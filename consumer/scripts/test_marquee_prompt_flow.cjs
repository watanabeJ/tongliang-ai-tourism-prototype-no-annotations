const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

test('every configured marquee topic derives a scoped backend prompt', () => {
  const configStart = source.indexOf('const marqueePromptConfigs = {');
  const configEnd = source.indexOf('\n};', configStart);
  const config = source.slice(configStart, configEnd);
  const keys = [...config.matchAll(/'local-\d{2}':/g)].map(match => match[0].slice(1, -2));
  assert.equal(keys.length, 20);
  assert(source.includes('const getMarqueePrompt = key =>'));
  assert(source.includes('marqueePromptConfigs[key]?.prompt'));
  assert(keys.every(key => config.includes(`${key}': { prompt:`)));
});

test('clicking a marquee routes through the shared prompt submitter', () => {
  const start = source.indexOf('function submitMarqueePrompt(key) {');
  const end = source.indexOf('\nfunction appendWeekendGuide', start);
  const submitSource = source.slice(start, end);
  assert(submitSource.includes('const prompt = getMarqueePrompt(key);'));
  assert(submitSource.includes("composerInput.value = prompt"));
  assert(submitSource.includes("keyboardComposerInput.value = prompt"));
  assert(submitSource.includes("sendComposerMessage(prompt, { marqueeTopic: key })"));
  assert(submitSource.includes('const draft = composerInput?.value ||'));
  assert(submitSource.includes('const keyboardDraft = keyboardComposerInput?.value ||'));
  const clickSource = source.slice(source.lastIndexOf("const chip = event.target.closest?.('[data-journey-key]');"));
  assert(clickSource.includes('submitMarqueePrompt(chip.dataset.journeyKey)'));
});

test('shared send pipeline recognizes a marquee prompt as the selected topic', () => {
  const actualStart = source.indexOf('function sendComposerMessage(rawValue, { marqueeTopic = \'\', preserveDraft = false } = {})');
  assert(actualStart >= 0, 'sendComposerMessage should accept marquee context');
  const sendEnd = source.indexOf('\ndocument.querySelector(\'.send\')', actualStart);
  const sendSource = source.slice(actualStart, sendEnd);
  assert(sendSource.includes('const isMarqueePrompt = Boolean(marqueeTopic'));
  assert(sendSource.includes("source: 'marquee', topic: marqueeTopic"));
  assert(sendSource.includes("type: 'agent'"));
  assert(sendSource.includes('requestConsumerAgentMessage(message)'));
  assert(!sendSource.includes("type: 'marquee-intent'"));
  assert(!sendSource.includes('advanceMarqueeIntent('));
});

test('isolated marquee click mirrors the prompt into both composer fields before the reply', () => {
  const appendStart = source.indexOf('function submitMarqueePrompt(key) {');
  const appendEnd = source.indexOf('\nfunction appendWeekendGuide', appendStart);
  const input = { value: '' };
  const keyboard = { value: '' };
  const selected = [{ dataset: { journeyKey: 'local-01' }, classList: { toggle() {} } }];
  const messages = [];
  const context = vm.createContext({
    marqueeTopics: { 'local-01': { template: 'watch' } },
    marqueeIntentConfigs: { 'local-01': { title: '铜梁龙舞体验' } },
    getMarqueePrompt: () => '我想了解“铜梁龙舞体验”。你想了解龙舞的看点，还是想安排一场现场观看？',
    composerInput: input,
    keyboardComposerInput: keyboard,
    document: { querySelectorAll: () => selected },
    addSharedConversationMessage: message => messages.push({ ...message }),
    sendComposerMessage: prompt => {
      messages.push({ role: 'user', text: prompt, source: 'marquee', topic: 'local-01' });
      messages.push({ role: 'assistant', type: 'agent', status: 'pending' });
    },
    updateComposerState() {},
    openActiveConversation() {}
  });
  vm.runInContext(source.slice(appendStart, appendEnd), context);
  vm.runInContext("submitMarqueePrompt('local-01')", context);
  assert.equal(messages[0].text, '我想了解“铜梁龙舞体验”。你想了解龙舞的看点，还是想安排一场现场观看？');
  assert.equal(messages[0].source, 'marquee');
  assert.equal(messages[0].topic, 'local-01');
  assert.equal(messages[1].type, 'agent');
  assert.equal(input.value, '');
  assert.equal(keyboard.value, '');
});

