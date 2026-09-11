// Opt-in: two real model calls plus weather/search queries; consumes provider quota.
const assert = require('node:assert/strict');
const base = 'http://127.0.0.1:4188';
async function chat(payload) {
  const response = await fetch(`${base}/api/consumer-agent/chat`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base },
    body: JSON.stringify(payload), signal: AbortSignal.timeout(90000)
  });
  const result = await response.json();
  assert.equal(response.status, 200, result.error);
  assert(result.answer.length > 30);
  assert.equal(result.model, 'deepseek-v4-flash');
  assert((result.followUp.match(/[?？]/g) || []).length <= 1);
  assert(!/"(?:answer|followUp)"\s*:/.test(result.followUp));
  return result;
}
(async () => {
  const user = { role: 'user', content: '我明天自驾去安居古城，两位大人，当天往返。请推荐项目资料里已有的餐饮卡片，查明天的天气，并搜索古城最新开放信息；没有官方证据的开放情况请说明未核实。先给答案，不要再问出行方式。' };
  const first = await chat({ language: 'zh', messages: [user] });
  assert(first.cards.length > 0);
  assert(first.cards.some(row => row.id === 'merchant-fujiang-shanju-food'));
  assert(first.cards.every(row => row.category === 'eat'));
  assert.equal(first.tools.find(row => row.tool === 'weather')?.status, 'ok');
  assert.equal(first.tools.find(row => row.tool === 'search')?.status, 'ok');
  console.log(JSON.stringify({ check: 'Real model + existing cards + weather + web search',
    answer: first.answer, followUp: first.followUp, entityIds: first.entityIds,
    tools: first.tools.map(row => ({ tool: row.tool, status: row.status, requestedDate: row.requestedDate, sources: row.results?.length })) }));
  const next = await chat({ language: 'en', previousEntityIds: first.entityIds,
    messages: [user, { role: 'assistant', content: first.answer }, { role: 'user', content: '第一家怎么去？请给出地图入口，不要编造距离。' }] });
  assert.equal(next.tools.find(row => row.tool === 'map')?.entityId, first.entityIds[0]);
  assert((next.answer.match(/[A-Za-z]/g) || []).length > next.answer.length / 2);
  console.log(JSON.stringify({ check: 'Previous card + map handoff + English',
    answer: next.answer, followUp: next.followUp, entityIds: next.entityIds,
    tools: next.tools.map(row => ({ tool: row.tool, status: row.status, entityId: row.entityId })) }));
  console.log('LIVE_AGENT_TOOLS_SMOKE: 2/2 passed');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
