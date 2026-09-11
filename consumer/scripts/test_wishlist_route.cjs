const test = require('node:test');
const assert = require('node:assert/strict');
const { validateRouteRequest, buildRoute, buildMockRoute, routeContract, formatRouteAnswer, gcjToWgs, wgsToGcj } = require('../../server/wishlist-route.cjs');
const { complete, validatePayload } = require('../../server/consumer-agent.cjs');
const { getCatalog, cardFor } = require('../../server/entity-catalog.cjs');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const stops = [{ id: 'a', name: '甲地' }, { id: 'c', name: '丙地' }, { id: 'b', name: '乙地' }];
const points = { a: [106.0, 29.8], b: [106.01, 29.8], c: [106.03, 29.8] };
function services(overrides = {}) {
  const requests = [];
  return {
    requests, amapKey: 'test-only',
    mapLookup: async ({ entityId: id }) => ({ places: [{ id, name: stops.find(s => s.id === id).name,
      longitude: points[id][0], latitude: points[id][1], address: '测试地址' }] }),
    request: async url => {
      const parsed = new URL(url);
      requests.push(parsed);
      return { status: '1', route: { paths: [{ distance: '1200', cost: { duration: '360' },
        steps: [{ polyline: `${parsed.searchParams.get('origin')};${parsed.searchParams.get('destination')}` }] }] } };
    }, ...overrides
  };
}
const advice = route => JSON.stringify({ stops: route.stops.map(s =>
  ({ id: s.id, visit: '了解当地特色，适当安排体验。', rest: '游玩期间留出休息时间。', caution: '营业与开放信息需要提前核实。' })) });
