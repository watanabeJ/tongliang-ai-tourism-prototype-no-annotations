const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

const rootPath = path.resolve(__dirname, '../..');
const html = fs.readFileSync(path.join(rootPath, 'consumer/plan.html'), 'utf8');
const runtime = fs.readFileSync(path.join(rootPath, 'consumer/prototype-annotator/runtime/prototype-annotator.js'), 'utf8');
const css = fs.readFileSync(path.join(rootPath, 'consumer/prototype-annotator/runtime/prototype-annotator.css'), 'utf8');
const inline = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];
const viewer = inline.find(match => match[2].includes('window.PrototypePageSpec ='))[2];
const embedded = JSON.parse(inline.find(match => match[1].includes('data-proto-spec-markdown="plan"'))[2]);

// Local DOM/event doubles only: no browser, server requests, or actual file saves.
class Events {
  listeners = new Map();
  addEventListener(name, callback) {
    this.listeners.set(name, [...(this.listeners.get(name) || []), callback]);
  }
  dispatchEvent(event) { (this.listeners.get(event.type) || []).forEach(callback => callback(event)); }
}

class Node extends Events {
  constructor(tagName, document) {
    super();
    this.tagName = tagName.toLowerCase();
    this.document = document;
    this.attributes = {};
    this.children = [];
    this.dataset = {};
    this.style = {};
    this.className = '';
    this.hidden = false;
    this.value = '';
    this.classList = {
      contains: name => this.className.split(/\s+/).includes(name),
      toggle: (name, force) => {
        const names = new Set(this.className.split(/\s+/).filter(Boolean));
        if (force ?? !names.has(name)) names.add(name); else names.delete(name);
        this.className = [...names].join(' ');
      }
    };
  }
  get isConnected() { return !!this.parentElement || this === this.document.body || this === this.document.head; }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === 'class') this.className = String(value);
    if (name.startsWith('data-')) {
      this.dataset[name.slice(5).replace(/-([a-z])/g, (_, char) => char.toUpperCase())] = String(value);
    }
  }
  getAttribute(name) { return this.attributes[name] ?? null; }
  appendChild(node) { this.children.push(node); node.parentElement = this; return node; }
  focus() { this.document.activeElement = this; }
  matches(selector) {
    const tag = selector.match(/^[a-z]+/i)?.[0];
    if (tag && tag !== this.tagName) return false;
    const className = selector.match(/\.([\w-]+)/)?.[1];
    if (className && !this.classList.contains(className)) return false;
    const attribute = selector.match(/\[([\w-]+)(?:="([^"]*)")?\]/);
    if (attribute && (this.getAttribute(attribute[1]) === null ||
      (attribute[2] !== undefined && this.getAttribute(attribute[1]) !== attribute[2]))) return false;
    return true;
  }
  closest(selector) { return this.matches(selector) ? this : this.parentElement?.closest(selector) || null; }
  querySelectorAll(selector) {
    return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]);
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  set innerHTML(value) {
    this.markup = value;
    this.children = [];
    // Parse only the interactive controls needed by the actual viewer/runtime.
    for (const match of value.matchAll(/<(button|textarea)\b([^>]*)>([\s\S]*?)<\/\1>/g)) {
      const node = new Node(match[1], this.document);
      for (const attribute of match[2].matchAll(/([\w-]+)="([^"]*)"/g)) {
        node.setAttribute(attribute[1], attribute[2]);
      }
      node.textContent = match[3];
      this.appendChild(node);
    }
  }
  get innerHTML() { return this.markup || ''; }
}

