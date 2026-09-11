const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const plan = fs.readFileSync(path.join(root, 'consumer/plan.html'), 'utf8');
function section(start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from);
  assert(from >= 0 && to > from, `Missing section: ${start}`);
  return source.slice(from, to);
}

// Isolated DOM/event contracts only; these tests do not access a browser or server.
test('home and standalone map use the shared history clock with a descriptive label', () => {
  const mapHeader = source.match(/mapHeader.innerHTML = `([^`]+)`;/)[1];
  for (const markup of [plan, mapHeader]) {
    const button = markup.match(/<button class="drawer-toggle"[^>]*>[\s\S]*?<\/button>/)[0];
    assert.match(button, /type="button"/);
    assert.match(button, /aria-label="打开历史对话"/);
    assert.match(button, /title="历史对话"/);
    assert.match(button, /aria-expanded="false"/);
    assert.match(button, /data-icon="history"/);
  }
  const icon = { dataset: { icon: 'history' }, innerHTML: '' };
  const context = vm.createContext({ document: { querySelectorAll: () => [icon] } });
  vm.runInContext(source.slice(0, source.indexOf('const merchantReturnKeyPrefix')), context);
  assert.match(icon.innerHTML, /viewBox="0 0 24 24"/);
  assert.match(icon.innerHTML, /aria-hidden="true"/);
  assert.match(icon.innerHTML, /M12 7v5l3 2/); // Clock hands, with the existing history arrow.
});

test('no old hamburger pseudo-element can override the centered clock', () => {
  const blocks = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  const pseudoBlocks = blocks.filter(([, selectors]) => selectors.includes('.drawer-toggle::before'));
  assert(pseudoBlocks.length > 0);
  for (const [, , declarations] of pseudoBlocks) {
    assert.match(declarations, /content:\s*none/);
    assert.match(declarations, /display:\s*none/);
    assert(!declarations.includes('linear-gradient'));
  }
  const clockWrapper = blocks.find(([, selectors]) => selectors.includes('.drawer-toggle [data-icon]') && !selectors.includes('svg'));
  assert(clockWrapper);
  assert.match(clockWrapper[2], /width:\s*26px/);
  assert.match(clockWrapper[2], /height:\s*26px/);
  assert.match(clockWrapper[2], /place-items:\s*center/);
  const clockSvg = blocks.find(([, selectors]) => selectors.includes('.drawer-toggle [data-icon] svg'));
  assert(clockSvg);
  assert.match(clockSvg[2], /width:\s*26px/);
  assert.match(clockSvg[2], /height:\s*26px/);
  for (const screen of ['plan', 'map']) {
    const selector = `.${screen}-screen .main-page-appbar .drawer-toggle`;
    const button = blocks.find(([, selectors]) => selectors.trim() === selector);
    assert.match(button[2], /width:\s*40px/);
    assert.match(button[2], /height:\s*40px/);
    assert.match(button[2], /display:\s*grid/);
    assert.match(button[2], /place-items:\s*center/);
  }
});

test('the larger language pill aligns with the clock and the title grid reserves space for both sides', () => {
  // Source geometry checks, not a browser layout measurement.
  const blocks = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  const declarations = selector => {
    const matches = blocks.filter(([, selectors]) => selectors.trim() === selector);
    assert(matches.length, `Missing CSS rule: ${selector}`);
    return Object.fromEntries(matches.flatMap(block => block[2].split(';')).filter(value => value.includes(':')).map(value => {
      const colon = value.indexOf(':');
      return [value.slice(0, colon).trim(), value.slice(colon + 1).trim()];
    }));
  };
  const clock = declarations('.plan-screen .main-page-appbar .drawer-toggle');
  const pill = declarations('.plan-screen .main-page-appbar .language-switch');
  const text = declarations('.plan-screen .main-page-appbar .language-switch > span');
  const number = (item, property) => Number.parseFloat(item[property]);
  assert.equal(pill.width, '60px');
  assert.equal(pill['min-width'], '60px');
  assert.equal(pill.height, '40px');
  assert.equal(pill['border-radius'], '20px');
  assert.equal(pill['align-items'], 'center');
  assert.equal(pill['justify-content'], 'center');
  assert.equal(pill['pointer-events'], 'auto');
  assert.equal(text['font-size'], '12px');
  assert.equal(number(clock, 'top') + number(clock, 'height') / 2, number(pill, 'top') + number(pill, 'height') / 2);
  assert.equal(number(pill, 'left') - number(clock, 'left') - number(clock, 'width'), 8);
  const header = declarations('.plan-screen .main-page-appbar,\n.map-screen .main-page-appbar');
  assert.equal(header.display, 'grid');
  assert.equal(header.padding, '0 16px');
  assert.equal(header['grid-template-columns'], 'minmax(112px, 1fr) max-content minmax(44px, 1fr)');
  const title = declarations('.main-page-title');
  const fontSize = number(title, 'font-size');
  assert.equal(fontSize, 20);
  assert.equal(title['grid-column'], '2');
  assert.equal(title['grid-row'], '1');
  const wishlist = declarations('.wishlist-toggle');
  // Model the source grid for CJK widths and a range of English font metrics.
  // These bounds are not browser-rendered measurements.
  for (const viewport of [320, 360, 373, 375, 390, 430]) {
    for (const titleWidth of ['在铜梁'.length * fontSize, '边走边耍'.length * fontSize, 88, 96, 119, 128, 132]) {
      const sideSpace = viewport - 32 - titleWidth;
      const leftTrack = Math.max(112, sideSpace / 2);
      const rightTrack = sideSpace - leftTrack;
      assert(rightTrack >= 44);
      const titleLeft = 16 + leftTrack;
      const titleRight = titleLeft + titleWidth;
      assert(titleLeft - number(pill, 'left') - number(pill, 'width') >= 4);
      assert(viewport - number(wishlist, 'right') - number(wishlist, 'width') - titleRight >= 4);
      assert.equal(titleLeft + titleWidth / 2, Math.max(viewport / 2, 128 + titleWidth / 2));
    }
  }
});

test('both page titles share larger single-line typography without a smaller English override', () => {
  const blocks = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  const titleBlocks = blocks.filter(([, selectors]) => selectors.includes('.main-page-title'));
  const shared = titleBlocks.find(([, selectors]) => selectors.trim() === '.main-page-title');
  assert(shared);
  for (const declaration of ['font-family: inherit', 'font-size: 20px', 'font-weight: 700', 'line-height: 28px', 'white-space: nowrap', 'text-align: center']) {
    assert(shared[2].includes(declaration));
  }
  for (const [, selectors, declarations] of titleBlocks) {
    assert(!selectors.includes('data-language'));
    assert(!/max-width|overflow|text-overflow/.test(declarations), 'Do not clip, truncate or constrain the title text');
    if (selectors.trim() !== '.main-page-title') {
      assert(!/font(?:-[a-z-]+)?\s*:|line-height|letter-spacing|white-space/.test(declarations), 'Background variants only change contrast, not typography');
    }
  }
});

test('clicking the clock still opens history and closing it restores expansion state', () => {
  const classes = new Set();
  const buttonAttributes = {};
  const drawerAttributes = {};
  let click;
  let refreshed = 0;
  let focused = 0;
  const context = vm.createContext({
    drawerPhone: { classList: { add: name => classes.add(name), remove: name => classes.delete(name) } },
    drawerToggle: {
      setAttribute: (name, value) => { buttonAttributes[name] = value; },
      addEventListener: (name, handler) => { if (name === 'click') click = handler; }
    },
    conversationDrawer: { setAttribute: (name, value) => { drawerAttributes[name] = value; } },
    resetFeatureCarouselGesture() {},
    refreshConversationDrawer: () => { refreshed++; },
    closeDrawerHistoryMenu() {},
    renderSharedConversation() {},
    persistActiveConversation: () => {},
    window: { requestAnimationFrame: callback => callback() },
    drawerSearchInput: { focus: () => { focused++; } }
  });
  vm.runInContext(section('const closeConversationDrawer =', 'const refreshConversationDrawer ='), context);
  vm.runInContext(section("drawerToggle?.addEventListener('click'", "languageSwitch?.addEventListener('click'"), context);
  click({ stopPropagation() {} });
  assert(classes.has('is-drawer-open'));
  assert.equal(buttonAttributes['aria-expanded'], 'true');
  assert.equal(drawerAttributes['aria-hidden'], 'false');
  assert.equal(refreshed, 1);
  assert.equal(focused, 1);
  vm.runInContext('closeConversationDrawer()', context);
  assert(!classes.has('is-drawer-open'));
  assert.equal(buttonAttributes['aria-expanded'], 'false');
  assert.equal(drawerAttributes['aria-hidden'], 'true');
});

test('clock tooltip and accessible label follow the selected language without changing the icon', () => {
  const attributes = {};
  const button = {
    innerHTML: '<span data-icon="history"></span>',
    setAttribute: (name, value) => { attributes[name] = value; }
  };
  const context = vm.createContext({
    currentLanguage: 'en',
    document: { querySelectorAll: () => [button] }
  });
  const update = section("  document.querySelectorAll('.drawer-toggle').forEach(button => {", "  languageSwitch?.setAttribute('aria-pressed'");
  vm.runInContext(update, context);
  assert.equal(attributes['aria-label'], 'Open conversation history');
  assert.equal(button.title, 'Conversation history');
  context.currentLanguage = 'zh';
  vm.runInContext(update, context);
  assert.equal(attributes['aria-label'], '打开历史对话');
  assert.equal(button.title, '历史对话');
  assert.equal(button.innerHTML, '<span data-icon="history"></span>');
});

test('both pages load the enlarged header stylesheet and retain the clock script', () => {
  for (const page of ['plan', 'explore']) {
    const html = fs.readFileSync(path.join(root, `consumer/${page}.html`), 'utf8');
    assert(html.includes('../styles.css?v=agent-tools-v2'));
    assert(html.includes('../app.js?v=agent-tools-v2'));
  }
});
