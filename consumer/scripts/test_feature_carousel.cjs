const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const begin = source.indexOf("const featureCarousel = document.querySelector('[data-feature-carousel]');");
const end = source.indexOf('\nconst featureKnowledgeGuides =', begin);
assert(begin >= 0 && end > begin);
const carouselSource = source.slice(begin, end);
const contentSource = fs.readFileSync(path.join(root, 'consumer/feature-carousel-content.js'), 'utf8');
const contentWindow = {};
vm.runInNewContext(contentSource, { window: contentWindow });
const localizedContent = JSON.parse(JSON.stringify(contentWindow.TongliangFeatureContent));

// Isolated DOM/event doubles execute the actual carousel block, without a browser or network.
class Events {
  listeners = new Map();
  addEventListener(name, fn) {
    const list = this.listeners.get(name) || [];
    list.push(fn);
    this.listeners.set(name, list);
  }
  fire(name, properties = {}) {
    const event = {
      target: this, button: 0, isPrimary: true, pointerId: 1,
      clientX: 150, clientY: 20, detail: 1,
      preventDefault() { this.prevented = true; },
      stopPropagation() { this.stopped = true; },
      ...properties
    };
    for (const fn of this.listeners.get(name) || []) fn(event);
    return event;
  }
}

class Node extends Events {
  children = [];
  parent = null;
  dataset = {};
  attrs = {};
  classes = new Set();
  classList = {
    add: name => this.classes.add(name),
    remove: name => this.classes.delete(name),
    contains: name => this.classes.has(name)
  };
  style = { setProperty(name, value) { this[name] = value; } };
  captured = new Set();
  constructor(name, width = 100) { super(); this.name = name; this.width = width; }
  set className(value) { this.classes = new Set(value.split(/\s+/).filter(Boolean)); }
  get className() { return [...this.classes].join(' '); }
  setAttribute(name, value) {
    this.attrs[name] = value;
    if (name.startsWith('data-')) this.dataset[name.slice(5).replace(/-([a-z])/g, (_, char) => char.toUpperCase())] = value;
  }
  get clientWidth() { return this.width; }
  get offsetWidth() { return this.width; }
  getBoundingClientRect() { return { width: this.width }; }
  append(...nodes) { nodes.forEach(node => { node.parent = this; this.children.push(node); }); }
  prepend(...nodes) { nodes.forEach(node => { node.parent = this; }); this.children.unshift(...nodes); }
  replaceChildren(...nodes) {
    this.children.forEach(node => { node.parent = null; });
    this.children = [];
    this.append(...nodes);
  }
  remove() {
    this.parent.children = this.parent.children.filter(node => node !== this);
    this.parent = null;
  }
  matches(selector) {
    if (selector === '[data-feature-slide]') return this.dataset.featureSlide !== undefined;
    if (selector === ':focus-visible') return Boolean(this.focusVisible);
    if (selector.startsWith('.')) return this.classes.has(selector.slice(1));
    return selector === this.name;
  }
  querySelectorAll(selector) {
    return this.children.flatMap(child => [
      ...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)
    ]);
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  closest(selector) { return this.matches(selector) ? this : this.parent?.closest(selector) || null; }
  contains(node) { return Boolean(node && (node === this || this.children.some(child => child.contains(node)))); }
  cloneNode() {
    const clone = new Node(this.name, this.width);
    clone.dataset = { ...this.dataset };
    clone.attrs = { ...this.attrs };
    clone.classes = new Set(this.classes);
    clone.src = this.src;
    clone.alt = this.alt;
    clone.textContent = this.textContent;
    clone.append(...this.children.map(child => child.cloneNode(true)));
    return clone;
  }
  setPointerCapture(id) { this.captured.add(id); }
  hasPointerCapture(id) { return this.captured.has(id); }
  releasePointerCapture(id) {
    this.captured.delete(id);
    this.fire('lostpointercapture', { pointerId: id });
  }
}