test('every marquee submits the configured language verbatim and preserves drafts across switches', () => {
  const start = source.indexOf('const marqueePromptConfigs = {');
  const end = source.indexOf('\nconst marqueeEntityCatalog', start);
  const submitStart = source.indexOf('function submitMarqueePrompt(key) {');
  const submitEnd = source.indexOf('\nfunction appendWeekendGuide', submitStart);
  const sent = [];
  const context = vm.createContext({
    currentLanguage: 'en',
    marqueeIntentConfigs: Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`local-${String(i + 1).padStart(2, '0')}`, {}])),
    composerInput: { value: 'my unsent draft' },
    keyboardComposerInput: { value: 'keyboard draft' },
    document: { querySelectorAll: () => [] },
    updateComposerState() {}, openActiveConversation() {},
    sendComposerMessage: (prompt, options) => sent.push({ prompt, ...options })
  });
  vm.runInContext(source.slice(start, end) + '\n' + source.slice(submitStart, submitEnd), context);
  for (const language of ['en', 'zh', 'en']) {
    context.currentLanguage = language;
    for (let i = 1; i <= 20; i++) {
      const key = `local-${String(i).padStart(2, '0')}`;
      vm.runInContext(`submitMarqueePrompt('${key}')`, context);
      const expected = vm.runInContext(language === 'en' ? `marqueeEnglishPrompts['${key}']` : `marqueePromptConfigs['${key}'].prompt`, context);
      assert.equal(sent.at(-1).prompt, expected);
      assert.equal(sent.at(-1).marqueeTopic, key);
      assert.equal(/[\u3400-\u9fff]/.test(expected), language === 'zh');
    }
  }
  assert.equal(context.composerInput.value, 'my unsent draft');
  assert.equal(context.keyboardComposerInput.value, 'keyboard draft');
});

test('carousel submits each localized record prompt rather than a hardcoded topic override', () => {
  const contentWindow = {};
  vm.runInNewContext(fs.readFileSync(path.join(root, 'consumer/feature-carousel-content.js'), 'utf8'), { window: contentWindow });
  const sent = [];
  const context = vm.createContext({
    currentLanguage: 'en', getMarqueePrompt: () => 'generic topic prompt',
    sendComposerMessage: prompt => sent.push(prompt), openActiveConversation() {}
  });
  for (const [startToken, endToken] of [
    ['function appendJourneyRecommendation(', '\nfunction submitMarqueePrompt'],
    ['function appendFeatureKnowledgeGuide(', '\nconst latestPendingMarqueeIntent']
  ]) {
    const start = source.indexOf(startToken);
    vm.runInContext(source.slice(start, source.indexOf(endToken, start)), context);
  }
  for (const [language, items] of Object.entries(contentWindow.TongliangFeatureContent.locales)) {
    context.currentLanguage = language;
    for (const item of items) {
      assert.equal(typeof item.prompt, 'string');
      assert.equal(/[\u3400-\u9fff]/.test(item.prompt), language === 'zh');
      const [type, key] = item.action.split(':');
      const args = type === 'guide' ? [key, item.prompt] : [key, '', item.prompt];
      context.args = args;
      vm.runInContext(`${type === 'guide' ? 'appendFeatureKnowledgeGuide' : 'appendJourneyRecommendation'}(...args)`, context);
      assert.equal(sent.at(-1), item.prompt);
    }
  }
  context.currentLanguage = 'en';
  vm.runInContext("appendFeatureKnowledgeGuide('xuantian-lake-ride')", context);
  assert.match(sent.at(-1), /cycle around Xuantian Lake/);
  assert(!/[\u3400-\u9fff]/.test(sent.at(-1)));
  assert(source.includes("slide.dataset.featurePrompt = typeof item.prompt === 'string'"));
  assert(source.includes('appendFeatureKnowledgeGuide(key, slide.dataset.featurePrompt)'));
  assert(source.includes("appendJourneyRecommendation(key, '', slide.dataset.featurePrompt)"));
});
