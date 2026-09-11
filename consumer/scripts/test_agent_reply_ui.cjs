const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { getCatalog } = require('../../server/entity-catalog.cjs');
const { planRequest, retrieveEntities, createTools } = require('../../server/agent-tools.cjs');
const { systemPrompt, complete } = require('../../server/consumer-agent.cjs');
const root = path.resolve(__dirname, '../..');
async function setup(rows = getCatalog(), buttons = []) {
  const context = vm.createContext({
    window: {}, document: { dispatchEvent() {}, querySelectorAll: () => buttons }, Event, URL, Map, Date, navigator: {},
    fetch: async () => new Response(JSON.stringify({ entities: rows }), { headers: { 'Content-Type': 'application/json' } })
  });
  vm.runInContext(fs.readFileSync(path.join(root, 'consumer-agent-ui.js'), 'utf8'), context);
  await new Promise(resolve => setImmediate(resolve));
  return context.window.TongliangAgentUI;
}
test('location authorization stays out of replies and restored history without granting consent or removing cards', async () => {
  const ui = await setup();
  for (const language of ['zh', 'en']) {
    for (const needsLocation of [true, false]) {
      const message = { language, needsLocation, entityIds: ['product:lake-eco-fish'] };
      const before = JSON.stringify(message);
      const html = ui.render(message);
      assert(!html.includes('agent-location-note'));
      assert(!html.includes('data-agent-location'));
      assert(!html.includes('一次性授权定位'));
      assert(!html.includes('Use my location once'));
      assert(html.includes('湖畔生态鱼庄'));
      assert(html.includes('href="explore.html"'));
      assert(html.includes('agent-map.html'));
      assert.equal(ui.getLocation(), undefined);
      assert.equal(JSON.stringify(message), before);
    }
  }
  assert.equal(ui.render({ needsLocation: true, entityIds: [] }), '');
});

