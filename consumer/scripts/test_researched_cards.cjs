const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const cards = require('../../data/researched-cards.js');
const { getCatalog, findEntity } = require('../../server/entity-catalog.cjs');
const { planRequest, retrieveEntities } = require('../../server/agent-tools.cjs');
const root = path.resolve(__dirname, '../..');
test('12 sourced complete cards cover all four categories without duplicate IDs or names', () => {
  assert.equal(cards.length, 12);
  for (const type of ['eat', 'stay', 'tour', 'shop']) assert.equal(cards.filter(c => c.type === type).length, 3);
  assert.equal(getCatalog().filter(c => c.hasDetailPage).length, 32);
  for (const c of cards) {
    const row = findEntity(c.id);
    assert.equal(getCatalog().filter(r => r.name === c.name).length, 1);
    assert.equal(row.name, c.name);
    assert.equal(new URL(row.detailHref, 'http://local/').searchParams.get('researchRef'), c.id);
    assert(c.info.address && c.info.description && c.info.specialties.length);
    assert.equal(c.checkedAt, '2026-09-08');
    assert(c.sources.every(s => new URL(s.url).protocol === 'https:' && s.checkedAt === c.checkedAt));
    assert.equal(row.freshness, 'local_snapshot');
    assert.equal(c.packages.length, 0);
    assert(fs.readFileSync(path.join(root, row.image), 'utf8').includes('非场所实拍'));
    assert(!('latitude' in row));
    assert(!('price' in row));
  }
  assert.equal(findEntity('place:玄天湖观景台').hasDetailPage, false);
});
test('named new places can be retrieved even when question category is inferred differently', () => {
  for (const c of cards) {
    const rows = retrieveEntities(planRequest([{ role: 'user', content: `介绍${c.name}，适合去吗？` }]));
    assert(rows.some(row => row.id === c.id), c.name);
  }
});
test('shared browser catalog matches server records and details preserve wishlist identity and sources', () => {
  const context = vm.createContext({ window: {} });
  vm.runInContext(fs.readFileSync(path.join(root, 'data/researched-cards.js'), 'utf8'), context);
  assert.deepEqual(JSON.parse(JSON.stringify(context.window.TongliangResearchedCards)), cards);
  const html = fs.readFileSync(path.join(root, 'consumer/product-detail.html'), 'utf8');
  assert(html.indexOf('src="../data/researched-cards.js') < html.indexOf('const researchRef'));
  assert(html.includes('const wishlistItemId = researchRef ||'));
  assert(html.includes('researchRef && !researchedProduct'));
  assert(html.includes('资料来源'));
});
test('all sourced cards produce real detail links, maps and synchronized favorites in both language modes', async () => {
  const context = vm.createContext({
    window: {}, document: { dispatchEvent() {}, querySelectorAll: () => [] }, Event, URL, Map, Date, navigator: {},
    fetch: async () => new Response(JSON.stringify({ entities: getCatalog() }))
  });
  vm.runInContext(fs.readFileSync(path.join(root, 'consumer-agent-ui.js'), 'utf8'), context);
  await new Promise(resolve => setImmediate(resolve));
  const ui = context.window.TongliangAgentUI;
  for (const language of ['zh', 'en']) for (const c of cards) {
    const message = { entityIds: [c.id], language, text: c.name };
    const answer = ui.renderAnswer(message);
    assert(answer.includes(`data-agent-entity="${c.id}"`), c.name);
    assert(answer.includes('product-detail.html?researchRef='));
    const html = ui.render(message, id => id === c.id);
    assert(html.includes('aria-pressed="true"'));
    assert(html.includes('href="explore.html"'));
    assert(!html.includes('agent-entity.html'));
  }
});