function pageFixture(file) {
  const source = fs.readFileSync(path.join(rootPath, file), 'utf8');
  const blocks = [...source.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];
  const viewerCode = blocks.find(match => match[2].includes('window.PrototypePageSpec ='))[2];
  const pageKey = JSON.parse(viewerCode.match(/const pageKey = ("[^"]+");/)[1]);
  const documentBlock = blocks.find(match => match[1].includes(`data-proto-spec-markdown="${pageKey}"`));
  const runtimePath = path.join(rootPath, path.dirname(file), 'prototype-annotator/runtime');
  return {
    source, pageKey, viewer: viewerCode, embedded: JSON.parse(documentBlock[2]),
    runtime: fs.readFileSync(path.join(runtimePath, 'prototype-annotator.js'), 'utf8'),
    css: fs.readFileSync(path.join(runtimePath, 'prototype-annotator.css'), 'utf8')
  };
}

async function setup({ enabled = true, withViewer = true, page = { pageKey: 'plan', viewer, embedded, runtime } } = {}) {
  const document = new Events();
  document.body = new Node('body', document);
  document.head = new Node('head', document);
  document.createElement = tag => new Node(tag, document);
  document.querySelectorAll = selector => [...document.body.querySelectorAll(selector), ...document.head.querySelectorAll(selector)];
  const stage = document.createElement('main');
  stage.className = 'stage';
  document.body.appendChild(stage);
  const specData = document.createElement('script');
  specData.setAttribute('data-proto-spec-markdown', page.pageKey);
  specData.textContent = JSON.stringify(page.embedded);
  document.body.appendChild(specData);
  const window = new Events();
  const requests = [];
  const state = { visible: true, editMode: false, sidebarOpen: false, toolbarCollapsed: false, toolbarPosition: null };
  const annotationRoot = document.createElement('div');
  annotationRoot.className = 'pa-ui pa-root';
  document.body.appendChild(annotationRoot);
  const calls = { exports: 0, preferences: 0, renders: 0 };
  const context = vm.createContext({
    console, document, window, state, root: annotationRoot, toolbar: null,
    CFG: { pageSpecInToolbar: enabled },
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    fetch: async (url, options) => {
      requests.push({ url, options });
      return { ok: false, text: async () => 'Static preview has no save API' };
    },
    $: (selector, base) => base.querySelector(selector),
    contextAnnotations: () => [{}, {}],
    requestAnimationFrame: callback => callback(),
    applyToolbarPosition: () => {},
    onToolbarPointerDown: () => {},
    onToolbarMouseDown: () => {},
    closeCard: () => {},
    setEditMode: enabled => { state.editMode = enabled; },
    toast: () => {},
    exportData: () => { calls.exports++; },
    persistToolbarPreferences: () => { calls.preferences++; },
    render: () => { calls.renders++; context.updateToolbar(); }
  });
  if (withViewer) vm.runInContext(page.viewer, context);
  await new Promise(resolve => setImmediate(resolve));
  const toolbarStart = page.runtime.indexOf('  function hasPageSpecViewer()');
  const toolbarEnd = page.runtime.indexOf('  function loadToolbarPreferences()', toolbarStart);
  vm.runInContext(page.runtime.slice(toolbarStart, toolbarEnd), context);
  context.ensureToolbar();
  window.addEventListener('prototypepagespecchange', context.updateToolbar);
  const panel = document.body.querySelector('.pa-page-spec-panel');
  const toolbar = annotationRoot.querySelector('.pa-toolbar');
  const control = action => toolbar.querySelector(`[data-pa-action="${action}"]`);
  return {
    context, document, window, stage, state, panel, toolbar, control, requests, calls,
    clickToolbar(action) {
      const target = control(action);
      target.focus();
      toolbar.dispatchEvent({ type: 'click', target });
    },
    clickPanel(action) {
      const target = panel.querySelector(`[data-action="${action}"]`);
      assert(target, `missing panel control: ${action}`);
      panel.dispatchEvent({ type: 'click', target });
    }
  };
}

test('the standalone floating switcher is not created, and the original spec is still used', async () => {
  const h = await setup();
  assert.equal(h.document.querySelectorAll('.proto-spec-switcher').length, 0);
  assert.equal(h.panel.hidden, true);
  assert.equal(h.panel.getAttribute('role'), 'dialog');
  assert(h.panel.innerHTML.includes('首页以运营主题'));
  assert.equal(h.requests.length, 0);
  h.clickToolbar('page-spec');
  h.clickPanel('edit');
  const frontmatterEnd = embedded.indexOf('\n---', 4);
  const originalBody = embedded.slice(frontmatterEnd + 4).replace(/^\s*\n/, '').trim();
  assert.equal(h.panel.querySelector('textarea').value, originalBody);
});

test('the page-spec entry follows edit mode, precedes the list, and collapses with the action group', async () => {
  const h = await setup();
  assert(h.toolbar.classList.contains('pa-toolbar-has-page-spec'));
  const actionGroup = h.toolbar.innerHTML.match(/<div class="pa-toolbar-actions">([\s\S]*?)<\/div>/);
  assert(actionGroup);
  assert.deepEqual([...actionGroup[1].matchAll(/data-pa-action="([^"]+)"/g)].map(match => match[1]), [
    'toggle-visible', 'toggle-edit', 'page-spec', 'sidebar', 'export'
  ]);
  assert.match(css, /\.pa-toolbar\.pa-toolbar-has-page-spec\s*\{[^}]*top:\s*auto;[^}]*bottom:\s*16px;/);
  assert.match(css, /\.pa-toolbar\.pa-toolbar-collapsed \.pa-toolbar-actions\s*\{\s*display:\s*none;/);
  h.clickToolbar('collapse');
  assert.equal(h.state.toolbarCollapsed, true);
  assert.equal(h.toolbar.classList.contains('pa-toolbar-collapsed'), true);
  assert.equal(h.control('collapse').textContent, '展开');
  assert.equal(h.control('collapse').getAttribute('aria-expanded'), 'false');
  h.clickToolbar('collapse');
  assert.equal(h.state.toolbarCollapsed, false);
  assert.equal(h.toolbar.classList.contains('pa-toolbar-collapsed'), false);
  assert.equal(h.control('collapse').textContent, '收起');
  assert.equal(h.control('collapse').getAttribute('aria-expanded'), 'true');
  h.clickToolbar('page-spec');
  assert.equal(h.panel.hidden, false);
  assert.equal(h.control('page-spec').getAttribute('aria-expanded'), 'true');
});

test('opening/closing the document preserves the map DOM, toolbar state and focus', async () => {
  const h = await setup();
  h.state.editMode = true;
  h.state.visible = false;
  h.state.toolbarPosition = { left: 30, top: 600 };
  h.clickToolbar('page-spec');
  assert.equal(h.stage.hidden, false);
  assert.equal(h.document.activeElement.dataset.action, 'close');
  h.clickPanel('close');
  assert.equal(h.panel.hidden, true);
  assert.equal(h.control('page-spec').getAttribute('aria-expanded'), 'false');
  assert.equal(h.document.activeElement, h.control('page-spec'));
  assert.equal(h.state.editMode, true);
  assert.equal(h.state.visible, false);
  assert.deepEqual(h.state.toolbarPosition, { left: 30, top: 600 });
  h.clickToolbar('page-spec');
  h.clickToolbar('page-spec');
  assert(h.panel.hidden);
});

test('Escape returns to the page; reopening keeps unsaved editing text', async () => {
  const h = await setup();
  h.clickToolbar('page-spec');
  h.clickPanel('edit');
  h.panel.querySelector('textarea').value = '# 测试草稿\n\n尚未保存。';
  h.document.dispatchEvent({ type: 'keydown', key: 'Escape' });
  assert(h.panel.hidden);
  h.clickToolbar('page-spec');
  assert.equal(h.panel.querySelector('textarea').value, '# 测试草稿\n\n尚未保存。');
  h.clickPanel('preview');
  assert(h.panel.innerHTML.includes('测试草稿'));
  h.clickPanel('write');
  assert.equal(h.panel.querySelector('textarea').value, '# 测试草稿\n\n尚未保存。');
});

test('save failure remains explicit and does not discard the edited document', async () => {
  const h = await setup();
  h.clickToolbar('page-spec');
  h.clickPanel('edit');
  h.panel.querySelector('textarea').value = '# 保存失败测试';
  h.clickPanel('save');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.requests.length, 1);
  assert.equal(h.requests[0].options.method, 'PUT');
  assert(JSON.parse(h.requests[0].options.body).markdown.includes('# 保存失败测试'));
  assert(h.panel.innerHTML.includes('保存失败'));
  assert.equal(h.panel.querySelector('textarea').value, '# 保存失败测试');
});

