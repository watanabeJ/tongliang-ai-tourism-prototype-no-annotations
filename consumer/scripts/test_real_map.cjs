const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'consumer-map.js'), 'utf8');
const appSource = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

// No browser or network: execute the adapter against DOM/Leaflet contract doubles.
class Events {
  listeners = new Map();
  on(names, callback) {
    names.split(' ').forEach(name => {
      const callbacks = this.listeners.get(name) || [];
      callbacks.push(callback);
      this.listeners.set(name, callbacks);
    });
    return this;
  }
  addEventListener(name, callback) { this.on(name, callback); }
  fire(name, properties = {}) { (this.listeners.get(name) || []).forEach(callback => callback({ type: name, target: this, ...properties })); }
}

class Element extends Events {
  constructor(tagName = 'div') {
    super();
    this.tagName = tagName;
    this.children = [];
    this.dataset = {};
    this.style = {};
    this.attributes = {};
    this.hidden = false;
    this.clientWidth = 375;
    this.clientHeight = 812;
    const classes = new Set();
    this.classList = {
      add: (...names) => names.forEach(name => classes.add(name)),
      remove: (...names) => names.forEach(name => classes.delete(name)),
      contains: name => classes.has(name)
    };
  }
  append(...nodes) { this.children.push(...nodes); }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  getAttribute(key) { return this.attributes[key] ?? null; }
  querySelectorAll(selector) {
    const matches = node => selector.split(',').some(part => {
      const query = part.trim();
      if (query === 'svg') return node.tagName === 'svg';
      if (query === '[data-map-point]') return Boolean(node.dataset.mapPoint);
      if (query === '[data-map-points]') return Boolean(node.dataset.mapPoints);
      const [tag, className] = query.split('.');
      return (!tag || node.tagName === tag) &&
        (node.classList.contains(className) || (node.className || '').split(/\s+/).includes(className));
    });
    return this.children.flatMap(child => [
      ...(matches(child) ? [child] : []), ...child.querySelectorAll(selector)
    ]);
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
}

class MapDouble extends Events {
  constructor(canvas, options) {
    super();
    this.canvas = canvas;
    this.options = options;
    this.zoom = 14;
    this.center = [29.7968734, 106.0581745];
    this.fitCalls = 0;
    this.invalidateCalls = 0;
  }
  getSize() { return { x: this.canvas.clientWidth, y: this.canvas.clientHeight }; }
  getZoom() { return this.zoom; }
  getCenter() { return this.center; }
  project(latLng, zoom) {
    // Web Mercator math, independent from the adapter implementation.
    const [lat, lng] = latLng;
    const scale = 256 * 2 ** zoom;
    const sin = Math.sin(lat * Math.PI / 180);
    return { x: (lng + 180) / 360 * scale, y: (.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale };
  }
  unproject([x, y], zoom) {
    const scale = 256 * 2 ** zoom;
    return [Math.atan(Math.sinh(Math.PI * (1 - 2 * y / scale))) * 180 / Math.PI, x / scale * 360 - 180];
  }
  latLngToContainerPoint(latLng) {
    const point = this.project(latLng, this.zoom);
    const center = this.project(this.center, this.zoom);
    const size = this.getSize();
    return { x: point.x - center.x + size.x / 2, y: point.y - center.y + size.y / 2 };
  }
  fitBounds(bounds, options) {
    this.fitCalls++;
    this.bounds = bounds;
    this.fitOptions = options;
    this.zoom = 14;
    this.center = [29.7968734, 106.0581745];
    this.fire('move');
    return this;
  }
  invalidateSize() { this.invalidateCalls++; }
  panBy(x, y) {
    this.fire('dragstart');
    const center = this.project(this.center, this.zoom);
    this.center = this.unproject([center.x + x, center.y + y], this.zoom);
    this.fire('move');
  }
  panTo(center) { this.center = center; this.fire('move'); }
  setZoom(zoom) { this.fire('zoomstart'); this.zoom = zoom; this.fire('zoom'); this.fire('move'); }
  remove() { this.removed = true; }
}

function setup({ hidden = false, withLeaflet = true } = {}) {
  const host = new Element();
  const canvas = new Element();
  canvas.className = 'map-canvas';
  canvas.getBoundingClientRect = () => ({ top: 0, bottom: canvas.clientHeight });
  if (hidden) { canvas.clientWidth = 0; canvas.clientHeight = 0; }
  const layer = new Element();
  layer.className = 'marker-layer';
  const referenceMarker = new Element();
  referenceMarker.className = 'map-current-location';
  const locate = new Element('button');
  locate.className = 'map-locate';
  host.append(canvas, layer, referenceMarker, locate);
  const frames = [];
  const timers = new Map();
  let timerId = 0;
  const maps = [];
  const layers = [];
  const vectors = [];
  const groups = [];
  let resizeCallback;
  const window = new Events();
  window.requestAnimationFrame = callback => { frames.push(callback); };
  window.setTimeout = callback => { timers.set(++timerId, callback); return timerId; };
  window.clearTimeout = id => { timers.delete(id); };
  const leaflet = {
    layerGroup: () => {
      const group = { addTo() { return this; }, remove() { this.removed = true; } };
      groups.push(group);
      return group;
    },
    polyline: (points, options) => {
      const vector = { points, options, addTo(group) { this.group = group; return this; } };
      vectors.push(vector);
      return vector;
    },
    divIcon: options => options,
    marker: (point, options) => {
      const marker = { point, options, addTo(group) { this.group = group; return this; },
        on(event, handler) { this[event] = handler; return this; },
        bindTooltip(label) { this.label = label.textContent; return this; }, bindPopup() { return this; } };
      vectors.push(marker);
      return marker;
    },
    map: (element, options) => {
      const map = new MapDouble(element, options);
      maps.push(map);
      return map;
    },
    control: { zoom: options => ({ addTo(map) { map.zoomOptions = options; } }) },
    tileLayer: (url, options) => {
      const layer = new Events();
      layer.url = url;
      layer.options = options;
      layer.redrawCount = 0;
      layer.addTo = () => layer.fire('loading');
      layer.redraw = () => { layer.redrawCount++; layer.fire('loading'); };
      layers.push(layer);
      return layer;
    }
  };
  if (withLeaflet) window.L = leaflet;
  const context = vm.createContext({
    window, console, document: { createElement: tag => new Element(tag) },
    ResizeObserver: class { constructor(callback) { resizeCallback = callback; } observe() {} }
  });
  vm.runInContext(source, context);
  let interactions = 0;
  let updates = 0;
  const adapter = window.TongliangMap.create(host, {
    onMapInteraction: () => { interactions++; },
    onViewChange: () => { updates++; }
  });
  return {
    host, canvas, layer, referenceMarker, locate, adapter, window, leaflet, maps, layers, timers, vectors, groups,
    get map() { return maps[0]; },
    get tiles() { return layers[0]; },
    get interactions() { return interactions; },
    get updates() { return updates; },
    get status() { return host.querySelector('.map-load-status'); },
    flushFrames() { frames.splice(0).forEach(callback => callback()); },
    resize(width, height) { canvas.clientWidth = width; canvas.clientHeight = height; resizeCallback(); },
    marker(point) {
      const marker = new Element('button');
      adapter.setMarkerPoint(marker, point);
      layer.append(marker);
      return marker;
    }
  };
}

function near(actual, expected) { assert(Math.abs(Number(actual) - expected) < .001, `${actual} != ${expected}`); }

test('computed itinerary draws provider geometry and exact stop order, and historical reopening replaces the old layer', () => {
  const s = setup();
  s.flushFrames();
  const route = { status: 'ready', coordinateSystem: 'WGS84', simulated: false,
    stops: [{ id: 'a', name: '安居古城', mapPoint: [106.0, 29.9] }, { id: 'b', name: '玄天湖', mapPoint: [106.1, 29.8] }],
    legs: [{ from: 'a', to: 'b', geometry: [[106, 29.9], [106.04, 29.85], [106.1, 29.8]] }] };
  const opened = [];
  assert.equal(s.adapter.showPlan(route, { renderStopIcon: stop => `<span>${stop.id}</span>`,
    onStopClick: stop => opened.push(stop.id) }), true);
  s.vectors[1].click();
  assert.deepEqual(opened, ['a']);
  assert.equal(s.vectors[1].options.bubblingMouseEvents, false);
  const geographic = s.adapter.projectPoint({ mapPoint: route.stops[0].mapPoint });
  const expected = s.map.latLngToContainerPoint([29.9, 106]);
  near(geographic.x, expected.x);
  near(geographic.y, expected.y);
  assert(!source.slice(source.indexOf('function showPlan')).includes('.bindPopup('));
  assert(!source.slice(source.indexOf('function showPlan')).includes('.bindTooltip('));
  assert.equal(s.vectors[1].options.title, undefined, 'no native hover title');
  assert.equal(s.vectors[1].options.icon.className, 'route-poi-marker');
  assert.equal(s.vectors[1].options.icon.html, '<span>a</span>');
  assert.equal(s.vectors[1].options.alt, '1. 安居古城');
  const mockRoute = { ...route, simulated: true };
  assert.equal(s.adapter.showPlan(mockRoute), true);
  assert.equal(s.vectors[3].options.dashArray, '8 8');
  assert.deepEqual(JSON.parse(JSON.stringify(s.vectors[0].points)), [[29.9, 106], [29.85, 106.04], [29.8, 106.1]]);
  assert.deepEqual(s.vectors.slice(1, 3).map(m => m.options.alt), ['1. 安居古城', '2. 玄天湖']);
  assert(s.vectors.slice(1, 3).every(m => m.label === undefined), 'no floating white name labels');
  assert.equal(s.adapter.showPlan(route), true);
  assert.equal(s.groups[0].removed, true);
  s.adapter.clearPlan();
  assert.equal(s.groups[2].removed, true);
  assert.equal(s.adapter.showPlan({ ...route, coordinateSystem: 'GCJ-02' }), false);
  assert.equal(s.adapter.showPlan({ ...route, legs: [{ ...route.legs[0], to: 'wrong' }] }), false);
});
const px = (node, key) => Number.parseFloat(node.style[key]);

function addMarkerIcons(h) {
  return ['food', 'hotel', 'flag', 'bag', 'heart'].map((name, index) => {
    const marker = h.marker([34 + index * 8, 32 + index * 6]);
    marker.classList.add(index === 4 ? 'wishlist-poi' : 'category-marker');
    const span = new Element('span');
    const icon = new Element('svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('fill', 'none');
    icon.setAttribute('stroke', 'currentColor');
    // Use the existing category and wishlist icon geometry from app.js.
    const paths = appSource.match(new RegExp(`${name}: svg\\('([^']+)'\\)`));
    assert(paths, `missing ${name} icon`);
    icon.innerHTML = paths[1];
    span.append(icon);
    marker.append(span);
    return { icon, before: { ...icon.attributes }, geometry: paths[1] };
  });
}

test('category and wishlist icon viewBoxes survive zoom in/out, dragging, resize and recenter', () => {
  const h = setup();
  h.flushFrames();
  const icons = addMarkerIcons(h);
  const assertUnchanged = () => icons.forEach(({ icon, before, geometry }) => {
    assert.deepEqual(icon.attributes, before);
    assert.equal(icon.innerHTML, geometry);
  });
  for (const zoom of [15, 16, 14, 13, 19, 4, 14]) {
    h.map.setZoom(zoom);
    assertUnchanged();
  }
  h.map.panBy(40, -25);
  assertUnchanged();
  h.resize(430, 900);
  assertUnchanged();
  h.adapter.recenter();
  assertUnchanged();
});

test('initializing and reopening a hidden map never resize the SVGs inside POI markers', () => {
  const h = setup({ hidden: true });
  const icons = addMarkerIcons(h);
  h.flushFrames();
  h.resize(375, 812);
  h.adapter.show();
  h.resize(0, 0);
  h.resize(375, 812);
  icons.forEach(({ icon, before }) => assert.deepEqual(icon.attributes, before));
});

test('lazy initialization waits for the hidden homepage map; returning reuses one instance', () => {
  const h = setup({ hidden: true });
  const marker = h.marker([34, 32]);
  h.flushFrames();
  assert.equal(h.maps.length, 0);
  h.resize(375, 812);
  assert.equal(h.maps.length, 1);
  near(px(marker, 'left'), 375 * .34);
  near(px(marker, 'top'), (812 - 56) * .32);
  h.adapter.show();
  h.resize(375, 812);
  assert.equal(h.maps.length, 1);
  assert.equal(h.map.fitCalls, 1);
});

test('dragging, touch, wheel, keyboard and bounded zoom are enabled; OSM uses normal cached viewport tiles', () => {
  const h = setup();
  h.flushFrames();
  for (const option of ['dragging', 'touchZoom', 'scrollWheelZoom', 'doubleClickZoom', 'keyboard']) {
    assert.equal(h.map.options[option], true);
  }
  assert.equal(h.map.options.zoomAnimation, false);
  assert.equal(h.map.options.zoomControl, false);
  assert.equal(h.map.zoomOptions, undefined);
  assert.equal(h.tiles.url, 'https://tile.openstreetmap.org/{z}/{x}/{y}.png');
  assert.equal(h.tiles.options.referrerPolicy, 'strict-origin-when-cross-origin');
  assert.equal(h.tiles.options.updateWhenIdle, true);
  assert.equal(h.tiles.options.keepBuffer, 1);
});

test('business markers and reference center move with the geographic map, not the screen', () => {
  const h = setup();
  h.flushFrames();
  const marker = h.marker([34, 32]);
  const before = { x: px(marker, 'left'), y: px(marker, 'top') };
  h.map.panBy(80, -45);
  near(px(marker, 'left'), before.x - 80);
  near(px(marker, 'top'), before.y + 45);
  near(px(h.referenceMarker, 'left'), 375 / 2 - 80);
  near(px(h.referenceMarker, 'top'), 812 / 2 + 45);
  assert.equal(h.interactions, 1);
});

test('zoom buttons are not created on first load or reopening and accessible instructions match', () => {
  const h = setup();
  h.flushFrames();
  assert.equal(h.map.options.zoomControl, false);
  assert.equal(h.map.zoomOptions, undefined);
  assert(!source.includes('L.control.zoom('));
  assert.equal(h.canvas.getAttribute('aria-label'), '玄天湖真实地图，可拖动，使用滚轮或双指缩放');
  h.adapter.show();
  h.adapter.recenter();
  h.flushFrames();
  assert.equal(h.maps.length, 1);
  assert.equal(h.map.zoomOptions, undefined);
  h.map.setZoom(16);
  assert.equal(h.map.getZoom(), 16);
  assert.equal(h.map.options.touchZoom, true);
  assert.equal(h.map.options.scrollWheelZoom, true);
});

test('filtering/re-rendering after dragging does not change the demo coordinates', () => {
  const h = setup();
  h.flushFrames();
  const first = h.marker([34, 32]);
  h.map.panBy(120, 65);
  const replacement = h.marker([34, 32]);
  near(px(replacement, 'left'), px(first, 'left'));
  near(px(replacement, 'top'), px(first, 'top'));
});

test('zoom and resize keep the same geographic anchor and projected card position', () => {
  const h = setup();
  h.flushFrames();
  const marker = h.marker([34, 32]);
  const x = px(marker, 'left');
  const y = px(marker, 'top');
  h.map.setZoom(15);
  near(px(marker, 'left') - 187.5, (x - 187.5) * 2);
  near(px(marker, 'top') - 406, (y - 406) * 2);
  const beforeResize = { x: px(marker, 'left'), y: px(marker, 'top') };
  h.resize(430, 900);
  near(px(marker, 'left'), beforeResize.x + (430 - 375) / 2);
  near(px(marker, 'top'), beforeResize.y + (900 - 812) / 2);
  const position = h.adapter.projectPoint([34, 32]);
  near(position.x, px(marker, 'left'));
  near(position.y, px(marker, 'top'));
  assert(h.updates > 0);
});

test('wishlist polylines and plan segments remain attached to their markers after pan/zoom', () => {
  const h = setup();
  h.flushFrames();
  const points = [[50, 60], [66, 47]];
  const markers = points.map(point => h.marker(point));
  const route = new Element('svg');
  route.classList.add('wishlist-poi-route');
  const planRoute = new Element('svg');
  planRoute.classList.add('plan-route-layer');
  const polyline = new Element('polyline');
  const line = new Element('line');
  h.adapter.setRoutePoints(polyline, points);
  h.adapter.setRoutePoints(line, points);
  route.append(polyline);
  planRoute.append(line);
  h.layer.append(route, planRoute);
  const icons = addMarkerIcons(h);
  h.map.panBy(40, 10);
  h.map.setZoom(16);
  assert.equal(route.attributes.viewBox, '0 0 375 812');
  assert.equal(planRoute.attributes.viewBox, '0 0 375 812');
  const projected = polyline.attributes.points.split(' ').map(pair => pair.split(',').map(Number));
  projected.forEach((point, index) => {
    near(point[0], px(markers[index], 'left'));
    near(point[1], px(markers[index], 'top'));
  });
  near(line.attributes.x1, projected[0][0]);
  near(line.attributes.y2, projected[1][1]);
  icons.forEach(({ icon, before }) => assert.deepEqual(icon.attributes, before));
});

test('map click, dragstart and zoomstart dismiss cards; recenter restores default map and markers', () => {
  const h = setup();
  h.flushFrames();
  const marker = h.marker([51, 58]);
  const initialX = px(marker, 'left');
  h.map.fire('click');
  h.map.panBy(100, 40);
  h.map.setZoom(16);
  assert.equal(h.interactions, 3);
  h.adapter.recenter();
  near(px(marker, 'left'), initialX);
  assert.equal(h.map.getZoom(), 14);
  assert.equal(h.map.fitCalls, 2);
});

test('opening a single product POI brings it back into view after a long pan', () => {
  const h = setup();
  h.flushFrames();
  const marker = h.marker([51, 58]);
  h.map.panBy(1800, -900);
  h.adapter.focusPoint([51, 58]);
  near(px(marker, 'left'), 375 / 2);
  near(px(marker, 'top'), 812 / 2);
});

test('failed tiles expose a retry; a successful retry clears the error without cache-busting', () => {
  const h = setup();
  h.flushFrames();
  h.tiles.fire('tileerror');
  h.tiles.fire('load');
  assert.equal(h.status.hidden, false);
  assert.match(h.status.children[0].textContent, /加载失败/);
  assert.equal(h.status.children[1].hidden, false);
  assert.equal(h.timers.size, 0);
  h.status.children[1].fire('click');
  assert.equal(h.tiles.redrawCount, 1);
  h.tiles.fire('tileload');
  h.tiles.fire('load');
  assert.equal(h.status.hidden, true);
  assert.equal(h.timers.size, 0);
});

test('partial failure and a slow network remain visible; hidden maps do not retry on reconnect', () => {
  const h = setup();
  h.flushFrames();
  [...h.timers.values()][0]();
  assert.match(h.status.children[0].textContent, /较慢/);
  h.tiles.fire('tileload');
  h.tiles.fire('tileerror');
  h.tiles.fire('load');
  assert.match(h.status.children[0].textContent, /部分/);
  h.resize(0, 0);
  h.window.fire('online');
  assert.equal(h.tiles.redrawCount, 0);
  h.resize(375, 812);
  h.window.fire('online');
  assert.equal(h.tiles.redrawCount, 1);
});

test('missing map library is recoverable and does not silently display the old static map', () => {
  const h = setup({ withLeaflet: false });
  h.flushFrames();
  assert.match(h.status.children[0].textContent, /组件未加载/);
  assert.equal(h.host.classList.contains('is-map-ready'), false);
  assert.equal(h.host.classList.contains('has-real-map'), true);
  h.window.L = h.leaflet;
  h.status.children[1].fire('click');
  assert.equal(h.maps.length, 1);
  assert.equal(h.host.classList.contains('is-map-ready'), true);
});

test('visible attribution and explicit demo/ non-GPS wording are present', () => {
  const h = setup();
  assert.match(h.host.querySelector('.map-credits').innerHTML, /© OpenStreetMap contributors/);
  assert.match(h.host.querySelector('.map-data-note').textContent, /点位、路线为演示/);
  assert.match(h.referenceMarker.attributes['aria-label'], /非设备定位/);
  assert.match(h.locate.attributes['aria-label'], /玄天湖/);
  assert(!/geolocation|getCurrentPosition|watchPosition/.test(source));
});

test('both consumer pages load local assets in order; every marker/route path calls the adapter', () => {
  for (const page of ['plan', 'explore']) {
    const html = fs.readFileSync(path.join(root, `consumer/${page}.html`), 'utf8');
    const libraries = html.indexOf('<script src="../vendor/leaflet/leaflet.js"');
    const adapter = html.indexOf('<script src="../consumer-map.js?');
    const app = html.indexOf('<script src="../app.js?');
    assert(libraries >= 0 && libraries < adapter && adapter < app);
    assert(html.includes('../consumer-map.css?'));
    assert(html.includes('../vendor/leaflet/leaflet.css'));
  }
  assert.equal((appSource.match(/realMap\?\.setMarkerPoint\(/g) || []).length, 4);
  assert.equal((appSource.match(/realMap\?\.setRoutePoints\(/g) || []).length, 2);
  assert(appSource.includes('onMapInteraction: closePoiCard'));
  assert(appSource.includes('const projected = realMap?.projectPoint(point)'));
  for (const file of ['leaflet.js', 'leaflet.css', 'LICENSE']) {
    assert(fs.statSync(path.join(root, 'vendor/leaflet', file)).size > 1000);
  }
  const css = fs.readFileSync(path.join(root, 'consumer-map.css'), 'utf8');
  assert(!css.includes('assets/map.png'));
  assert.match(css, /\.map-screen\.has-real-map \.marker-layer \{ inset: 0;/);
});

test('embedded and external map annotations agree on the real-map/demo boundary', () => {
  const html = fs.readFileSync(path.join(root, 'consumer/plan.html'), 'utf8');
  const match = html.match(/<script id="prototype-annotations-data" type="application\/json">([\s\S]*?)<\/script>/);
  assert(match);
  const embedded = JSON.parse(match[1]);
  const external = JSON.parse(fs.readFileSync(path.join(root, 'consumer/prototype-annotator/annotations.json'), 'utf8'));
  const findMap = data => data.annotations.find(item => item.id === 'ANN-P14-015');
  assert.equal(findMap(embedded).contentMarkdown, findMap(external).contentMarkdown);
  assert.match(findMap(embedded).contentMarkdown, /真实底图原型说明/);
});

test('map category targets remain 44px and aligned with locate after removing zoom buttons', () => {
  // Static geometry guard; this does not replace browser layout verification.
  const css = fs.readFileSync(path.join(root, 'consumer-map.css'), 'utf8');
  const declarations = selector => {
    const block = css.split(`${selector} {`)[1]?.split('}')[0];
    assert(block, `missing ${selector}`);
    return Object.fromEntries(block.split(';').filter(value => value.includes(':')).map(value => {
      const colon = value.indexOf(':');
      return [value.slice(0, colon).trim(), value.slice(colon + 1).trim()];
    }));
  };
  const base = '.map-screen.has-real-map';
  const bar = declarations(`${base} .category-bar`);
  const target = declarations(`${base} .category-bar .category`);
  const circle = declarations(`${base} .category-bar .category span`);
  const icon = declarations(`${base} .category-bar .category svg`);
  const locate = declarations(`${base} .map-locate`);
  const number = (item, property) => Number.parseFloat(item[property]);
  assert.equal(target.width, '44px');
  assert.equal(target.height, '44px');
  assert.equal(target['min-width'], '44px');
  assert.equal(target['min-height'], '44px');
  assert.equal(target.padding, '0');
  assert.equal(circle.width, '30px');
  assert.equal(circle.height, '30px');
  assert.equal(icon.width, '16px');
  assert.equal(icon.height, '16px');
  assert.equal(bar['grid-template-rows'], 'repeat(5, 44px)');
  assert.equal(bar.gap, '0');
  assert.equal(bar.padding, '4px 1px');
  assert.equal(number(bar, 'width'), 44 + 2 + 2); // target + side padding + borders
  assert.equal(number(bar, 'height'), 5 * 44 + 8 + 2);
  const centerline = number(bar, 'right') + number(bar, 'width') / 2;
  assert.equal(centerline, number(locate, 'right') + number(locate, 'width') / 2);
  assert.equal(centerline, 16 + 40 / 2); // existing header buttons
  assert(number(locate, 'top') - number(bar, 'top') - number(bar, 'height') >= 12);
  assert(!css.includes('.leaflet-control-zoom'));
  assert(!css.includes('.leaflet-top.leaflet-right'));
  for (const page of ['plan', 'explore']) {
    const html = fs.readFileSync(path.join(root, `consumer/${page}.html`), 'utf8');
    assert(html.includes('../consumer-map.css?v=no-zoom-controls-v1'));
    assert(html.includes('../consumer-map.js?v=no-zoom-controls-v1'));
  }
});

function setupCategoryHints() {
  const host = new Element();
  const bar = new Element();
  bar.className = 'category-bar';
  const buttons = ['eat', 'stay', 'tour', 'shop', 'wishlist'].map((key, index) => {
    const button = new Element('button');
    button.className = 'category';
    button.dataset.category = key;
    button.offsetTop = 4 + 44 * index;
    button.offsetHeight = 44;
    bar.append(button);
    return button;
  });
  host.append(bar);
  const timers = new Map();
  const delays = [];
  const selected = [];
  let nextTimer = 0;
  const context = vm.createContext({
    mapScreen: host, currentLanguage: 'zh',
    document: {
      createElement: tag => new Element(tag),
      querySelectorAll: selector => host.querySelectorAll(selector)
    },
    window: {
      clearTimeout: id => timers.delete(id),
      setTimeout: (callback, delay) => {
        delays.push(delay);
        timers.set(++nextTimer, callback);
        return nextTimer;
      }
    },
    markerCard: new Element(), activeMarkerPoint: null,
    selectAllMapWishlist: () => [{ key: 'example' }],
    syncMapCategoryState: () => {},
    renderAllNearbyPois: () => selected.push('nearby'),
    renderWishlistPoi: () => selected.push('wishlist'),
    renderMarkers: key => selected.push(key),
    notify: () => {}
  });
  const start = appSource.indexOf('// Category labels are separate');
  const end = appSource.indexOf('const syncMapCategoryState', start);
  assert(start >= 0 && end > start);
  vm.runInContext(appSource.slice(start, end), context);
  const handlersStart = appSource.indexOf("document.querySelectorAll('.category').forEach(button => {");
  const handlersEnd = appSource.indexOf('if (mapScreen && !embeddedMapHost)', handlersStart);
  assert(handlersStart >= 0 && handlersEnd > handlersStart);
  vm.runInContext(appSource.slice(handlersStart, handlersEnd), context);
  const closeStart = appSource.indexOf('function closePoiCard()');
  const closeEnd = appSource.indexOf("mapScreen?.addEventListener('click'", closeStart);
  vm.runInContext(appSource.slice(closeStart, closeEnd), context);
  return { bar, buttons, context, timers, delays, selected, hint: bar.querySelector('.map-category-hint') };
}

test('clicking each category displays its label beside that row without changing filtering', () => {
  const h = setupCategoryHints();
  assert(h.hint.hidden);
  ['美食', '住宿', '游玩', '购物', '心愿单'].forEach((label, index) => {
    h.buttons[index].fire('click');
    assert.equal(h.hint.textContent, label);
    assert.equal(h.hint.hidden, false);
    assert.equal(h.hint.style.top, `${4 + index * 44 + 22}px`);
    assert.equal(h.buttons[index].getAttribute('aria-label'), label);
  });
  assert.deepEqual(h.selected, ['eat', 'stay', 'tour', 'shop', 'wishlist']);
  assert.equal(h.hint.getAttribute('role'), 'status');
  assert.equal(h.hint.getAttribute('aria-live'), 'polite');
});

test('category hints replace each other and restart a single two-second dismissal timer', () => {
  const h = setupCategoryHints();
  h.buttons[0].fire('click');
  const firstTimer = [...h.timers.keys()][0];
  h.buttons[1].fire('click');
  assert.equal(h.hint.textContent, '住宿');
  assert.equal(h.timers.has(firstTimer), false);
  assert.equal(h.timers.size, 1);
  h.buttons[1].fire('click');
  assert.equal(h.timers.size, 1);
  assert(h.delays.every(delay => delay === 2000));
  [...h.timers.values()][0]();
  assert.equal(h.hint.hidden, true);
  assert.equal(h.timers.size, 0);
});

test('Escape and map/card dismissal close the category hint without pending timers', () => {
  const h = setupCategoryHints();
  h.buttons[0].fire('click');
  h.bar.fire('keydown', { key: 'Escape' });
  assert(h.hint.hidden);
  assert.equal(h.timers.size, 0);
  h.buttons[2].fire('click');
  h.context.closePoiCard();
  assert(h.hint.hidden);
  assert.equal(h.timers.size, 0);
});

test('category hints and accessible names follow the current page language', () => {
  const h = setupCategoryHints();
  h.buttons[0].fire('click');
  h.context.currentLanguage = 'en';
  h.context.updateMapCategoryLanguage();
  assert.equal(h.hint.textContent, 'Food');
  ['Food', 'Stay', 'Explore', 'Shopping', 'Wishlist'].forEach((label, index) => {
    h.buttons[index].fire('click');
    assert.equal(h.hint.textContent, label);
    assert.equal(h.buttons[index].getAttribute('aria-label'), label);
  });
});

test('an empty wishlist explains its unavailable state without filtering or changing the map', () => {
  const h = setupCategoryHints();
  const wishlist = h.buttons[4];
  wishlist.setAttribute('aria-disabled', 'true');
  wishlist.fire('click');
  assert.equal(h.hint.textContent, '心愿单暂无内容');
  assert.deepEqual(h.selected, []);
  h.context.currentLanguage = 'en';
  h.context.updateMapCategoryLanguage();
  assert.equal(h.hint.textContent, 'Your wishlist is empty');
  wishlist.setAttribute('aria-disabled', 'false');
  wishlist.fire('click');
  assert.equal(h.hint.textContent, 'Wishlist');
  assert.deepEqual(h.selected, ['wishlist']);
});
