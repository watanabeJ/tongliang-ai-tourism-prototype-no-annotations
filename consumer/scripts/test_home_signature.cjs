const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const config = fs.readFileSync(path.join(root, 'consumer/home-theme-content.js'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'consumer/home-themes.js'), 'utf8');
const appSource = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'consumer/plan.html'), 'utf8');
const originalConfig = ['languageCopy', 'journeyMarqueeCopy', 'marqueePromptConfigs', 'marqueeEnglishPrompts']
  .map(name => {
    const start = appSource.indexOf(`const ${name} =`);
    return appSource.slice(start, appSource.indexOf('\n};', start) + 3);
  }).join('\n');
const originalProvider = appSource.slice(appSource.indexOf('function getOriginalHome(language)'),
  appSource.indexOf('window.TongliangHomeThemes?.install('));
const originalRows = [...html.matchAll(/data-journey-key="([^"]+)"[^>]*><i[^>]*>([^<]*)<\/i>/g)]
  .map(([, key, icon]) => ({ key, icon }));
const flush = () => new Promise(resolve => setImmediate(resolve));
class Node {
  constructor(className = '') {
    this.className = className; this.children = []; this.dataset = {}; this.attrs = {}; this.listeners = {};
    this.style = { setProperty(key, value) { this[key] = value; } };
    this.classList = { remove() {} };
  }
  setAttribute(key, value) { this.attrs[key] = value; }
  append(...nodes) { nodes.forEach(node => { node.parent = this; this.children.push(node); }); }
  replaceChildren(...nodes) { this.children = []; this.append(...nodes); }
  after(node) { this.parent.append(node); }
  scrollTo() {}
  focus() { this.focused = true; }
  matches(selector) {
    if (selector.startsWith('.')) return this.className.split(' ').includes(selector.slice(1));
    const data = selector.match(/^\[data-([-\w]+)(?:="([^"]+)")?\]$/);
    if (!data) return false;
    const key = data[1].replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
    return this.dataset[key] !== undefined && (data[2] === undefined || this.dataset[key] === data[2]);
  }
  querySelectorAll(selector) { return this.children.flatMap(node => [...(node.matches(selector) ? [node] : []), ...node.querySelectorAll(selector)]); }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  closest(selector) { return this.matches(selector) ? this : this.parent?.closest(selector); }
  cloneNode() {
    const node = new Node(this.className);
    node.dataset = { ...this.dataset }; node.attrs = { ...this.attrs }; node.textContent = this.textContent;
    node.append(...this.children.map(child => child.cloneNode()));
    return node;
  }
  addEventListener(type, callback) { (this.listeners[type] ||= []).push(callback); }
  dispatchEvent(event) { this.fire(event.type); }
  fire(type, props = {}) {
    const event = { type, target: this, detail: 1, preventDefault() {}, stopPropagation() {}, ...props };
    for (const callback of this.listeners[type] || []) callback(event);
  }
}
async function setup({ held = '', failed = '' } = {}) {
  const screen = new Node(), tabs = new Node('home-signature-topics'), panel = new Node('plan-theme-content');
  const background = new Node('plan-background-image'), marquee = new Node('journey-marquees');
  const rows = Array.from({ length: 3 }, () => { const row = new Node(); row.dataset.journeyMarquee = ''; return row; });
  marquee.append(...rows);
  panel.append(marquee);
  for (const key of ['planHeroLineOne', 'planHeroLineTwo', 'planHeroSummary', 'planFeatureTitle']) {
    const node = new Node(); node.dataset.i18n = key; panel.append(node);
  }
  screen.append(tabs, panel, background);
  const win = new Node(), pending = [];
  const state = { language: 'zh', sent: [], opened: 0, shown: 0, notifications: [], refreshes: [] };
  class Image {
    set src(value) {
      this.path = value;
      if (held && value.includes(held)) pending.push(this);
      else queueMicrotask(() => failed && value.includes(failed) ? this.onerror?.() : this.onload?.());
    }
  }
  const context = vm.createContext({
    window: win, Image, Event, setTimeout, clearTimeout,
    document: { createElement: () => new Node(), createTextNode: text => { const n = new Node(); n.textContent = text; return n; } }
  });
  vm.runInContext(config + runtime, context);
  vm.runInContext(originalConfig + '\n' +
    fs.readFileSync(path.join(root, 'consumer/feature-carousel-content.js'), 'utf8') +
    `\nconst originalHomeMarqueeRows = ${JSON.stringify([originalRows.slice(0, 7), originalRows.slice(7, 14), originalRows.slice(14)])};\n` +
    originalProvider, context);
  const api = win.TongliangHomeThemes;
  api.install({
    screen, getLanguage: () => state.language, assetUrl: value => value,
    getOriginalHome: context.getOriginalHome,
    refreshCarousel: force => state.refreshes.push({ force, slides: api.getSlides(state.language) }),
    submit: text => state.sent.push(text), openConversation: () => state.opened++,
    showHome: () => state.shown++, notify: text => state.notifications.push(text)
  });
  await flush();
  return {
    screen, tabs, panel, background, rows, state, api, context,
    select(id) { tabs.fire('click', { target: tabs.children.find(button => button.dataset.homeTheme === id) }); },
    language(value) { state.language = value; win.fire('home-language-change'); },
    release() { pending.splice(0).forEach(image => image.onload?.()); }
  };
}
test('comprehensive is the default and restores original bilingual rows, copy, background and carousel', async () => {
  const s = await setup();
  assert.equal(s.screen.dataset.homeTheme, 'all');
  assert.equal(s.tabs.children.length, 5);
  assert.equal(s.tabs.children[0].querySelector('.home-theme-label').textContent, '综合');
  for (const lang of ['zh', 'en']) {
    s.language(lang); await flush();
    const original = s.api.snapshot('all', lang);
    assert.equal(original.items.length, 20);
    assert.deepEqual(Array.from(original.marqueeRows, row => row.length), [7, 7, 6]);
    assert.equal(original.slides.length, lang === 'zh' ? 9 : 6);
    assert.equal(original.lineOne, lang === 'zh' ? '周末到铜梁' : 'Tongliang');
    assert(!s.background.style.backgroundImage.includes('linear-gradient'));
    assert(fs.existsSync(path.join(root, original.background)));
    original.items.forEach(item => {
      assert(item.prompt);
      if (lang === 'en') assert.doesNotMatch(item.title + item.prompt, /[\u4e00-\u9fff]/);
    });
    s.select('nature'); await flush();
    s.select('all'); await flush();
    assert.equal(s.screen.dataset.homeTheme, 'all');
    assert.deepEqual(s.api.getSlides(lang), original.slides);
    assert.equal(s.rows[0].querySelector('[data-home-inspiration]').dataset.homeInspiration, 'all-local-01');
  }
  assert.equal(s.state.sent.length, 0);
});
test('four complete bilingual theme snapshots use existing assets and matching question/image IDs', async () => {
  const s = await setup();
  const backgrounds = new Set();
  for (const id of ['heritage', 'food', 'football', 'nature']) {
    for (const lang of ['zh', 'en']) {
      const data = s.api.snapshot(id, lang);
      assert.equal(data.id, id); assert.equal(data.language, lang);
      backgrounds.add(data.background);
      assert(fs.existsSync(path.join(root, data.background)));
      data.items.forEach((item, i) => {
        assert(fs.existsSync(path.join(root, item.image)));
        assert.equal(data.slides[i].prompt, item.prompt);
        assert.equal(data.slides[i].image, item.image);
        if (lang === 'en') assert.doesNotMatch(item.title + item.prompt, /[\u4e00-\u9fff]/);
      });
    }
  }
  assert.equal(backgrounds.size, 4);
  assert.equal(s.api.snapshot('missing', 'zh'), null);
});
test('theme selection updates all four surfaces together without sending a conversation', async () => {
  const s = await setup();
  for (const id of ['food', 'football', 'nature', 'heritage']) {
    s.select(id); await flush();
    const data = s.api.snapshot(id, 'zh');
    assert.equal(s.screen.dataset.homeTheme, id);
    assert(s.background.style.backgroundImage.includes(data.background));
    assert.equal(s.panel.querySelector('[data-i18n="planHeroLineTwo"]').textContent, data.lineTwo);
    assert(s.rows.every(row => row.querySelectorAll('[data-home-inspiration]').every(chip => chip.dataset.homeInspiration.startsWith(id))));
    assert(s.state.refreshes.at(-1).slides.every(slide => slide.id.startsWith(id)));
    assert.equal(s.tabs.children.filter(button => button.attrs['aria-selected'] === 'true').length, 1);
  }
  assert.equal(s.state.sent.length, 0);
});
test('a stale slow theme cannot replace the most recent selection', async () => {
  const s = await setup({ held: '湖景火锅' });
  s.select('food');
  s.select('nature');
  await flush();
  assert.equal(s.screen.dataset.homeTheme, 'nature');
  s.release(); await flush();
  assert.equal(s.screen.dataset.homeTheme, 'nature');
  assert.equal(s.tabs.attrs['aria-busy'], 'false');
});
test('failed theme assets retain the entire prior snapshot and report retry', async () => {
  const s = await setup({ failed: '湖景火锅' });
  s.select('food'); await flush();
  assert.equal(s.screen.dataset.homeTheme, 'all');
  assert.equal(s.state.refreshes.at(-1).slides.length, 9);
  assert.match(s.state.notifications.at(-1), /重试/);
});
test('language changes during theme loading commit the current language only', async () => {
  const s = await setup({ held: '湖景火锅' });
  s.select('food'); s.language('en'); s.release(); await flush();
  assert.equal(s.screen.dataset.homeTheme, 'food');
  assert.equal(s.tabs.children[2].querySelector('.home-theme-label').textContent, 'Food');
  assert(s.api.getSlides('en').every(slide => !/[\u4e00-\u9fff]/.test(slide.caption + slide.prompt)));
  assert.equal(s.api.getSlides('zh'), undefined);
});
test('inspiration clicks submit exact selected-language questions; swipes do not submit', async () => {
  const s = await setup();
  s.language('en'); await flush();
  const row = s.rows[0], button = row.querySelector('[data-home-inspiration]');
  row.fire('pointerdown', { clientX: 0 }); row.fire('pointermove', { clientX: 30 }); row.fire('pointerup');
  row.fire('click', { target: button });
  assert.equal(s.state.sent.length, 0);
  row.fire('click', { target: button });
  assert.equal(s.state.sent.length, 1);
  assert.equal(s.state.sent[0], s.api.snapshot('all', 'en').items[0].prompt);
  assert.equal(s.state.opened, 1);
});
test('arrow keys switch themes and keep a single selected keyboard target', async () => {
  const s = await setup();
  s.tabs.fire('keydown', { target: s.tabs.children[0], key: 'ArrowRight' });
  await flush();
  assert.equal(s.screen.dataset.homeTheme, 'heritage');
  assert.equal(s.tabs.children[1].focused, true);
  assert.equal(s.tabs.children.filter(button => button.tabIndex === 0).length, 1);
});
