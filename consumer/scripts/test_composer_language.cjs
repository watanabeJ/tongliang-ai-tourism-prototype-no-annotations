const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
function section(start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from);
  assert(from >= 0 && to > from, `Missing source section: ${start}`);
  return source.slice(from, to);
}

// Execute the actual handlers with isolated DOM/event doubles, without browser or network access.
class Element {
  constructor() {
    this.value = '';
    this.placeholder = '';
    this.textContent = '';
    this.attributes = {};
    this.listeners = new Map();
    this.hidden = true;
    this.dataset = {};
    const classes = new Set();
    this.classList = {
      add: (...names) => names.forEach(name => classes.add(name)),
      remove: (...names) => names.forEach(name => classes.delete(name)),
      contains: name => classes.has(name),
      toggle: (name, force) => {
        if (force ?? !classes.has(name)) classes.add(name); else classes.delete(name);
      }
    };
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name]; }
  querySelector() { return null; }
  addEventListener(name, callback) {
    this.listeners.set(name, [...(this.listeners.get(name) || []), callback]);
  }
  fire(name, properties = {}) {
    for (const callback of this.listeners.get(name) || []) {
      callback({ target: this, preventDefault() {}, stopPropagation() {}, ...properties });
    }
  }
  blur() {}
  focus() { this.fire('focus'); }
}

function setup({ withComposer = true } = {}) {
  const selectors = [
    '.composer', '.composer input', '[data-composer-more]', '[data-nearby-card]',
    '[data-keyboard-simulation]', '[data-keyboard-composer-input]',
    '[data-voice-input]', '.voice-hint'
  ];
  const elements = new Map(withComposer ? selectors.map(selector => [selector, new Element()]) : []);
  const document = new Element();
  document.querySelector = selector => elements.get(selector) || null;
  document.querySelectorAll = () => [];
  const recognitions = [];
  class SpeechRecognition {
    constructor() { recognitions.push(this); }
    start() { this.onstart(); }
  }
  const messages = [];
  const context = vm.createContext({
    document,
    window: { SpeechRecognition, dispatchEvent() {} }, Event,
    sharedConversationMessages: [], renderSharedConversation() {},
    currentLanguage: 'zh',
    languageSwitch: new Element(),
    languageCopy: { zh: {}, en: {} },
    activePromptKey: null,
    icons: { mic: 'mic', keyboard: 'keyboard' },
    notify() {},
    updateJourneyMarqueeLanguage() {},
    updateConsumerHeaderLanguage() {},
    updateFeatureCarouselLanguage() {},
    updateNearbyServiceLanguage() {},
    updateMapCategoryLanguage() {},
    updateLocationContext() {},
    refreshConversationDrawer() {},
    openActiveConversation() {},
    sendComposerMessage: text => messages.push({ role: 'user', text }),
    addSharedConversationMessage: message => messages.push(message)
  });
  vm.runInContext(section("const composerInput = document.querySelector('.composer input');", 'const showNearbyService ='), context);
  vm.runInContext(section("keyboardComposerInput?.addEventListener('input'", 'function escapeHTML('), context);
  vm.runInContext(section('const toggleLanguage = () => {', 'if (drawerPhone && (planScreen || mapScreen))'), context);
  return {
    input: elements.get('.composer input'),
    keyboard: elements.get('[data-keyboard-composer-input]'),
    composer: elements.get('.composer'),
    voiceButton: elements.get('[data-voice-input]'),
    voiceHint: elements.get('.voice-hint'),
    recognitions, messages, context,
    run: code => vm.runInContext(code, context),
    toggle: () => vm.runInContext('toggleLanguage()', context)
  };
}

test('language switching updates both placeholders and accessible names in both directions', () => {
  const h = setup();
  assert.equal(h.input.placeholder, '发消息或按住说话...');
  assert.equal(h.keyboard.placeholder, h.input.placeholder);
  h.toggle();
  assert.equal(h.input.placeholder, 'Type or hold to talk...');
  assert.equal(h.keyboard.placeholder, h.input.placeholder);
  assert.equal(h.input.getAttribute('aria-label'), 'Send a message');
  assert.equal(h.keyboard.getAttribute('aria-label'), 'Type a message');
  h.toggle();
  assert.equal(h.input.placeholder, '发消息或按住说话...');
  assert.equal(h.keyboard.placeholder, h.input.placeholder);
  assert.equal(h.input.getAttribute('aria-label'), '发送消息');
  assert.equal(h.keyboard.getAttribute('aria-label'), '键盘输入消息');
});

