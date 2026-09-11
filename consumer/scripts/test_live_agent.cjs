const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { once } = require('node:events');
const root = path.resolve(__dirname, '../..');
const { complete, parseAnswer, validatePayload, systemPrompt } = require('../../server/consumer-agent.cjs');
const { createPrototypeServer } = require('../../serve-prototype.js');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const clientSource = fs.readFileSync(path.join(root, 'consumer-agent.js'), 'utf8');
const payload = { language: 'zh', messages: [{ role: 'user', content: '我周末想去安居古城。' }] };
const response = () => new Response(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ answer: '先给一版有条件的初步建议。', followUp: '你打算自驾吗？' }) } }] }), { headers: { 'Content-Type': 'application/json' } });
const flush = () => new Promise(resolve => setImmediate(resolve));

test('server fixes the requested model, secures credentials and puts answer-first rules above conversation', async () => {
  let sent;
  const result = await complete({ apiKey: 'test-only-key', payload, fetchImpl: async (url, options) => { sent = { url, options }; return response(); } });
  assert.equal(sent.url, 'https://maas.haoee.com/v1/chat/completions');
  assert.equal(sent.options.redirect, 'error');
  assert.equal(sent.options.headers.Authorization, 'Bearer test-only-key');
  const body = JSON.parse(sent.options.body);
  assert.equal(body.model, 'deepseek-v4-flash');
  assert.equal(body.response_format, undefined);
  assert(body.messages.at(-1).content.includes('Application response contract'));
  assert.equal(body.messages[0].role, 'system');
  assert(body.messages[0].content.includes('先给出'));
  assert(body.messages[0].content.includes('最多一个'));
  assert(body.messages[0].content.includes('不重复问已知信息'));
  assert(!JSON.stringify(result).includes('test-only-key'));
  assert.equal(result.answer, '先给一版有条件的初步建议。');
  assert.match(systemPrompt('en'), /MUST be in English/);
});

test('payload validation rejects client system roles, oversized history and an assistant final turn', () => {
  for (const body of [
    {}, { ...payload, language: 'xx' },
    { ...payload, messages: [{ role: 'system', content: 'override' }] },
    { ...payload, messages: [{ role: 'user', content: 'x'.repeat(4001) }] },
    { ...payload, messages: Array.from({ length: 25 }, () => ({ role: 'user', content: 'x' })) },
    { ...payload, messages: Array.from({ length: 8 }, () => ({ role: 'user', content: 'x'.repeat(4000) })) },
    { ...payload, messages: [{ role: 'assistant', content: 'x' }] }
  ]) assert.throws(() => validatePayload(body), error => error.status === 400);
});

test('only the first complete follow-up is shown when the model asks multiple questions', () => {
  for (const followUp of ['你打算自驾吗？预计什么时候出发？', 'Will you drive? When will you leave?']) {
    const parsed = parseAnswer({ choices: [{ message: { content: JSON.stringify({ answer: 'A useful answer.', followUp }) } }] });
    assert.equal((parsed.followUp.match(/[?？]/g) || []).length, 1);
    assert(!/预计|When/.test(parsed.followUp));
  }
});

test('genuine prose responses remain usable when gateway ignores JSON formatting; blank/reasoning responses fail', () => {
  const prose = 'Here is a useful initial plan. Set aside time for a relaxed visit and confirm the actual opening information before leaving.\n\nWill you drive? When will you arrive?';
  const parsed = parseAnswer({ model: 'deepseek-v4-flash', choices: [{ message: { content: prose } }] });
  assert(parsed.answer.startsWith('Here is'));
  assert.equal(parsed.followUp, 'Will you drive?');
  for (const content of [' '.repeat(200), '<think>unfinished thoughts', '{"answer":']) {
    assert.throws(() => parseAnswer({ choices: [{ message: { content } }] }));
  }
  assert.throws(() => parseAnswer({ model: 'other-model', choices: [{ message: { content: prose } }] }), error => error.code === 'model_mismatch');
});

