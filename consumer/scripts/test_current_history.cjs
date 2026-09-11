const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../../app.js'), 'utf8');

test('default conversation is upserted into history without losing pins or duplicating records', () => {
  let records = [];
  const context = vm.createContext({
    activeConversationId: 'main', mainConversationId: 'main',
    sharedConversationMessages: [{ role: 'user', text: '玄天湖怎么玩' }],
    writeMainConversation() {},
    readConversationDrawerHistory: () => records,
    writeConversationDrawerHistory: value => { records = value; },
    drawerThreadTitle: messages => messages[0].text
  });
  const start = source.indexOf('const persistActiveConversation =');
  const end = source.indexOf('const activateMainConversation =', start);
  vm.runInContext(source.slice(start, end), context);
  vm.runInContext('persistActiveConversation()', context);
  assert.equal(records.length, 1);
  assert.equal(records[0].id, 'main');
  assert.equal(records[0].messages[0].text, '玄天湖怎么玩');
  records[0].pinned = true;
  vm.runInContext('persistActiveConversation()', context);
  assert.equal(records.length, 1);
  assert.equal(records[0].pinned, true);
});

test('opening history saves the active conversation and title is simplified', () => {
  const open = source.slice(source.indexOf('const openConversationDrawer ='), source.indexOf('const refreshConversationDrawer ='));
  assert(open.indexOf('persistActiveConversation();') < open.indexOf('refreshConversationDrawer();'));
  assert(source.includes('<strong>历史对话</strong>'));
  assert(!source.includes('<strong>历史旅程对话</strong>'));
});