test('switching language and input modes leaves drafts untouched and keyboard typing still syncs', () => {
  const h = setup();
  h.input.value = '我的草稿 with English';
  h.keyboard.value = 'keyboard draft';
  h.toggle();
  h.input.focus();
  h.run('enterVoiceMode(); leaveVoiceMode();');
  assert.equal(h.input.value, '我的草稿 with English');
  assert.equal(h.keyboard.value, 'keyboard draft');
  assert.equal(h.input.placeholder, 'Type or hold to talk...');
  h.keyboard.fire('input');
  assert.equal(h.input.value, 'keyboard draft');
  assert(h.composer.classList.contains('is-ready'));
  h.toggle();
  assert.equal(h.input.value, 'keyboard draft');
  assert.equal(h.keyboard.value, 'keyboard draft');
  assert.equal(h.messages.length, 0);
});

test('voice hints use the active language on entry, recording, completion and exit', () => {
  const h = setup();
  h.toggle();
  h.voiceButton.fire('click');
  assert(h.composer.classList.contains('is-voice'));
  assert.equal(h.voiceButton.getAttribute('aria-label'), 'Switch to text input');
  assert.equal(h.voiceHint.textContent, 'Hold to talk');
  assert.equal(h.voiceHint.getAttribute('aria-label'), 'Tap to start voice input');
  h.voiceHint.fire('click');
  assert.equal(h.voiceHint.textContent, 'Listening...');
  h.toggle();
  assert.equal(h.voiceHint.textContent, '正在聆听...');
  h.toggle();
  assert.equal(h.voiceHint.textContent, 'Listening...');
  h.recognitions[0].onend();
  assert.equal(h.voiceHint.textContent, 'Tap to talk');
  h.voiceButton.fire('click');
  assert.equal(h.voiceButton.getAttribute('aria-label'), 'Voice input');
  assert.equal(h.input.placeholder, 'Type or hold to talk...');
  h.toggle();
  h.voiceButton.fire('click');
  assert.equal(h.voiceButton.getAttribute('aria-label'), '切换到文本输入');
  assert.equal(h.voiceHint.textContent, '点击说话');
});

test('voice completion reads the latest language instead of restoring hard-coded Chinese', () => {
  const h = setup();
  h.voiceButton.fire('click');
  h.voiceHint.fire('keydown', { key: 'Enter' });
  assert.equal(h.voiceHint.textContent, '正在聆听...');
  h.toggle();
  h.recognitions[0].onend();
  assert.equal(h.voiceHint.textContent, 'Tap to talk');
  assert.equal(h.keyboard.placeholder, 'Type or hold to talk...');
});

test('merchant hints retain the selected name across languages without changing existing messages', () => {
  const h = setup();
  // Legacy feature hints still localize; map cards now invoke the real agent.
  h.run("setComposerMerchantHint('涪江山居民宿')");
  assert.equal(h.input.placeholder, '你想了解“涪江山居民宿”这家店的什么情况？');
  assert.equal(h.keyboard.placeholder, h.input.placeholder);
  const history = JSON.stringify(h.messages);
  h.input.value = '请问营业时间？';
  h.toggle();
  assert.equal(h.input.placeholder, 'What would you like to know about 涪江山居民宿?');
  assert.equal(h.keyboard.placeholder, h.input.placeholder);
  assert.equal(h.input.value, '请问营业时间？');
  assert.equal(JSON.stringify(h.messages), history);
  h.toggle();
  assert.equal(h.input.placeholder, '你想了解“涪江山居民宿”这家店的什么情况？');
});

test('opening a feature merchant consultation in English immediately uses an English hint', () => {
  const h = setup();
  h.toggle();
  h.context.event = {
    target: { closest: () => ({ dataset: { featureKnowledgeChat: '玄天湖湖景火锅' } }) },
    preventDefault() {},
    stopImmediatePropagation() {}
  };
  const handler = section("  const featureKnowledgeChat = event.target.closest('[data-feature-knowledge-chat]');", '  const featureKnowledgeLink =');
  vm.runInContext(`(() => { ${handler} })()`, h.context);
  assert.equal(h.input.placeholder, 'What would you like to know about 玄天湖湖景火锅?');
  assert.equal(h.keyboard.placeholder, h.input.placeholder);
  h.run("setComposerMerchantHint('')");
  assert.equal(h.input.placeholder, 'What would you like to know about this place?');
});

test('shared app initialization and language switching tolerate pages without a composer', () => {
  const h = setup({ withComposer: false });
  assert.doesNotThrow(() => h.toggle());
  assert.doesNotThrow(() => h.toggle());
});

test('plan and explore reference the updated shared composer script', () => {
  for (const page of ['plan', 'explore']) {
    const html = fs.readFileSync(path.join(root, `consumer/${page}.html`), 'utf8');
    assert(html.includes('../app.js?v=agent-tools-v2'));
  }
});