test('mock route preserves selected order, distinct stable positions and does not invent road metrics', () => {
  const input = { mode: 'driving', stops: Array.from({ length: 10 }, (_, i) => ({ id: `mock-${i}`, name: `测试地点${i}` })) };
  const route = buildMockRoute(input);
  assert.deepEqual(route.stops.map(s => s.id), input.stops.map(s => s.id));
  assert.equal(new Set(route.stops.map(s => s.mapPoint.join(','))).size, 10);
  assert.deepEqual(route.stops.map(s => s.mapPoint), buildMockRoute(input).stops.map(s => s.mapPoint));
  assert.equal(route.simulated, true);
  assert.equal(route.legs.length, 9);
  assert.equal(route.distance, null);
  assert.equal(route.duration, null);
  route.legs.forEach((leg, i) => {
    assert.deepEqual(leg.geometry, [route.stops[i].mapPoint, route.stops[i+1].mapPoint]);
    assert.equal(leg.distance, null);
  });
  const text = formatRouteAnswer(advice(route), route, 'zh').answer;
  assert(text.includes('模拟行程'));
  assert(text.includes('未计算真实距离或车程'));
  assert(!text.includes('0.0 公里'));
  assert(!text.includes('车程为地图服务估算'));
  assert(routeContract(route).includes('模拟地点和模拟连线'));
});
test('mock tool run bypasses unavailable map service and still supplies every selected card to the model', async () => {
  const { createTools } = require('../../server/agent-tools.cjs');
  const known = getCatalog().slice(0, 5).map(({ id, name }) => ({ id, name }));
  const tools = createTools({ amapKey: '', fetchImpl: async () => { throw new Error('Mock route must not query external services'); } });
  const result = await tools.run({ messages: [{ role: 'user', content: '行程规划' }],
    routeRequest: validateRouteRequest({ mode: 'driving', stops: known }) });
  assert.equal(result.routePlan.simulated, true);
  assert.deepEqual(result.entities.map(s => s.id), known.map(s => s.id));
  assert.deepEqual(result.routePlan.stops.map(s => s.id), known.map(s => s.id));
  const demoInput = { mode: 'driving', stops: [known[0], { id: 'demo-stay', name: '岳麓别院民宿' }] };
  const validated = validateRouteRequest(demoInput, { allowMock: true });
  const demo = await tools.run({ messages: [{ role: 'user', content: '测试规划' }], routeRequest: validated });
  assert.equal(demo.routePlan.stops[1].name, '岳麓别院民宿');
  assert.equal(demo.entities[1].hasDetailPage, false);
  assert.equal(demo.entities[1].freshness, 'mock');
  assert.throws(() => validateRouteRequest(demoInput), { code: 'route_place_unresolved' });
});
test('first stop is locked, nearest-next order and every road leg share identical IDs', async () => {
  const deps = services();
  const route = await buildRoute({ stops, mode: 'driving' }, deps);
  assert.deepEqual(route.stops.map(s => s.id), ['a', 'b', 'c']);
  assert.deepEqual(route.legs.map(l => [l.from, l.to]), [['a', 'b'], ['b', 'c']]);
  assert.equal(route.distance, 2400);
  assert.equal(route.duration, 720);
  assert.equal(route.origin, 'first-selected-stop');
  assert.equal(route.coordinateSystem, 'WGS84');
  assert.equal(deps.requests.length, 2);
  assert.match(deps.requests[0].pathname, /v5\/direction\/driving/);
  assert.deepEqual(route.legs[0].geometry[0], route.stops[0].mapPoint);
  const answer = formatRouteAnswer(advice(route), route, 'zh').answer;
  assert(answer.indexOf('## 1. 甲地') < answer.indexOf('## 2. 乙地'));
  assert(answer.includes('2.4 公里'));
  assert(answer.includes('预计驾驶 12 分钟'));
  assert(answer.includes('不代表从您的当前位置'));
});
test('over five stops have distinct coordinates and full leg coverage', async () => {
  const many = Array.from({ length: 7 }, (_, i) => ({ id: `id-${i}`, name: `地点${i}` }));
  const deps = services({ mapLookup: async ({ entityId }) => {
    const i = Number(entityId.split('-')[1]);
    return { places: [{ id: entityId, name: `地点${i}`, longitude: 106+i*.01, latitude: 29.8 }] };
  } });
  const route = await buildRoute({ stops: many, mode: 'driving' }, deps);
  assert.equal(new Set(route.stops.map(s => s.mapPoint.join(','))).size, 7);
  assert.equal(route.legs.length, 6);
});
test('no first fuzzy hit, no ambiguous POI and no invented line when lookup/routing fails', async () => {
  await assert.rejects(buildRoute({ stops }, services({ amapKey: '' })), { code: 'route_not_configured' });
  for (const places of [[], [{ id: 'x', name: '其他地方' }],
    [{ id: 'x', name: '甲地' }, { id: 'y', name: '甲地' }]]) {
    await assert.rejects(buildRoute({ stops }, services({ mapLookup: async () => ({ places }) })), { code: 'route_place_unresolved' });
  }
  await assert.rejects(buildRoute({ stops }, services({ request: async () => ({ status: '0' }) })), { code: 'route_unavailable' });
  await assert.rejects(buildRoute({ stops }, services({ request: async () => ({ status: '1',
    route: { paths: [{ distance: 1, cost: { duration: 2 }, steps: [{ polyline: 'NaN,1;2,3' }] }] } }) })), { code: 'route_unavailable' });
});
test('GCJ02 conversion is applied once and round-trips within one metre', () => {
  for (const point of Object.values(points)) {
    const gcj = wgsToGcj(point), wgs = gcjToWgs(gcj);
    assert(Math.abs(gcj[0]-point[0]) > .001);
    assert(Math.abs(wgs[0]-point[0]) < .00001);
    assert(Math.abs(wgs[1]-point[1]) < .00001);
  }
});
test('model reordered, omitted or added stops are rejected rather than shown against a different map', async () => {
  const route = await buildRoute({ stops }, services());
  const response = JSON.parse(advice(route));
  const mutations = [
    { stops: response.stops.slice().reverse() },
    { stops: response.stops.slice(0, 1) },
    { stops: [...response.stops, response.stops[0]] },
    { stops: response.stops.map((s, i) => ({ ...s, visit: i === 0 ? '然后去丙地。' : s.visit })) }
  ];
  for (const data of mutations) assert.throws(() => formatRouteAnswer(JSON.stringify(data), route, 'zh'),
    { code: 'route_answer_mismatch' });
  assert.throws(() => formatRouteAnswer(advice(route), route, 'en'), { code: 'route_answer_mismatch' });
  const englishAdvice = JSON.stringify({ stops: route.stops.map(s => ({ id: s.id,
    visit: 'Explore the local sights at a relaxed pace.', rest: 'Allow breaks and bring water.', caution: 'Check opening information in advance.' })) });
  const en = formatRouteAnswer(englishAdvice, route, 'en').answer;
  assert(en.includes('2.4 km / 12 min'));
  assert(en.includes('not your device location'));
});
test('payload only accepts known unique locations and the supported driving mode', () => {
  const known = getCatalog().slice(0, 2).map(({ id, name }) => ({ id, name }));
  assert.equal(validateRouteRequest({ mode: 'driving', stops: known }).stops.length, 2);
  assert.throws(() => validateRouteRequest({ mode: 'walking', stops: known }), { code: 'invalid_route_request' });
  assert.throws(() => validateRouteRequest({ mode: 'driving', stops: [known[0], known[0]] }), { code: 'route_duplicate_stop' });
  assert.throws(() => validateRouteRequest({ mode: 'driving', stops: [known[0], { name: '未知地点' }] }), { code: 'route_place_unresolved' });
  const payload = validatePayload({ language: 'zh', messages: [{ role: 'user', content: '请规划' }],
    routeRequest: { mode: 'driving', stops: known } });
  assert.equal(payload.routeRequest.mode, 'driving');
});
test('completion supplies locked route to model and returns the same route object with formatted prose', async () => {
  const entities = getCatalog().slice(0, 2);
  const route = await buildRoute({ stops: stops.slice(0, 2), mode: 'driving' }, services());
  route.stops.forEach((s, i) => { s.id = entities[i].id; s.name = entities[i].name; });
  route.legs[0].from = entities[0].id; route.legs[0].to = entities[1].id;
  let request;
  const response = await complete({
    apiKey: 'test', payload: { language: 'zh', messages: [{ role: 'user', content: '规划' }],
      routeRequest: { mode: 'driving', stops: route.stops } },
    tools: { run: async () => ({ routePlan: route, today: '2026-09-09', plan: { scene: 'plan' },
      entities: entities.map(cardFor), tools: [], needsLocation: false }) },
    fetchImpl: async (_url, options) => {
      request = JSON.parse(options.body);
      return { ok: true, json: async () => ({ choices: [{ finish_reason: 'stop', message: { content: advice(route) } }] }) };
    }
  });
  assert(request.messages[0].content.includes('stops必须'));
  assert.equal(response.routePlan, route);
  assert(response.answer.includes(`## 1. ${route.stops[0].name}`));
});
test('client sends structured selection, ignores simulated location and only applies current route result', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../../app.js'), 'utf8');
  const start = source.indexOf("if (event.target.closest('[data-wishlist-selection-map]'))");
  const block = source.slice(start, source.indexOf("const groupVisitedButton", start));
  assert(block.includes('routeRequest:'));
  assert(block.includes('id: `route-${Date.now()}'));
  assert(!block.includes('readCurrentLocation'));
  assert(!block.includes('connect: true'));
  assert(!block.includes('configureLocationPermission'));
  assert(source.includes('message.id === activeWishlistRouteRequestId'));
  assert(source.includes('message.routePlan = response.routePlan'));
  assert(source.includes('data-conversation-route='));
});

