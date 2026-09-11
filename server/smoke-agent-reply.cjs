// Opt-in: one real model request with the newly configured map tool.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { getCatalog } = require('./entity-catalog.cjs');
(async () => {
  const response = await fetch('http://127.0.0.1:4188/api/consumer-agent/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://127.0.0.1:4188' },
    body: JSON.stringify({ language: 'zh', messages: [{
      role: 'user', content: '请规划铜梁一日游，两位成年人自驾，当天往返，不需要住宿。希望结合山水、古城、美食和购物，节奏轻松并留出休息时间。用清楚的小标题、适量表情和列表呈现，先给完整建议。'
    }] }), signal: AbortSignal.timeout(90000)
  });
  const data = await response.json();
  assert.equal(response.status, 200, data.error);
  assert.equal(data.model, 'deepseek-v4-flash');
  assert(/^#{1,3} /m.test(data.answer), 'Expected section headings');
  assert(/\p{Extended_Pictographic}/u.test(data.answer), 'Expected useful icons');
  assert(/^[-*] /m.test(data.answer), 'Expected short lists');
  assert.equal(data.tools.find(row => row.tool === 'map')?.status, 'ok');
  const context = vm.createContext({
    window: {}, document: { dispatchEvent() {} }, Event, URL, Map, Date, navigator: {},
    fetch: async () => new Response(JSON.stringify({ entities: getCatalog() }))
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../consumer-agent-ui.js'), 'utf8'), context);
  await new Promise(resolve => setImmediate(resolve));
  const rendered = context.window.TongliangAgentUI.renderAnswer({ ...data, text: data.answer, language: 'zh' });
  const linked = [...rendered.matchAll(/data-agent-entity="([^"]+)"/g)].map(match => match[1]);
  assert(linked.length > 0);
  assert(linked.every(id => getCatalog().some(row => row.id === id && row.hasDetailPage)));
  assert(!rendered.includes('agent-entity.html'));
  assert(!rendered.includes('**'));
  console.log(JSON.stringify({ check: 'Live structured itinerary + map + safe inline entity links',
    answer: data.answer, followUp: data.followUp, linkedEntities: [...new Set(linked)],
    cards: data.cards.map(row => row.name), mapStatus: data.tools.find(row => row.tool === 'map')?.status }));
  console.log('LIVE_REPLY_SMOKE: passed');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
