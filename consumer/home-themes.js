// Theme presentation only; the controller never changes conversations, drafts or wishlist data.
(() => {
  let activeSnapshot = null;
  let originalHomeSnapshot = null;
  const languageKey = value => value === 'en' ? 'en' : 'zh';
  const localAsset = value => typeof value === 'string' && /^assets\/(?!.*\.\.)[^?#]+$/.test(value);
  function snapshot(id, language) {
    const theme = window.TongliangHomeThemeContent?.themes?.[id];
    const lang = languageKey(language);
    if (theme?.originalHome && originalHomeSnapshot) {
      const original = originalHomeSnapshot(lang);
      if (!original?.items?.length || !original.slides?.length) return null;
      return { ...original, id, language: lang, background: theme.background,
        accent: theme.accent, label: theme.label[lang], originalHome: true };
    }
    if (!theme || !localAsset(theme.background) || !theme[lang] || !theme.label?.[lang] ||
        !Array.isArray(theme.items) || theme.items.length < 3 || !theme.items.every(row =>
          row.id && localAsset(row.image) && row[lang]?.title && row[lang]?.prompt)) return null;
    const ids = new Set(theme.items.map(row => row.id));
    if (ids.size !== theme.items.length) return null;
    return {
      id, language: lang, background: theme.background, accent: theme.accent,
      label: theme.label[lang], ...theme[lang],
      items: theme.items.map(row => ({
        id: `${id}-${row.id}`, image: row.image, icon: row.icon, ...row[lang]
      })),
      slides: theme.items.map(row => ({
        id: `${id}-${row.id}`, image: row.image, alt: row[lang].title,
        caption: row[lang].title, prompt: row[lang].prompt, action: `guide:theme-${id}`
      }))
    };
  }
  function install({ screen, getLanguage, getOriginalHome, refreshCarousel, submit, openConversation, showHome, notify, assetUrl }) {
    const tabs = screen?.querySelector('.home-signature-topics');
    const content = window.TongliangHomeThemeContent;
    if (!screen || !tabs || !content) return;
    originalHomeSnapshot = getOriginalHome;
    const rows = [...screen.querySelectorAll('[data-journey-marquee]')];
    const images = new Map();
    let requestVersion = 0, requestedId = content.defaultTheme;
    const imageReady = path => {
      if (!images.has(path)) images.set(path, new Promise((resolve, reject) => {
        const image = new Image();
        const timer = setTimeout(() => { image.onload = image.onerror = null; reject(new Error('image_timeout')); }, 8000);
        image.onload = () => { clearTimeout(timer); resolve(); };
        image.onerror = () => { clearTimeout(timer); reject(new Error('image_unavailable')); };
        image.src = assetUrl(path);
      }).catch(error => { images.delete(path); throw error; }));
      return images.get(path);
    };
    tabs.setAttribute('role', 'tablist');
    const buttons = Object.entries(content.themes).map(([id, theme]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'home-theme-tab';
      button.dataset.homeTheme = id;
      button.id = `home-theme-${id}`;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', 'home-theme-panel');
      button.setAttribute('aria-selected', 'false');
      button.tabIndex = id === content.defaultTheme ? 0 : -1;
      const icon = document.createElement('span');
      icon.className = 'home-theme-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = theme.icon;
      const label = document.createElement('span');
      label.className = 'home-theme-label';
      button.append(icon, label);
      return button;
    });
    tabs.replaceChildren(...buttons);
    const panel = screen.querySelector('.plan-theme-content');
    panel.id = 'home-theme-panel';
    panel.setAttribute('role', 'tabpanel');
    const status = document.createElement('span');
    status.className = 'home-theme-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    tabs.after(status);
    function updateTabLabels() {
      const language = languageKey(getLanguage());
      tabs.setAttribute('aria-label', language === 'en' ? 'Explore by theme' : '切换游玩主题');
      buttons.forEach(button => {
        button.querySelector('.home-theme-label').textContent = content.themes[button.dataset.homeTheme].label[language];
      });
    }
    const createChip = item => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'journey-chip';
      button.dataset.homeInspiration = item.id;
      const icon = document.createElement('i');
      icon.className = 'journey-chip-swatch';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = item.icon;
      button.append(icon, document.createTextNode(item.title));
      return button;
    };
    function commit(next) {
      activeSnapshot = next;
      screen.dataset.homeTheme = next.id;
      screen.style.setProperty('--home-theme-accent', next.accent);
      screen.querySelector('.plan-background-image').style.backgroundImage =
        `${next.originalHome ? '' : 'linear-gradient(180deg, rgba(5,20,30,.28), rgba(5,20,30,.18) 35%, rgba(5,20,30,.66)), '}url("${assetUrl(next.background)}")`;
      for (const [key, selector] of Object.entries({
        lineOne: '[data-i18n="planHeroLineOne"]', lineTwo: '[data-i18n="planHeroLineTwo"]',
        summary: '[data-i18n="planHeroSummary"]', gallery: '[data-i18n="planFeatureTitle"]'
      })) screen.querySelector(selector).textContent = next[key];
      rows.forEach((row, index) => {
        row.dispatchEvent(new Event('pointercancel'));
        row.classList.remove('dragging');
        row.scrollLeft = 0;
        const items = next.marqueeRows?.[index] ||
          next.items.map((_, itemIndex) => next.items[(itemIndex + index) % next.items.length]);
        const track = document.createElement('div');
        track.className = 'journey-track';
        // Repeat a whole group so narrow groups still cover the viewport during looping.
        const originals = Array.from({ length: Math.max(3, items.length) }, (_, n) => createChip(items[n % items.length]));
        track.append(...originals);
        for (const chip of originals) {
          const clone = chip.cloneNode(true);
          clone.tabIndex = -1;
          clone.setAttribute('aria-hidden', 'true');
          track.append(clone);
        }
        row.replaceChildren(track);
        row.setAttribute('aria-label', next.language === 'en'
          ? `${next.label} ideas, row ${index + 1}` : `${next.label}灵感第${index + 1}行`);
      });
      screen.querySelector('.journey-marquees').setAttribute('aria-label', next.language === 'en' ? `${next.label} ideas` : `${next.label}游玩灵感`);
      panel.setAttribute('aria-labelledby', `home-theme-${next.id}`);
      buttons.forEach(button => {
        const selected = button.dataset.homeTheme === next.id;
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
      });
      updateTabLabels();
      refreshCarousel(true);
      status.textContent = next.language === 'en' ? `${next.label} theme selected` : `已切换至${next.label}主题`;
    }
    async function select(id, reveal = false) {
      const version = ++requestVersion;
      requestedId = id;
      const next = snapshot(id, getLanguage());
      if (!next) return;
      updateTabLabels();
      tabs.setAttribute('aria-busy', 'true');
      try {
        await Promise.all([...new Set([next.background, ...next.slides.map(slide => slide.image)])].map(imageReady));
        if (version !== requestVersion) return;
        commit(next);
        if (reveal) {
          showHome();
          panel.scrollTo({ top: 0 });
        }
      } catch (_) {
        if (version !== requestVersion) return;
        // Retain the entire prior snapshot, not a mixture of old and new theme assets.
        if (activeSnapshot) commit(snapshot(activeSnapshot.id, getLanguage()) || activeSnapshot);
        requestedId = activeSnapshot?.id || content.defaultTheme;
        notify(getLanguage() === 'en' ? 'Theme images are unavailable. Please try again.' : '主题素材暂未加载成功，请重试。');
      } finally {
        if (version === requestVersion) tabs.setAttribute('aria-busy', 'false');
      }
    }
    tabs.addEventListener('click', event => {
      const button = event.target.closest('[data-home-theme]');
      if (button) select(button.dataset.homeTheme, true);
    });
    tabs.addEventListener('keydown', event => {
      const index = buttons.indexOf(event.target.closest('[data-home-theme]'));
      if (index < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const target = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[target].focus();
      select(buttons[target].dataset.homeTheme, true);
    });
    rows.forEach(row => {
      let start = null, moved = false;
      row.addEventListener('pointerdown', event => { start = event.clientX; moved = false; });
      row.addEventListener('pointermove', event => { if (start !== null && Math.abs(event.clientX - start) > 6) moved = true; });
      row.addEventListener('pointerup', () => { start = null; });
      row.addEventListener('pointercancel', () => { start = null; moved = false; });
      row.addEventListener('click', event => {
        const button = event.target.closest('[data-home-inspiration]');
        if (!button) return;
        event.preventDefault();
        event.stopPropagation();
        if (moved && event.detail !== 0) { moved = false; return; }
        const item = activeSnapshot?.items.find(item => item.id === button.dataset.homeInspiration);
        if (item) { submit(item.prompt); openConversation(); }
      });
    });
    window.addEventListener('home-language-change', () => select(requestedId));
    updateTabLabels();
    select(content.defaultTheme);
  }
  window.TongliangHomeThemes = {
    install, snapshot,
    getSlides: language => activeSnapshot && activeSnapshot.language === languageKey(language) ? activeSnapshot.slides : undefined
  };
})();