test('itinerary markers reuse wishlist category icons and names without numeric badges', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../../app.js'), 'utf8');
  const resolverStart = source.indexOf('const getWishlistCategory =');
  const resolverEnd = source.indexOf('\nlet getWishlistPoiNumber', resolverStart);
  const showStart = source.indexOf('function showConversationRoute(message)');
  const showEnd = source.indexOf('\nasync function requestConsumerAgentMessage', showStart);
  const icons = { food: '<svg>food</svg>', hotel: '<svg>hotel</svg>', flag: '<svg>flag</svg>', bag: '<svg>bag</svg>' };
  const html = [];
  const context = vm.createContext({
    icons, window: { TongliangAgentUI: { getEntity: id => id === 'known-shop' ? { category: 'shop' } : null } },
    realMap: { showPlan(route, options) { route.stops.forEach(stop => html.push(options.renderStopIcon(stop))); return true; } },
    embeddedMapHost: null, markerLayer: null, markerCard: null,
    openActiveConversation() {}, wishlistMapDisplayMode: 'route',
    truncateWishlistPoiName: text => text, escapeHTML: text => text.replace(/</g, '&lt;')
  });
  vm.runInContext(source.slice(resolverStart, resolverEnd) + source.slice(showStart, showEnd), context);
  context.stops = [{ name: '西郊雅社民宿' }, { name: '湖畔生态鱼庄' }, { name: '安居古城' },
    { name: '风物集市' }, { id: 'known-shop', name: '<商品名称>' }];
  vm.runInContext('showConversationRoute({routePlan:{stops}})', context);
  ['stay', 'eat', 'tour', 'shop', 'shop'].forEach((category, i) => {
    assert(html[i].includes(`wishlist-poi-type-${category}`));
    assert(!html[i].includes('plan-marker-number'));
  });
  assert(html[0].includes(icons.hotel));
  assert(html[1].includes(icons.food));
  assert(html[2].includes(icons.flag));
  assert(html[3].includes(icons.bag));
  assert(html[4].includes('&lt;商品名称>'));
});