test('existing annotation visibility, edit, list, export and collapse controls still work', async () => {
  const h = await setup();
  h.clickToolbar('toggle-visible');
  assert.equal(h.state.visible, false);
  h.clickToolbar('toggle-edit');
  assert.equal(h.state.editMode, true);
  h.clickToolbar('sidebar');
  assert.equal(h.state.sidebarOpen, true);
  h.clickToolbar('export');
  assert.equal(h.calls.exports, 1);
  h.clickToolbar('collapse');
  assert.equal(h.calls.preferences, 1);
});

test('other pages do not gain an entry when the integration is not enabled or available', async () => {
  const disabled = await setup({ enabled: false });
  assert.equal(disabled.control('page-spec'), null);
  assert.equal(disabled.toolbar.classList.contains('pa-toolbar-has-page-spec'), false);
  const missing = await setup({ withViewer: false });
  assert.equal(missing.control('page-spec'), null);
  const explore = fs.readFileSync(path.join(rootPath, 'consumer/explore.html'), 'utf8');
  assert(!explore.includes('pageSpecInToolbar: true'));
  assert(html.includes('pageSpecInToolbar: true'));
  assert(html.includes('prototype-annotator.js?v=page-spec-toolbar-v2'));
  assert(html.includes('prototype-annotator.css?v=page-spec-toolbar-v2'));
});