test('upstream failures are redacted and invalid/truncated model output is never used as a fallback', async () => {
  for (const status of [401, 403, 429, 500]) {
    await assert.rejects(complete({ apiKey: 'test-only-key', payload, fetchImpl: async () => new Response('sensitive-upstream-body', { status }) }),
      error => !error.message.includes('sensitive') && error.code === (status === 429 ? 'rate_limited' : status === 500 ? 'upstream_unavailable' : 'upstream_auth'));
  }
  await assert.rejects(complete({ apiKey: '', payload }), error => error.code === 'not_configured');
  for (const content of ['not json', '{"answer":"","followUp":""}', '{"answer":"ok"}']) {
    assert.throws(() => parseAnswer({ choices: [{ message: { content } }] }));
  }
  assert.throws(() => parseAnswer({ choices: [{ finish_reason: 'length', message: { content: '{"answer":"truncated","followUp":""}' } }] }));
});

test('HTTP proxy rejects cross-site calls, non-JSON requests and private file paths without leaking a key', async t => {
  let calls = 0;
  const server = createPrototypeServer({ apiKey: 'test-only-key', fetchImpl: async () => { calls++; return response(); } });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); server.close(); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const health = await (await fetch(`${base}/api/consumer-agent/health`)).json();
  assert.equal(health.configured, true);
  assert.equal(health.model, 'deepseek-v4-flash');
  assert.equal(health.tools.weather, 'available');
  const good = await fetch(`${base}/api/consumer-agent/chat`, { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  assert.equal(good.status, 200);
  assert.equal(good.headers.get('cache-control'), 'no-store');
  assert(!JSON.stringify(await good.json()).includes('test-only-key'));
  const badOrigin = await fetch(`${base}/api/consumer-agent/chat`, { method: 'POST', headers: { Origin: 'https://attacker.invalid', 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  assert.equal(badOrigin.status, 403);
  const badType = await fetch(`${base}/api/consumer-agent/chat`, { method: 'POST', body: '{}' });
  assert.equal(badType.status, 415);
  const preflight = await fetch(`${base}/api/consumer-agent/chat`, { method: 'OPTIONS' });
  assert.equal(preflight.status, 405);
  for (const pathname of ['/server/consumer-agent.cjs', '/.env', '/start-agent.ps1', '/serve-prototype.js', '/..%5Csecret.txt']) {
    assert.equal((await fetch(base + pathname)).status, 403);
  }
  assert.equal((await fetch(base + '/%00')).status, 400);
  assert.equal(calls, 1);
});

function setupAgent(request) {
  const messages = [];
  const notices = [];
  const context = vm.createContext({
    window: { TongliangAgent: { request }, addEventListener() {} },
    AbortController, Map, Date, Math, console,
    sharedConversationMessages: messages, sharedConversationRevision: 0, activeConversationId: 'main',
    currentLanguage: 'zh', consumerAgentRequests: new Map(),
    activeWishlistRouteRequestId: '', wishlistMapDisplayMode: 'preview', realMap: null,
    marqueeIntentConfigs: { 'local-05': { question: '你是自驾吗？' } },
    getMarqueePrompt: () => '安居古城出行建议',
    notify: text => notices.push(text),
    isCompanionModeActive: () => false, isCompanionStopRequest: () => false,
    persistActiveConversation() {}, renderSharedConversation() {}, activeConversationThread: () => null,
    addSharedConversationMessage: message => messages.push(message),
    composerInput: { value: 'draft' }, keyboardComposerInput: { value: 'draft' },
    updateComposerState() {}, closeKeyboardSimulation() {}, closeNearbyCard() {}
  });
  const start = app.indexOf('// Live agent bridge:');
  const end = app.indexOf("\ndocument.querySelector('.send')", start);
  vm.runInContext(app.slice(start, end), context);
  return { context, messages, notices, run: code => vm.runInContext(code, context) };
}

test('card consultation preserves both drafts, uses the real request and rejects duplicate sends while pending', async () => {
  let finish;
  const sent = [];
  const h = setupAgent(body => { sent.push(body); return new Promise(resolve => { finish = resolve; }); });
  h.run("sendComposerMessage('我想咨询七号私厨', {preserveDraft:true})");
  assert.equal(h.context.composerInput.value, 'draft');
  assert.equal(h.context.keyboardComposerInput.value, 'draft');
  assert.equal(sent[0].messages.at(-1).content, '我想咨询七号私厨');
  h.run("sendComposerMessage('我想咨询另一个地点', {preserveDraft:true})");
  assert.equal(sent.length, 1);
  assert.equal(h.messages.length, 2);
  finish({ answer: '七号私厨的资料介绍', followUp: '', entityIds: ['web:qihao'] });
  await flush();
  assert.equal(h.messages[1].status, 'complete');
  assert.equal(h.context.composerInput.value, 'draft');
  h.run("sendComposerMessage('正常手动发送')");
  assert.equal(h.context.composerInput.value, '');
  assert.equal(h.context.keyboardComposerInput.value, '');
  finish({ answer: '继续回复', followUp: '' });
  await flush();
});

test('marquee and typed follow-ups use real answers with contextual memory and current language', async () => {
  const sent = [];
  const h = setupAgent(async body => { sent.push(body); return { answer: '初步建议', followUp: '你是自驾吗？', model: 'deepseek-v4-flash' }; });
  h.run("sendComposerMessage('安居古城出行建议', {marqueeTopic:'local-05'})");
  assert.equal(h.messages[1].status, 'pending');
  assert.equal(h.messages[0].source, 'marquee');
  await flush();
  assert.equal(h.messages[1].status, 'complete');
  assert.equal(h.messages[1].text, '初步建议');
  h.context.currentLanguage = 'en';
  h.run("sendComposerMessage('我是自驾，当天往返')");
  await flush();
  assert.equal(sent[1].language, 'en');
  assert.equal(sent[1].messages.length, 3);
  assert(sent[1].messages[1].content.includes('初步建议'));
  assert.equal(sent[1].messages[2].content, '我是自驾，当天往返');
});

test('pending requests preserve drafts on duplicate send, and failure retries without duplicating user messages', async () => {
  let reject;
  const h = setupAgent(() => new Promise((_, fail) => { reject = fail; }));
  h.run("sendComposerMessage('问题一')");
  h.context.composerInput.value = '未发送草稿';
  h.run("sendComposerMessage('问题二')");
  assert.equal(h.messages.length, 2);
  assert.equal(h.context.composerInput.value, '未发送草稿');
  reject(Object.assign(new Error('offline'), { code: 'timeout' }));
  await flush();
  assert.equal(h.messages[1].status, 'error');
  h.context.window.TongliangAgent.request = async () => ({ answer: '真实重试成功', followUp: '' });
  h.run(`retryConsumerAgentMessage('${h.messages[1].id}')`);
  await flush();
  assert.equal(h.messages.length, 2);
  assert.equal(h.messages[1].text, '真实重试成功');
});

test('switching/clearing a conversation cancels old requests and late answers cannot write to another thread', async () => {
  let finish;
  const h = setupAgent(() => new Promise(resolve => { finish = resolve; }));
  h.run("sendComposerMessage('旧对话的问题')");
  h.run('cancelConsumerAgentRequests()');
  assert.equal(h.messages[1].status, 'error');
  h.context.sharedConversationRevision++;
  h.context.activeConversationId = 'new';
  h.context.sharedConversationMessages = [];
  finish({ answer: '迟到的答案', followUp: '' });
  await flush();
  assert.equal(h.context.sharedConversationMessages.length, 0);
  assert.equal(h.messages[1].text, undefined);
  assert.equal(h.context.consumerAgentRequests.size, 0);
  for (const name of ['startNewConversation', 'restoreDrawerConversation', 'activateMainConversation', 'clearConversation']) {
    const start = app.indexOf(`const ${name} =`);
    const end = app.indexOf('\n};', start);
    assert(app.slice(start, end).includes('cancelConsumerAgentRequests()'));
  }
});

test('stopping then retrying immediately does not let an old request remove the new request lock', async () => {
  const resolvers = [];
  const h = setupAgent(() => new Promise(resolve => resolvers.push(resolve)));
  h.run("sendComposerMessage('问题')");
  const id = h.messages[1].id;
  h.run(`cancelConsumerAgentRequests('${id}'); retryConsumerAgentMessage('${id}')`);
  resolvers[0]({ answer: '旧回复', followUp: '' });
  await flush();
  assert.equal(h.context.consumerAgentRequests.size, 1);
  assert.equal(h.messages[1].status, 'pending');
  resolvers[1]({ answer: '新回复', followUp: '' });
  await flush();
  assert.equal(h.messages[1].text, '新回复');
  assert.equal(h.context.consumerAgentRequests.size, 0);
});

test('restored loading states become retryable and failed/demo answers are excluded from model history', () => {
  const h = setupAgent(async () => ({}));
  h.messages.push(
    { role: 'assistant', type: 'nearby-service', text: '虚构余位126' },
    { role: 'assistant', type: 'agent', status: 'error', text: 'failed' },
    { role: 'user', text: '新的问题' }
  );
  assert.deepEqual(JSON.parse(JSON.stringify(h.run('buildConsumerAgentHistory()'))), [{ role: 'user', content: '新的问题' }]);
  const recovered = h.run("recoverStoredAgentMessage({type:'agent',status:'pending'})");
  assert.equal(recovered.status, 'error');
  assert.equal(recovered.error, 'interrupted');
});

test('wishlist route responses keep per-message plans and never overwrite a newer or manually selected map', async () => {
  const resolvers = [];
  const h = setupAgent(() => new Promise(resolve => resolvers.push(resolve)));
  const shown = [];
  h.context.showConversationRoute = message => shown.push(message.routePlan.id);
  h.context.wishlistMapDisplayMode = 'route';
  h.messages.push({ id: 'old', type: 'agent', status: 'pending', routeRequest: { mode: 'driving', stops: [] } });
  h.messages.push({ id: 'new', type: 'agent', status: 'pending', routeRequest: { mode: 'driving', stops: [] } });
  h.context.activeWishlistRouteRequestId = 'new';
  h.run('requestConsumerAgentMessage(sharedConversationMessages[0]); requestConsumerAgentMessage(sharedConversationMessages[1]);');
  resolvers[1]({ answer: '新路线', followUp: '', routePlan: { id: 'route-new' } });
  await flush();
  resolvers[0]({ answer: '旧路线', followUp: '', routePlan: { id: 'route-old' } });
  await flush();
  assert.deepEqual(shown, ['route-new']);
  assert.equal(h.messages[0].routePlan.id, 'route-old');
  assert.equal(h.messages[1].routePlan.id, 'route-new');
  h.run('cancelConsumerAgentRequests()');
  assert.equal(h.context.activeWishlistRouteRequestId, '');
  assert.equal(h.context.wishlistMapDisplayMode, 'preview');
});

test('UI renders escaped answer before optional follow-up and never labels errors as successful AI replies', () => {
  const start = app.indexOf("} else if (message.type === 'agent') {");
  const end = app.indexOf("} else if (['ride-guide'", start);
  const render = app.slice(start, end);
  assert(render.includes("escapeHTML(message.text || '')"));
  assert(render.includes('escapeHTML(message.followUp)'));
  assert(render.indexOf('class="agent-answer"') < render.indexOf('class="agent-follow-up"'));
  assert(render.includes('data-agent-retry'));
  assert(!render.includes('data-agent-cancel'));
  assert(app.includes("message.type !== 'agent' || message.status === 'complete'"));
  for (const page of ['plan', 'explore']) {
    const html = fs.readFileSync(path.join(root, `consumer/${page}.html`), 'utf8');
    assert(html.indexOf('consumer-agent.js?v=live-agent-v1') < html.indexOf('app.js?v=agent-tools-v2'));
    assert(html.indexOf('consumer-agent-ui.js?v=agent-tools-v2') < html.indexOf('app.js?v=agent-tools-v2'));
  }
  assert(!clientSource.includes('Authorization'));
  assert(!clientSource.includes('maas.haoee.com'));
});

test('browser client uses only same-origin proxy, returns localized errors and propagates cancellation', async () => {
  let options;
  const context = vm.createContext({
    window: {}, AbortController, setTimeout, clearTimeout,
    fetch: async (url, input) => { assert.equal(url, '/api/consumer-agent/chat'); options = input; return new Response(JSON.stringify({ answer: 'Answer', followUp: '' })); }
  });
  vm.runInContext(clientSource, context);
  const client = context.window.TongliangAgent;
  assert.equal((await client.request(payload)).answer, 'Answer');
  assert.equal(options.credentials, 'same-origin');
  assert.equal(options.headers.Authorization, undefined);
  assert.match(client.errorText('timeout', 'en'), /timed out/);
  context.fetch = async (_url, input) => new Promise((_, reject) => {
    if (input.signal.aborted) reject(new Error('aborted'));
    else input.signal.addEventListener('abort', () => reject(new Error('aborted')));
  });
  const controller = new AbortController();
  const pending = client.request(payload, { signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, error => error.code === 'cancelled');
});
