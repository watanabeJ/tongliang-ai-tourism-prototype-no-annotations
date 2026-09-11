const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.resolve(__dirname, '../../app.js'), 'utf8');
const code = source.slice(source.indexOf('const createConversationWelcome ='), source.indexOf("document.addEventListener('agent-catalog-ready'"));
function setup() {
  const thread = () => ({
    children: [],
    querySelectorAll() { return this.children.map(child => ({ remove: () => { this.children = this.children.filter(item => item !== child); } })); },
    appendChild(child) { this.children.push(child); }
  });
  const context = vm.createContext({
    currentLanguage: 'zh', sharedConversationMessages: [],
    mapConversationList: thread(), planConversationList: thread(),
    activeConversationThread: () => null, assetUrl: value => value,
    document: { createElement: () => ({ dataset: {} }) },
    createConversationMessage: message => ({ dataset: {}, message })
  });
  vm.runInContext(code, context);
  return context;
}
test('empty new/restored conversations show one localized greeting in both views without saving fake responses', () => {
  const c = setup();
  vm.runInContext('renderSharedConversation(); renderSharedConversation();', c);
  for (const view of [c.planConversationList, c.mapConversationList]) {
    assert.equal(view.children.length, 1);
    assert.match(view.children[0].innerHTML, /你好呀/);
    assert.match(view.children[0].innerHTML, /dragon-mini/);
    assert.doesNotMatch(view.children[0].innerHTML, /ai-message-footer/);
  }
  assert.equal(c.sharedConversationMessages.length, 0);
  c.currentLanguage = 'en';
  vm.runInContext('renderSharedConversation()', c);
  assert.match(c.planConversationList.children[0].innerHTML, /Hi! I’m your Tongliang/);
  assert.doesNotMatch(c.planConversationList.children[0].innerHTML, /你好/);
});
test('real conversation replaces the greeting and clearing restores it without duplicates', () => {
  const c = setup();
  vm.runInContext('renderSharedConversation()', c);
  c.sharedConversationMessages.push({ role: 'user', text: 'hello' });
  vm.runInContext('renderSharedConversation()', c);
  assert.equal(c.planConversationList.children.length, 1);
  assert.equal(c.planConversationList.children[0].message.text, 'hello');
  c.sharedConversationMessages = [];
  vm.runInContext('renderSharedConversation()', c);
  assert.equal(c.planConversationList.children.length, 1);
  assert.match(c.planConversationList.children[0].className, /conversation-welcome/);
});
