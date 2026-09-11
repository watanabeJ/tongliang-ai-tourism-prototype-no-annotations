// Opt-in integration check. Sends three synthetic travel questions through the
// running local proxy and consumes the configured provider's model quota.
const assert = require('node:assert/strict');
const base = `http://127.0.0.1:${Number(process.env.PORT || 4188)}`;
async function chat(language, messages) {
  const response = await fetch(`${base}/api/consumer-agent/chat`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base },
    body: JSON.stringify({ language, messages }), signal: AbortSignal.timeout(70000)
  });
  const data = await response.json();
  assert.equal(response.status, 200, `Agent failure: ${data.error || 'unknown'}`);
  assert.equal(data.model, 'deepseek-v4-flash');
  assert(data.answer.length > 50);
  assert.equal(typeof data.followUp, 'string');
  assert((data.followUp.match(/[?？]/g) || []).length <= 1);
  return data;
}
(async () => {
  const health = await (await fetch(`${base}/api/consumer-agent/health`)).json();
  assert.equal(health.configured, true);
  const first = { role: 'user', content: '我计划周末去安居古城，请先根据已有信息给出出行方式、停车和游逛的初步建议，再按需追问一个能帮助细化安排的问题。无法确认的实时信息请明确说明。' };
  const zh = await chat('zh', [first]);
  console.log(JSON.stringify({ check: 'Chinese answer before optional question', ...zh }));
  const follow = await chat('zh', [
    first, { role: 'assistant', content: `${zh.answer}\n\n${zh.followUp}` },
    { role: 'user', content: '我从铜梁城区自驾，两个大人带一个小孩，上午出发，当天往返。请按这些信息细化，不要再问我交通方式或是否过夜。' }
  ]);
  assert(!/自驾还是|公共交通还是|当天往返还是|住一晚还是/.test(follow.followUp));
  console.log(JSON.stringify({ check: 'Contextual follow-up', ...follow }));
  const en = await chat('en', [{ role: 'user', content: '我想去玄天湖休闲游，请先给初步建议，未确认的开放、租车和路线信息不要编造。' }]);
  assert((en.answer.match(/[A-Za-z]/g) || []).length > en.answer.length / 2);
  console.log(JSON.stringify({ check: 'English reply to Chinese input', ...en }));
  console.log('LIVE_AGENT_SMOKE: 3/3 passed');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