test('route clicks reuse original catalog/category card data and retain wishlist/detail identities', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../../app.js'), 'utf8');
  const start = source.indexOf('function routeStopPoi(');
  const end = source.indexOf('\nfunction showConversationRoute', start);
  const entity = { id: 'merchant-xijiao', name: '西郊雅社民宿', image: 'assets/original.jpg',
    address: '铜梁区西来村', description: '原卡片介绍', hasDetailPage: true,
    detailHref: 'product-detail.html?knowledgeRef=merchant-xijiao', kind: 'merchant' };
  const context = vm.createContext({
    currentLanguage: 'zh',
    window: { TongliangAgentUI: { getEntity: id => id === entity.id ? entity : null } },
    categoryData: { stay: { places: [['岳麓别院民宿', '4.6', '72', '精品民宿', '巴岳寺旁', '预订', 'assets/recommend-3.png']] } },
    getMapWishlistRows: () => [{ name: '岳麓别院民宿', key: 'category-stay-0-123456' }]
  });
  vm.runInContext(source.slice(start, end), context);
  const original = vm.runInContext("routeStopPoi({id:'merchant-xijiao',name:'西郊雅社民宿',address:'模拟点位 / Mock location'})", context);
  assert.equal(original.image, entity.image);
  assert.equal(original.address, entity.address);
  assert.equal(original.detailHref, entity.detailHref);
  const demo = vm.runInContext("routeStopPoi({id:'mock:123',name:'岳麓别院民宿'})", context);
  assert.equal(demo.image, 'assets/recommend-3.png');
  assert.equal(demo.address, '巴岳寺旁');
  assert.equal(demo.wishlistId, 'category-stay-0');
  assert.equal(vm.runInContext("routeStopPoi({id:'missing',name:'无卡片地点'})", context), null);
  const show = source.slice(end, source.indexOf('\nasync function requestConsumerAgentMessage', end));
  assert(show.includes('onStopClick: stop =>'));
  assert(show.includes('renderPoiActionCard(poi)'));
  assert(show.includes('bindPoiCardActions(poi)'));
  assert(!show.includes('renderMarqueePoi('));
});