const migratedPages = [
  'consumer/activity-detail.html', 'consumer/product-detail.html',
  ...['merchant-assistant', 'government'].flatMap(directory =>
    fs.readdirSync(path.join(rootPath, directory)).filter(file => file.endsWith('.html'))
      .sort().map(file => `${directory}/${file}`))
];

for (const file of migratedPages) {
  test(`${file}: the toolbar opens only its own document and supports close, edit and collapse`, async () => {
    const page = pageFixture(file);
    const h = await setup({ page });
    assert(page.source.includes('pageSpecInToolbar: true'));
    assert(page.source.includes('prototype-annotator.js?v=page-spec-toolbar-v3'));
    assert(page.source.includes('prototype-annotator.css?v=page-spec-toolbar-v3'));
    assert.equal(h.document.querySelectorAll('.proto-spec-switcher').length, 0);
    assert.equal(h.document.querySelectorAll('.pa-page-spec-panel').length, 1);
    assert.equal(h.panel.hidden, true);
    assert.equal(h.requests.length, 0, 'the correct embedded document must work in static/offline previews');
    const actions = h.toolbar.innerHTML.match(/<div class="pa-toolbar-actions">([\s\S]*?)<\/div>/)[1];
    assert.deepEqual([...actions.matchAll(/data-pa-action="([^"]+)"/g)].map(match => match[1]), [
      'toggle-visible', 'toggle-edit', 'page-spec', 'sidebar', 'export'
    ]);
    assert.match(page.css, /\.pa-toolbar\.pa-toolbar-collapsed \.pa-toolbar-actions\s*\{\s*display:\s*none;/);
    assert(page.css.includes('.pa-page-spec-panel.proto-spec-doc[hidden]'));
    h.clickToolbar('page-spec');
    assert.equal(h.panel.hidden, false);
    assert.equal(h.stage.hidden, false, 'the underlying product page is not replaced');
    assert.equal(h.control('page-spec').getAttribute('aria-expanded'), 'true');
    h.clickPanel('edit');
    const expectedBody = page.embedded.slice(page.embedded.indexOf('\n---', 4) + 4).trim();
    assert.equal(h.panel.querySelector('textarea').value, expectedBody);
    h.clickPanel('close');
    assert.equal(h.panel.hidden, true);
    assert.equal(h.document.activeElement, h.control('page-spec'));
    h.clickToolbar('collapse');
    assert.equal(h.toolbar.classList.contains('pa-toolbar-collapsed'), true);
    h.clickToolbar('collapse');
    assert.equal(h.toolbar.classList.contains('pa-toolbar-collapsed'), false);
    h.clickToolbar('page-spec');
    h.document.dispatchEvent({ type: 'keydown', key: 'Escape' });
    assert.equal(h.panel.hidden, true);
  });
}

test('government login uses its own document rather than the merchant login with the same page key', () => {
  const government = pageFixture('government/login.html');
  const merchant = pageFixture('merchant-assistant/login.html');
  assert.notEqual(government.embedded, merchant.embedded);
  assert(government.embedded.includes('政府'));
  assert(merchant.embedded.includes('商户'));
});