function setup(count = 9, { width = 324, reduced = false, content, language = 'zh' } = {}) {
  const cardWidth = (width - 24) / 3;
  const gallery = new Node('gallery', width);
  const track = new Node('track', width);
  track.classes.add('feature-gallery-track');
  gallery.append(track);
  for (let index = 0; index < count; index += 1) {
    const slide = new Node('button', cardWidth);
    slide.dataset.featureSlide = String(index);
    slide.append(new Node('img'));
    track.append(slide);
  }
  const doc = new Events();
  doc.hidden = false;
  doc.activeElement = null;
  doc.querySelector = () => gallery;
  doc.querySelectorAll = () => [];
  doc.createElement = name => new Node(name, name === 'button' ? cardWidth : 100);
  gallery.focus = () => { doc.activeElement = gallery; };
  const win = new Events();
  if (content) win.TongliangFeatureContent = content;
  const media = new Events();
  media.matches = reduced;
  win.matchMedia = () => media;
  win.getComputedStyle = () => ({ gap: '8px' });
  const timers = new Map();
  let now = 0;
  let nextTimer = 0;
  win.setTimeout = (fn, delay) => {
    timers.set(++nextTimer, { fn, at: now + delay });
    return nextTimer;
  };
  win.clearTimeout = id => timers.delete(id);
  const tick = duration => {
    const until = now + duration;
    for (;;) {
      const next = [...timers].filter(([, t]) => t.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      now = next[1].at;
      timers.delete(next[0]);
      next[1].fn();
    }
    now = until;
  };
  const actions = [];
  const screen = new Node('screen');
  const phone = new Node('phone');
  const context = vm.createContext({
    document: doc, window: win, planScreen: screen, drawerPhone: phone,
    currentLanguage: language,
    assetUrl: asset => `../${asset}`,
    resetFeatureCarouselGesture: () => {},
    appendFeatureKnowledgeGuide: key => actions.push(key),
    appendJourneyRecommendation: key => actions.push(key)
  });
  vm.runInContext(carouselSource, context);
  const setLanguage = language => {
    context.currentLanguage = language;
    vm.runInContext('updateFeatureCarouselLanguage()', context);
  };
  const offset = () => parseFloat(gallery.style['--feature-gallery-offset']);
  const swipe = distance => {
    gallery.fire('pointerdown');
    gallery.fire('pointermove', { clientX: 150 + distance });
    gallery.fire('pointerup', { clientX: 150 + distance });
  };
  return { gallery, track, win, doc, media, screen, phone, timers, tick, offset, swipe, actions, context, setLanguage, cardWidth, step: cardWidth + 8 };
}

test('same-language theme changes replace originals and clones, cancel gestures and keep one autoplay timer', () => {
  const dataContext = vm.createContext({ window: {} });
  vm.runInContext(fs.readFileSync(path.join(root, 'consumer/home-theme-content.js'), 'utf8') +
    fs.readFileSync(path.join(root, 'consumer/home-themes.js'), 'utf8'), dataContext);
  const s = setup(9, { content: localizedContent });
  let selected = 'heritage';
  s.win.TongliangHomeThemes = { getSlides: language => dataContext.window.TongliangHomeThemes.snapshot(selected, language).slides };
  for (const id of ['heritage', 'food', 'football', 'nature']) {
    s.gallery.fire('pointerdown');
    s.gallery.fire('pointermove', { clientX: 190 });
    selected = id;
    vm.runInContext('updateFeatureCarouselLanguage(true)', s.context);
    const slides = s.track.querySelectorAll('[data-feature-slide]');
    assert.equal(slides.length, 12); // Four originals and eight loop buffers.
    assert(slides.every(slide => slide.dataset.featureId.startsWith(`${id}-`)));
    assert(slides.every(slide => slide.dataset.featurePrompt.length > 0));
    assert.equal(s.gallery.captured.size, 0);
    assert.equal(s.timers.size, 1);
    s.gallery.fire('click', { target: slides[5] });
    assert.equal(s.actions.at(-1), `theme-${id}`);
  }
});

test('0/1/2/9/10/12 configured images: cap at 10, clones excluded from accessible count', () => {
  for (const count of [0, 1, 2, 9, 10, 12]) {
    const s = setup(count);
    const originals = s.track.children.filter(node => node.dataset.featureSlide !== undefined && !node.dataset.featureClone);
    assert.equal(originals.length, Math.min(count, 10));
    assert(s.gallery.attrs['aria-label'].includes(`${Math.min(count, 10)}`));
    assert.equal(s.track.querySelectorAll('[data-feature-slide]').length, originals.length + (count > 1 ? 8 : 0));
    for (const clone of s.track.children.filter(node => node.dataset.featureClone)) {
      assert.equal(clone.attrs['aria-hidden'], 'true');
      assert.equal(clone.tabIndex, -1);
      assert(Number(clone.dataset.featureSlide) < Math.min(count, 10));
    }
    assert(Number.isFinite(s.offset()));
    if (count < 2) {
      const before = s.offset();
      s.tick(30000);
      assert.equal(s.offset(), before);
      assert.equal(s.timers.size, 0);
    }
  }
});

test('autoplay moves right to left every 3 seconds, and covers every image before wrapping', () => {
  const s = setup();
  const initial = s.offset();
  s.tick(2999);
  assert.equal(s.offset(), initial);
  s.tick(1);
  assert.equal(s.offset(), initial - s.step);
  s.tick(360);
  const seen = new Set([1, 2]);
  for (let i = 0; i < 8; i += 1) {
    s.tick(3000);
    const index = Math.round(1 + (-s.offset() - 4 * s.step - s.cardWidth / 2) / s.step);
    seen.add(index);
  }
  assert.equal(seen.size, 9);
  assert.equal(s.offset(), initial);
  assert.deepEqual(s.actions, []);
});

test('both wrap directions use equivalent buffers with no blank track', () => {
  const s = setup();
  const initial = s.offset();
  for (let i = 0; i < 8; i += 1) {
    s.gallery.fire('keydown', { key: 'ArrowRight' });
    if (i < 7) s.tick(360);
  }
  const forwardBuffer = s.offset();
  s.tick(360);
  assert.equal(s.offset() - forwardBuffer, 9 * s.step);
  s.gallery.fire('keydown', { key: 'ArrowLeft' });
  const backwardBuffer = s.offset();
  s.tick(360);
  assert.equal(backwardBuffer - s.offset(), 9 * s.step);
  for (let i = 0; i < 7; i += 1) {
    s.gallery.fire('keydown', { key: 'ArrowLeft' });
    s.tick(360);
  }
  assert.equal(s.offset(), initial);
});

test('drag follows pointer, pauses autoplay and resumes 3 seconds after release', () => {
  const s = setup();
  const initial = s.offset();
  s.gallery.fire('pointerdown');
  s.tick(10000);
  assert.equal(s.offset(), initial);
  s.gallery.fire('pointermove', { clientX: 110 });
  assert.equal(s.offset(), initial - 40);
  assert.equal(s.track.style.transition, 'none');
  s.gallery.fire('pointerup', { clientX: 110 });
  assert.equal(s.offset(), initial - s.step);
  s.tick(2999);
  assert.equal(s.offset(), initial - s.step);
  s.tick(1);
  assert.equal(s.offset(), initial - 2 * s.step);
  assert.equal(s.gallery.captured.size, 0);
});

test('short drags snap back, swipes do not open conversations, taps and keyboard clicks still work', () => {
  const s = setup();
  const initial = s.offset();
  const slide = s.track.children.find(node => node.dataset.featureSlide === '0');
  s.swipe(15);
  assert.equal(s.offset(), initial);
  assert(s.gallery.fire('click', { target: slide }).prevented);
  assert.deepEqual(s.actions, []);
  s.gallery.fire('pointerdown', { target: slide });
  s.gallery.fire('pointerup', { target: slide });
  s.gallery.fire('click', { target: slide });
  assert.deepEqual(s.actions, ['xuantian-lake']);
  s.gallery.fire('click', { target: slide, detail: 0 });
  assert.equal(s.actions.length, 2);
});

test('buffer card taps keep the original topic binding', () => {
  const s = setup();
  const clone = s.track.children[0];
  assert.equal(clone.dataset.featureSlide, '5');
  s.gallery.fire('click', { target: clone.children[0] });
  assert.deepEqual(s.actions, ['boat']);
});

test('vertical gestures, pointer cancellation and lost capture do not get stuck', () => {
  for (const cancel of ['vertical', 'pointercancel', 'lostpointercapture']) {
    const s = setup();
    const initial = s.offset();
    s.gallery.fire('pointerdown');
    if (cancel === 'vertical') s.gallery.fire('pointermove', { clientX: 152, clientY: 80 });
    else {
      s.gallery.fire('pointermove', { clientX: 90 });
      s.gallery.fire(cancel);
    }
    assert.equal(s.offset(), initial);
    s.tick(3000);
    assert.equal(s.offset(), initial - s.step);
    assert(!s.gallery.classList.contains('is-dragging'));
  }
});

test('non-primary pointers and right clicks are ignored', () => {
  const s = setup();
  const initial = s.offset();
  s.gallery.fire('pointerdown', { button: 2 });
  s.gallery.fire('pointermove', { clientX: 70 });
  s.gallery.fire('pointerup', { clientX: 70 });
  s.gallery.fire('pointerdown', { isPrimary: false });
  s.gallery.fire('pointermove', { clientX: 70 });
  assert.equal(s.offset(), initial);
});

test('hidden documents, maps, drawers and keyboard focus pause auto motion', () => {
  for (const mode of ['hidden', 'map', 'drawer', 'wishlist', 'keyboard']) {
    const s = setup();
    const initial = s.offset();
    if (mode === 'hidden') { s.doc.hidden = true; s.doc.fire('visibilitychange'); }
    if (mode === 'map') s.screen.classes.add('is-map-active');
    if (mode === 'drawer') s.phone.classes.add('is-drawer-open');
    if (mode === 'wishlist') s.phone.classes.add('is-wishlist-open');
    if (mode === 'keyboard') { s.doc.activeElement = s.track.children[4]; s.doc.activeElement.focusVisible = true; }
    s.tick(9000);
    assert.equal(s.offset(), initial);
    s.doc.hidden = false;
    s.doc.activeElement = null;
    s.screen.classes.clear();
    s.phone.classes.clear();
    s.doc.fire('visibilitychange');
    s.tick(3000);
    assert.equal(s.offset(), initial - s.step);
  }
});

test('reduced motion preserves manual switching without automatic movement', () => {
  const s = setup(9, { reduced: true });
  const initial = s.offset();
  s.tick(12000);
  assert.equal(s.offset(), initial);
  s.swipe(-50);
  s.tick(0);
  assert.equal(s.offset(), initial - s.step);
  assert.equal(s.track.style.transition, 'none');
  s.media.matches = false;
  s.media.fire('change');
  s.tick(3000);
  assert.equal(s.offset(), initial - 2 * s.step);
});

test('resize and page restoration keep a single autoplay timer', () => {
  const s = setup();
  for (let i = 0; i < 10; i += 1) s.win.fire('resize');
  assert.equal(s.timers.size, 1);
  s.win.fire('pagehide');
  assert.equal(s.timers.size, 0);
  s.win.fire('pageshow');
  assert.equal(s.timers.size, 1);
});

test('narrow and wide layouts keep the same fractional-card layout and finite offsets', () => {
  for (const width of [280, 320, 375, 430]) {
    const s = setup(2, { width });
    const expected = -(4 * s.step + s.cardWidth / 2);
    assert.equal(s.offset(), expected);
    s.tick(6000);
    s.tick(360);
    assert(Number.isFinite(s.offset()));
    assert(Math.abs(s.offset() - expected) < 0.001);
  }
});

test('current 9 assets exist and embedded carousel annotation matches the external annotation', () => {
  const html = fs.readFileSync(path.join(root, 'consumer/plan.html'), 'utf8');
  const assets = [...html.matchAll(/<img src="\.\.\/(assets\/feature-\d+\.png)"/g)];
  assert.equal(assets.length, 9);
  for (const [, asset] of assets) assert(fs.existsSync(path.join(root, asset)), asset);
  const embedded = JSON.parse(html.match(/<script id="prototype-annotations-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
  const external = JSON.parse(fs.readFileSync(path.join(root, 'consumer/prototype-annotator/annotations.json'), 'utf8'));
  const find = data => Object.values(data).filter(Array.isArray).flat().find(item => item.id === 'ANN-P14-006');
  assert.equal(find(embedded).contentMarkdown, find(external).contentMarkdown);
  assert(find(external).contentMarkdown.includes('10'));
  assert(find(external).contentMarkdown.includes('3'));
});

test('each language has an independent valid image set and English captions contain no Chinese copy', () => {
  assert.equal(localizedContent.locales.zh.length, 9);
  assert.equal(localizedContent.locales.en.length, 6);
  const chineseImages = new Set(localizedContent.locales.zh.map(item => item.image));
  for (const [language, items] of Object.entries(localizedContent.locales)) {
    assert.equal(new Set(items.map(item => item.id)).size, items.length);
    for (const item of items) {
      assert(fs.existsSync(path.join(root, item.image)), item.image);
      assert(item.alt.trim());
      if (language === 'en') {
        assert(!chineseImages.has(item.image));
        assert(item.caption.trim());
        assert(!/[\u3400-\u9fff]/.test(item.caption + item.alt));
      }
    }
  }
  const html = fs.readFileSync(path.join(root, 'consumer/plan.html'), 'utf8');
  assert(html.indexOf('<script src="feature-carousel-content.js?') < html.indexOf('<script src="../app.js?'));
});

test('Chinese to English to Chinese replaces original and buffer images, labels and captions', () => {
  const s = setup(9, { content: localizedContent });
  s.tick(6360);
  const chinesePosition = s.offset();
  s.setLanguage('en');
  assert.equal(s.track.children.length, 6 + 8);
  assert.match(s.gallery.attrs['aria-label'], /Tongliang highlights, 6 images/);
  for (const slide of s.track.children) {
    const item = localizedContent.locales.en.find(item => item.id === slide.dataset.featureId);
    assert(item);
    assert.equal(slide.querySelector('img').src, `../${item.image}`);
    assert.equal(slide.querySelector('img').alt, item.alt);
    assert.equal(slide.querySelector('.feature-gallery-caption').textContent, item.caption);
    assert.equal(slide.attrs['aria-label'], `Explore ${item.alt}`);
  }
  s.setLanguage('zh');
  assert.equal(s.track.children.length, 9 + 8);
  assert.equal(s.offset(), chinesePosition);
  assert.match(s.gallery.attrs['aria-label'], /共9张/);
  assert.equal(s.track.querySelectorAll('.feature-gallery-caption').length, 0);
  assert.equal(s.timers.size, 1);
});

test('switching while dragging or animating releases capture and leaves one timer and no stale click target', () => {
  for (const phase of ['dragging', 'animating']) {
    const s = setup(9, { content: localizedContent });
    const staleSlide = s.track.children[4];
    if (phase === 'dragging') {
      s.gallery.fire('pointerdown');
      s.gallery.fire('pointermove', { clientX: 100 });
    } else s.tick(3000);
    s.doc.activeElement = staleSlide;
    for (let i = 0; i < 8; i++) { s.setLanguage('en'); s.setLanguage('zh'); }
    s.setLanguage('en');
    assert.equal(s.gallery.captured.size, 0);
    assert(!s.gallery.classList.contains('is-dragging'));
    assert.equal(s.timers.size, 1);
    assert.equal(s.doc.activeElement, s.gallery);
    assert(!s.gallery.contains(staleSlide));
    s.gallery.fire('click', { target: staleSlide });
    assert.deepEqual(s.actions, []);
    const start = s.offset();
    s.tick(3000);
    assert.equal(s.offset(), start - s.step);
  }
});

test('localized card and buffer actions follow their configuration rather than their index', () => {
  const s = setup(9, { content: localizedContent, language: 'en' });
  const cycling = s.track.children.find(item => item.dataset.featureId === 'cycling' && !item.dataset.featureClone);
  s.gallery.fire('click', { target: cycling.querySelector('.feature-gallery-caption') });
  assert.deepEqual(s.actions, ['xuantian-lake-ride']);
  const clone = s.track.children.find(item => item.dataset.featureClone && item.dataset.featureId === 'hotpot');
  s.gallery.fire('click', { target: clone.querySelector('img'), detail: 0 });
  assert.deepEqual(s.actions, ['xuantian-lake-ride', 'local-14']);
  s.swipe(-40);
  assert(s.gallery.fire('click', { target: cycling }).prevented);
  assert.equal(s.actions.length, 2);
});

test('each localized list caps at ten, filters invalid or disabled rows, and permits empty or one-card sets', () => {
  for (const count of [0, 1, 2, 12]) {
    const content = { locales: { zh: localizedContent.locales.zh, en: Array.from({ length: count }, (_, i) => ({
      ...localizedContent.locales.en[0], id: `item-${i}`
    })) } };
    content.locales.en.push({ ...localizedContent.locales.en[0], id: 'off', enabled: false }, { id: 'bad' });
    if (count) content.locales.en.push({ ...content.locales.en[0] }); // Duplicate ID.
    const s = setup(9, { content });
    s.setLanguage('en');
    const originals = s.track.children.filter(node => node.dataset.featureSlide !== undefined && !node.dataset.featureClone);
    assert.equal(originals.length, Math.min(10, count));
    assert(Number.isFinite(s.offset()));
    if (count < 2) assert.equal(s.timers.size, 0);
    if (!count) {
      assert.match(s.track.querySelector('.feature-gallery-empty').textContent, /No highlights available in English/);
      assert.equal(s.offset(), 0);
    }
  }
});

test('missing English config and image failures never fall back to Chinese artwork', () => {
  const missing = setup();
  missing.setLanguage('en');
  assert.equal(missing.track.querySelectorAll('img').length, 0);
  assert.equal(missing.timers.size, 0);
  missing.setLanguage('zh');
  assert.equal(missing.track.querySelectorAll('img').length, 17);
  const s = setup(9, { content: localizedContent, language: 'en' });
  for (const slide of s.track.children) {
    const image = slide.querySelector('img');
    const before = image.src;
    image.fire('error');
    assert(image.hidden);
    assert.equal(image.src, before);
    assert.match(slide.querySelector('.feature-gallery-caption').textContent, /Image unavailable/);
  }
});

test('English autoplay wraps its own six-card list and language changes respect reduced motion', () => {
  const s = setup(9, { content: localizedContent, language: 'en' });
  const initial = s.offset();
  s.tick(18360);
  assert.equal(s.offset(), initial);
  const r = setup(9, { content: localizedContent, reduced: true });
  r.setLanguage('en');
  assert.equal(r.timers.size, 0);
  const before = r.offset();
  r.gallery.fire('keydown', { key: 'ArrowRight' });
  r.tick(0);
  assert.equal(r.offset(), before - r.step);
  assert.equal(r.timers.size, 0);
});

test('page title and map entry labels follow language after repeated background switches', () => {
  const headerStart = source.indexOf('function updateConsumerHeaderLanguage(');
  const headerEnd = source.indexOf('let addWishlistItem', headerStart);
  const switchStart = source.indexOf('function switchConsumerBackground(');
  const switchEnd = source.indexOf('let mapConversationPanel;', switchStart);
  const title = { textContent: '' };
  const entry = new Node('button');
  const screen = new Node('screen');
  screen.classList.toggle = (name, force) => { if (force) screen.classes.add(name); else screen.classes.delete(name); };
  screen.setAttribute = (name, value) => { if (name === 'data-language') screen.dataset.language = value; };
  screen.querySelector = selector => selector === '.main-page-title' ? title : entry;
  const map = new Node('screen');
  map.classList.toggle = (name, force) => { if (force) map.classes.add(name); else map.classes.delete(name); };
  map.querySelector = screen.querySelector;
  let renders = 0;
  const context = vm.createContext({
    planScreen: screen, mapScreen: map, embeddedMapHost: true, consumerBackgroundMode: 'plan',
    realMap: { show() {} }, renderDefaultMapPois: () => renders++, hideMapCategoryHint() {},
    icons: { home: 'home', mapEntry: 'map' }
  });
  vm.runInContext(source.slice(headerStart, headerEnd) + source.slice(switchStart, switchEnd), context);
  vm.runInContext("updateConsumerHeaderLanguage('en')", context);
  assert.equal(title.textContent, 'In Tongliang');
  assert.equal(entry.attrs['aria-label'], 'Open live guide map');
  vm.runInContext("switchConsumerBackground('map')", context);
  assert.equal(title.textContent, 'Live guide');
  assert.equal(entry.dataset.page, 'plan');
  assert.equal(entry.attrs['aria-label'], 'Return to In Tongliang');
  vm.runInContext("updateConsumerHeaderLanguage('zh')", context);
  assert.equal(title.textContent, '边走边耍');
  assert.equal(renders, 1); // Changing language itself does not redraw/reset the map.
  vm.runInContext("switchConsumerBackground('plan')", context);
  assert.equal(title.textContent, '在铜梁');
  vm.runInContext("updateConsumerHeaderLanguage('en'); switchConsumerBackground('map'); switchConsumerBackground('plan')", context);
  assert.equal(title.textContent, 'In Tongliang');
  context.planScreen = null;
  vm.runInContext("updateConsumerHeaderLanguage('en')", context);
  assert.equal(title.textContent, 'Live guide');
  context.mapScreen = null;
  assert.doesNotThrow(() => vm.runInContext("updateConsumerHeaderLanguage('zh')", context));
});

test('the actual language toggle updates the title and carousel together without duplicating handlers', () => {
  const s = setup(9, { content: localizedContent });
  const title = new Node('strong');
  title.className = 'main-page-title';
  s.screen.append(title);
  Object.assign(s.context, {
    consumerBackgroundMode: 'plan', languageCopy: { zh: {}, en: {} },
    languageSwitch: null, activePromptKey: null,
    sharedConversationMessages: [], renderSharedConversation() {}, Event,
    updateJourneyMarqueeLanguage() {}, updateNearbyServiceLanguage() {}, updateMapCategoryLanguage() {},
    updateComposerLanguage() {}, updateLocationContext() {}, refreshConversationDrawer() {}, notify() {}
  });
  s.context.window.dispatchEvent = () => {};
  const headerStart = source.indexOf('function updateConsumerHeaderLanguage(');
  const headerEnd = source.indexOf('let addWishlistItem', headerStart);
  const toggleStart = source.indexOf('const toggleLanguage = () => {');
  const toggleEnd = source.indexOf('if (drawerPhone && (planScreen || mapScreen))', toggleStart);
  vm.runInContext(source.slice(headerStart, headerEnd) + source.slice(toggleStart, toggleEnd), s.context);
  vm.runInContext('toggleLanguage()', s.context);
  assert.equal(title.textContent, 'In Tongliang');
  assert.equal(s.screen.dataset.language, 'en');
  assert.match(s.gallery.attrs['aria-label'], /6 images/);
  assert.equal(s.track.querySelectorAll('.feature-gallery-caption').length, 14);
  vm.runInContext('toggleLanguage()', s.context);
  assert.equal(title.textContent, '在铜梁');
  assert.equal(s.screen.dataset.language, 'zh');
  assert.equal(s.track.querySelectorAll('.feature-gallery-caption').length, 0);
  assert.match(s.gallery.attrs['aria-label'], /共9张/);
  assert.equal(s.gallery.listeners.get('click').length, 1);
  assert.equal(s.gallery.listeners.get('pointerdown').length, 1);
  assert.equal(s.timers.size, 1);
});

test('English image captions remain readable while the header uses shared single-line typography', () => {
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  assert.match(css, /\.plan-screen \.feature-gallery-caption \{[^}]*color: #fff;[^}]*linear-gradient/);
  assert.match(css, /\.plan-screen \.feature-gallery-slide \{[^}]*position: relative/);
  const title = css.match(/\.main-page-title \{([^}]+)\}/);
  assert(title);
  assert.match(title[1], /font-size: 20px/);
  assert.match(title[1], /line-height: 28px/);
  assert.match(title[1], /white-space: nowrap/);
  assert(!css.includes('.plan-screen[data-language="en"] .main-page-appbar .main-page-title'));
  const annotation = JSON.parse(fs.readFileSync(path.join(root, 'consumer/prototype-annotator/annotations.json'), 'utf8'));
  const carousel = Object.values(annotation).filter(Array.isArray).flat().find(item => item.id === 'ANN-P14-006');
  assert(carousel.contentMarkdown.includes('中英文分别配置主图'));
  assert(carousel.contentMarkdown.includes('后台发布、有效期校验和远端快照加载尚未接入'));
});