test('private shown-card labels are absent from new and restored replies without removing recommendations', async () => {
  const ui = await setup();
  for (const label of ['已展示卡片 / Shown cards:', '已展示卡片：', 'Shown cards:', '**已展示卡片 / Shown cards:**', '> Shown cards:']) {
    const text = `推荐湖畔生态鱼庄。\n\n${label} 湖畔生态鱼庄、安居古城\n\n可以查看已展示卡片了解详情。`;
    for (const language of ['zh', 'en']) {
      const message = { text, language };
      const before = JSON.stringify(message);
      const html = ui.renderAnswer(message);
      assert(!html.includes('Shown cards'));
      assert(!html.includes('安居古城'));
      assert(html.includes('推荐'));
      assert(html.includes('可以查看已展示卡片了解详情'));
      assert(html.includes('data-agent-entity="product:lake-eco-fish"'));
      assert.equal(JSON.stringify(message), before);
    }
  }
});
test('each reply card has a rightmost localized consultation button with the same simple map chat icon', async () => {
  const ui = await setup();
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const chatPath = 'M20 11.5a8 8 0 0 1-8 8H4l1.4-4.1A8 8 0 1 1 20 11.5Z';
  assert(app.includes(`,chat: svg('<path d="${chatPath}"/>')`));
  for (const language of ['zh', 'en']) {
    const html = ui.render({ language, entityIds: ['product:lake-eco-fish', 'web:qihao'] });
    assert.equal((html.match(/data-agent-chat=/g) || []).length, 2);
    for (const id of ['product:lake-eco-fish', 'web:qihao']) {
      assert(html.indexOf(`data-agent-chat="${id}"`) > html.indexOf(`data-agent-wishlist="${id}"`));
    }
    assert(html.includes(chatPath));
    assert(html.includes(language === 'en' ? 'Ask about 七号私厨' : '咨询七号私厨'));
    assert(!html.includes('data-agent-chat="undefined"'));
  }
});
test('both card consultation entry points send the selected name in the active language and preserve drafts', () => {
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const from = app.indexOf('function consultEntityCard(');
  const to = app.indexOf('const bindPoiCardActions', from);
  const sent = [], opened = [];
  const context = vm.createContext({
    currentLanguage: 'zh',
    sendComposerMessage: (prompt, options) => sent.push({ prompt, options }),
    openActiveConversation: state => opened.push(state)
  });
  vm.runInContext(app.slice(from, to), context);
  for (const language of ['zh', 'en']) {
    context.currentLanguage = language;
    vm.runInContext("consultEntityCard({name:'七号私厨', enabled:true});", context);
    assert(sent.at(-1).prompt.includes('七号私厨'));
    assert(sent.at(-1).prompt.startsWith(language === 'en' ? 'Tell me' : '我想咨询'));
    assert.equal(sent.at(-1).options.preserveDraft, true);
    assert.equal(opened.at(-1), 'half');
  }
  vm.runInContext("consultEntityCard(null); consultEntityCard({name:'失效卡片', enabled:false});", context);
  assert.equal(sent.length, 2);
  assert(app.includes("chatButton?.addEventListener('click', () => consultEntityCard(poi))"));
  assert(app.includes('getEntity(agentChat.dataset.agentChat)'));
  assert(app.includes('if (entity?.enabled) consultEntityCard(entity)'));
});
test('map favorite state matches reply white circles and red heart fills, including accessible updates', () => {
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  const from = app.indexOf('function updatePoiWishlistAction(');
  const to = app.indexOf('function consultEntityCard(', from);
  const attrs = {}, states = {};
  let added = false;
  const button = { dataset: { poiWishlist: 'web:qihao', poiWishlistName: '七号私厨' }, classList: { toggle: (key, value) => states[key] = value }, setAttribute: (key, value) => attrs[key] = value };
  const context = vm.createContext({ button, isWishlistItemAdded: () => added });
  vm.runInContext(app.slice(from, to), context);
  for (added of [false, true, false]) {
    vm.runInContext('updatePoiWishlistAction(button)', context);
    assert.equal(states['is-added'], added);
    assert.equal(attrs['aria-pressed'], String(added));
  }
  assert.match(css, /\.poi-card-actions > \.poi-card-wishlist\.is-added svg \{ fill: currentColor; \}/);
  assert.match(css, /\.poi-card-actions > \.poi-card-wishlist:hover \{\s*color: #e64063; background: #fff;/);
  assert(app.includes("document.querySelectorAll('[data-poi-wishlist]').forEach(updatePoiWishlistAction)"));
});
test('empty map lookup is hidden while cards, map actions and other tool evidence remain unchanged', async () => {
  const ui = await setup();
  for (const language of ['zh', 'en']) {
    const message = { language, entityIds: ['product:lake-eco-fish'], tools: [{ tool: 'map', status: 'empty' }] };
    const before = JSON.stringify(message);
    const html = ui.render(message);
    assert(!html.includes('agent-tool-note'));
    assert(!html.includes('没有匹配结果'));
    assert(!html.includes('no matching results'));
    assert(html.includes('href="explore.html"'));
    assert(html.includes('data-agent-wishlist="product:lake-eco-fish"'));
    assert.equal(JSON.stringify(message), before);
    assert(ui.render({ language, tools: [{ tool: 'weather', status: 'error' }] }).includes('role="status"'));
    assert(!ui.render({ language, tools: [{ tool: 'map', status: 'ok', entityId: 'product:lake-eco-fish' }] }).includes('agent-tool-note'));
  }
});
test('history sends prose without echoed card bookkeeping while retaining separate previous-card IDs', async () => {
  const ui = await setup();
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const from = app.indexOf('function buildConsumerAgentHistory(');
  const to = app.indexOf('async function requestConsumerAgentMessage(', from);
  const context = vm.createContext({
    window: { TongliangAgentUI: ui },
    sharedConversationMessages: [
      { role: 'user', text: '推荐吃饭' },
      { type: 'agent', status: 'complete', text: '推荐湖畔生态鱼庄。\n\n已展示卡片 / Shown cards: 湖畔生态鱼庄', followUp: '想几点去？', cards: [{ name: '湖畔生态鱼庄' }] }
    ]
  });
  vm.runInContext(`${app.slice(from, to)}; result = buildConsumerAgentHistory();`, context);
  assert.equal(context.result[1].content, '推荐湖畔生态鱼庄。\n\n想几点去？');
  assert(app.includes('previousEntityIds:'));
  assert(systemPrompt('zh').includes('不在answer或followUp中复述'));
});
test('reply renders titles, sections, lists, emphasis, notes and separators without raw markdown markers', async () => {
  const ui = await setup();
  const html = ui.renderAnswer({ language: 'zh', text: '# 🗺️ 铜梁一日游\n\n> 建议安排，不是营业时间\n\n## 🕘 上午\n\n- 游览**安居古城**\n- 🌿 预留休息\n\n---\n\n## 📌 提醒\n\n1. 带水\n2. 核对开放公告' });
  assert(html.startsWith('<h2>🗺️ 铜梁一日游</h2>'));
  assert(html.includes('<h3>🕘 上午</h3>'));
  assert(html.includes('<blockquote>'));
  assert(html.includes('<ul><li>'));
  assert(html.includes('<ol start="1"><li>'));
  assert(html.includes('<hr>'));
  assert(!html.includes('**'));
  assert.match(html, /<strong><a[^>]+>安居古城<\/a><\/strong>/);
});
test('all known body entities link to their own card details, including outside the three displayed cards', async () => {
  const ui = await setup();
  const html = ui.renderAnswer({ text: '安居古城 → 玄天湖 → 湖畔生态鱼庄 → 风物集市。\n安居古城可以慢逛。', language: 'zh', entityIds: [] });
  assert.equal((html.match(/class="agent-entity-link"/g) || []).length, 4);
  assert(html.includes('data-agent-entity="product:lake-eco-fish"'));
  assert(html.includes('product-detail.html?item=lake-eco-fish&amp;lang=zh'));
  assert.equal((html.match(/data-agent-entity="place:安居古城"/g) || []).length, 2);
  assert(!ui.renderAnswer({ text: '一家完全不存在的测试餐厅', language: 'zh' }).includes('<a'));
});
test('long names are not split into shorter names; same-name ambiguous aliases do not guess', async () => {
  const ui = await setup();
  const html = ui.renderAnswer({ text: '玄天湖环湖步道和玄天湖', language: 'en' });
  assert.equal((html.match(/class="agent-entity-link"/g) || []).length, 1);
  assert(html.includes('data-agent-entity="product:xuantian-lake-trail"'));
  assert(html.includes('&amp;lang=en'));
  const shortName = ui.renderAnswer({ text: '玄天湖龙火锅', language: 'zh' });
  assert(shortName.includes('data-agent-entity="merchant-xuantian-lake-dragon-hotpot"'));
  assert(!shortName.includes('data-agent-entity="place:玄天湖"'));
  const area = ui.renderAnswer({ text: '玄天湖景区', language: 'zh' });
  assert(!area.includes('data-agent-entity="product:xuantian-lake-trail"'));
  const rows = ['a', 'b'].map(id => ({ id, name: `餐厅${id}`, aliases: ['同名餐厅'], enabled: true, detailHref: `product-detail.html?item=${id}` }));
  assert(!((await setup(rows)).renderAnswer({ text: '同名餐厅', language: 'zh' })).includes('<a'));
});
test('model HTML, image markup, scripts and authored links cannot inject HTML or arbitrary destinations', async () => {
  const ui = await setup();
  const html = ui.renderAnswer({ language: 'zh', text: '<img src=x onerror=alert(1)>\n[安居古城](javascript:evil)\n[陌生店铺](https://evil.example)\n`<script>bad()</script>`\n![图片](https://evil.example/image.png)' });
  assert(!html.includes('<img'));
  assert(!html.includes('<script>'));
  assert(!html.includes('href="javascript:'));
  assert(!html.includes('href="https://evil'));
  assert(html.includes('&lt;img'));
  assert(html.includes('data-agent-entity="place:安居古城"'));
  assert(html.includes('安居古城'));
  assert(!ui.renderAnswer({ text: 'https://example.com/安居古城', language: 'zh' }).includes('<a'));
});
test('catalog failure stays readable; legacy bracket headings and follow-up names also render', async () => {
  const empty = await setup([]);
  assert.equal(empty.renderAnswer({ text: '安居古城\n\n普通文字', language: 'zh' }), '<p>安居古城</p><p>普通文字</p>');
  const ui = await setup();
  assert(ui.renderAnswer({ text: '【上午·山水】玄天湖\n\n【待确认】查询天气', language: 'zh' }).includes('<h3>上午·山水</h3>'));
  assert(ui.renderInline('你想先去安居古城吗？', 'zh').includes('agent-entity-link'));
  assert(ui.renderInline('你想去湖畔生态鱼庄吗？', 'zh').includes('agent-entity-link'));
});
test('wishlist states are accessible and icon rules outrank the old 22px and 11px rules', async () => {
  const ui = await setup();
  const message = { entityIds: ['product:lake-eco-fish'], language: 'zh' };
  assert(ui.render(message).includes('aria-pressed="false"'));
  assert(ui.render(message, () => true).includes('aria-pressed="true"'));
  assert(ui.render(message).includes('aria-hidden="true" focusable="false"'));
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  assert.match(css, /\.agent-entity-card \.marquee-entity-card-actions > \.marquee-entity-wishlist \{[^}]*width: 32px;[^}]*height: 32px;[^}]*flex: 0 0 32px/);
  assert.match(css, /\.agent-entity-card \.marquee-entity-card-actions > \.marquee-entity-wishlist svg \{[^}]*width: 18px;[^}]*height: 18px/);
});
test('compact cards show the real record address with the same address class as map cards', async () => {
  const ui = await setup();
  const html = ui.render({ entityIds: ['product:lake-eco-fish'], language: 'zh' });
  assert(html.includes('class="poi-address-navigate agent-card-address"'));
  assert(html.includes('铜梁区玄天湖西岸'));
  assert(html.includes('aria-label="查看湖畔生态鱼庄位置"'));
  assert(!html.includes('agent-card-note'));
  assert(!html.includes('项目已有资料'));
  const unknown = await setup([{ id: 'test', name: '测试地点', enabled: true, image: 'assets/map.png', detailHref: 'product-detail.html?item=test' }]);
  assert(unknown.render({ entityIds: ['test'], language: 'zh' }).includes('地址待补充'));
  assert(unknown.render({ entityIds: ['test'], language: 'en' }).includes('Address not supplied'));
});
test('card location icon goes directly to Live guide while address, detail and wishlist keep their behavior', async () => {
  const ui = await setup();
  for (const language of ['zh', 'en']) {
    const html = ui.render({ entityIds: ['merchant-xuantian-lake-dragon-hotpot'], language });
    assert(html.includes('class="marquee-entity-card-map" href="explore.html"'));
    assert(html.includes(language === 'en' ? 'Open Live guide map' : '进入边走边耍地图'));
    assert(html.includes(`href="agent-map.html?id=merchant-xuantian-lake-dragon-hotpot&amp;lang=${language}"`) ||
      html.includes(`href="agent-map.html?id=merchant-xuantian-lake-dragon-hotpot&lang=${language}"`));
    assert(html.includes('product-detail.html?knowledgeRef=merchant-xuantian-lake-dragon-hotpot'));
    assert(html.includes('data-agent-wishlist="merchant-xuantian-lake-dragon-hotpot"'));
  }
  assert(fs.existsSync(path.join(root, 'consumer/explore.html')));
});
test('search sources stay out of Chinese and English replies without altering evidence or failure notices', async () => {
  const ui = await setup();
  for (const language of ['zh', 'en']) {
    const message = { language, entityIds: ['product:lake-eco-fish'], tools: [
      { tool: 'search', status: 'ok', accessMode: 'keyless_limited', results: [
        { id: 'web:1', title: 'Hidden source title', snippet: 'Hidden source excerpt', url: 'https://example.com/source' }
      ] }
    ] };
    const before = JSON.stringify(message);
    const html = ui.render(message);
    assert(!html.includes('agent-sources'));
    assert(!html.includes('<details'));
    assert(!html.includes('Hidden source'));
    assert(html.includes('湖畔生态鱼庄'));
    assert.equal(JSON.stringify(message), before);
    assert(ui.render({ language, tools: [{ tool: 'search', status: 'error' }] }).includes('role="status"'));
  }
});
test('related cards appear directly without a Chinese or English heading', async () => {
  const ui = await setup();
  for (const language of ['zh', 'en']) {
    const html = ui.render({ language, entityIds: ['product:lake-eco-fish'] });
    assert(html.includes('<section class="agent-related"><div class="marquee-entity-carousel">'));
    assert(!html.includes('匹配到的已有卡片'));
    assert(!html.includes('Matching project cards'));
    assert(html.includes('湖畔生态鱼庄'));
    assert(html.includes('href="explore.html"'));
    assert(html.includes('data-agent-wishlist="product:lake-eco-fish"'));
    assert(!ui.render({ language, entityIds: [] }).includes('agent-related'));
  }
});
test('brief-only places never gain blue links or intermediate cards, even in restored history', async () => {
  const ui = await setup();
  for (const language of ['zh', 'en']) {
    const message = { language, text: '**玄天湖观景台**、安居古城、湖畔生态鱼庄',
      entityIds: ['place:玄天湖观景台', 'place:安居古城', 'product:lake-eco-fish'],
      cards: [{ id: 'place:玄天湖观景台', detailHref: 'agent-entity.html?id=place:玄天湖观景台' }] };
    const answer = ui.renderAnswer(message);
    assert(answer.includes('<strong>玄天湖观景台</strong>'));
    assert.equal((answer.match(/class="agent-entity-link"/g) || []).length, 2);
    assert(answer.includes('product-detail.html?item=lake-eco-fish'));
    const cards = ui.render(message);
    assert(!cards.includes('玄天湖观景台'));
    assert(cards.includes('安居古城'));
    assert(!cards.includes('agent-entity.html'));
    assert(cards.includes('湖畔生态鱼庄'));
  }
  const stale = await setup([{ id: 'old', name: '旧占位地点', enabled: true, detailHref: 'agent-entity.html?id=old' }]);
  assert(!stale.renderAnswer({ text: '旧占位地点', language: 'zh' }).includes('<a'));
  assert(!stale.render({ entityIds: ['old'] }).includes('agent-related'));
});
test('server returns only full-detail cards while brief place knowledge remains available to the model', async () => {
  const entities = getCatalog().filter(row => ['place:玄天湖观景台', 'product:lake-eco-fish'].includes(row.id));
  let supplied;
  const result = await complete({ apiKey: 'test-only-model-key',
    payload: { language: 'zh', messages: [{ role: 'user', content: '推荐玄天湖游玩和餐厅' }] },
    tools: { run: async () => ({ today: '2026-09-08', plan: { scene: 'recommend', destination: ['玄天湖'] }, entities, tools: [], needsLocation: false }) },
    fetchImpl: async (_url, options) => {
      supplied = JSON.parse(options.body).messages.at(-1).content;
      return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({
        answer: '可了解玄天湖观景台，也可查看湖畔生态鱼庄。', followUp: '', entityIds: entities.map(row => row.id), sourceIds: []
      }) }, finish_reason: 'stop' }] }));
    }
  });
  assert(supplied.includes('玄天湖观景台'));
  assert(supplied.includes('"hasDetailPage":false'));
  assert.deepEqual(result.entityIds, ['product:lake-eco-fish']);
  assert.equal(result.cards.length, 1);
});
test('rapid multi-card favorites commit immediately and synchronize every occurrence without rebuilding cards', async () => {
  const button = (id, language) => {
    const attrs = {}, svgAttrs = {}, classes = new Set();
    return { dataset: { agentWishlist: id, agentLanguage: language }, attrs, svgAttrs, classes,
      classList: { toggle(name, on) { if (on) classes.add(name); else classes.delete(name); } },
      setAttribute(name, value) { attrs[name] = value; },
      querySelector() { return { setAttribute(name, value) { svgAttrs[name] = value; } }; }
    };
  };
  const buttons = [button('product:xuantian-lake-trail', 'zh'), button('product:lake-eco-fish', 'zh'),
    button('product:xuantian-lake-trail', 'en'), button('merchant-xuantian-lake-dragon-hotpot', 'zh')];
  const ui = await setup(getCatalog(), buttons);
  let added = [], removed = [], flights = 0;
  const matches = (candidate, id) => candidate === id || candidate.startsWith(`${id}-`);
  const isAdded = id => added.some(row => matches(row.id, id)) && !removed.some(key => matches(key, id));
  const context = vm.createContext({
    Date, Set, window: { setTimeout() { throw Error('Wishlist persistence must not wait for an animation'); } },
    wishlistItemMatchesId: matches, isWishlistItemAdded: isAdded,
    readAddedWishlistItems: () => added, writeAddedWishlistItems: rows => { added = rows; },
    readRemovedWishlistItems: () => removed, writeRemovedWishlistItems: rows => { removed = rows; },
    flyIntoWishlist: () => flights++, renderWishlist: () => ui.syncWishlist(isAdded),
    selectedWishlistItems: new Set(), addWishlistItem: null, removeWishlistItem: null
  });
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const from = app.indexOf('  addWishlistItem = (item, source) => {');
  const to = app.indexOf('  renderWishlist();\n  document.addEventListener', from);
  assert(from > 0 && to > from);
  vm.runInContext(app.slice(from, to), context);
  for (const id of ['xuantian-lake-trail', 'lake-eco-fish', 'merchant-xuantian-lake-dragon-hotpot']) {
    context.addWishlistItem({ id, name: id });
  }
  assert.equal(added.length, 3);
  assert.equal(flights, 3);
  for (const node of buttons) {
    assert(node.classes.has('is-added'));
    assert.equal(node.attrs['aria-pressed'], 'true');
    assert.equal(node.svgAttrs.fill, 'currentColor');
  }
  assert.equal(buttons[2].attrs['aria-label'], 'Remove from wishlist');
  context.addWishlistItem({ id: 'xuantian-lake-trail', name: 'duplicate' });
  assert.equal(added.length, 3);
  context.removeWishlistItem('xuantian-lake-trail');
  assert.equal(added.length, 2);
  for (const index of [0, 2]) {
    assert.equal(buttons[index].attrs['aria-pressed'], 'false');
    assert.equal(buttons[index].svgAttrs.fill, 'none');
  }
  assert.equal(buttons[1].attrs['aria-pressed'], 'true');
  context.addWishlistItem({ id: 'xuantian-lake-trail', name: 're-add' });
  assert.equal(added.length, 3);
  assert.equal(buttons[2].attrs['aria-pressed'], 'true');
  added = []; removed = [];
  ui.syncWishlist(isAdded);
  assert(buttons.every(node => node.attrs['aria-pressed'] === 'false'));
  const handler = app.slice(app.indexOf("  const agentWishlist = event.target.closest('[data-agent-wishlist]')"), app.indexOf("  const agentLocation = event.target.closest('[data-agent-location]')"));
  assert(!handler.includes('renderSharedConversation()'));
  assert(handler.includes('syncWishlist'));
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  assert.match(css, /\.agent-entity-card \.marquee-entity-card-actions > \.marquee-entity-wishlist\.is-added \{[^}]*color: #e64063;[^}]*background: #fff;[^}]*border-color: rgba\(22,119,210,\.25\)/);
});
test('mixed day itinerary retrieves attractions, food and shopping without losing the requested themes', () => {
  const rows = retrieveEntities(planRequest([{ role: 'user', content: '请规划铜梁一日游，结合山水、古城、美食和购物，留出休息时间' }]));
  assert(rows.some(row => row.name === '安居古城'));
  assert(rows.some(row => row.name === '玄天湖'));
  assert(rows.some(row => row.category === 'eat'));
  assert(rows.some(row => row.category === 'shop'));
  const prompt = systemPrompt('zh');
  for (const rule of ['Markdown', '🗺️', '建议时段', '不能声称“全程不走回头路”', '完整名称']) assert(prompt.includes(rule));
  assert(prompt.includes('最多一个'));
});
test('map excludes unrelated fuzzy matches and deduplicates municipality names', async () => {
  const tools = createTools({ amapKey: 'test-only-map-key', fetchImpl: async () => new Response(JSON.stringify({
    status: '1', pois: [
      { id: 'wrong', name: '象山生态鱼庄', location: '106,29.9' },
      { id: 'right', name: '湖畔生态鱼庄', pname: '重庆市', cityname: '重庆市', adname: '铜梁区', address: '湖边', location: '106,29.9' }
    ]
  })) });
  const result = await tools.mapLookup({ entityId: 'product:lake-eco-fish' });
  assert.equal(result.places.length, 1);
  assert.equal(result.places[0].id, 'right');
  assert.equal(result.places[0].address, '重庆市铜梁区湖边');
  const unmatched = createTools({ amapKey: 'test-only-map-key', fetchImpl: async () => new Response(JSON.stringify({
    status: '1', pois: [{ id: 'wrong', name: '象山生态鱼庄', location: '106,29.9' }]
  })) });
  assert.equal((await unmatched.mapLookup({ entityId: 'product:lake-eco-fish' })).status, 'empty');
});
