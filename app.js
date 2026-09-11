const svg = paths => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

const assetUrl = path => {
  if (typeof path !== 'string' || !path.startsWith('assets/')) return path;
  // Use the user-supplied mascot for shared replies; retain the original asset.
  if (path === 'assets/dragon .png') path = 'assets/dragon-guide-20260910.png';
  return new URL(`../${path}`, document.baseURI).href;
};

const icons = {
  map: svg('<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/>'),
  home: svg('<path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z"/>'),
  user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  plan: svg('<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.2 2.2 4.8-5"/>'),
  camera: svg('<path d="M4 8h3l1.5-2h7L17 8h3v10H4V8Z"/><circle cx="12" cy="13" r="3"/>'),
  folder: svg('<path d="M3 6h6l2 3h10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z"/><path d="M3 9h18"/>'),
  translate: svg('<path d="M4 5h8M8 3v2m-3 4c1.5 3 3.5 5 6 6m0-6c-1.3 2.6-3.3 4.7-6 6m9-2 3.5 8m2.5-8-3.5 8m-1.3-3h4.6"/>'),
  bag: svg('<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>'),
  phone: svg('<path d="M7 3 4 5c0 8 7 15 15 15l2-3-5-3-2 2c-3-1-5-3-6-6l2-2-3-5Z"/>'),
  search: svg('<circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/>'),
  mic: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6"/>'),
  keyboard: svg('<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h.01M10 10h.01M13 10h.01M16 10h.01M7 14h7M17 14h.01"/>'),
  send: svg('<path d="m21 3-7 18-4-7-7-4 18-7Z"/><path d="m10 14 4-4"/>'),
  stop: svg('<rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor" stroke="none"/>'),
  food: svg('<path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M16 3v18M16 3c3 2 4 5 4 8h-4"/>'),
  hotel: svg('<path d="M4 20V5h16v15M4 11h16M8 8h2M14 8h2M8 15h2M14 15h2"/>'),
  car: svg('<path d="M5 17h14l-1-7-2-3H8l-2 3-1 7Z"/><circle cx="8" cy="17" r="2"/><circle cx="16" cy="17" r="2"/><path d="M6 11h12"/>'),
  flag: svg('<path d="M5 21V4m0 1h11l-2 4 2 4H5"/>'),
  layers: svg('<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>'),
  feedback: svg('<path d="M4 5h16v12H8l-4 4V5Z"/><path d="M8 9h8M8 13h5"/>'),
  settings: svg('<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.8-1L14.5 3h-5L9 6a7 7 0 0 0-1.8 1L5 6 3 9.5 5.1 11a7 7 0 0 0 0 2L3 14.5 5 18l2.2-1a7 7 0 0 0 1.8 1l.5 3h5l.5-3a7 7 0 0 0 1.8-1l2.2 1 2-3.5-2.1-1.5c.1-.3.1-.7.1-1Z"/>'),
  wallet: svg('<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 9h18M16 13h3"/>'),
  calendar: svg('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>'),
  heart: svg('<path d="M20.8 5.6a5.4 5.4 0 0 0-7.7 0L12 6.7l-1.1-1.1a5.4 5.4 0 0 0-7.7 7.7L12 22l8.8-8.7a5.4 5.4 0 0 0 0-7.7Z"/>'),
  gift: svg('<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18M12 8H8.5a2.5 2.5 0 1 1 2.5-2.5V8ZM12 8h3.5A2.5 2.5 0 1 0 13 5.5V8Z"/>'),
  thumbUp: svg('<path d="M7 10v10H4V10h3ZM7 20h9.4a2 2 0 0 0 2-1.6l1.2-6a2 2 0 0 0-2-2.4H14l.6-3.2A3 3 0 0 0 11.7 3L7 10Z"/>'),
  thumbDown: svg('<path d="M7 14V4H4v10h3ZM7 4h9.4a2 2 0 0 1 2 1.6l1.2 6A2 2 0 0 1 17.6 14H14l.6 3.2a3 3 0 0 1-2.9 3.8L7 14Z"/>'),
  refund: svg('<path d="M4 8V4m0 0h4M4 4l4 4a7 7 0 1 1-2 7"/>'),
  order: svg('<path d="M6 3h12v18H6zM9 8h6M9 12h6M9 16h4"/>'),
  chevron: svg('<path d="m9 18 6-6-6-6"/>'),
  video: svg('<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>'),
  ticket: svg('<path d="M4 6h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4V6Z"/><path d="M12 8v2M12 14v2"/>'),
  history: svg('<path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.5"/><path d="M4 4v4.5h4.5M12 7v5l3 2"/>')
  ,store: svg('<path d="M4 9h16l-1-5H5L4 9Z"/><path d="M5 9v11h14V9M9 20v-6h6v6M4 9a3 3 0 0 0 6 0 3 3 0 0 0 4 0 3 3 0 0 0 6 0"/>')
  ,more: svg('<circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/>')
  ,box: svg('<path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="M4 7v10l8 4 8-4V7M12 11v10"/>')
  ,chart: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20V7"/><path d="M2 20h22"/>')
  ,building: svg('<path d="m3 9 9-6 9 6M5 9h14M6 20h12M8 9v8M12 9v8M16 9v8"/>')
  ,grid: svg('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>')
  ,fire: svg('<path d="M13 3s1 4-2 6c-2-3-5-2-5 2a6 6 0 1 0 12 0c0-3-2-5-5-8Z"/><path d="M12 13c2 1 2 4 0 6-2-1-3-4 0-6Z"/>')
  ,briefcase: svg('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V4h6v3M3 12h18M10 12v2h4v-2"/>')
  ,report: svg('<path d="M6 3h9l3 3v15H6V3Z"/><path d="M15 3v4h4M9 11h6M9 15h6M9 19h4"/>')
  ,pin: svg('<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>')
  ,locate: svg('<circle cx="12" cy="12" r="5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>')
  ,mapEntry: svg('<path d="M4 12h16l2 8H2l2-8Z"/><path d="M4.8 15h14.4M8 12l-1 8M16 12l1 8M12 12v8"/><path d="M12 3a4 4 0 0 0-4 4c0 3.2 4 7 4 7s4-3.8 4-7a4 4 0 0 0-4-4Z"/><circle cx="12" cy="7" r="1.3"/>')
  ,route: svg('<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h3a3 3 0 0 0 3-3v-6a3 3 0 0 1 3-3"/>')
  ,navigation: svg('<path fill="currentColor" stroke="none" d="M21.4 3.2 3.3 10.7a.8.8 0 0 0 .1 1.5l6.8 2.2 2.2 6.8a.8.8 0 0 0 1.5.1l7.5-18.1a.8.8 0 0 0-1-1Zm-8 15.3-1.4-4.4 3.7-3.7-3.7 3.7-4.4-1.4L19 7.9l-5.6 10.6Z"/>')
  ,chat: svg('<path d="M20 11.5a8 8 0 0 1-8 8H4l1.4-4.1A8 8 0 1 1 20 11.5Z"/>')
  ,chatPlus: svg('<path d="M20 11.5a8 8 0 0 1-8 8H4l1.4-4.1A8 8 0 1 1 20 11.5Z"/><path d="M12 7.5v8M8 11.5h8"/>')
  ,cardHeart: svg('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>')
  ,'chevron-left': svg('<path d="m15 18-6-6 6-6"/>')
  ,knowledge: svg('<path d="M4 4h6a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4V4Z"/><path d="M20 4h-4a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h4V4Z"/>')
  ,plus: svg('<path d="M12 5v14M5 12h14"/>')
  ,link: svg('<path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2"/>')
  ,spark: svg('<path d="m12 3 1.3 4.2L17 9l-3.7 1.8L12 15l-1.3-4.2L7 9l3.7-1.8L12 3Z"/><path d="m5 14 .8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14ZM19 13l.6 1.4L21 15l-1.4.6L19 17l-.6-1.4L17 15l1.4-.6L19 13Z"/>')
  ,sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>')
  ,alert: svg('<path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 9v5M12 17h.01"/>')
  ,shield: svg('<path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>')
  ,filter: svg('<path d="M4 5h16l-6 7v5l-4 2v-7L4 5Z"/>')
  ,refresh: svg('<path d="M20 7v5h-5M4 17v-5h5"/><path d="M18 12a6 6 0 0 0-10-4L4 12M6 12a6 6 0 0 0 10 4l4-4"/>')
  ,copy: svg('<rect x="9" y="3" width="11" height="14" rx="2"/><path d="M15 17v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3"/>')
  ,volume: svg('<path d="M5 10v4h3l4 3V7l-4 3H5Z"/><path d="M15 9.5a4 4 0 0 1 0 5M18 7a7 7 0 0 1 0 10"/>')
  ,quote: svg('<path d="M8.5 10.5H5a3 3 0 0 0 0 6h3.5v-6ZM19 10.5h-3.5a3 3 0 0 0 0 6H19v-6Z"/>')
  ,selectText: svg('<path d="M7 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h2M17 4h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2M9 8h6M9 12h6M9 16h6"/>')
  ,filePlus: svg('<path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v5h5M12 11v6M9 14h6"/>')
  ,share: svg('<path d="M12 16V4M8 8l4-4 4 4"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>')
  ,bookmark: svg('<path d="M6 3h12v18l-6-4-6 4V3Z"/>')
  ,fileExport: svg('<path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v5h5M10 14h7M14 11l3 3-3 3"/>')
  ,trash: svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"/>')
  ,close: svg('<path d="m6 6 12 12M18 6 6 18"/>')
  ,eraser: svg('<path d="m4 15 8-8a2 2 0 0 1 2.8 0l4.2 4.2a2 2 0 0 1 0 2.8l-4 4H7l-3-3a2 2 0 0 1 0-2.8Z"/><path d="m9 11 6 6M11 18h9"/>')
  ,broom: svg('<path d="m8 15 7-11"/><path d="m14 3 2 1"/><path d="M7 14c-1 1-2 3-4 6 3 1 7 1 11 0-1-3-2-5-4-6Z"/><path d="M5 18 4 21M8 18l-.5 3M11 18v3"/>')
  ,clearBroom: svg('<path fill="currentColor" stroke="none" d="M10 2h4a1.5 1.5 0 0 1 1.5 1.5V7H20a2 2 0 0 1 2 2v4H2V9a2 2 0 0 1 2-2h4.5V3.5A1.5 1.5 0 0 1 10 2Z"/><path d="M4.5 13 3 22h18l-1.5-9M7.5 18l-.5 4M12 18v4M16.5 18l.5 4"/>')
};

document.querySelectorAll('[data-icon]').forEach(element => {
  element.innerHTML = icons[element.dataset.icon] || '';
});

const merchantReturnKeyPrefix = 'tongliang-merchant-return:';
const currentMerchantFile = () => {
  const file = location.pathname.split('/').pop();
  return /^merchant(?:-[a-z0-9-]+)?\.html$/i.test(file || '') ? file : '';
};

const navigateToPage = button => {
  const target = button.dataset.page;
  if (target === 'explore' && typeof switchConsumerBackground === 'function' && document.querySelector('.plan-screen')) {
    switchConsumerBackground('map');
    return;
  }
  if (target === 'plan' && typeof switchConsumerBackground === 'function' && document.querySelector('.plan-screen.is-map-active')) {
    switchConsumerBackground('plan');
    return;
  }
  if (target === 'explore' && !hasCurrentLocation() && !readCompanionMode()) {
    requestOneTimeLocationForExplore();
    return;
  }
  const source = currentMerchantFile();
  if (source && target.startsWith('merchant')) {
    try { sessionStorage.setItem(`${merchantReturnKeyPrefix}${target}.html`, source); } catch (_) {}
  }
  location.href = `${target}.html`;
};

const ordersReturnKey = 'tongliang-orders-return-page-v1';
const saveOrdersReturnPage = () => {
  try {
    const file = location.pathname.split('/').pop();
    sessionStorage.setItem(ordersReturnKey, /^(plan|explore)\.html$/i.test(file || '') ? file : 'plan.html');
  } catch (_) {}
};

document.querySelectorAll('.orders-back').forEach(button => {
  button.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    let source = 'plan.html';
    try { source = sessionStorage.getItem(ordersReturnKey) || source; } catch (_) {}
    const target = new URL(source, location.href);
    target.searchParams.set('restoreDrawer', '1');
    location.href = target.href;
  });
});

document.querySelectorAll('[data-page]:not([data-merchant-back])').forEach(button => {
  button.addEventListener('click', () => navigateToPage(button));
  if (!button.matches('button, a, input, select, textarea')) {
    button.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        navigateToPage(button);
      }
    });
  }
});

document.querySelectorAll('[data-merchant-back]').forEach(button => {
  button.addEventListener('click', () => {
    const current = currentMerchantFile();
    let target = '';
    try { target = sessionStorage.getItem(`${merchantReturnKeyPrefix}${current}`) || ''; } catch (_) {}
    location.href = target || `${button.dataset.page}.html`;
  });
});

document.querySelectorAll('[data-merchant-tab-group]').forEach(group => {
  const buttons = [...group.querySelectorAll('[data-merchant-tab]')];
  const container = group.parentElement;
  buttons.forEach(button => button.addEventListener('click', () => {
    const selected = button.dataset.merchantTab;
    buttons.forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
    });
    container.querySelectorAll('[data-merchant-tab-panel]').forEach(panel => {
      panel.hidden = panel.dataset.merchantTabPanel !== selected;
    });
    document.querySelectorAll('[data-merchant-tab-visible]').forEach(action => {
      action.hidden = action.dataset.merchantTabVisible !== selected;
    });
  }));
});

const productFilterControls = document.querySelectorAll('[data-merchant-product-filter]');
if (productFilterControls.length) {
  const productItems = document.querySelectorAll('[data-merchant-product]');
  const applyProductFilters = () => {
    const state = document.querySelector('[data-merchant-product-filter="state"]')?.value || 'all';
    const category = document.querySelector('[data-merchant-product-filter="category"]')?.value || 'all';
    productItems.forEach(item => {
      const matchesState = state === 'all' || item.dataset.productState === state;
      const matchesCategory = category === 'all' || item.dataset.productCategory === category;
      item.hidden = !(matchesState && matchesCategory);
    });
  };
  productFilterControls.forEach(control => control.addEventListener('change', applyProductFilters));
}

document.querySelectorAll('[data-merchant-keywords]').forEach(editor => {
  const list = editor.querySelector('[data-merchant-keyword-list]');
  const input = editor.querySelector('[data-merchant-keyword-input]');
  const addButton = editor.querySelector('[data-merchant-keyword-add]');
  const count = editor.querySelector('[data-merchant-keyword-count]');
  const limit = Number(editor.dataset.keywordLimit || 10);
  const updateKeywordState = () => {
    const total = list.querySelectorAll('.merchant-keyword').length;
    count.textContent = `已添加 ${total} / ${limit} 个关键词`;
    addButton.disabled = total >= limit;
    input.disabled = total >= limit;
    input.placeholder = total >= limit ? `最多 ${limit} 个关键词` : '输入关键词';
  };
  const addKeyword = () => {
    const keyword = input.value.trim();
    const existing = [...list.querySelectorAll('.merchant-keyword')].map(item => item.firstChild.textContent.trim());
    if (!keyword || existing.includes(keyword) || existing.length >= limit) return;
    const tag = document.createElement('span');
    tag.className = 'merchant-keyword';
    tag.append(document.createTextNode(keyword));
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.setAttribute('aria-label', `删除关键词 ${keyword}`);
    removeButton.innerHTML = icons.close;
    removeButton.addEventListener('click', () => {
      tag.remove();
      updateKeywordState();
    });
    tag.append(removeButton);
    list.append(tag);
    input.value = '';
    updateKeywordState();
  };
  list.querySelectorAll('.merchant-keyword button').forEach(button => button.addEventListener('click', () => {
    button.closest('.merchant-keyword')?.remove();
    updateKeywordState();
  }));
  addButton.addEventListener('click', addKeyword);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addKeyword();
    }
  });
  updateKeywordState();
});

const publishedKnowledgeDeletionKey = 'tongliang-merchant-published-knowledge-deleted';
const publishedKnowledge = document.querySelector('[data-merchant-published-knowledge]');
if (publishedKnowledge) {
  try {
    if (localStorage.getItem(publishedKnowledgeDeletionKey) === 'true') {
      publishedKnowledge.innerHTML = '<p class="merchant-empty-state">暂无已发布知识</p>';
    }
  } catch (_) {}
}
document.querySelector('[data-merchant-knowledge-delete]')?.addEventListener('click', () => {
  requestRecordDelete({
    title: '确认删除这条已发布知识吗？',
    onConfirm: () => {
      try { localStorage.setItem(publishedKnowledgeDeletionKey, 'true'); } catch (_) {}
      location.href = 'merchant-knowledge.html';
    }
  });
});

const productReturnStorageKey = 'tongliang-product-return-v1';
const productFavoriteStorageKey = 'tongliang-product-favorites-v1';
const conversationFavoriteStorageKey = 'tongliang-conversation-favorites-v1';
const defaultFavoriteProductIds = ['toudaocai', 'sanhuochun', 'xijiao-yashe', 'longcheng-hotel'];
const favoriteProductCatalog = {
  toudaocai: { category: 'eat', icon: 'food', store: '铜梁区原乡头刀菜餐饮店', name: '泡椒头刀菜', image: 'assets/头刀菜.jpeg', savedAt: '收藏时间：2026年08月02日 10:28' },
  sanhuochun: { category: 'eat', icon: 'food', store: '铜梁区三活餐馆', name: '油烧兔', image: 'assets/三活春油烧兔-1.png', savedAt: '收藏时间：2026年08月01日 19:36' },
  'xijiao-yashe': { category: 'stay', icon: 'hotel', store: '西郊雅社民宿', name: '西郊雅社民宿', image: 'assets/西郊雅社-1.jpeg', savedAt: '收藏时间：2026年08月01日 16:22' },
  'longcheng-hotel': { category: 'stay', icon: 'hotel', store: '希岸 Deluxe 酒店', name: '希岸 Deluxe 酒店重庆铜梁万达广场龙城天街店', image: 'assets/龙城天街连锁酒店-1.jpeg', savedAt: '收藏时间：2026年07月31日 20:10' }
};
const defaultConversationFavorites = [
  { id: 'lake-intro', title: '玄天湖景区介绍', prompt: '我是一个用户，我当前定位是玄天湖景区，请以一个AI伴游的身份，给我介绍这里。', content: '玄天湖AI伴游全程讲解（当前定位玄天湖景区）。这里是4A级巴岳山玄天湖旅游度假区，全天免费入园，适合亲子、骑行与散心。', savedAt: '今天' },
  { id: 'follow-up', title: '后续沟通安排', prompt: '好的好的，我们后续再说吧。', content: '没问题，你先忙自己的事情就好。什么时候有空想聊天、探讨问题了随时再来，祝你一切顺利！', savedAt: '今天' }
];
function readProductFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(productFavoriteStorageKey) || 'null');
    return Array.isArray(saved) ? saved.filter(id => favoriteProductCatalog[id]) : [...defaultFavoriteProductIds];
  } catch (_) { return [...defaultFavoriteProductIds]; }
}
function writeProductFavorites(ids) {
  try { localStorage.setItem(productFavoriteStorageKey, JSON.stringify(ids)); } catch (_) {}
}
function toggleProductFavorite(id) {
  const ids = readProductFavorites();
  const next = ids.includes(id) ? ids.filter(item => item !== id) : [id, ...ids];
  writeProductFavorites(next);
  return next.includes(id);
}
function removeProductFavorite(id) {
  writeProductFavorites(readProductFavorites().filter(item => item !== id));
}
function readConversationFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(conversationFavoriteStorageKey) || 'null');
    return Array.isArray(saved) ? saved : [...defaultConversationFavorites];
  } catch (_) { return [...defaultConversationFavorites]; }
}
function writeConversationFavorites(items) {
  try { localStorage.setItem(conversationFavoriteStorageKey, JSON.stringify(items)); } catch (_) {}
}
window.tongliangProductFavorites = { has: id => readProductFavorites().includes(id), toggle: toggleProductFavorite, remove: removeProductFavorite, catalog: favoriteProductCatalog };
window.tongliangConversationFavorites = { read: readConversationFavorites };

const favoriteProductList = document.querySelector('[data-favorite-product-list]');
if (favoriteProductList) {
  const renderFavoriteProducts = () => {
    const ids = readProductFavorites();
    favoriteProductList.innerHTML = ids.length ? ids.map(id => {
      const item = favoriteProductCatalog[id];
      return `<article class="order-card favorite-product-card" data-order-category="${item.category}" data-favorite-product="${id}"><div class="order-store"><span class="order-store-mark">${icons[item.icon]}</span><strong>${escapeHTML(item.store)}</strong><em>已收藏</em></div><div class="order-product-row"><img src="${assetUrl(item.image)}" alt="${escapeHTML(item.name)}"><div><strong>${escapeHTML(item.name)}</strong><b>${escapeHTML(item.savedAt)}</b></div><div class="record-row-actions"><button class="history-revisit" type="button">查看详情</button><button class="record-delete" type="button" data-favorite-product-delete="${id}" aria-label="删除收藏" title="删除收藏">${icons.trash}</button></div></div></article>`;
    }).join('') : '<p class="favorites-empty">暂无商品收藏</p>';
  };
  renderFavoriteProducts();
  favoriteProductList.addEventListener('click', event => {
    const deleteButton = event.target.closest('[data-favorite-product-delete]');
    if (deleteButton) {
      event.preventDefault();
      event.stopPropagation();
      requestRecordDelete({
        title: '确认删除此条记录吗？',
        onConfirm: () => {
          removeProductFavorite(deleteButton.dataset.favoriteProductDelete);
          renderFavoriteProducts();
          notify('已删除收藏');
        }
      });
      return;
    }
    const card = event.target.closest('[data-favorite-product]');
    if (!card) return;
    saveProductReturn();
    location.href = `product-detail.html?item=${encodeURIComponent(card.dataset.favoriteProduct)}`;
  });
}
const favoriteConversationList = document.querySelector('[data-favorite-conversation-list]');
if (favoriteConversationList) {
  const renderFavoriteConversations = () => {
    favoriteConversationList.innerHTML = readConversationFavorites().map(item => `<article class="favorite-conversation-item" data-favorite-conversation="${escapeHTML(item.id)}"><button class="favorite-conversation-open" type="button" data-favorite-conversation-open><strong>${escapeHTML(item.title)}</strong><p>${escapeHTML(item.content)}</p></button><div class="favorite-conversation-meta"><span>${escapeHTML(item.savedAt)}</span><button class="record-delete" type="button" data-favorite-conversation-delete="${escapeHTML(item.id)}" aria-label="删除收藏" title="删除收藏">${icons.trash}</button></div></article>`).join('') || '<p class="favorites-empty">暂无对话收藏</p>';
  };
  renderFavoriteConversations();
  favoriteConversationList.addEventListener('click', event => {
    const deleteButton = event.target.closest('[data-favorite-conversation-delete]');
    if (deleteButton) {
      event.preventDefault();
      event.stopPropagation();
      requestRecordDelete({
        title: '确认删除此条记录吗？',
        onConfirm: () => {
          writeConversationFavorites(readConversationFavorites().filter(item => item.id !== deleteButton.dataset.favoriteConversationDelete));
          renderFavoriteConversations();
          notify('已删除收藏');
        }
      });
      return;
    }
    const item = event.target.closest('[data-favorite-conversation]');
    if (!item || !event.target.closest('[data-favorite-conversation-open]')) return;
    location.href = `favorite-conversation.html?item=${encodeURIComponent(item.dataset.favoriteConversation)}`;
  });
}
const favoriteTabs = document.querySelectorAll('[data-favorites-tab]');
if (favoriteTabs.length) {
  favoriteTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const selected = tab.dataset.favoritesTab;
      favoriteTabs.forEach(item => {
        const active = item === tab;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      });
      document.querySelectorAll('[data-favorites-panel]').forEach(panel => {
        panel.hidden = panel.dataset.favoritesPanel !== selected;
      });
    });
  });
}
function saveProductReturn() {
  try { sessionStorage.setItem(productReturnStorageKey, location.href); } catch (_) {}
}
function saveWishlistProductReturn() {
  try {
    const returnUrl = new URL(location.href);
    returnUrl.searchParams.set('restoreWishlist', '1');
    sessionStorage.setItem(productReturnStorageKey, returnUrl.href);
  } catch (_) { saveProductReturn(); }
}
document.addEventListener('click', event => {
  if (event.target.closest('a[href^="product-detail.html"]')) saveProductReturn();
});

const entryLocationKey = 'tongliang-current-location';
const companionModeKey = 'tongliang-companion-mode';
const savedWeekendPlanKey = 'tongliang-saved-weekend-plan-v1';
const planProgressKey = 'tongliang-plan-progress-v1';
function readCurrentLocation() {
  try {
    const value = JSON.parse(sessionStorage.getItem(entryLocationKey) || 'null');
    return value && typeof value === 'object' ? value : null;
  } catch (_) {
    return null;
  }
}
function hasCurrentLocation() {
  return Boolean(readCurrentLocation());
}
function saveCurrentLocation(source) {
  const locationData = { source, updatedAt: Date.now(), simulated: true };
  try { sessionStorage.setItem(entryLocationKey, JSON.stringify(locationData)); } catch (_) {}
  return locationData;
}
const weekendPlanStops = [
  { day: 'Day1', time: '09:40', name: '玄天湖北门骑行', point: [42, 46] },
  { day: 'Day1', time: '13:30', name: '玄天湖湖边休闲', point: [55, 39] },
  { day: 'Day1', time: '16:40', name: '奇彩梦园', point: [66, 31] },
  { day: 'Day1', time: '20:30', name: '酒店入住', point: [72, 45] },
  { day: 'Day2', time: '08:00', name: '龙门老街早茶', point: [34, 57] },
  { day: 'Day2', time: '09:00', name: '安居古城', point: [21, 42] },
  { day: 'Day2', time: '12:20', name: '铜梁区三活餐馆', point: [45, 63] },
  { day: 'Day2', time: '13:40', name: '巴岳山徒步', point: [77, 67] },
  { day: 'Day2', time: '16:10', name: '天街 / 游客中心采购', point: [60, 54] }
];
const readSavedWeekendPlan = () => {
  try { return JSON.parse(localStorage.getItem(savedWeekendPlanKey) || 'null'); } catch (_) { return null; }
};
const hasSavedWeekendPlan = () => Boolean(readSavedWeekendPlan());
const saveWeekendPlan = () => {
  const plan = {
    id: 'tongliang-weekend-drive-v1',
    title: '重庆主城→铜梁周末 2 日自驾攻略',
    summary: 'Day1 玄天湖骑行 + 打铁花｜Day2 安居古城 + 巴岳山',
    savedAt: Date.now()
  };
  try {
    localStorage.setItem(savedWeekendPlanKey, JSON.stringify(plan));
    localStorage.setItem(planProgressKey, '1');
    return plan;
  } catch (_) {
    return null;
  }
};
const clearSavedWeekendPlan = () => {
  try {
    localStorage.removeItem(savedWeekendPlanKey);
    localStorage.removeItem(planProgressKey);
    return true;
  } catch (_) {
    return false;
  }
};
function enterWithCurrentLocation(destination, button) {
  const state = document.querySelector('.permission-state');
  if (state) state.textContent = '正在定位';
  if (button) {
    button.disabled = true;
    button.textContent = '正在获取定位...';
  }
  try { localStorage.setItem(companionModeKey, 'off'); } catch (_) {}
  saveCurrentLocation('once');
  window.setTimeout(() => {
    if (state) state.textContent = '已定位';
    location.href = destination;
  }, 420);
}
document.querySelector('[data-entry-start]')?.addEventListener('click', event => enterWithCurrentLocation('plan.html', event.currentTarget));
document.querySelector('[data-entry-explore]')?.addEventListener('click', event => enterWithCurrentLocation('explore.html', event.currentTarget));
document.addEventListener('click', event => {
  const locationAction = event.target.closest('[data-route-explore]');
  if (!locationAction) return;
  if (document.querySelector('.map-screen')) {
    notify('当前定位：铜梁区玄天湖');
    return;
  }
  if (!hasCurrentLocation() && !readCompanionMode()) {
    requestOneTimeLocationForExplore();
    return;
  }
  location.href = 'explore.html';
});

const immersiveBackgrounds = [
  'assets/沉浸式背景层-750×1624px-1.png',
  'assets/沉浸式背景层-750×1624px-2.png',
  'assets/沉浸式背景层-750×1624px-3.png',
  'assets/沉浸式背景层-750×1624px-4.png',
  'assets/沉浸式背景层-750×1624px-5.png'
];
const immersiveScreen = document.querySelector('.map-screen, .profile-screen');
if (immersiveScreen) {
  let immersiveBackgroundIndex = 0;
  const updateImmersiveBackground = () => {
    immersiveScreen.style.setProperty('--immersive-background', `url("${assetUrl(immersiveBackgrounds[immersiveBackgroundIndex])}")`);
    immersiveBackgroundIndex = (immersiveBackgroundIndex + 1) % immersiveBackgrounds.length;
  };
  updateImmersiveBackground();
  window.setInterval(updateImmersiveBackground, 20000);
}

const toast = document.querySelector('.toast');
function notify(text) {
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('show'), 1500);
}

const recordDeleteConfirm = document.createElement('div');
recordDeleteConfirm.className = 'record-delete-confirm';
recordDeleteConfirm.hidden = true;
recordDeleteConfirm.innerHTML = `<section class="record-delete-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="record-delete-confirm-title"><h2 id="record-delete-confirm-title"></h2><p>删除后不再恢复。</p><div><button type="button" data-record-delete-cancel>取消</button><button type="button" data-record-delete-confirm>确认</button></div></section>`;
document.querySelector('.phone')?.append(recordDeleteConfirm);
let pendingRecordDeletion = null;
function closeRecordDeleteConfirm() {
  recordDeleteConfirm.hidden = true;
  pendingRecordDeletion = null;
}
function requestRecordDelete({ title, onConfirm }) {
  pendingRecordDeletion = onConfirm;
  recordDeleteConfirm.querySelector('#record-delete-confirm-title').textContent = title;
  recordDeleteConfirm.hidden = false;
}
recordDeleteConfirm.addEventListener('click', event => {
  if (event.target === recordDeleteConfirm || event.target.closest('[data-record-delete-cancel]')) {
    closeRecordDeleteConfirm();
    return;
  }
  if (!event.target.closest('[data-record-delete-confirm]')) return;
  pendingRecordDeletion?.();
  closeRecordDeleteConfirm();
});

const ordersFilter = document.querySelector('.orders-filter');
const ordersCategoryMenu = document.querySelector('.orders-category-menu');
let orderCards = [...document.querySelectorAll('.order-card[data-order-category], .history-item[data-order-category]')];
const ordersEmpty = document.querySelector('.orders-empty');
const ordersSecondaryContent = document.querySelectorAll('.orders-divider, .order-suggestion-grid, .orders-tip');
const orderCategoryNames = { all: '全部分类', eat: '吃', stay: '住', tour: '游', shop: '购' };
const orderCategoryIcons = { eat: 'food', stay: 'hotel', tour: 'ticket', shop: 'bag' };

function applyOrderCategoryFilter(category) {
  let visibleCount = 0;
  orderCards.forEach(card => {
    const visible = !category || category === 'all' || card.dataset.orderCategory === category;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });
  if (ordersEmpty) ordersEmpty.hidden = visibleCount > 0;
  ordersSecondaryContent.forEach(element => { element.hidden = Boolean(category) && category !== 'all'; });
}

ordersFilter?.addEventListener('click', () => {
  const expanded = ordersFilter.getAttribute('aria-expanded') === 'true';
  ordersFilter.setAttribute('aria-expanded', String(!expanded));
  if (ordersCategoryMenu) ordersCategoryMenu.hidden = expanded;
});

ordersCategoryMenu?.addEventListener('click', event => {
  const option = event.target.closest('[data-order-filter]');
  if (!option) return;
  const category = option.dataset.orderFilter;
  ordersCategoryMenu.querySelectorAll('[data-order-filter]').forEach(item => item.classList.toggle('is-selected', item === option));
  ordersFilter.textContent = orderCategoryNames[category];
  ordersFilter.append(' ');
  const chevron = document.createElement('span');
  chevron.dataset.icon = 'chevron';
  chevron.innerHTML = icons.chevron;
  ordersFilter.append(chevron);
  ordersFilter.setAttribute('aria-expanded', 'false');
  ordersCategoryMenu.hidden = true;
  applyOrderCategoryFilter(category);
});

const savedPlansList = document.querySelector('[data-saved-plans-list]');
const savedPlansHeading = document.querySelector('[data-saved-plans-heading]');
const savedPlanSchedule = [
  { day: 'Day1', time: '09:40-16:30', place: '玄天湖', content: '环湖骑行、逛龙文化博物馆、湖边休闲野餐、简单采购零食文创' },
  { day: 'Day1', time: '16:40-20:20', place: '奇彩梦园', content: '赏花、小吃打卡、19:30 观看打铁花表演' },
  { day: 'Day1', time: '20:30', place: '温泉 / 湖景民宿 / 天街酒店', content: '办理入住，休息' },
  { day: 'Day2', time: '08:00-08:50', place: '龙门老街', content: '吃本地早茶，逛手工小店' },
  { day: 'Day2', time: '09:00-12:10', place: '安居古城', content: '漫步古街、吃古城特色小吃' },
  { day: 'Day2', time: '12:20-13:30', place: '城区餐馆（三活春）', content: '午餐，品尝招牌油烧兔' },
  { day: 'Day2', time: '13:40-16:00', place: '巴岳山黄桷门', content: '山林轻徒步、古寺歇凉' },
  { day: 'Day2', time: '16:10-16:50', place: '天街 / 玄天湖游客中心', content: '采购铜梁特产伴手礼' },
  { day: 'Day2', time: '17:00', place: '返程重庆主城', content: '结束两日铜梁自驾行程' }
];
const savedPlanPois = [
  { name: '玄天湖', time: 'Day1 09:40-16:30', content: savedPlanSchedule[0].content, point: [25, 59] },
  { name: '奇彩梦园', time: 'Day1 16:40-20:20', content: savedPlanSchedule[1].content, point: [48, 30] },
  { name: '天街酒店', time: 'Day1 20:30', content: savedPlanSchedule[2].content, point: [63, 52] },
  { name: '龙门老街', time: 'Day2 08:00-08:50', content: savedPlanSchedule[3].content, point: [18, 34] },
  { name: '安居古城', time: 'Day2 09:00-12:10', content: savedPlanSchedule[4].content, point: [38, 45] },
  { name: '三活春', time: 'Day2 12:20-13:30', content: savedPlanSchedule[5].content, point: [57, 69] },
  { name: '巴岳山黄桷门', time: 'Day2 13:40-16:00', content: savedPlanSchedule[6].content, point: [79, 36] },
  { name: '游客中心', time: 'Day2 16:10-16:50', content: savedPlanSchedule[7].content, point: [70, 76] }
];
const renderSavedPlanDetail = () => {
  const schedule = savedPlanSchedule.map((item, index) => `<li class="saved-plan-timeline-item"><span class="saved-plan-timeline-dot">${index + 1}</span><div><span class="saved-plan-day">${item.day}</span><strong>${item.time} ${item.place}</strong><p><b>项目：</b>${item.content}</p></div></li>`).join('');
  const pois = savedPlanPois.map((poi, index) => `<button class="saved-plan-poi" type="button" data-saved-plan-poi="${index}" style="left:${poi.point[0]}%;top:${poi.point[1]}%" aria-label="查看${poi.name}"><span>${index + 1}</span><i>${escapeHTML(poi.name)}</i></button>`).join('');
  const routePoints = savedPlanPois.map(poi => `${poi.point[0]},${poi.point[1]}`).join(' ');
  return `<section class="saved-plan-detail" data-saved-plan-detail hidden><div class="saved-plan-detail-head"><strong>两日行程</strong><span>重庆主城 → 铜梁</span></div><ol class="saved-plan-timeline">${schedule}</ol><section class="saved-plan-map-section" aria-label="计划地点地图"><div class="saved-plan-map"><svg class="saved-plan-map-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="${routePoints}"></polyline></svg>${pois}<div class="saved-plan-poi-card" data-saved-plan-poi-card aria-live="polite"><strong>点击地图图标查看地点安排</strong><span>行程地点已按时间顺序标记</span></div></div><button class="saved-plan-delete" type="button" data-saved-plan-delete aria-label="删除此条计划" title="删除此条计划">${icons.trash}</button></section></section>`;
};
const formatSavedPlanDate = value => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '已加入的计划';
  const pad = number => String(number).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
const renderSavedPlans = () => {
  if (!savedPlansList) return;
  const plan = readSavedWeekendPlan();
  const plans = (Array.isArray(plan) ? plan : plan ? [plan] : [])
    .sort((first, second) => Number(second.savedAt || 0) - Number(first.savedAt || 0));
  if (savedPlansHeading) savedPlansHeading.textContent = '计划列表';
  savedPlansList.innerHTML = plans.length
    ? plans.map(item => `<article class="saved-plan-item"><span class="saved-plan-icon">${icons.plan}</span><div><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.summary)}</small><em>已加入</em></div><button class="saved-plan-open" type="button" data-saved-plan-open aria-label="展开计划详情" aria-expanded="false">${icons.map}</button>${renderSavedPlanDetail()}</article>`).join('')
    : '<p class="saved-plans-empty">暂无计划，看看推荐计划吧</p>';
  savedPlansList.querySelectorAll('[data-saved-plan-open]').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.saved-plan-item');
      const detail = item?.querySelector('[data-saved-plan-detail]');
      if (!detail) return;
      const willOpen = detail.hidden;
      detail.hidden = !willOpen;
      button.setAttribute('aria-expanded', String(willOpen));
      button.setAttribute('aria-label', willOpen ? '收起计划详情' : '展开计划详情');
      item.classList.toggle('is-detail-open', willOpen);
    });
  });
  savedPlansList.querySelectorAll('[data-saved-plan-poi]').forEach(button => {
    button.addEventListener('click', () => {
      const poi = savedPlanPois[Number(button.dataset.savedPlanPoi)];
      const card = button.closest('.saved-plan-map')?.querySelector('[data-saved-plan-poi-card]');
      if (!poi || !card) return;
      button.closest('.saved-plan-map')?.querySelectorAll('.saved-plan-poi').forEach(item => item.classList.remove('is-active'));
      button.classList.add('is-active');
      card.innerHTML = `<strong>${escapeHTML(poi.name)} <span>${escapeHTML(poi.time)}</span></strong><p>${escapeHTML(poi.content)}</p>`;
    });
  });
  savedPlansList.querySelectorAll('[data-saved-plan-delete]').forEach(button => {
    button.addEventListener('click', () => {
      requestRecordDelete({
        title: '确认删除此条计划吗？',
        onConfirm: () => {
          clearSavedWeekendPlan();
          renderSavedPlans();
          notify('已删除计划');
        }
      });
    });
  });
};
renderSavedPlans();

let mapScreen = document.querySelector('.map-screen');
const planScreen = document.querySelector('.plan-screen');
// Capture original row membership before theme switching replaces the marquee DOM.
const originalHomeMarqueeRows = [...(planScreen?.querySelectorAll('[data-journey-marquee]') || [])].map(row =>
  [...new Map([...row.querySelectorAll('[data-journey-key]')].map(chip => [
    chip.dataset.journeyKey,
    { key: chip.dataset.journeyKey, icon: chip.querySelector('.journey-chip-swatch')?.textContent || '' }
  ])).values()]
);
let realMap = null;
let renderWishlistPoi = () => {};
let renderMarqueePoi = () => {};
// Shared category resolver for wishlist/map markers.  Keep this outside the
// wishlist drawer scope so map rendering can use it after the drawer closes.
const getWishlistCategory = item => {
  const text = `${item?.name || ''} ${item?.id || ''}`.toLowerCase();
  if (/民宿|酒店|住宿|hotel|stay/.test(text)) return 'stay';
  if (/火锅|餐饮|餐馆|鱼庄|头刀|美食|food|eat/.test(text)) return 'eat';
  if (/集市|文创|瀚林|真艾|兰花|传媒|商品|shop/.test(text)) return 'shop';
  return 'tour';
};
let getWishlistPoiNumber = () => 1;
let getMapWishlistRows = () => [];
let selectAllMapWishlist = () => [];
let renderDefaultMapPois = () => {};
let isWishlistItemVisited = () => false;
let updateWishlistItemVisited = () => {};
let activeWishlistMapItems = [];
let activeWishlistMapLabel = '已选心愿';
let wishlistMapDisplayMode = 'preview';
let activeWishlistRouteRequestId = '';
const embeddedMapHost = !mapScreen && Boolean(planScreen);
if (embeddedMapHost) {
  mapScreen = document.createElement('div');
  mapScreen.className = 'map-screen map-background-layer';
  mapScreen.innerHTML = `<div class="map-canvas"></div><div class="category-bar" aria-label="地图分类"><button class="category" data-category="eat"><span>${icons.food}<b>吃</b></span></button><button class="category" data-category="stay"><span>${icons.hotel}<b>住</b></span></button><button class="category" data-category="tour"><span>${icons.flag}<b>游</b></span></button><button class="category" data-category="shop"><span>${icons.bag}<b>购</b></span></button><button class="category category-wishlist" data-category="wishlist" aria-label="心愿单"><span>${icons.heart}</span></button></div><button class="map-locate" type="button" aria-label="返回当前定位并显示附近POI">${icons.locate}</button><span class="map-current-location" aria-label="当前定位位置"><span></span></span><div class="marker-layer"></div><div class="marker-card"></div>`;
  planScreen.prepend(mapScreen);
}
let consumerBackgroundMode = 'plan';
function updateConsumerHeaderLanguage(language = 'zh') {
  const host = planScreen || mapScreen;
  if (!host) return;
  const activeMap = !planScreen || consumerBackgroundMode === 'map';
  const english = language === 'en';
  host.setAttribute('data-language', english ? 'en' : 'zh');
  const title = host.querySelector('.main-page-title');
  if (title) title.textContent = activeMap ? (english ? 'Live guide' : '边走边耍') : (english ? 'In Tongliang' : '在铜梁');
  const entry = host.querySelector('.top-explore-entry');
  entry?.setAttribute('aria-label', activeMap
    ? (english ? 'Return to In Tongliang' : '返回在铜梁主页')
    : (english ? 'Open live guide map' : '进入边走边耍地图'));
}
let addWishlistItem = () => {};
let removeWishlistItem = () => {};
let isWishlistItemAdded = () => false;
function switchConsumerBackground(mode = 'plan') {
  if (!planScreen || !embeddedMapHost) return false;
  consumerBackgroundMode = mode === 'map' ? 'map' : 'plan';
  const activeMap = consumerBackgroundMode === 'map';
  planScreen.classList.toggle('is-map-active', activeMap);
  mapScreen.classList.toggle('is-background-active', activeMap);
  const entry = planScreen.querySelector('.top-explore-entry');
  updateConsumerHeaderLanguage(planScreen.dataset.language || 'zh');
  if (entry) {
    entry.dataset.page = activeMap ? 'plan' : 'explore';
    entry.innerHTML = activeMap ? icons.chat : icons.pin;
    if (activeMap) entry.classList.add('home-entry-icon'); else entry.classList.remove('home-entry-icon');
  }
  if (activeMap) {
    realMap?.show();
    renderDefaultMapPois();
  } else hideMapCategoryHint();
  return true;
}
let mapConversationPanel;
let mapConversationList;
let mapConversationHandle;
let planConversationPanel;
let planConversationList;
let planConversationHandle;
let mapCurrentLocation = mapScreen?.querySelector('.map-current-location');
let mapLocate = mapScreen?.querySelector('.map-locate');

const createSharedComposer = () => {
  const nearbyCard = document.createElement('aside');
  nearbyCard.className = 'nearby-card';
  nearbyCard.dataset.nearbyCard = '';
  nearbyCard.hidden = true;
  nearbyCard.setAttribute('aria-label', '附近的服务');
  nearbyCard.innerHTML = `<strong>附近的</strong><div><button type="button" data-nearby-action="eat"><span data-icon="food"></span><span>吃</span></button><button type="button" data-nearby-action="stay"><span data-icon="hotel"></span><span>住</span></button><button type="button" data-nearby-action="tour"><span data-icon="flag"></span><span>游</span></button><button type="button" data-nearby-action="shop"><span data-icon="bag"></span><span>购</span></button><button type="button" data-nearby-action="parking"><span data-icon="car"></span><span>停车位</span></button><button type="button" data-nearby-action="restroom"><span data-icon="pin"></span><span>卫生间</span></button></div>`;

  const composer = document.createElement('div');
  composer.className = 'composer';
  composer.innerHTML = `<button class="composer-camera" type="button" data-toast="拍照功能准备中" aria-label="打开相机"><span data-icon="camera"></span></button><input aria-label="发送消息" placeholder="发消息或按住说话..."><span class="voice-hint" aria-live="polite">按住说话</span><button class="voice composer-voice" type="button" data-voice-input aria-label="语音输入"><span data-icon="mic"></span></button><button class="composer-more" type="button" data-composer-more aria-label="打开附近服务" aria-expanded="false"><span data-icon="plus"></span></button><button class="send" type="button" aria-label="发送"><span data-icon="send"></span></button>`;

  const keyboard = document.createElement('div');
  keyboard.className = 'keyboard-simulation';
  keyboard.dataset.keyboardSimulation = '';
  keyboard.hidden = true;
  keyboard.innerHTML = `<img src="${assetUrl('assets/豆包输入体验/7-文字输入拉起输入键盘.png')}" alt="文字输入键盘模拟"><div class="keyboard-composer-shell"><div class="keyboard-composer-field"><input data-keyboard-composer-input aria-label="键盘输入消息" placeholder="发消息或按住说话..."><i data-icon="camera"></i></div></div><button type="button" class="keyboard-voice-open" data-keyboard-voice-open aria-label="切换到语音输入"><span data-icon="mic"></span></button><button type="button" class="keyboard-tools-open" data-keyboard-tools-open aria-label="打开附近服务"><span data-icon="plus"></span></button><button type="button" class="keyboard-close" data-keyboard-close aria-label="收起键盘"></button>`;

  return { nearbyCard, composer, keyboard };
};

const mountSharedComposer = screen => {
  if (!screen) return;
  const { nearbyCard, composer, keyboard } = createSharedComposer();
  screen.append(nearbyCard, composer, keyboard);
  [nearbyCard, composer, keyboard].forEach(container => {
    container.querySelectorAll('[data-icon]').forEach(element => { element.innerHTML = icons[element.dataset.icon] || ''; });
  });
};

if (mapScreen && !embeddedMapHost) {
  const mapClearButton = mapScreen.querySelector('.wechat-capsule');
  if (mapClearButton) {
    mapClearButton.setAttribute('data-clear-conversation', '');
    mapClearButton.setAttribute('aria-label', '清除对话内容');
    mapClearButton.setAttribute('role', 'button');
  }
  const mapHeader = document.createElement('header');
  mapHeader.className = 'app-bar main-page-appbar map-plan-appbar';
  mapHeader.innerHTML = `<div class="app-actions"><button class="drawer-toggle" type="button" aria-label="打开历史对话" title="历史对话" aria-expanded="false"><span data-icon="history"></span></button></div><strong class="main-page-title">边走边耍</strong><div class="main-page-context" aria-label="当前位置和天气"><button class="context-action context-location" type="button" data-route-explore aria-label="查看当前位置"><span data-icon="pin"></span><strong data-i18n="contextPlace">铜梁区玄天湖...</strong></button><button class="context-action context-weather" type="button" data-context-action="weather" aria-label="查看天气"><span data-i18n="contextWeather">晴 23℃</span></button></div><button class="top-explore-entry home-entry-icon" type="button" data-page="plan" aria-label="返回在铜梁主页">${icons.chat}</button><button class="wishlist-toggle" type="button" data-wishlist-toggle aria-label="打开我的心愿单">${icons.heart}<i data-wishlist-count hidden>0</i></button>`;
  mapHeader.querySelector('.drawer-toggle')?.addEventListener('click', event => {
    event.stopPropagation();
    openConversationDrawer();
  });
  mapHeader.querySelector('[data-page="plan"]')?.addEventListener('click', () => { location.href = 'plan.html'; });
  mapScreen.querySelector('.map-appbar')?.replaceWith(mapHeader);

  const { nearbyCard: mapNearbyCard, composer: mapComposer, keyboard: mapKeyboard } = createSharedComposer();

  mapConversationPanel = document.createElement('section');
  mapConversationPanel.className = 'map-conversation-panel';
  mapConversationPanel.setAttribute('aria-label', '对话面板');
  mapConversationPanel.setAttribute('aria-hidden', 'true');
  mapConversationPanel.innerHTML = `<button class="map-conversation-handle" type="button" aria-label="展开或收起对话" aria-expanded="false"><span class="map-conversation-grip"></span></button><div class="map-conversation-list" aria-live="polite"></div>`;
  mapConversationList = mapConversationPanel.querySelector('.map-conversation-list');
  mapConversationHandle = mapConversationPanel.querySelector('.map-conversation-handle');

  mapCurrentLocation = document.createElement('span');
  mapCurrentLocation.className = 'map-current-location';
  mapCurrentLocation.setAttribute('aria-label', '当前定位位置');
  mapCurrentLocation.innerHTML = '<span></span>';
  mapLocate = document.createElement('button');
  mapLocate.className = 'map-locate';
  mapLocate.type = 'button';
  mapLocate.setAttribute('aria-label', '回到当前位置');
  mapLocate.innerHTML = icons.locate;
  mapScreen.append(mapNearbyCard, mapComposer, mapKeyboard, mapConversationPanel, mapCurrentLocation, mapLocate);
  [mapHeader, mapNearbyCard, mapComposer, mapKeyboard, mapConversationPanel].forEach(container => {
    container.querySelectorAll('[data-icon]').forEach(element => { element.innerHTML = icons[element.dataset.icon] || ''; });
  });
}

if (planScreen) {
  planScreen.querySelector('.main-page-appbar')?.insertAdjacentHTML('beforeend', `<button class="wishlist-toggle" type="button" data-wishlist-toggle aria-label="打开我的心愿单">${icons.heart}<i data-wishlist-count hidden>0</i></button>`);
  mountSharedComposer(planScreen);
  const homeShortcuts = planScreen.querySelector('.home-signature-topics');
  if (homeShortcuts) planScreen.querySelector('.composer').append(homeShortcuts);
  planConversationPanel = document.createElement('section');
  planConversationPanel.className = 'plan-conversation-panel';
  planConversationPanel.setAttribute('aria-label', '对话面板');
  planConversationPanel.setAttribute('aria-hidden', 'true');
  planScreen.classList.add('is-conversation-collapsed');
  planConversationPanel.innerHTML = `<button class="plan-conversation-handle" type="button" aria-label="展开或收起对话" aria-expanded="false"><span class="plan-conversation-grip"></span></button><button class="plan-conversation-clear" type="button" data-clear-conversation aria-label="清空当前对话记录" title="清空当前记录">${icons.clearBroom}</button><div class="plan-conversation-list" aria-live="polite"></div>`;
  planConversationList = planConversationPanel.querySelector('.plan-conversation-list');
  planConversationHandle = planConversationPanel.querySelector('.plan-conversation-handle');
  planScreen.append(planConversationPanel);
  planConversationPanel.addEventListener('click', event => {
    if (planConversationPanel.dataset.suppressCollapsedClick === 'true') {
      delete planConversationPanel.dataset.suppressCollapsedClick;
      event.preventDefault();
      return;
    }
    if (planScreen.classList.contains('is-conversation-collapsed')) {
      event.preventDefault();
      openPlanConversation('half');
    }
  });
}

const wishlistPhone = document.querySelector('.phone');
if (wishlistPhone && (planScreen || mapScreen)) {
  const wishlistStorageKey = 'tongliang-added-wishlist-items-v1';
  const wishlistClearedKey = 'tongliang-wishlist-cleared-v1';
  const wishlistRemovedKey = 'tongliang-wishlist-removed-v1';
const wishlistMapSelectionKey = 'tongliang-wishlist-map-selection-v1';
  const wishlistVisitedKey = 'tongliang-wishlist-visited-v1';
  const readAddedWishlistItems = () => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(wishlistStorageKey) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch (_) { return []; }
  };
  const writeAddedWishlistItems = items => {
    try { sessionStorage.setItem(wishlistStorageKey, JSON.stringify(items)); } catch (_) {}
  };
  const isWishlistCleared = () => {
    try { return sessionStorage.getItem(wishlistClearedKey) === 'true'; } catch (_) { return false; }
  };
  const readRemovedWishlistItems = () => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(wishlistRemovedKey) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch (_) { return []; }
  };
  const writeRemovedWishlistItems = items => {
    try { sessionStorage.setItem(wishlistRemovedKey, JSON.stringify(items)); } catch (_) {}
  };
  const readVisitedWishlistItems = () => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(wishlistVisitedKey) || '[]');
      return new Set(Array.isArray(saved) ? saved : []);
    } catch (_) { return new Set(); }
  };
  const writeVisitedWishlistItems = items => {
    try { sessionStorage.setItem(wishlistVisitedKey, JSON.stringify([...items])); } catch (_) {}
  };
  const wishlistDrawer = document.createElement('aside');
  wishlistDrawer.className = 'wishlist-drawer';
  wishlistDrawer.setAttribute('aria-hidden', 'true');
  wishlistDrawer.setAttribute('aria-label', '我的心愿单');
  wishlistDrawer.innerHTML = `<button class="wishlist-close-top" type="button" data-wishlist-close aria-label="关闭心愿单">${icons.close}</button><header><div class="wishlist-header-top"><strong class="wishlist-title">我的心愿单</strong></div><div class="wishlist-header-bottom"><button class="wishlist-clear" type="button" data-wishlist-clear>清空心愿单</button><button class="wishlist-selection-map" type="button" data-wishlist-selection-map hidden>行程规划</button></div></header><div class="wishlist-content" data-wishlist-panel="wishlist"></div><div class="wishlist-clear-confirm" data-wishlist-clear-dialog hidden><section role="alertdialog" aria-modal="true" aria-labelledby="wishlist-clear-title"><h2 id="wishlist-clear-title">确认清空所有心愿记录吗？</h2><div><button type="button" data-wishlist-clear-cancel>取消</button><button type="button" data-wishlist-clear-confirm>确认</button></div></section></div>`;
  const wishlistDismiss = document.createElement('button');
  wishlistDismiss.className = 'wishlist-dismiss';
  wishlistDismiss.type = 'button';
  wishlistDismiss.hidden = true;
  wishlistDismiss.setAttribute('aria-label', '关闭我的心愿单');
  wishlistPhone.append(wishlistDrawer, wishlistDismiss);
  const wishlistContents = [...wishlistDrawer.querySelectorAll('.wishlist-content')];
  const wishlistClearConfirm = wishlistDrawer.querySelector('[data-wishlist-clear-dialog]');
  const wishlistClearTitle = wishlistDrawer.querySelector('#wishlist-clear-title');
  const wishlistClearConfirmButton = wishlistDrawer.querySelector('[data-wishlist-clear-confirm]');
  const wishlistClearButton = wishlistDrawer.querySelector('[data-wishlist-clear]');
  const wishlistSelectionMapButton = wishlistDrawer.querySelector('[data-wishlist-selection-map]');
  const collapsedWishlistGroups = new Set();
  const selectedWishlistItems = new Set();
  const wishlistSwipeStarts = new WeakMap();
  const wishlistItemMatchesId = (candidate, itemId) => {
    const value = String(candidate || '');
    const target = String(itemId || '');
    return Boolean(target) && (value === target || value.startsWith(`${target}-`));
  };
  const wishlistItemCategory = item => {
    const text = `${item?.name || ''} ${item?.id || ''}`.toLowerCase();
    if (/民宿|酒店|住宿|hotel|stay/.test(text)) return 'stay';
    if (/火锅|餐饮|餐馆|头刀|美食|food|eat/.test(text)) return 'eat';
    if (/集市|文创|瀚林|真艾|兰花|传媒|商品|shop/.test(text)) return 'shop';
    return 'tour';
  };
  const wishlistRows = () => {
    const removed = new Set(readRemovedWishlistItems());
    const formatWishlistAddedAt = value => {
      const date = new Date(Number(value));
      if (Number.isNaN(date.getTime())) return '加入时间未知';
      const pad = number => String(number).padStart(2, '0');
      return `${date.getMonth() + 1}/${date.getDate()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };
    const added = readAddedWishlistItems().map((item, index) => {
      const addedAt = Number(item.addedAt) || Number(String(item.id).match(/-(\d+)$/)?.[1]) || index;
      return { key: item.id, name: item.name, kind: item.kind, time: formatWishlistAddedAt(addedAt), group: '今天', addedAt };
    });
    return added.filter(item => ![...removed].some(key => wishlistItemMatchesId(item.key, key)));
  };
  getWishlistPoiNumber = itemId => {
    const chronologicalRows = wishlistRows().slice().sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
    const index = chronologicalRows.findIndex(row => row.key === itemId || row.key.startsWith(`${itemId}-`));
    return index >= 0 ? index + 1 : chronologicalRows.length + 1;
  };
  isWishlistItemAdded = itemId => Boolean(itemId) && wishlistRows().some(item => wishlistItemMatchesId(item.key, itemId));
  getMapWishlistRows = () => wishlistRows();
  isWishlistItemVisited = itemId => {
    const visited = readVisitedWishlistItems();
    return [...visited].some(key => wishlistItemMatchesId(key, itemId));
  };
  selectAllMapWishlist = () => {
    const rows = wishlistRows();
    selectedWishlistItems.clear();
    rows.forEach(item => selectedWishlistItems.add(item.key));
    return rows;
  };
  const renderWishlist = () => {
    const rows = wishlistRows();
    const availableKeys = new Set(rows.map(item => item.key));
    [...selectedWishlistItems].forEach(key => { if (!availableKeys.has(key)) selectedWishlistItems.delete(key); });
    const wishlistItem = item => {
      const detailId = item.key.replace(/-\d+$/, '');
      const selected = selectedWishlistItems.has(item.key);
      const visited = isWishlistItemVisited(item.key);
      const category = wishlistItemCategory(item);
      const categoryIcon = { eat: icons.food, stay: icons.hotel, tour: icons.flag, shop: icons.bag }[category];
      const visitLabel = visited ? '去过了' : '还没去';
      return `<article class="wishlist-item${selected ? ' is-selected' : ''}${visited ? ' is-visited' : ''}"><button type="button" class="wishlist-select${selected ? ' is-selected' : ''}" data-wishlist-select="${escapeHTML(item.key)}" role="checkbox" aria-checked="${String(selected)}" aria-label="${selected ? '取消选择' : '选择'}${escapeHTML(item.name)}"><span>${selected ? icons.plan : ''}</span></button><button type="button" class="wishlist-item-detail" data-wishlist-detail="${escapeHTML(detailId)}" aria-label="查看${escapeHTML(item.name)}详情"><span class="wishlist-item-icon ${category}">${categoryIcon}</span><span class="wishlist-item-copy"><strong>${escapeHTML(item.name)}</strong></span></button><button type="button" class="wishlist-visited-toggle${visited ? ' is-visited' : ''}" data-wishlist-visited="${escapeHTML(item.key)}" aria-pressed="${String(visited)}" aria-label="${escapeHTML(item.name)}${visitLabel}"><em>${visitLabel}</em></button><button type="button" class="wishlist-item-delete" data-wishlist-delete="${escapeHTML(item.key)}" aria-label="删除${escapeHTML(item.name)}" title="删除${escapeHTML(item.name)}">${icons.trash}</button></article>`;
    };
    const wishlistGroup = (label, groupRows, emptyText = '') => {
      const collapsed = collapsedWishlistGroups.has(label);
      const content = groupRows.length ? groupRows.map(wishlistItem).join('') : `<p class="wishlist-empty">${emptyText || '暂无心愿'}</p>`;
      const visited = groupRows.length > 0 && groupRows.every(item => isWishlistItemVisited(item.key));
      const visitedToggle = `<button type="button" class="wishlist-group-visited${visited ? ' is-visited' : ''}" data-wishlist-group-visited="${escapeHTML(label)}" role="checkbox" aria-checked="${String(visited)}" aria-disabled="${String(!groupRows.length)}"${groupRows.length ? '' : ' disabled'} aria-label="${visited ? '取消' : '勾选'}${escapeHTML(label)}去了没"><span>${visited ? icons.plan : ''}</span></button>`;
      return `<section class="wishlist-group${collapsed ? ' is-collapsed' : ''}"><div class="wishlist-group-toolbar"><button type="button" class="wishlist-group-toggle" data-wishlist-group="${label}" aria-expanded="${String(!collapsed)}"><span>${label}</span></button>${visitedToggle}<button type="button" class="wishlist-group-arrow" data-wishlist-group="${label}" aria-label="展开或收起${label}心愿" aria-expanded="${String(!collapsed)}"><i>${icons.chevron}</i></button></div><div class="wishlist-group-list"${collapsed ? ' hidden' : ''}>${content}</div></section>`;
    };
    const added = readAddedWishlistItems();
    const wishlistMarkup = (isWishlistCleared() && !added.length)
      ? '<p class="wishlist-all-empty">心愿单暂无记录</p>'
      : `${wishlistGroup('今天', rows.filter(item => item.group === '今天'))}${wishlistGroup('昨天', rows.filter(item => item.group === '昨天'))}${wishlistGroup('2026-08-10', [], '暂无心愿')}`;
    wishlistContents.forEach(content => { content.innerHTML = wishlistMarkup; });
    document.querySelectorAll('[data-wishlist-count]').forEach(badge => {
      badge.textContent = String(added.length);
      badge.hidden = added.length === 0;
    });
    wishlistSelectionMapButton.hidden = selectedWishlistItems.size < 2;
    wishlistSelectionMapButton.setAttribute('aria-label', `用已选的 ${selectedWishlistItems.size} 个心愿生成行程规划`);
    window.TongliangAgentUI?.syncWishlist?.(isWishlistItemAdded);
    document.querySelectorAll('[data-poi-wishlist]').forEach(updatePoiWishlistAction);
  };
  wishlistContents.forEach(content => {
    content.addEventListener('pointerdown', event => {
      const item = event.target.closest('.wishlist-item');
      if (item) wishlistSwipeStarts.set(item, event.clientX);
    });
    content.addEventListener('pointerup', event => {
      const item = event.target.closest('.wishlist-item');
      const startX = item && wishlistSwipeStarts.get(item);
      if (item && Number.isFinite(startX)) {
        const deltaX = event.clientX - startX;
        if (deltaX < -28) item.classList.add('is-swipe-open');
        else if (deltaX > 28) item.classList.remove('is-swipe-open');
      }
      if (item) wishlistSwipeStarts.delete(item);
    });
  });
  updateWishlistItemVisited = (itemId, visited) => {
    const visitedItems = readVisitedWishlistItems();
    [...visitedItems].forEach(key => {
      if (wishlistItemMatchesId(key, itemId)) visitedItems.delete(key);
    });
    if (visited) visitedItems.add(itemId);
    writeVisitedWishlistItems(visitedItems);
    renderWishlist();
    refreshWishlistMarkerVisitedColors();
  };
  const closeWishlist = () => { wishlistPhone.classList.remove('is-wishlist-open'); wishlistDrawer.classList.remove('is-open'); wishlistDrawer.setAttribute('aria-hidden', 'true'); wishlistDismiss.hidden = true; };
  const openWishlist = () => {
    const rows = selectAllMapWishlist();
    wishlistMapDisplayMode = 'preview';
    // Keep the current surface (especially the Q&A page) in place. The
    // wishlist drawer is an overlay and should not navigate/switch to map.
    if (rows.length) renderWishlistPoi(rows, '我的心愿单', { connect: false, showVisitedColors: false });
    renderWishlist();
    wishlistPhone.classList.add('is-wishlist-open');
    wishlistDrawer.classList.add('is-open');
    wishlistDrawer.setAttribute('aria-hidden', 'false');
    wishlistDismiss.hidden = false;
  };
  if (new URLSearchParams(location.search).get('restoreWishlist') === '1') {
    window.setTimeout(openWishlist, 0);
    const restoredUrl = new URL(location.href);
    restoredUrl.searchParams.delete('restoreWishlist');
    window.history.replaceState(null, '', restoredUrl.href);
  }
  const flyIntoWishlist = source => {
    const target = document.querySelector('[data-wishlist-toggle]');
    if (!source || !target) return;
    const start = source.getBoundingClientRect();
    const end = target.getBoundingClientRect();
    const particle = document.createElement('span');
    particle.className = 'wishlist-fly-item';
    particle.innerHTML = icons.gift;
    particle.style.setProperty('--fly-x', `${end.left + end.width / 2 - start.left - start.width / 2}px`);
    particle.style.setProperty('--fly-y', `${end.top + end.height / 2 - start.top - start.height / 2}px`);
    particle.style.left = `${start.left + start.width / 2 - 14}px`;
    particle.style.top = `${start.top + start.height / 2 - 14}px`;
    document.body.append(particle);
    particle.addEventListener('animationend', () => particle.remove(), { once: true });
  };
  addWishlistItem = (item, source) => {
    if (item?.id && isWishlistItemAdded(item.id)) {
      renderWishlist();
      return;
    }
    const kind = item.kind || (/xijiao|longcheng|hotel|yashe/.test(item.id) ? 'merchant' : 'product');
    flyIntoWishlist(source);
    // Commit immediately; the decorative flight animation must not delay state,
    // lose rapid clicks, or resurrect an item after the user removes it.
    const added = readAddedWishlistItems();
    writeRemovedWishlistItems(readRemovedWishlistItems().filter(key => !wishlistItemMatchesId(key, item.id)));
    writeAddedWishlistItems([{ id: `${item.id}-${Date.now()}`, name: item.name, kind, addedAt: Date.now() }, ...added]);
    renderWishlist();
  };
  removeWishlistItem = itemId => {
    if (!itemId) return;
    const added = readAddedWishlistItems();
    writeAddedWishlistItems(added.filter(item => !wishlistItemMatchesId(item.id, itemId)));
    const removed = readRemovedWishlistItems();
    if (!removed.some(key => wishlistItemMatchesId(key, itemId))) writeRemovedWishlistItems([...removed, itemId]);
    [...selectedWishlistItems].forEach(key => {
      if (wishlistItemMatchesId(key, itemId)) selectedWishlistItems.delete(key);
    });
    renderWishlist();
  };
  renderWishlist();
  document.addEventListener('click', event => {
    if (event.target.closest('[data-wishlist-toggle]')) { event.stopPropagation(); openWishlist(); return; }
    if (event.target.closest('[data-wishlist-selection-map]')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const rows = wishlistRows().filter(item => selectedWishlistItems.has(item.key));
      if (rows.length < 2) return;
      if (rows.length > 10) { notify(currentLanguage === 'en' ? 'Select up to 10 stops per route.' : '每次最多规划10个地点，请减少选择。'); return; }
      const startWishlistPlan = () => {
        const planRows = rows.slice().sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
        wishlistMapDisplayMode = 'route';
        closeWishlist();
        if (embeddedMapHost) switchConsumerBackground('map');
        wishlistMapDisplayMode = 'route';
        realMap?.clearPlan?.();
        if (markerLayer) markerLayer.innerHTML = '';
        markerCard?.classList.remove('show');
        notify(currentLanguage === 'en' ? 'Preparing the itinerary and map…' : '正在准备行程与地图…');
        const placeNames = planRows.map((item, index) => `${index + 1}. ${item.name}`).join('；');
        addSharedConversationMessage({
          role: 'user',
          text: currentLanguage === 'en'
            ? `Plan a driving itinerary for these selected places, starting at the first stop rather than my device location. Include a shared map route, advice for each stop and rest breaks: ${placeNames}.`
            : `请为这些心愿地点规划自驾行程，暂从所选首站出发，不使用我的当前位置。请给出与地图一致的路线及各站游玩、用餐和休息建议：${placeNames}。`,
          speak: false
        });
        const agentPlanMessage = addSharedConversationMessage({
          id: `route-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          role: 'assistant',
          type: 'agent',
          status: 'pending',
          routeRequest: { mode: 'driving', stops: planRows.map(item => ({ id: item.key.replace(/-\d+$/, ''), name: item.name })) },
          language: currentLanguage,
          text: ''
        });
        activeWishlistRouteRequestId = agentPlanMessage.id;
        requestConsumerAgentMessage(agentPlanMessage);
        openActiveConversation('half');
      };
      startWishlistPlan();
      return;
    }
    const groupVisitedButton = event.target.closest('[data-wishlist-group-visited]');
    if (groupVisitedButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const label = groupVisitedButton.dataset.wishlistGroupVisited;
      const rows = wishlistRows().filter(item => item.group === label);
      const visited = readVisitedWishlistItems();
      const nextValue = !rows.length || !rows.every(item => visited.has(item.key));
      rows.forEach(item => { if (nextValue) visited.add(item.key); else visited.delete(item.key); });
      writeVisitedWishlistItems(visited);
      renderWishlist();
      refreshWishlistMarkerVisitedColors();
      return;
    }
    const groupToggle = event.target.closest('[data-wishlist-group]');
    if (groupToggle) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const label = groupToggle.dataset.wishlistGroup;
      if (collapsedWishlistGroups.has(label)) collapsedWishlistGroups.delete(label);
      else collapsedWishlistGroups.add(label);
      renderWishlist();
      return;
    }
    const detailButton = event.target.closest('[data-wishlist-detail]');
  if (detailButton) {
      saveWishlistProductReturn();
      location.href = `product-detail.html?item=${encodeURIComponent(detailButton.dataset.wishlistDetail)}`;
      return;
    }
    const selectButton = event.target.closest('[data-wishlist-select]');
    if (selectButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const key = selectButton.dataset.wishlistSelect;
      if (selectedWishlistItems.has(key)) selectedWishlistItems.delete(key);
      else selectedWishlistItems.add(key);
      renderWishlist();
      return;
    }
    const visitedButton = event.target.closest('[data-wishlist-visited]');
    if (visitedButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const key = visitedButton.dataset.wishlistVisited;
      updateWishlistItemVisited(key, !isWishlistItemVisited(key));
      return;
    }
    const deleteButton = event.target.closest('[data-wishlist-delete]');
    if (deleteButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const key = deleteButton.dataset.wishlistDelete;
      const added = readAddedWishlistItems();
      writeAddedWishlistItems(added.filter(item => item.id !== key));
      const removed = readRemovedWishlistItems();
      if (!removed.includes(key) && !added.some(item => item.id === key)) writeRemovedWishlistItems([...removed, key]);
      selectedWishlistItems.delete(key);
      renderWishlist();
      return;
    }
    if (event.target.closest('[data-wishlist-close]') || event.target === wishlistDismiss) { closeWishlist(); }
    if (event.target.closest('[data-wishlist-clear]')) {
      wishlistClearConfirm.dataset.mode = 'wishlist';
      wishlistClearTitle.textContent = '确认清空所有心愿记录吗？';
      wishlistClearConfirmButton.textContent = '确认';
      wishlistClearConfirm.hidden = false;
      return;
    }
    if (event.target.closest('[data-wishlist-clear-cancel]')) { wishlistClearConfirm.hidden = true; return; }
    if (event.target.closest('[data-wishlist-clear-confirm]')) {
      writeAddedWishlistItems([]);
      try { sessionStorage.setItem(wishlistClearedKey, 'true'); } catch (_) {}
      selectedWishlistItems.clear();
      wishlistClearConfirm.hidden = true;
      renderWishlist();
    }
  });
}

document.querySelectorAll('[data-toast]').forEach(button => {
  button.addEventListener('click', () => notify(button.dataset.toast));
});

const companionModeSwitches = () => document.querySelectorAll('.mode-switch');
const companionConsentKey = 'tongliang-companion-location-consent';

function readCompanionMode() {
  // 伴游模式已从用户端移除，历史存储值不再恢复该模式。
  return false;
}

function setCompanionMode(enabled) {
  companionModeSwitches().forEach(toggle => {
    toggle.classList.remove('checked');
    toggle.setAttribute('aria-checked', 'false');
  });
  try { window.localStorage.removeItem(companionModeKey); } catch (_) {}
}

function isCompanionModeActive() {
  return [...companionModeSwitches()].some(toggle => toggle.classList.contains('checked'));
}

function isCompanionStopRequest(value) {
  const command = String(value).replace(/\s+/g, '');
  return /(?:关闭|取消|退出|结束).{0,4}伴游|(?:不需要|不要).{0,4}伴游|伴游(?:模式)?.{0,4}(?:关闭|取消|退出|结束|不需要|不要)/.test(command);
}

function deactivateCompanionMode() {
  const wasActive = isCompanionModeActive();
  setCompanionMode(false);
  if (typeof companionNeedsRefresh !== 'undefined') companionNeedsRefresh = true;
  if (typeof closeActiveConversation === 'function') closeActiveConversation();
  if (wasActive) notify('伴游模式已关闭，已切换到计划模式');
}

setCompanionMode(readCompanionMode());

document.addEventListener('click', event => {
  const toggle = event.target.closest('.mode-switch');
  if (!toggle) return;
  const enabled = !toggle.classList.contains('checked');
  if (enabled && typeof requestCompanionMode === 'function') {
    requestCompanionMode();
    return;
  }
  if (!enabled) {
    deactivateCompanionMode();
    return;
  }
  setCompanionMode(true);
  notify('伴游模式已开启');
});

const drawerToggle = document.querySelector('.drawer-toggle');
const languageSwitch = document.querySelector('.language-switch');
const languageCopy = {
  zh: {
    brand: '周末到铜梁AI伴游', subtitle: '玄天湖智能伴游', mode: '伴游模式',
    greeting: '您好，我是您的铜梁龙伴游。我可以帮您规划路线、推荐美食、介绍景点，也可以一路陪您讲解。您这次是刚到铜梁，还是正在计划出发呢？',
    userQuestion: '我现在去玄天湖，应该怎么去玩？', guideReply: '为您整理了玄天湖专属攻略，需要地图导航吗？我可以直接带您到玄天湖。',
    parking: '我要去玄天湖，周边停车方便吗？', change: '换一批', tickets: '玄天湖需要提前预约和购买门票吗？', specialTour: '想看打铁花、吃头刀肉，请给我推荐',
    photoGuide: '拍照导览', viralTour: '网红游铜梁', nearbyGoods: '附近好物', phoneService: '打电话',
    promptWeekendDrive: '周末自驾铜梁两日游', promptFoodieDay: '吃货在铜梁的一天，小红书力荐', promptPeakMatch: '铜梁火龙 VS 江津润通动力-巅峰对决',
    composer: '我不要吃的，我要去徒步', navPlan: '在铜梁', navExplore: '边走边耍', navProfile: '我的',
    contextPlace: '铜梁区玄天湖...', contextWeather: '晴 23℃', contextEvent: '19:30 打铁花', localWord: '本地人口碑', localQuote: '“傍晚沿湖走最舒服，停车从东门进更方便。”', startRoute: '进入边走边耍', saveRoute: '收藏路线',
    planEyebrow: 'AI 为你生成周末计划', planHeroLineOne: '周末到铜梁', planHeroLineTwo: '看龙舞 · 享足球', planHeroSummary: '跟着铜龙逛山水，把足球热爱装进周末。',
    homeDragonEyebrow: '铜龙带你耍', homeDragonTitle: '龙舞非遗之旅', homeDragonAction: '看龙舞 · 逛文创 ↗',
    homeFootballEyebrow: '跟着足球去旅行', homeFootballTitle: '球迷周末计划', homeFootballAction: '问观赛 · 逛铜梁 ↗',
    homeFootballMarquee: '为一场球，来铜梁过个周末',
    homeDragonShortcut: '铜龙非遗', homeFootballShortcut: '足球周末',
    planStepOne: '周末路线', planStepTwo: '风味探索', planStepThree: '今晚去耍', planFeatureEyebrow: '本地灵感', planFeatureTitle: '把铜梁的好耍，都装进周末'
  },
  en: {
    brand: 'Longxiang Guide', subtitle: 'Xuantian Lake', mode: 'Guide mode',
    greeting: 'Hello, I am your Tongliang Dragon guide. I can plan routes, recommend local food, introduce attractions and guide you along the way. Have you arrived in Tongliang, or are you planning your trip?',
    userQuestion: 'How should I explore Xuantian Lake?', guideReply: 'I have prepared a Xuantian Lake guide for you. Need directions? I can take you there now.',
    parking: 'Is parking easy near Xuantian Lake?', change: 'Refresh', tickets: 'Do I need to book tickets in advance?', specialTour: 'Recommend iron flower shows and local food',
    photoGuide: 'Photo guide', viralTour: 'Viral tour', nearbyGoods: 'Nearby finds', phoneService: 'Call',
    promptWeekendDrive: 'Two-day self-drive weekend in Tongliang', promptFoodieDay: 'A foodie day in Tongliang', promptPeakMatch: 'Tongliang Fire Dragon VS Jiangjin Runtong Power',
    composer: "I don't want food. I want to go hiking.", navPlan: 'In Tongliang', navExplore: 'Live guide', navProfile: 'Me',
    contextPlace: 'Xuantian Lake...', contextWeather: 'Sunny 23°C', contextEvent: '19:30 Iron flower', localWord: 'Local review', localQuote: '“The east gate is easier for parking before sunset.”', startRoute: 'Start live guide', saveRoute: 'Save route',
    planEyebrow: 'AI WEEKEND PLAN', planHeroLineOne: 'Tongliang', planHeroLineTwo: 'Dragons & Football', planHeroSummary: 'Discover dragon culture, scenic escapes and football weekends.',
    homeDragonEyebrow: 'Meet your dragon guide', homeDragonTitle: 'Dragon heritage', homeDragonAction: 'Shows & souvenirs ↗',
    homeFootballEyebrow: 'Travel with football', homeFootballTitle: 'A fan’s weekend', homeFootballAction: 'Matchday & city trips ↗',
    homeFootballMarquee: 'Come for the football, stay for the weekend',
    homeDragonShortcut: 'Dragon heritage', homeFootballShortcut: 'Football weekend',
    planStepOne: 'WEEKEND ROUTE', planStepTwo: 'LOCAL FLAVORS', planStepThree: 'TONIGHT OUT', planFeatureEyebrow: 'LOCAL HIGHLIGHTS', planFeatureTitle: 'Pack Tongliang into your weekend'
  }
};
let currentLanguage = 'zh';
updateConsumerHeaderLanguage(currentLanguage);
const journeyMarqueeCopy = {
  zh: {
    'local-01': '铜梁人看龙舞：这动作，外地人真学不会',
    'local-02': '安居古城到底该慢逛，还是直奔那家馆子？',
    'local-03': '玄天湖骑一圈后，谁还记得自己是来运动的',
    'local-04': '在铜梁点“微辣”，到底需要多大勇气？',
    'local-05': '周末去安居：堵在路上算不算提前进入古城？',
    'local-06': '铜梁龙不只会飞，居然还会“整活”',
    'local-07': '奇彩梦园拍照指南：人可以不出片，花必须出片',
    'local-08': '铜梁人的早餐局，谁才是隐藏冠军？',
    'local-09': '下雨天的玄天湖，像开了铜梁限定滤镜',
    'local-10': '第一次来铜梁，最容易错过的不是景点，是好吃的',
    'local-11': '铜梁人嘴里的“就在附近”，到底是几分钟？',
    'local-12': '这条铜梁徒步线，走着走着就不想回城',
    'local-13': '火龙表演现场：建议别眨眼，怕错过高光',
    'local-14': '铜梁夜宵到底有多卷？胃说它还可以再战',
    'local-15': '在铜梁找停车位，比找对象更看缘分？',
    'local-16': '外地朋友第一次见铜梁龙，反应都很一致',
    'local-17': '铜梁适合发呆的地方，被我们悄悄找到了',
    'local-18': '谁说铜梁晚上没得耍？这份夜游清单请收好',
    'local-19': '铜梁本地人私藏的一日游路线，少走弯路版',
    'local-20': '你以为来铜梁是旅游，结果先被美食留下来了'
  },
  en: {
    'local-01': 'Tongliang locals watch dragon dances like this. Visitors will never quite get it.',
    'local-02': 'Stroll Anju Ancient Town, or head straight for that restaurant?',
    'local-03': 'After cycling around Xuantian Lake, who remembers we came here to work out?',
    'local-04': 'How brave do you need to be to order "mild" in Tongliang?',
    'local-05': 'Weekend trip to Anju: does traffic count as entering the ancient town early?',
    'local-06': 'Tongliang dragons do more than fly. They have quite a sense of fun.',
    'local-07': 'Photo guide to Qicai Dream Garden: you can skip the perfect portrait, but the flowers cannot.',
    'local-08': 'Tongliang breakfast: who is the hidden champion?',
    'local-09': 'Rainy Xuantian Lake comes with a Tongliang-only filter.',
    'local-10': 'First time in Tongliang? The easiest thing to miss is great food, not attractions.',
    'local-11': 'When Tongliang locals say "nearby", how many minutes do they mean?',
    'local-12': 'This Tongliang hiking route makes you never want to head home.',
    'local-13': 'Fire dragon show tip: do not blink, or you might miss the highlight.',
    'local-14': 'How competitive is Tongliang night food? Your stomach says bring it on.',
    'local-15': 'Finding a parking space in Tongliang is all about fate.',
    'local-16': 'Out-of-town friends all react the same way when they first see a Tongliang dragon.',
    'local-17': 'We quietly found Tongliang spots that are perfect for doing nothing.',
    'local-18': 'Who says there is nothing to do in Tongliang at night? Save this night-tour list.',
    'local-19': 'A local\'s private Tongliang day trip route, made to avoid detours.',
    'local-20': 'You came to visit Tongliang, then the food made you stay.'
  }
};
const nearbyServiceCopy = {
  zh: { title: '附近的', eat: '吃', stay: '住', tour: '游', shop: '购', parking: '停车位', restroom: '卫生间' },
  en: { title: 'Nearby services', eat: 'Food', stay: 'Stay', tour: 'Explore', shop: 'Shop', parking: 'Parking', restroom: 'Restroom' }
};
function updateJourneyMarqueeLanguage() {
  const copy = journeyMarqueeCopy[currentLanguage];
  if (!copy) return;
  document.querySelectorAll('[data-journey-key]').forEach(chip => {
    const text = copy[chip.dataset.journeyKey];
    if (!text) return;
    const textNode = [...chip.childNodes].find(node => node.nodeType === Node.TEXT_NODE);
    if (textNode) textNode.nodeValue = ` ${text}`;
  });
}
function updateNearbyServiceLanguage() {
  const copy = nearbyServiceCopy[currentLanguage];
  if (!copy) return;
  document.querySelectorAll('[data-nearby-card]').forEach(card => {
    card.setAttribute('aria-label', copy.title);
    const title = card.querySelector(':scope > strong');
    if (title) title.textContent = copy.title;
    card.querySelectorAll('[data-nearby-action]').forEach(button => {
      const label = copy[button.dataset.nearbyAction];
      const labelNode = button.querySelector('span:last-child');
      if (label && labelNode) labelNode.textContent = label;
    });
  });
}
function updateLocationContext() {
  const hasLocation = hasCurrentLocation();
  const copy = languageCopy[currentLanguage];
  const place = hasLocation ? copy.contextPlace : currentLanguage === 'zh' ? '未定位' : 'Location unavailable';
  const weather = hasLocation ? copy.contextWeather : '--';
  document.querySelectorAll('[data-i18n="contextPlace"]').forEach(element => { element.textContent = place; });
  document.querySelectorAll('[data-i18n="contextWeather"]').forEach(element => { element.textContent = weather; });
  document.querySelectorAll('.context-location').forEach(element => {
    element.classList.toggle('is-unavailable', !hasLocation);
    element.setAttribute('aria-label', hasLocation ? '查看当前位置' : '尚未获取当前位置');
  });
}
updateLocationContext();
const conversationDrawerHistoryKey = 'tongliang-conversation-drawer-history-v1';
const drawerPhone = document.querySelector('.phone');
let conversationDrawer;
let drawerHistoryList;
let drawerSearchInput;
let drawerHistoryMenu;
let drawerHistoryDeleteConfirm;
let drawerHistoryPressTimer;
let drawerHistoryPressItem;
let drawerHistoryPressStart;
let drawerHistoryLongPressed = false;
let pendingDrawerHistoryDeleteId = '';

const readConversationDrawerHistory = () => {
  try {
    const records = JSON.parse(sessionStorage.getItem(conversationDrawerHistoryKey) || '[]');
    return Array.isArray(records) ? records : [];
  } catch (_) { return []; }
};
const writeConversationDrawerHistory = records => {
  try { sessionStorage.setItem(conversationDrawerHistoryKey, JSON.stringify(records)); } catch (_) {}
};
const drawerThreadTitle = messages => {
  const firstUserMessage = messages.find(message => message.role === 'user' && message.text)?.text;
  const title = String(firstUserMessage || '新对话').replace(/\s+/g, '');
  const characters = Array.from(title);
  return `${characters.slice(0, 10).join('')}${characters.length > 10 ? '...' : ''}`;
};
const drawerHistoryDate = record => {
  if (Number.isFinite(Number(record.createdAt))) return new Date(Number(record.createdAt));
  const match = String(record.updatedAt || '').match(/(\d{1,2})\/(\d{1,2})[^\d]*(\d{1,2}):(\d{2})/);
  if (!match) return new Date(0);
  const now = new Date();
  const [, month, day, hour, minute] = match;
  let year = now.getFullYear();
  const date = new Date(year, Number(month) - 1, Number(day), Number(hour), Number(minute));
  if (date.getTime() - now.getTime() > 24 * 60 * 60 * 1000) date.setFullYear(year - 1);
  return date;
};
const drawerHistoryGroup = record => {
  const date = drawerHistoryDate(record);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOffset = Math.floor((today.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) / 86400000);
  if (dayOffset <= 0) return '今天';
  if (dayOffset === 1) return '昨天';
  if (dayOffset <= 7) return '7天之内';
  return '更多';
};
const drawerHistoryGroups = ['今天', '昨天', '7天之内', '更多'];
const collapsedDrawerHistoryGroups = new Set();
let resetFeatureCarouselGesture = () => {};
const closeConversationDrawer = () => {
  drawerPhone?.classList.remove('is-drawer-open');
  conversationDrawer?.setAttribute('aria-hidden', 'true');
  (drawerToggle || document.querySelector('.drawer-toggle'))?.setAttribute('aria-expanded', 'false');
  if (typeof closeDrawerHistoryMenu === 'function') closeDrawerHistoryMenu();
  if (typeof renderSharedConversation === 'function') renderSharedConversation();
};
const openConversationDrawer = () => {
  if (!conversationDrawer) return;
  resetFeatureCarouselGesture();
  persistActiveConversation();
  refreshConversationDrawer();
  drawerPhone?.classList.add('is-drawer-open');
  conversationDrawer.setAttribute('aria-hidden', 'false');
  (drawerToggle || document.querySelector('.drawer-toggle'))?.setAttribute('aria-expanded', 'true');
  window.requestAnimationFrame(() => drawerSearchInput?.focus());
};
const refreshConversationDrawer = () => {
  if (!conversationDrawer || !drawerHistoryList) return;
  const query = drawerSearchInput?.value.trim().toLocaleLowerCase() || '';
  const records = readConversationDrawerHistory()
    .map(record => ({ ...record, pinned: Boolean(record.pinned), title: drawerThreadTitle(Array.isArray(record.messages) ? record.messages : []) }))
    .filter(record => !query || record.title.toLocaleLowerCase().includes(query));
  const historyItem = record => `<button type="button" class="conversation-drawer-history-item${record.pinned ? ' is-pinned' : ''}" data-drawer-thread="${escapeHTML(record.id)}"><span>${icons.history}</span><strong>${escapeHTML(record.title)}</strong><small>${record.pinned ? '已置顶 · ' : ''}${escapeHTML(record.updatedAt || '')}</small><i>${icons.chevron}</i></button>`;
  const grouped = drawerHistoryGroups.map(label => ({
    label,
    records: records.filter(record => drawerHistoryGroup(record) === label).sort((left, right) => Number(right.pinned) - Number(left.pinned) || drawerHistoryDate(right) - drawerHistoryDate(left))
  })).filter(group => group.records.length);
  drawerHistoryList.innerHTML = grouped.length
    ? grouped.map(group => {
      const collapsed = collapsedDrawerHistoryGroups.has(group.label);
      return `<section class="conversation-drawer-history-group${collapsed ? ' is-collapsed' : ''}"><button type="button" class="conversation-drawer-history-group-toggle" data-drawer-history-group="${group.label}" aria-expanded="${String(!collapsed)}"><span>${group.label}</span><i>${icons.chevron}</i></button><div class="conversation-drawer-history-group-list"${collapsed ? ' hidden' : ''}>${group.records.map(historyItem).join('')}</div></section>`;
    }).join('')
    : '<p class="conversation-drawer-history-empty">暂无历史对话</p>';
};
const archiveCurrentConversation = () => {
  if (!sharedConversationMessages.length) return;
  const records = readConversationDrawerHistory();
  records.unshift({
    id: `thread-${Date.now()}`,
    title: drawerThreadTitle(sharedConversationMessages),
    createdAt: Date.now(),
    updatedAt: new Date().toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    messages: JSON.parse(JSON.stringify(sharedConversationMessages))
  });
  writeConversationDrawerHistory(records.slice(0, 30));
};
const startNewConversation = () => {
  cancelConsumerAgentRequests();
  sharedConversationRevision += 1;
  persistActiveConversation();
  const id = `thread-${Date.now()}`;
  const records = readConversationDrawerHistory();
  records.unshift({
    id,
    title: '新对话',
    createdAt: Date.now(),
    updatedAt: new Date().toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    messages: [],
    pinned: false
  });
  writeConversationDrawerHistory(records.slice(0, 30));
  setActiveConversation(id);
  sharedConversationMessages = [];
  renderSharedConversation();
  openActiveConversation('half');
  refreshConversationDrawer();
  closeConversationDrawer();
};
const restoreDrawerConversation = id => {
  if (id === activeConversationId) {
    openActiveConversation('half');
    closeConversationDrawer();
    return;
  }
  const record = readConversationDrawerHistory().find(item => item.id === id);
  if (!record || !Array.isArray(record.messages)) return;
  cancelConsumerAgentRequests();
  sharedConversationRevision += 1;
  persistActiveConversation();
  setActiveConversation(id);
  sharedConversationMessages = JSON.parse(JSON.stringify(record.messages)).map(recoverStoredAgentMessage);
  renderSharedConversation();
  openActiveConversation('half');
  closeConversationDrawer();
};
const toggleLanguage = () => {
  currentLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const value = languageCopy[currentLanguage][element.dataset.i18n];
    if (value) element.textContent = value;
  });
  document.querySelectorAll('[data-i18n-value]').forEach(element => {
    const value = languageCopy[currentLanguage][element.dataset.i18nValue];
    if (value) element.value = value;
  });
  updateJourneyMarqueeLanguage();
  updateConsumerHeaderLanguage(currentLanguage);
  updateFeatureCarouselLanguage();
  updateNearbyServiceLanguage();
  updateMapCategoryLanguage();
  updateComposerLanguage();
  updateLocationContext();
  document.querySelectorAll('.drawer-toggle').forEach(button => {
    button.setAttribute('aria-label', currentLanguage === 'en' ? 'Open conversation history' : '打开历史对话');
    button.title = currentLanguage === 'en' ? 'Conversation history' : '历史对话';
  });
  languageSwitch?.setAttribute('aria-pressed', String(currentLanguage === 'en'));
  languageSwitch?.setAttribute('aria-label', currentLanguage === 'zh' ? '切换为英文' : '切换为中文');
  const currentLabel = languageSwitch?.querySelector('.language-current');
  const otherLabel = languageSwitch?.querySelector('.language-other');
  if (currentLabel) currentLabel.textContent = currentLanguage === 'zh' ? '中' : 'EN';
  if (otherLabel) otherLabel.textContent = currentLanguage === 'zh' ? 'EN' : '中';
  if (activePromptKey) renderPromptAnswer(activePromptKey);
  if (!sharedConversationMessages.length) renderSharedConversation();
  refreshConversationDrawer();
  window.dispatchEvent(new Event('home-language-change'));
  notify(currentLanguage === 'zh' ? '已切换为中文' : 'Switched to English');
};
if (drawerPhone && (planScreen || mapScreen)) {
  conversationDrawer = document.createElement('aside');
  conversationDrawer.className = 'conversation-drawer';
  conversationDrawer.setAttribute('aria-label', '对话菜单');
  conversationDrawer.setAttribute('aria-hidden', 'true');
  conversationDrawer.innerHTML = `<div class="conversation-drawer-profile"><span class="conversation-drawer-avatar">${icons.user}</span><span><strong>微信用户_7570</strong></span></div><div class="conversation-drawer-top"><label class="conversation-drawer-search"><span>${icons.search}</span><input type="search" placeholder="搜索历史对话" aria-label="搜索历史对话"></label><button type="button" class="conversation-drawer-new" data-drawer-new aria-label="新开对话">${icons.filePlus}</button></div><div class="conversation-drawer-section"><strong>历史对话</strong><div class="conversation-drawer-history" data-drawer-history></div></div><div class="drawer-history-menu" data-drawer-history-menu hidden><button type="button" data-drawer-history-pin>${icons.bookmark}<span>置顶</span></button><button type="button" data-drawer-history-delete>${icons.trash}<span>删除</span></button></div></aside><button type="button" class="conversation-drawer-dismiss" data-drawer-dismiss aria-label="收起对话菜单"></button>`;
  conversationDrawer.querySelector('[data-drawer-new]').innerHTML = icons.chatPlus;
  // Keep the profile below the flexible, independently scrolling history list.
  conversationDrawer.querySelector('.conversation-drawer-section').after(
    conversationDrawer.querySelector('.conversation-drawer-profile')
  );
  drawerPhone.append(conversationDrawer);
  drawerHistoryList = conversationDrawer.querySelector('[data-drawer-history]');
  drawerSearchInput = conversationDrawer.querySelector('input[type="search"]');
  drawerHistoryMenu = conversationDrawer.querySelector('[data-drawer-history-menu]');
  const drawerDismiss = drawerPhone.querySelector('[data-drawer-dismiss]');
  const blockDrawerDismissPointer = event => {
    event.preventDefault();
    event.stopPropagation();
  };
  drawerDismiss?.addEventListener('pointerdown', blockDrawerDismissPointer);
  drawerDismiss?.addEventListener('pointercancel', blockDrawerDismissPointer);
  drawerDismiss?.addEventListener('pointerup', event => {
    blockDrawerDismissPointer(event);
    closeConversationDrawer();
  });
  drawerDismiss?.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    closeConversationDrawer();
  });
  drawerSearchInput?.addEventListener('input', refreshConversationDrawer);
  drawerHistoryDeleteConfirm = document.createElement('div');
  drawerHistoryDeleteConfirm.className = 'drawer-history-delete-confirm';
  drawerHistoryDeleteConfirm.hidden = true;
  drawerHistoryDeleteConfirm.innerHTML = `<section class="drawer-history-delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="drawer-history-delete-title"><h2 id="drawer-history-delete-title">确认删除此条记录吗？</h2><p>删除后不再恢复。</p><div><button type="button" data-drawer-history-delete-cancel>取消</button><button type="button" data-drawer-history-delete-confirm>确认</button></div></section>`;
  drawerPhone.append(drawerHistoryDeleteConfirm);
  try {
    if (sessionStorage.getItem('tongliang-reopen-drawer') === 'true') {
      sessionStorage.removeItem('tongliang-reopen-drawer');
      window.requestAnimationFrame(openConversationDrawer);
    }
  } catch (_) {}
  if (new URLSearchParams(location.search).get('restoreDrawer') === '1') {
    window.setTimeout(openConversationDrawer, 0);
    const restoredUrl = new URL(location.href);
    restoredUrl.searchParams.delete('restoreDrawer');
    window.history.replaceState(null, '', restoredUrl.href);
  }
}
const closeDrawerHistoryMenu = () => {
  if (!drawerHistoryMenu) return;
  drawerHistoryMenu.hidden = true;
  drawerHistoryMenu.removeAttribute('data-thread-id');
};
const showDrawerHistoryMenu = item => {
  if (!drawerHistoryMenu || !conversationDrawer) return;
  const records = readConversationDrawerHistory();
  const record = records.find(entry => entry.id === item.dataset.drawerThread);
  const drawerRect = conversationDrawer.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  const top = Math.min(conversationDrawer.clientHeight - 50, Math.max(72, itemRect.bottom - drawerRect.top + 4));
  drawerHistoryMenu.dataset.threadId = item.dataset.drawerThread;
  drawerHistoryMenu.style.top = `${top}px`;
  drawerHistoryMenu.querySelector('[data-drawer-history-pin] span').textContent = record?.pinned ? '取消置顶' : '置顶';
  drawerHistoryMenu.hidden = false;
};
const clearDrawerHistoryPress = () => {
  if (drawerHistoryPressTimer) window.clearTimeout(drawerHistoryPressTimer);
  drawerHistoryPressTimer = undefined;
  drawerHistoryPressItem = undefined;
  drawerHistoryPressStart = undefined;
};
conversationDrawer?.addEventListener('pointerdown', event => {
  const item = event.target.closest('[data-drawer-thread]');
  if (!item) return;
  drawerHistoryLongPressed = false;
  drawerHistoryPressItem = item;
  drawerHistoryPressStart = { x: event.clientX, y: event.clientY };
  drawerHistoryPressTimer = window.setTimeout(() => {
    drawerHistoryLongPressed = true;
    showDrawerHistoryMenu(item);
  }, 520);
});
conversationDrawer?.addEventListener('pointermove', event => {
  if (!drawerHistoryPressStart || Math.hypot(event.clientX - drawerHistoryPressStart.x, event.clientY - drawerHistoryPressStart.y) <= 10) return;
  clearDrawerHistoryPress();
});
conversationDrawer?.addEventListener('pointerup', clearDrawerHistoryPress);
conversationDrawer?.addEventListener('pointercancel', clearDrawerHistoryPress);
conversationDrawer?.addEventListener('contextmenu', event => {
  const item = event.target.closest('[data-drawer-thread]');
  if (!item) return;
  event.preventDefault();
  drawerHistoryLongPressed = true;
  showDrawerHistoryMenu(item);
});
conversationDrawer?.addEventListener('click', event => {
  const groupToggle = event.target.closest('[data-drawer-history-group]');
  if (groupToggle) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const label = groupToggle.dataset.drawerHistoryGroup;
    if (collapsedDrawerHistoryGroups.has(label)) collapsedDrawerHistoryGroups.delete(label);
    else collapsedDrawerHistoryGroups.add(label);
    refreshConversationDrawer();
    return;
  }
  const pinButton = event.target.closest('[data-drawer-history-pin]');
  if (pinButton) {
    const id = drawerHistoryMenu?.dataset.threadId;
    if (!id) return;
    const records = readConversationDrawerHistory().map(record => record.id === id ? { ...record, pinned: !record.pinned } : record);
    writeConversationDrawerHistory(records);
    closeDrawerHistoryMenu();
    refreshConversationDrawer();
    event.stopPropagation();
    return;
  }
  const deleteButton = event.target.closest('[data-drawer-history-delete]');
  if (deleteButton) {
    pendingDrawerHistoryDeleteId = drawerHistoryMenu?.dataset.threadId || '';
    closeDrawerHistoryMenu();
    if (pendingDrawerHistoryDeleteId && drawerHistoryDeleteConfirm) drawerHistoryDeleteConfirm.hidden = false;
    event.stopPropagation();
  }
});
conversationDrawer?.addEventListener('click', event => {
  if (drawerHistoryMenu?.hidden || event.target.closest('[data-drawer-history-menu]')) return;
  closeDrawerHistoryMenu();
  event.preventDefault();
  event.stopPropagation();
});
drawerHistoryDeleteConfirm?.addEventListener('click', event => {
  if (event.target === drawerHistoryDeleteConfirm || event.target.closest('[data-drawer-history-delete-cancel]')) {
    drawerHistoryDeleteConfirm.hidden = true;
    pendingDrawerHistoryDeleteId = '';
    return;
  }
  if (!event.target.closest('[data-drawer-history-delete-confirm]') || !pendingDrawerHistoryDeleteId) return;
  writeConversationDrawerHistory(readConversationDrawerHistory().filter(record => record.id !== pendingDrawerHistoryDeleteId));
  drawerHistoryDeleteConfirm.hidden = true;
  pendingDrawerHistoryDeleteId = '';
  refreshConversationDrawer();
});
drawerToggle?.addEventListener('click', event => {
  event.stopPropagation();
  openConversationDrawer();
});
languageSwitch?.addEventListener('click', event => {
  event.stopPropagation();
  toggleLanguage();
});
document.addEventListener('click', event => {
  if (drawerPhone?.classList.contains('is-drawer-open') && !event.target.closest('.conversation-drawer')) {
    event.preventDefault();
    event.stopImmediatePropagation();
    closeConversationDrawer();
    return;
  }
  if (event.target.closest('[data-drawer-dismiss]')) {
    closeConversationDrawer();
    return;
  }
  if (event.target.closest('[data-drawer-new]')) {
    startNewConversation();
    return;
  }
  const historyItem = event.target.closest('[data-drawer-thread]');
  if (historyItem) {
    if (drawerHistoryLongPressed) {
      drawerHistoryLongPressed = false;
      return;
    }
    restoreDrawerConversation(historyItem.dataset.drawerThread);
  }
});

document.querySelector('[data-profile-back]')?.addEventListener('click', () => {
  try {
    sessionStorage.removeItem('tongliang-profile-return');
    sessionStorage.removeItem('tongliang-reopen-drawer');
  } catch (_) {}
  location.href = 'plan.html';
});

const promptAnswerCopy = {
  zh: {
    weekendDrive: '周末自驾路线的完整回答将在问答文档接入后显示。',
    foodieDay: '铜梁美食一日游的完整回答将在问答文档接入后显示。',
    peakMatch: '巅峰对决的完整回答将在问答文档接入后显示。'
  },
  en: {
    weekendDrive: 'The full two-day self-drive answer will appear after the Q&A copy is added.',
    foodieDay: 'The full Tongliang foodie-day answer will appear after the Q&A copy is added.',
    peakMatch: 'The full match guide will appear after the Q&A copy is added.'
  }
};
const promptAnswerPanel = document.querySelector('[data-prompt-answer]');
const promptAnswerQuestion = document.querySelector('[data-prompt-question]');
const promptAnswerText = document.querySelector('[data-prompt-answer-text]');
let activePromptKey = '';
function renderPromptAnswer(key) {
  if (!promptAnswerPanel || !promptAnswerQuestion || !promptAnswerText) return;
  const button = document.querySelector(`[data-prompt-key="${key}"]`);
  if (!button) return;
  activePromptKey = key;
  document.querySelectorAll('[data-prompt-key]').forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  promptAnswerQuestion.textContent = button.querySelector('[data-i18n]')?.textContent.trim() || button.textContent.trim();
  promptAnswerText.textContent = promptAnswerCopy[currentLanguage][key];
  promptAnswerPanel.hidden = false;
}
document.querySelectorAll('[data-prompt-key]').forEach(button => {
  button.addEventListener('click', () => {
    renderPromptAnswer(button.dataset.promptKey);
    const thread = document.querySelector('.conversation');
    window.requestAnimationFrame(() => thread?.scrollTo({ top: thread.scrollHeight, behavior: 'smooth' }));
    notify(currentLanguage === 'zh' ? '智能体已生成回答' : 'Answer generated');
  });
});

const categoryData = {
  eat: {
    color: ['#de9400'], points: [[34,32],[47,41],[81,47],[18,61],[67,72]],
    places: [
      ['玄天湖湖景火锅','3.6','3','火锅','铜梁区','购买','assets/湖景火锅.jpeg'],
      ['玄天湖龙火锅（龙舞广场店）','4.7','128','火锅','玄天湖景区','购买','assets/湖景火锅.jpeg'],
      ['铜梁区三活餐馆','4.6','86','特色餐饮','东城街道','购买','assets/三活春油烧兔-1.png'],
      ['铜梁区原乡头刀菜餐饮店','4.8','215','特色餐饮','东城街道','购买','assets/头刀菜.jpeg'],
      ['重庆市叙知香餐饮文化有限公司','4.5','64','火锅','南城街道','购买','assets/recommend-2.png']
    ]
  },
  stay: {
    color: ['#6e56cf'], points: [[65,30],[54,37],[42,48],[27,52],[61,34]],
    places: [
      ['重庆西温泉度假酒店','4.8','326','度假酒店','玄天湖景区','预订','assets/trip-day-tour-hd.png'],
      ['西郊雅社民宿','4.7','96','精品民宿','西来村','预订','assets/西郊雅社-1.jpeg'],
      ['岳麓别院民宿','4.6','72','精品民宿','巴岳寺旁','预订','assets/recommend-3.png'],
      ['涪江山居民宿','4.5','58','精品民宿','安居古城','预订','assets/recommend-3.png'],
      ['翰林山居民宿','4.7','113','精品民宿','安居古城','预订','assets/recommend-3.png']
    ]
  },
  travel: {
    color: ['#1664ff'], points: [[31,43],[50,38],[44,49],[35,55],[72,60]],
    places: [
      ['玄天湖观光车','4.6','188','景区交通','游客中心','购票','assets/map.png'],
      ['环湖骑行驿站','4.8','142','骑行服务','玄天湖绿道','预约','assets/trip-cycling-hd.png'],
      ['铜梁旅游专线','4.5','76','旅游巴士','北入口','购票','assets/map.png'],
      ['湖畔停车场','4.4','93','停车服务','玄天湖东门','导航','assets/map.png'],
      ['龙乡景区接驳车','4.7','104','景区接驳','文创基地','购票','assets/map.png']
    ]
  },
  shop: {
    color: ['#189959'], points: [[78,37],[54,42],[35,47],[15,58],[68,64]],
    places: [
      ['重庆市铜梁区龙文化传媒有限公司','4.8','206','文创好物','铜梁文创展厅','购买','assets/trip-cultural-base-hd.png'],
      ['瀚林酥','4.7','152','非遗文创','巴川街道','购买','assets/recommend-1.png'],
      ['重庆真艾农业有限公司','4.6','121','地方特产','南城街道','购买','assets/recommend-2.png'],
      ['风物集市','4.7','88','手工艺品','安居古城','购买','assets/recommend-3.png'],
      ['兰花根','4.5','67','旅游商品','南城街道','购买','assets/recommend-1.png']
    ]
  },
  tour: {
    color: ['#0e7490'], points: [[64,18],[77,27],[89,36],[47,43],[92,51]],
    places: [
      ['玄天湖环湖步道','4.9','428','自然景观','玄天湖景区','导航','assets/trip-day-tour-hd.png'],
      ['玄天湖文创基地','4.7','183','文化体验','玄天湖东岸','预约','assets/trip-cultural-base-hd.png'],
      ['徒步骑行玄天湖','4.8','236','户外运动','环湖绿道','预约','assets/trip-cycling-hd.png'],
      ['天灯石景区','4.6','109','自然景观','巴岳山','购票','assets/trip-stone-scenic-hd.png'],
      ['安居古城','4.8','512','历史古镇','安居镇','导航','assets/recommend-3.png']
    ]
  }
};

const markerLayer = document.querySelector('.marker-layer');
const markerCard = document.querySelector('.marker-card');
let activeMarkerPoint = null;
function closePoiCard() {
  markerCard?.classList.remove('show', 'wishlist-poi-card', 'poi-action-card');
  activeMarkerPoint = null;
  hideMapCategoryHint();
}
mapScreen?.addEventListener('click', event => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (target.closest('.marker-card, .marker, .wishlist-poi, .route-poi-marker')) return;
  if (target === mapScreen || target === markerLayer || target.closest('.map-canvas, .map-current-location')) {
    closePoiCard();
  }
});
function positionMarkerCard(point) {
  if (!mapScreen || !markerLayer || !markerCard?.classList.contains('show') || !point) return;
  const screenRect = mapScreen.getBoundingClientRect();
  const layerRect = markerLayer.getBoundingClientRect();
  const projected = realMap?.projectPoint(point);
  const markerX = projected?.x ?? (layerRect.left - screenRect.left + layerRect.width * point[0] / 100);
  const markerY = projected?.y ?? (layerRect.top - screenRect.top + layerRect.height * point[1] / 100);
  const cardWidth = markerCard.offsetWidth;
  const cardHeight = markerCard.offsetHeight;
  const minLeft = 12;
  const maxLeft = Math.max(minLeft, screenRect.width - cardWidth - 12);
  const minTop = 146;
  const maxTop = Math.max(minTop, screenRect.height - cardHeight - 62);
  const left = Math.min(maxLeft, Math.max(minLeft, markerX + 18));
  const top = Math.min(maxTop, Math.max(minTop, markerY - cardHeight - 12));
  markerCard.style.left = `${left}px`;
  markerCard.style.right = 'auto';
  markerCard.style.top = `${top}px`;
  markerCard.style.bottom = 'auto';
}
window.addEventListener('resize', () => positionMarkerCard(activeMarkerPoint));
if (mapScreen && window.TongliangMap) {
  realMap = window.TongliangMap.create(mapScreen, {
    onMapInteraction: closePoiCard,
    onViewChange: () => positionMarkerCard(activeMarkerPoint)
  });
}
const trustSources = ['本地人口碑', '游客口碑', '商户自述'];
const trustQuotes = {
  eat: ['湖边吹风后吃一锅最安逸', '老灶香，但晚市最好提前排号', '鱼是现点现做，适合多人同行', '正常人均约70元，先问当天做法', '小吃集中，赶路时最方便'],
  stay: ['东岸看日出很方便', '晚上安静，适合周末慢游', '老板会讲铜梁龙文化', '空气好，适合避暑', '逛古城不用赶末班车'],
  travel: ['游客中心上车最稳妥', '傍晚骑行体感最好', '周末建议提前查班次', '东门车位相对充足', '活动散场会加密班次'],
  shop: ['文创龙灯很有铜梁辨识度', '适合给小朋友带礼物', '农特产可现场试吃', '手作体验需要提前预约', '小包装更适合随身带走'],
  tour: ['傍晚沿湖走最舒服', '适合了解铜梁龙文化', '绿道平缓，新手也能骑', '石景壮观但要穿防滑鞋', '夜游比白天更有味道']
};
function rememberPlace(place, source, category) {
  try {
    const items = JSON.parse(localStorage.getItem('tongliang-history') || '[]');
    const next = [{ name: place[0], image: place[6], source, time: '刚刚', category }, ...items.filter(item => item.name !== place[0])].slice(0, 5);
    localStorage.setItem('tongliang-history', JSON.stringify(next));
  } catch (_) {}
}
const formatPoiDistance = value => {
  const text = String(value || '').trim();
  if (!text) return '距你 1.8 km';
  return text.startsWith('距你') ? text.replace(/(\d(?:\.\d)?)\s*km/i, '$1 km') : `距你 ${text.replace(/\s*km$/i, '')} km`;
};
const formatPoiAddress = value => {
  const text = String(value || '').trim();
  if (!text) return '重庆市铜梁区玄天湖周边';
  if (/^(重庆|上海|北京|天津|铜梁)/.test(text)) return text;
  return `重庆市铜梁区${text}`;
};
const poiNavigationHref = poi => `map-navigation.html?${new URLSearchParams({ name: poi.name || '目的地', address: formatPoiAddress(poi.address) })}`;
const poiDetailHref = poi => {
  if (typeof poi?.detailHref === 'string' && /^product-detail\.html\?/.test(poi.detailHref)) return poi.detailHref;
  const key = String(poi?.id || '');
  const query = key.startsWith('merchant-')
    ? { knowledgeRef: key, name: poi.name || '推荐内容' }
    : { item: key && !key.startsWith('category-') ? key : 'history', name: poi.name || '推荐内容' };
  return `product-detail.html?${new URLSearchParams(query)}`;
};
const featureKnowledgePoi = (name, entity) => {
  const matchedPlace = Object.values(categoryData).flatMap(category => category.places).find(place => place[0] === name);
  return {
    id: entity?.knowledgeRef || entity?.id || name,
    wishlistId: entity?.knowledgeRef || entity?.id || name,
    name,
    kind: entity?.type || 'merchant',
    image: entity?.image || 'assets/map.png',
    address: formatPoiAddress(entity?.address || matchedPlace?.[4]),
    intro: entity?.intro || '本地推荐商户，适合顺路到访。',
    distance: '距你 1.8 km'
  };
};
const renderPoiActionCard = poi => {
  const name = escapeHTML(poi.name || '目的地');
  const image = assetUrl(poi.image || 'assets/map.png');
  const distance = escapeHTML(formatPoiDistance(poi.distance));
  const address = escapeHTML(formatPoiAddress(poi.address));
  const wishlistId = escapeHTML(poi.wishlistId || poi.id || poi.name || 'poi');
  const kind = escapeHTML(poi.kind || 'merchant');
  const added = isWishlistItemAdded(poi.wishlistId || poi.id || poi.name);
  const visitedKey = poi.visitedKey || '';
  const visited = Boolean(visitedKey) && isWishlistItemVisited(visitedKey);
  const wishlistButton = `<button type="button" class="poi-card-action poi-card-wishlist${added ? ' is-added' : ''}" data-poi-wishlist="${wishlistId}" data-poi-wishlist-name="${name}" data-poi-wishlist-kind="${kind}" aria-pressed="${added}" aria-label="${added ? `从心愿单移除${name}` : `加入心愿单${name}`}" title="${added ? '取消心愿单' : '加入心愿单'}">${icons.cardHeart}</button>`;
  const chatButton = `<button type="button" class="poi-card-action poi-card-chat" data-poi-chat aria-label="咨询${name}" title="拉起对话">${icons.chat}</button>`;
  const body = visitedKey
    ? `<strong title="${name}" data-poi-detail role="button" tabindex="0">${name}</strong><button type="button" class="poi-address-navigate" data-poi-navigate aria-label="导航到${name}" title="导航到${address}">${icons.navigation}<span>${address}</span></button><div class="poi-card-footer"><button type="button" class="poi-visit-toggle${visited ? ' is-visited' : ''}" data-poi-visited-toggle aria-pressed="${String(visited)}">${visited ? '去过了' : '还没去'}</button><div class="poi-card-actions">${wishlistButton}${chatButton}</div></div>`
    : `<strong title="${name}" data-poi-detail role="button" tabindex="0">${name}</strong><button type="button" class="poi-address-navigate" data-poi-navigate aria-label="导航到${name}" title="导航到${address}">${icons.navigation}<span>${address}</span></button><div class="poi-card-actions poi-card-actions-compact">${wishlistButton}${chatButton}</div>`;
  return `<div class="wishlist-poi-card-image" data-poi-detail role="button" tabindex="0" aria-label="查看${name}详情"><img src="${image}" alt="${name}"></div><button type="button" class="poi-card-close" data-poi-card-close aria-label="关闭地点卡片" title="关闭">${icons.close}</button><div class="wishlist-poi-card-content poi-action-card-content">${body}</div>`;
};
function updatePoiWishlistAction(button) {
  if (!button) return;
  const added = isWishlistItemAdded(button.dataset.poiWishlist);
  button.classList.toggle('is-added', added);
  button.setAttribute('aria-pressed', String(added));
  button.setAttribute('aria-label', `${added ? '从心愿单移除' : '加入心愿单'}${button.dataset.poiWishlistName || ''}`);
  button.title = added ? '取消心愿单' : '加入心愿单';
}
function consultEntityCard(entity) {
  if (!entity?.name || entity.enabled === false) return;
  const prompt = currentLanguage === 'en'
    ? `Tell me about “${entity.name}” using the available place information. Give a useful introduction first and ask a follow-up only if needed. Do not invent opening hours, prices or distances.`
    : `我想咨询“${entity.name}”。请根据已有资料先介绍它及适合的游玩或消费场景，再按需追问；不要编造营业时间、价格或距离。`;
  sendComposerMessage(prompt, { preserveDraft: true });
  openActiveConversation('half');
}
const bindPoiCardActions = poi => {
  const navigateButton = markerCard?.querySelector('[data-poi-navigate]');
  const wishlistButton = markerCard?.querySelector('[data-poi-wishlist]');
  const chatButton = markerCard?.querySelector('[data-poi-chat]');
  const visitedButton = markerCard?.querySelector('[data-poi-visited-toggle]');
  const closeButton = markerCard?.querySelector('[data-poi-card-close]');
  markerCard?.querySelectorAll('[data-poi-detail]').forEach(target => {
    target.addEventListener('click', () => { saveProductReturn(); location.href = poiDetailHref(poi); });
    target.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); saveProductReturn(); location.href = poiDetailHref(poi); }
    });
  });
  closeButton?.addEventListener('click', closePoiCard);
  navigateButton?.addEventListener('click', () => { location.href = poiNavigationHref(poi); });
  visitedButton?.addEventListener('click', () => {
    updateWishlistItemVisited(poi.visitedKey, !isWishlistItemVisited(poi.visitedKey));
    markerCard.innerHTML = renderPoiActionCard(poi);
    bindPoiCardActions(poi);
  });
  wishlistButton?.addEventListener('click', () => {
    const itemId = wishlistButton.dataset.poiWishlist;
    if (isWishlistItemAdded(itemId)) {
      removeWishlistItem(itemId);
      if (poi.visitedKey) {
        renderWishlistPoi(activeWishlistMapItems.filter(item => item.key !== poi.visitedKey), activeWishlistMapLabel);
      }
      updatePoiWishlistAction(wishlistButton);
      notify(`已从心愿单移除${poi.name}`);
      return;
    }
    wishlistButton.classList.add('is-added');
    wishlistButton.setAttribute('aria-label', `从心愿单移除${poi.name}`);
    wishlistButton.title = '取消心愿单';
    addWishlistItem({ id: itemId, name: wishlistButton.dataset.poiWishlistName || poi.name, kind: wishlistButton.dataset.poiWishlistKind || 'merchant' }, wishlistButton);
    updatePoiWishlistAction(wishlistButton);
    notify(`已加入心愿单：${poi.name}`);
  });
  chatButton?.addEventListener('click', () => consultEntityCard(poi));
};
const appendCategoryMarker = (key, config, point, index, animationIndex = index) => {
  const place = config.places[index];
  const marker = document.createElement('button');
  const markerIcon = { eat: icons.food, stay: icons.hotel, tour: icons.flag, travel: icons.flag, shop: icons.bag }[key] || icons.pin;
  const markerColor = { eat: '#f5a032', stay: '#168bd0', tour: '#ef5e87', travel: '#ef5e87', shop: '#22a878' }[key] || config.color[index % config.color.length];
  marker.className = `marker category-marker category-marker-${key}`;
  marker.innerHTML = `<span>${markerIcon}</span>`;
  marker.style.cssText = `left:${point[0]}%;top:${point[1]}%;--marker:${markerColor};animation-delay:${animationIndex * 25}ms`;
  realMap?.setMarkerPoint(marker, point);
  marker.setAttribute('aria-label', place[0]);
  marker.addEventListener('click', () => {
    markerLayer.querySelectorAll('.marker').forEach(item => item.classList.remove('active'));
    marker.classList.add('active');
    activeMarkerPoint = point;
    const source = trustSources[index % trustSources.length];
    rememberPlace(place, source, key === 'travel' ? 'tour' : key);
    const poi = {
      id: `category-${key}-${index}`,
      wishlistId: `category-${key}-${index}`,
      name: place[0],
      kind: 'merchant',
      image: place[6],
      address: place[4],
      intro: place[3],
      distance: `距你 ${((index + 1) * .8).toFixed(1)} km`
    };
    markerCard.innerHTML = renderPoiActionCard(poi);
    markerCard.classList.add('show', 'wishlist-poi-card', 'poi-action-card');
    window.requestAnimationFrame(() => positionMarkerCard(point));
    bindPoiCardActions(poi);
  });
  markerLayer.appendChild(marker);
};
function renderMarkers(key = 'eat') {
  wishlistMapDisplayMode = 'nearby';
  realMap?.clearPlan?.();
  if (!markerLayer || !categoryData[key]) return;
  markerLayer.innerHTML = '';
  markerCard?.classList.remove('show', 'wishlist-poi-card', 'poi-action-card');
  activeMarkerPoint = null;
  const config = categoryData[key];
  config.points.forEach((point, index) => appendCategoryMarker(key, config, point, index));
}
function renderAllNearbyPois() {
  wishlistMapDisplayMode = 'nearby';
  realMap?.clearPlan?.();
  if (!markerLayer) return;
  markerLayer.innerHTML = '';
  markerCard?.classList.remove('show', 'wishlist-poi-card', 'poi-action-card');
  activeMarkerPoint = null;
  let animationIndex = 0;
  ['eat', 'stay', 'tour', 'shop'].forEach(key => {
    const config = categoryData[key];
    config.points.forEach((point, index) => {
      appendCategoryMarker(key, config, point, index, animationIndex);
      animationIndex += 1;
    });
  });
}
const truncateWishlistPoiName = name => {
  const chars = Array.from(String(name || ''));
  return chars.length > 10 ? `${chars.slice(0, 10).join('')}...` : chars.join('');
};
const wishlistPoiPopularity = (item, index) => {
  const values = {
    'wishlist-toudao': 128,
    'wishlist-chicken-feet': 76,
    'wishlist-xijiao': 54,
    'merchant-xuantian-lake-view-hotpot': 143,
    'merchant-xuantian-lake-dragon-hotpot': 116
  };
  return values[item.key?.replace(/-\d+$/, '')] || Math.max(24, 92 - index * 11);
};
function refreshWishlistMarkerVisitedColors() {
  markerLayer?.querySelectorAll('.wishlist-poi[data-wishlist-key]').forEach(marker => {
    marker.classList.toggle('is-visited', wishlistMapDisplayMode === 'plan' && isWishlistItemVisited(marker.dataset.wishlistKey));
  });
}
renderWishlistPoi = (items, groupLabel, options = {}) => {
  realMap?.clearPlan?.();
  if (!markerLayer) return;
  const { showVisitedColors = wishlistMapDisplayMode === 'plan' } = options;
  // Wishlist browsing is not a computed route. Only showConversationRoute may
  // draw an itinerary; legacy session selections must not recreate demo lines.
  const connect = false;
  if (wishlistMapDisplayMode === 'route') wishlistMapDisplayMode = 'preview';
  const activeKeys = new Set(getMapWishlistRows().map(item => item.key));
  const visibleItems = (items || []).filter(item => activeKeys.has(item.key));
  activeWishlistMapItems = visibleItems;
  activeWishlistMapLabel = groupLabel;
  const poiPoints = [[50, 60], [66, 47], [42, 38], [75, 66], [31, 55]];
  markerLayer.innerHTML = '';
  markerCard?.classList.remove('show', 'wishlist-poi-card', 'poi-action-card');
  const poiDetails = {
    'wishlist-toudao': { image: 'assets/头刀菜.jpeg', price: '¥48 起', distance: '距你 1.2km' },
    'wishlist-chicken-feet': { image: 'assets/泡椒凤爪.png', price: '¥28 起', distance: '距你 1.6km' },
    'wishlist-xijiao': { image: 'assets/西郊雅社-1.jpeg', intro: '湖畔庭院民宿，适合慢住看景。', distance: '距你 2.4km' }
  };
  const chronologicalItems = visibleItems.slice().sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
  if (connect && chronologicalItems.length > 1) {
    const route = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    route.classList.add('wishlist-poi-route');
    route.setAttribute('viewBox', '0 0 100 100');
    route.setAttribute('preserveAspectRatio', 'none');
    route.setAttribute('aria-hidden', 'true');
    const routeLine = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    routeLine.setAttribute('points', chronologicalItems.map((_, index) => poiPoints[index % poiPoints.length].join(',')).join(' '));
    realMap?.setRoutePoints(routeLine, chronologicalItems.map((_, index) => poiPoints[index % poiPoints.length]));
    route.append(routeLine);
    markerLayer.append(route);
  }
  chronologicalItems.forEach((item, index) => {
    const point = poiPoints[index % poiPoints.length];
    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = 'wishlist-poi';
    marker.style.pointerEvents = 'auto';
    marker.dataset.wishlistKey = item.key;
    if (showVisitedColors && isWishlistItemVisited(item.key)) marker.classList.add('is-visited');
    marker.style.left = `${point[0]}%`;
    marker.style.top = `${point[1]}%`;
    realMap?.setMarkerPoint(marker, point);
    const popularity = wishlistPoiPopularity(item, index);
    const category = getWishlistCategory(item);
    const categoryIcon = { eat: icons.food, stay: icons.hotel, tour: icons.flag, shop: icons.bag }[category] || icons.pin;
    marker.innerHTML = `<span class="wishlist-poi-type wishlist-poi-type-${category}">${categoryIcon}</span><span class="wishlist-poi-name">${escapeHTML(truncateWishlistPoiName(item.name))}</span>`;
    marker.setAttribute('aria-label', `${item.name}，心愿单地点`);
    marker.addEventListener('click', () => {
      const detail = poiDetails[item.key] || { image: item.kind === 'merchant' ? 'assets/西郊雅社-1.jpeg' : 'assets/头刀菜.jpeg', price: '¥39 起', distance: `距你 ${(index + 1) * .8 + .6}km` };
      markerLayer.querySelectorAll('.wishlist-poi').forEach(poi => poi.classList.remove('active'));
      marker.classList.add('active');
      activeMarkerPoint = point;
      const poi = {
        id: item.key.replace(/-\d+$/, ''),
        wishlistId: item.key.replace(/-\d+$/, ''),
        visitedKey: item.key,
        popularity,
        name: item.name,
        kind: item.kind,
        image: detail.image,
        address: detail.address || '玄天湖周边',
        intro: detail.intro || detail.price || '本地特色商户，为您提供安心服务。',
        distance: detail.distance
      };
      markerCard.innerHTML = renderPoiActionCard(poi);
      markerCard.classList.add('show', 'wishlist-poi-card', 'poi-action-card');
      window.requestAnimationFrame(() => positionMarkerCard(point));
      bindPoiCardActions(poi);
    });
    markerLayer.append(marker);
  });
  realMap?.sync();
  if (!visibleItems.length) notify(`${groupLabel}暂无可呈现的心愿 POI`);
};
if (new URLSearchParams(location.search).get('wishlistMap') === 'selected') {
  try {
    const selectedRows = JSON.parse(sessionStorage.getItem('tongliang-wishlist-map-selection-v1') || '[]');
    if (Array.isArray(selectedRows) && selectedRows.length > 1) {
      wishlistMapDisplayMode = 'plan';
      renderWishlistPoi(selectedRows, '已选心愿', { connect: true, showVisitedColors: true });
    }
  } catch (_) {}
}
renderMarqueePoi = item => {
  wishlistMapDisplayMode = 'nearby';
  realMap?.clearPlan?.();
  if (!markerLayer || !markerCard || !item) return;
  const point = [51, 58];
  markerLayer.innerHTML = '';
  markerCard.classList.remove('show', 'wishlist-poi-card', 'poi-action-card');
  const marker = document.createElement('button');
  marker.type = 'button';
  marker.className = 'wishlist-poi wishlist-poi-single';
  marker.style.pointerEvents = 'auto';
  marker.style.left = `${point[0]}%`;
  marker.style.top = `${point[1]}%`;
  realMap?.setMarkerPoint(marker, point);
  const category = getWishlistCategory(item);
  const categoryIcon = { eat: icons.food, stay: icons.hotel, tour: icons.flag, shop: icons.bag }[category] || icons.pin;
  marker.innerHTML = `<span class="wishlist-poi-type wishlist-poi-type-${category}">${categoryIcon}</span><span class="wishlist-poi-name">${escapeHTML(truncateWishlistPoiName(item.name))}</span>`;
  marker.setAttribute('aria-label', item.name);
  marker.addEventListener('click', () => {
    marker.classList.add('active');
    activeMarkerPoint = point;
    const poi = {
      id: item.id,
      wishlistId: item.id,
      name: item.name,
      kind: item.kind,
      image: item.image,
      address: item.address || '玄天湖周边',
      intro: item.intro,
      distance: item.distance || '距你 1.8 km'
    };
    markerCard.innerHTML = renderPoiActionCard(poi);
    markerCard.classList.add('show', 'wishlist-poi-card', 'poi-action-card');
    window.requestAnimationFrame(() => positionMarkerCard(point));
    bindPoiCardActions(poi);
  });
  markerLayer.append(marker);
  realMap?.focusPoint(point);
};
// Category labels are separate from the colored icon and its 44px touch target.
const mapCategoryCopy = {
  zh: { eat: '美食', stay: '住宿', tour: '游玩', shop: '购物', wishlist: '心愿单' },
  en: { eat: 'Food', stay: 'Stay', tour: 'Explore', shop: 'Shopping', wishlist: 'Wishlist' }
};
const mapCategoryBar = mapScreen?.querySelector('.category-bar');
const mapCategoryHint = mapCategoryBar ? document.createElement('div') : null;
let mapCategoryHintTimer = null;
let mapCategoryHintButton = null;
if (mapCategoryHint) {
  mapCategoryHint.className = 'map-category-hint';
  mapCategoryHint.hidden = true;
  mapCategoryHint.setAttribute('role', 'status');
  mapCategoryHint.setAttribute('aria-live', 'polite');
  mapCategoryHint.setAttribute('aria-atomic', 'true');
  mapCategoryBar.append(mapCategoryHint);
  mapCategoryBar.addEventListener('keydown', event => {
    if (event.key === 'Escape') hideMapCategoryHint();
  });
}
function hideMapCategoryHint() {
  window.clearTimeout(mapCategoryHintTimer);
  mapCategoryHintTimer = null;
  mapCategoryHintButton = null;
  if (mapCategoryHint) mapCategoryHint.hidden = true;
}
function updateMapCategoryLanguage() {
  const labels = mapCategoryCopy[currentLanguage] || mapCategoryCopy.zh;
  mapCategoryBar?.querySelectorAll('.category').forEach(button => {
    const label = labels[button.dataset.category];
    if (label) button.setAttribute('aria-label', label);
  });
  if (mapCategoryHintButton && mapCategoryHint) {
    mapCategoryHint.textContent = mapCategoryHintText(mapCategoryHintButton);
  }
}
function mapCategoryHintText(button) {
  if (button.dataset.category === 'wishlist' && button.getAttribute('aria-disabled') === 'true') {
    return currentLanguage === 'en' ? 'Your wishlist is empty' : '心愿单暂无内容';
  }
  return (mapCategoryCopy[currentLanguage] || mapCategoryCopy.zh)[button.dataset.category];
}
function showMapCategoryHint(button) {
  if (!mapCategoryHint || button.disabled) return;
  const label = mapCategoryHintText(button);
  if (!label) return;
  hideMapCategoryHint();
  mapCategoryHintButton = button;
  mapCategoryHint.textContent = label;
  mapCategoryHint.style.top = `${button.offsetTop + button.offsetHeight / 2}px`;
  mapCategoryHint.hidden = false;
  mapCategoryHintTimer = window.setTimeout(hideMapCategoryHint, 2000);
}
updateMapCategoryLanguage();

const syncMapCategoryState = activeKey => {
  const wishlistRows = getMapWishlistRows();
  mapScreen?.querySelectorAll('.category').forEach(button => {
    const isWishlist = button.dataset.category === 'wishlist';
    button.classList.toggle('active', button.dataset.category === activeKey);
    // Keep unavailable wishlist filtering disabled, but allow taps to explain why.
    button.disabled = false;
    button.setAttribute('aria-disabled', String(isWishlist && wishlistRows.length === 0));
    if (isWishlist) button.title = wishlistRows.length ? '查看我的心愿单点位' : '心愿单暂无内容';
  });
};
renderDefaultMapPois = () => {
  const rows = selectAllMapWishlist();
  if (rows.length) {
    wishlistMapDisplayMode = 'preview';
    syncMapCategoryState('wishlist');
    renderWishlistPoi(rows, '我的心愿单', { connect: false, showVisitedColors: false });
    return;
  }
  syncMapCategoryState('');
  renderAllNearbyPois();
};
function renderPlanMarkers() {
  if (!markerLayer) return;
  markerLayer.innerHTML = '';
  markerCard?.classList.remove('show', 'wishlist-poi-card', 'poi-action-card');
  let completedStopIndex = -1;
  try { completedStopIndex = Math.max(-1, Math.min(Number(localStorage.getItem(planProgressKey) ?? -1), weekendPlanStops.length - 1)); } catch (_) {}
  const route = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  route.classList.add('plan-route-layer');
  route.setAttribute('viewBox', '0 0 100 100');
  route.setAttribute('preserveAspectRatio', 'none');
  route.setAttribute('aria-hidden', 'true');
  weekendPlanStops.slice(0, -1).forEach((stop, index) => {
    const next = weekendPlanStops[index + 1];
    const segment = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    segment.setAttribute('x1', stop.point[0]);
    segment.setAttribute('y1', stop.point[1]);
    segment.setAttribute('x2', next.point[0]);
    segment.setAttribute('y2', next.point[1]);
    realMap?.setRoutePoints(segment, [stop.point, next.point]);
    segment.classList.add(index < completedStopIndex ? 'is-complete' : 'is-upcoming');
    route.appendChild(segment);
  });
  markerLayer.appendChild(route);
  weekendPlanStops.forEach((stop, index) => {
    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = 'marker plan-marker';
    marker.classList.add(index <= completedStopIndex ? 'is-complete' : 'is-upcoming');
    marker.classList.toggle('label-align-left', stop.point[0] > 68);
    marker.style.cssText = `left:${stop.point[0]}%;top:${stop.point[1]}%;animation-delay:${index * 35}ms`;
    realMap?.setMarkerPoint(marker, stop.point);
    marker.innerHTML = `<span class="plan-marker-number">${index + 1}</span><span class="plan-marker-label">${escapeHTML(stop.name)}</span>`;
    marker.setAttribute('aria-label', `${index + 1}. ${stop.day} ${stop.time} ${stop.name}`);
    marker.addEventListener('click', () => {
      markerLayer.querySelectorAll('.plan-marker').forEach(item => item.classList.remove('active'));
      marker.classList.add('active');
      completedStopIndex = Math.max(completedStopIndex, index);
      try { localStorage.setItem(planProgressKey, String(completedStopIndex)); } catch (_) {}
      renderPlanMarkers();
      markerLayer.querySelectorAll('.plan-marker')[index]?.classList.add('active');
    });
    markerLayer.appendChild(marker);
  });
  realMap?.sync();
}

document.querySelectorAll('.category').forEach(button => {
  button.addEventListener('click', () => {
    showMapCategoryHint(button);
    if (button.getAttribute('aria-disabled') === 'true') return;
    markerCard?.classList.remove('show', 'wishlist-poi-card', 'poi-action-card');
    if (button.dataset.category === 'wishlist') {
      const rows = selectAllMapWishlist();
      if (!rows.length) {
        syncMapCategoryState('');
        renderAllNearbyPois();
        notify('心愿单暂无内容，已展示当前位置周边 POI');
        return;
      }
      syncMapCategoryState('wishlist');
      renderWishlistPoi(rows, '我的心愿单');
      return;
    }
    syncMapCategoryState(button.dataset.category);
    renderMarkers(button.dataset.category);
  });
});
if (mapScreen && !embeddedMapHost) renderDefaultMapPois();
if (mapScreen && new URLSearchParams(location.search).get('showProductPoi') === '1') {
  try {
    const storedProductPoi = JSON.parse(sessionStorage.getItem('tongliang-product-map-poi-v1') || 'null');
    sessionStorage.removeItem('tongliang-product-map-poi-v1');
    if (storedProductPoi?.name) {
      switchConsumerBackground('map');
      renderMarqueePoi(storedProductPoi);
    }
  } catch (_) {}
}
mapLocate?.addEventListener('click', () => {
  if (realMap) {
    realMap.recenter();
  } else if (mapCurrentLocation) {
    mapCurrentLocation.style.left = '50%';
    mapCurrentLocation.style.top = '50%';
    mapCurrentLocation.classList.remove('is-recentering');
    window.requestAnimationFrame(() => mapCurrentLocation.classList.add('is-recentering'));
  }
  wishlistMapDisplayMode = 'nearby';
  syncMapCategoryState('');
  renderAllNearbyPois();
  notify(realMap ? '已回到玄天湖，商户点位为演示，非实际定位' : '已回到当前位置，并显示 5km 内吃住游购 POI');
});

const featureCarousel = document.querySelector('[data-feature-carousel]');
let updateFeatureCarouselLanguage = () => {};
if (featureCarousel) {
  const featureTrack = featureCarousel.querySelector('.feature-gallery-track');
  const fallbackSlides = Array.from(featureTrack.querySelectorAll('[data-feature-slide]')).slice(0, 10);
  let featureSlides = [];
  let featureCount = 0;
  let featureCloneCount = 0;
  let featureLanguage = '';
  const featurePositions = new Map();
  const featureAutoDelay = 3000;
  const featureReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let featureStartIndex = 0;
  let featurePointer = null;
  let featureSuppressClick = false;
  let featureAnimating = false;
  let featureAutoTimer = null;
  let featureTransitionTimer = null;
  const wrapFeatureIndex = index => ((index % featureCount) + featureCount) % featureCount;

  // Buffer both ends so the last-to-first transition travels in the same direction.
  const makeFeatureClone = index => {
    const clone = featureSlides[wrapFeatureIndex(index)].cloneNode(true);
    clone.dataset.featureClone = 'true';
    clone.setAttribute('aria-hidden', 'true');
    clone.tabIndex = -1;
    return clone;
  };
  const featureStep = () => {
    const cardWidth = featureSlides[0]?.getBoundingClientRect().width || 0;
    const cardGap = Number.parseFloat(window.getComputedStyle(featureTrack).gap) || 0;
    return { cardWidth, step: cardWidth + cardGap };
  };
  const renderFeatureCarousel = (animate = false, dragOffset = 0) => {
    const { cardWidth, step } = featureStep();
    const offset = !featureCount ? 0 : featureCount > 1
      ? -(featureCloneCount * step + cardWidth / 2 + (featureStartIndex - 1) * step) + dragOffset
      : (featureCarousel.clientWidth - cardWidth) / 2;
    featureTrack.style.transition = animate && !featureReducedMotion.matches ? '' : 'none';
    featureCarousel.style.setProperty('--feature-gallery-offset', `${offset}px`);
    featureCarousel.setAttribute('aria-label', featureLanguage === 'en'
      ? `Tongliang highlights, ${featureCount} images${featureCount > 1 ? ', swipe left or right to loop' : ''}`
      : `铜梁特色推荐，共${featureCount}张${featureCount > 1 ? '，可左右循环滑动' : ''}`);
    if (!animate) void featureTrack.offsetWidth;
  };
  const finishFeatureTransition = () => {
    window.clearTimeout(featureTransitionTimer);
    featureTransitionTimer = null;
    featureAnimating = false;
    if (featureCount) featureStartIndex = wrapFeatureIndex(featureStartIndex);
    renderFeatureCarousel();
  };
  const stopFeatureAutoplay = () => {
    window.clearTimeout(featureAutoTimer);
    featureAutoTimer = null;
  };
  const scheduleFeatureAutoplay = () => {
    stopFeatureAutoplay();
    if (featureCount < 2 || featureReducedMotion.matches || document.hidden || featurePointer) return;
    featureAutoTimer = window.setTimeout(() => {
      const keyboardFocused = featureCarousel.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
      const obscured = planScreen?.classList.contains('is-map-active')
        || drawerPhone?.classList.contains('is-drawer-open')
        || drawerPhone?.classList.contains('is-wishlist-open');
      if (!keyboardFocused && !obscured) changeFeatureSlide(1);
      else scheduleFeatureAutoplay();
    }, featureAutoDelay);
  };
  const changeFeatureSlide = direction => {
    if (featureCount < 2) return;
    if (featureAnimating) finishFeatureTransition();
    featureStartIndex += direction;
    featureAnimating = true;
    renderFeatureCarousel(true);
    featureTransitionTimer = window.setTimeout(finishFeatureTransition, featureReducedMotion.matches ? 0 : 360);
    scheduleFeatureAutoplay();
  };
  resetFeatureCarouselGesture = () => {
    const pointer = featurePointer;
    featurePointer = null;
    if (pointer && featureCarousel.hasPointerCapture?.(pointer.id)) featureCarousel.releasePointerCapture(pointer.id);
    featureCarousel.classList.remove('is-dragging');
    finishFeatureTransition();
    scheduleFeatureAutoplay();
  };
  const openFeatureConversation = slide => {
    const action = slide.dataset.featureAction;
    if (action) {
      const [type, key] = action.split(':');
      if (type === 'guide') appendFeatureKnowledgeGuide(key, slide.dataset.featurePrompt);
      else if (type === 'journey') appendJourneyRecommendation(key, '', slide.dataset.featurePrompt);
      return;
    }
    // Retain the original bindings only for the embedded Chinese fallback.
    const index = Number(slide.dataset.featureSlide);
    const featureActions = [
      () => appendFeatureKnowledgeGuide('xuantian-lake'),
      () => appendFeatureKnowledgeGuide('weekend'),
      () => appendFeatureKnowledgeGuide('xuantian-lake-ride'),
      () => appendJourneyRecommendation('event'),
      () => appendJourneyRecommendation('food'),
      () => appendJourneyRecommendation('boat'),
      () => appendJourneyRecommendation('local-03'),
      () => appendJourneyRecommendation('local-18'),
      () => appendJourneyRecommendation('local-10')
    ];
    featureActions[index]?.();
  };

  updateFeatureCarouselLanguage = (force = false) => {
    const language = currentLanguage === 'en' ? 'en' : 'zh';
    if (featureLanguage === language && !force) return;
    stopFeatureAutoplay();
    window.clearTimeout(featureTransitionTimer);
    featureTransitionTimer = null;
    featureAnimating = false;
    if (featureLanguage) featurePositions.set(featureLanguage, featureCount ? wrapFeatureIndex(featureStartIndex) : 0);
    if (force) featurePositions.clear();
    const pointer = featurePointer;
    featurePointer = null;
    if (pointer && featureCarousel.hasPointerCapture?.(pointer.id)) featureCarousel.releasePointerCapture(pointer.id);
    featureCarousel.classList.remove('is-dragging');
    featureSuppressClick = false;
    const returnFocus = featureTrack.contains(document.activeElement);
    featureLanguage = language;
    const configured = window.TongliangHomeThemes?.getSlides(language) ?? window.TongliangFeatureContent?.locales?.[language];
    const ids = new Set();
    // A missing English configuration must never reuse baked-in Chinese images.
    featureSlides = Array.isArray(configured) ? configured.filter(item => {
      if (!item || item.enabled === false || typeof item.id !== 'string' || !item.id || ids.has(item.id)
        || typeof item.image !== 'string' || !item.image.startsWith('assets/')
        || typeof item.alt !== 'string' || !item.alt.trim()
        || typeof item.action !== 'string' || !/^(guide|journey):[a-z0-9-]+$/.test(item.action)) return false;
      ids.add(item.id);
      return true;
    }).slice(0, 10).map((item, index) => {
      const slide = document.createElement('button');
      slide.type = 'button';
      slide.className = 'feature-gallery-slide';
      slide.dataset.featureSlide = String(index);
      slide.dataset.featureId = item.id;
      slide.dataset.featureAction = item.action;
      slide.dataset.featurePrompt = typeof item.prompt === 'string' ? item.prompt.trim() : '';
      slide.setAttribute('aria-label', language === 'en' ? `Explore ${item.alt}` : `查看${item.alt}`);
      const image = document.createElement('img');
      image.src = assetUrl(item.image);
      image.alt = item.alt;
      slide.append(image);
      if (typeof item.caption === 'string' && item.caption.trim()) {
        const caption = document.createElement('span');
        caption.className = 'feature-gallery-caption';
        caption.textContent = item.caption;
        caption.setAttribute('aria-hidden', 'true');
        slide.append(caption);
      }
      return slide;
    }) : (language === 'zh' ? fallbackSlides : []);
    featureCount = featureSlides.length;
    featureCloneCount = featureCount > 1 ? 4 : 0;
    const storedPosition = featurePositions.get(language);
    featureStartIndex = featureCount ? (storedPosition === undefined ? (featureCount > 1 ? 1 : 0) : storedPosition % featureCount) : 0;
    featureTrack.replaceChildren(...featureSlides);
    if (featureCloneCount) {
      featureTrack.prepend(...Array.from({ length: featureCloneCount }, (_, index) => makeFeatureClone(index - featureCloneCount)));
      featureTrack.append(...Array.from({ length: featureCloneCount }, (_, index) => makeFeatureClone(index)));
    }
    featureTrack.querySelectorAll('img').forEach(image => {
      image.draggable = false;
      image.addEventListener('error', () => {
        image.hidden = true;
        const slide = image.closest('[data-feature-slide]');
        slide.classList.add('is-image-unavailable');
        let caption = slide.querySelector('.feature-gallery-caption');
        if (!caption) {
          caption = document.createElement('span');
          caption.className = 'feature-gallery-caption';
          slide.append(caption);
        }
        caption.textContent = language === 'en' ? `${image.alt} — Image unavailable` : `${image.alt} — 图片暂不可用`;
      }, { once: true });
    });
    if (!featureCount) {
      const empty = document.createElement('p');
      empty.className = 'feature-gallery-empty';
      empty.textContent = language === 'en' ? 'No highlights available in English yet.' : '暂无特色推荐';
      featureTrack.append(empty);
    }
    renderFeatureCarousel();
    scheduleFeatureAutoplay();
    if (returnFocus) featureCarousel.focus();
  };
  updateFeatureCarouselLanguage();
  featureTrack.addEventListener('transitionend', event => {
    if (featureAnimating && event.target === featureTrack && event.propertyName === 'transform') finishFeatureTransition();
  });
  featureCarousel.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.isPrimary === false || featurePointer || drawerPhone?.classList.contains('is-drawer-open')) return;
    stopFeatureAutoplay();
    if (featureAnimating) finishFeatureTransition();
    featureSuppressClick = false;
    featurePointer = { id: event.pointerId, x: event.clientX, y: event.clientY, dragging: false };
  });
  featureCarousel.addEventListener('pointermove', event => {
    if (!featurePointer || event.pointerId !== featurePointer.id || featureCount < 2) return;
    const distance = event.clientX - featurePointer.x;
    const vertical = event.clientY - featurePointer.y;
    if (!featurePointer.dragging && Math.abs(vertical) > 8 && Math.abs(vertical) > Math.abs(distance)) {
      featureSuppressClick = true;
      resetFeatureCarouselGesture();
      return;
    }
    if (!featurePointer.dragging && Math.abs(distance) > 8) {
      featurePointer.dragging = true;
      featureSuppressClick = true;
      featureCarousel.setPointerCapture?.(event.pointerId);
      featureCarousel.classList.add('is-dragging');
    }
    if (featurePointer.dragging) {
      const { step } = featureStep();
      renderFeatureCarousel(false, Math.max(-step, Math.min(step, distance)));
    }
  });
  featureCarousel.addEventListener('pointerup', event => {
    if (!featurePointer || event.pointerId !== featurePointer.id) return;
    const distance = event.clientX - featurePointer.x;
    const dragged = featurePointer.dragging;
    if (drawerPhone?.classList.contains('is-drawer-open')) {
      resetFeatureCarouselGesture();
      return;
    }
    resetFeatureCarouselGesture();
    if (dragged) {
      const { step } = featureStep();
      renderFeatureCarousel(false, Math.max(-step, Math.min(step, distance)));
      changeFeatureSlide(Math.abs(distance) > 24 ? (distance > 0 ? -1 : 1) : 0);
    }
  });
  featureCarousel.addEventListener('click', event => {
    if (featureSuppressClick && event.detail !== 0) {
      event.preventDefault();
      event.stopPropagation();
      featureSuppressClick = false;
      return;
    }
    const slide = event.target.closest?.('[data-feature-slide]');
    if (slide && featureCarousel.contains(slide) && !drawerPhone?.classList.contains('is-drawer-open')) {
      openFeatureConversation(slide);
    }
  });
  featureCarousel.addEventListener('pointercancel', resetFeatureCarouselGesture);
  featureCarousel.addEventListener('lostpointercapture', () => {
    if (featurePointer) resetFeatureCarouselGesture();
  });
  featureCarousel.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    changeFeatureSlide(event.key === 'ArrowLeft' ? -1 : 1);
  });
  featureCarousel.addEventListener('dragstart', event => event.preventDefault());
  featureCarousel.addEventListener('focusout', scheduleFeatureAutoplay);
  document.addEventListener('visibilitychange', () => {
    resetFeatureCarouselGesture();
    if (document.hidden) stopFeatureAutoplay();
  });
  window.addEventListener('resize', resetFeatureCarouselGesture);
  window.addEventListener('pagehide', () => {
    stopFeatureAutoplay();
    window.clearTimeout(featureTransitionTimer);
  });
  window.addEventListener('pageshow', scheduleFeatureAutoplay);
  featureReducedMotion.addEventListener('change', resetFeatureCarouselGesture);
}

const featureKnowledgeGuides = {
  'xuantian-lake': {
    role: 'assistant',
    type: 'feature-knowledge-guide',
    guideKey: 'xuantian-lake',
    thinking: '正在读取玄天湖知识库',
    blocks: [
      { type: 'lead', text: '已根据文旅知识库整理玄天湖景区信息' },
      { type: 'title', text: '重庆铜梁玄天湖景区' },
      { type: 'fact', label: '景区信息', text: '4A 景区，包含玄天湖和巴岳山；资料登记开放时间为 5:00-22:00，无需预约。' },
      { type: 'text', text: '景区设有约 10 公里环湖绿道，可体验观光车、自行车、小火车和游船等服务。' },
      { type: 'fact', label: '游览服务', text: '知识库记录有生态停车场、公共厕所、游客服务中心和绿道服务站。' },
      { type: 'text', text: '如需安排《追梦·铜梁龙非遗山水实景剧》或景区餐饮，请在出发前查询实时场次、营业和预约状态。' },
      { type: 'knowledge-recommendations', title: '关联推荐', items: [
        { name: '玄天湖', type: 'poi', meta: '游 · 景区 POI' },
        { name: '铜梁龙舞展演', type: 'activity', meta: '游 · 活动场次需实时确认' },
        { name: '玄天湖龙火锅（龙舞广场店）', type: 'merchant', meta: '吃 · 营业与排位需实时确认' },
        { name: '重庆西温泉度假酒店', type: 'merchant', meta: '住 · 房态需实时确认' }
      ] },
      { type: 'feature-intent-question', guideKey: 'xuantian-lake', question: '骑行后你想优先解决什么？继续徒步，吃一顿饭，还是，住一晚或买伴手礼？' }
    ],
    intent: { results: ['建议从玄天湖观景和环湖绿道开始，按实时开放状态衔接景区服务。', '建议从玄天湖北门了解自行车与绿道服务，再根据体力选择骑行范围。', '可优先查看玄天湖龙火锅（龙舞广场店）和重庆西温泉度假酒店，营业与房态请以实时信息为准。'] }
  },
  weekend: {
    role: 'assistant',
    type: 'feature-knowledge-guide',
    guideKey: 'weekend',
    thinking: '正在组合周末游玩知识',
    blocks: [
      { type: 'lead', text: '知识库没有固定命名为“周末到铜梁”的线路，已按现有条目组合以下建议' },
      { type: 'title', text: '铜梁周末游玩组合' },
      { type: 'fact', label: '游', text: '可选择玄天湖的环湖绿道与景区服务，或安居古城的古城慢逛、龙文化、古建和湿地休闲。' },
      { type: 'fact', label: '花海', text: '奇彩梦园为 4A 乡村田园景区；资料登记日常开放 8:30-17:30、节假日 8:30-22:00。' },
      { type: 'fact', label: '吃住购', text: '安居古城可关联已确认入驻的涪江山居餐饮、涪江山居民宿和翰林山居民宿；伴手礼可查看风物集市。' },
      { type: 'text', text: '建议按同行人、出行方式和当日活动安排组合上述点位；活动场次、房态、餐饮营业及商品库存请以实时信息为准。' },
      { type: 'knowledge-recommendations', title: '吃住游购关联推荐', items: [
        { name: '玄天湖', type: 'poi', meta: '游 · 山水与环湖绿道' },
        { name: '安居古城', type: 'poi', meta: '游 · 古城慢逛与文化体验' },
        { name: '奇彩梦园', type: 'poi', meta: '游 · 花海与非遗展演' },
        { name: '涪江山居餐饮', type: 'merchant', meta: '吃 · 已确认入驻' },
        { name: '涪江山居民宿', type: 'merchant', meta: '住 · 已确认入驻' },
        { name: '风物集市', type: 'merchant', meta: '购 · 安居古城文创商铺' }
      ] },
      { type: 'feature-intent-question', guideKey: 'weekend', question: '骑行后你想优先解决什么？继续徒步，吃一顿饭，还是，住一晚或买伴手礼？' }
    ],
    intent: { results: ['可优先组合玄天湖环湖绿道与奇彩梦园，活动和开放状态请出发前确认。', '可安排安居古城慢逛，并衔接涪江山居餐饮与古城文化体验。', '可按安居古城-涪江山居餐饮-涪江山居民宿-风物集市组合，房态、营业和库存请以实时信息为准。'] }
  },
  'xuantian-lake-ride': {
    role: 'assistant',
    type: 'feature-knowledge-guide',
    guideKey: 'xuantian-lake-ride',
    thinking: '正在读取玄天湖骑行知识',
    blocks: [
      { type: 'lead', text: '已根据玄天湖景区和游览服务条目整理骑行信息' },
      { type: 'title', text: '玄天湖环湖骑行' },
      { type: 'fact', label: '骑行条件', text: '玄天湖景区资料记录有约 10 公里环湖绿道，并提供自行车等游览服务。' },
      { type: 'fact', label: '出发支持', text: '可从游客服务中心和绿道服务站获取服务信息；景区另有生态停车场和公共厕所。' },
      { type: 'text', text: '骑行前请确认自行车租赁、停车余位、天气和绿道开放情况；这些实时信息不以知识库静态内容替代。' },
      { type: 'text', text: '骑行后如需用餐，可查看玄天湖湖景火锅或玄天湖龙火锅（龙舞广场店）；营业和排位以实时信息为准。' },
      { type: 'knowledge-recommendations', title: '骑行前后关联推荐', items: [
        { name: '巴岳山步道', type: 'poi', meta: '游 · 徒步与观景' },
        { name: '玄天湖环湖骑行', type: 'activity', meta: '游 · 路线与开放状态需实时确认' },
        { name: '玄天湖湖景火锅', type: 'merchant', meta: '吃 · 景区餐饮候选' },
        { name: '巴岳山素食餐厅', type: 'merchant', meta: '吃 · 巴岳寺旁餐饮候选' },
        { name: '西郊雅社民宿', type: 'merchant', meta: '住 · 房态需实时确认' },
        { name: '重庆市铜梁区龙文化传媒有限公司', type: 'merchant', meta: '购 · 文创与非遗伴手礼' }
      ] },
      { type: 'feature-intent-question', guideKey: 'xuantian-lake-ride', question: '骑行后你想优先解决什么？继续徒步，吃一顿饭，还是，住一晚或买伴手礼？' }
    ],
    intent: { results: ['可把巴岳山步道作为后续徒步候选，注意天气、体力和开放状态。', '可查看玄天湖湖景火锅或巴岳山素食餐厅，营业和排位请以实时信息为准。', '可查看西郊雅社民宿及重庆市铜梁区龙文化传媒有限公司，房态和库存请以实时信息为准。'] }
  }
};
const getFeatureKnowledgeGuide = key => featureKnowledgeGuides[key] ? {
  ...featureKnowledgeGuides[key],
  blocks: featureKnowledgeGuides[key].blocks.map(block => ({ ...block }))
} : null;
const journeyRecommendations = {
  water: '周末铜梁玩水：示意推介内容。这里将展示适合亲水游玩的时段、地点、交通方式与安全提醒。',
  ride: {
    type: 'ride-guide',
    thinking: '正在整理玄天湖骑行攻略',
    blocks: [
      { type: 'lead', text: '为你整理了玄天湖骑行精简攻略' },
      { type: 'title', text: '铜梁玄天湖骑行【精简版攻略】' },
      { type: 'fact', label: '📍 导航', text: '玄天湖北门（跑步服务中心）｜景区免费入园' },
      { type: 'amap-link', text: '高德地图为您导航', href: 'https://www.amap.com/search?query=%E7%8E%84%E5%A4%A9%E6%B9%96%E5%8C%97%E9%97%A8%EF%BC%88%E8%B7%91%E6%AD%A5%E6%9C%8D%E5%8A%A1%E4%B8%AD%E5%BF%83%EF%BC%89' },
      { type: 'fact', label: '🅿 停车', text: '北门主停车场首选，12 小时 10 元；车位充足，周末建议 9 点前到。' },
      { type: 'section', text: '🚲 骑行信息' },
      { type: 'text', text: '环湖塑胶绿道 9.2 km，路面平缓，亲子友好。租车（北门起点）：单人车 10 元不限时；双人亲子车 30 元。' },
      { type: 'section', text: '✅ 路线推荐' },
      { type: 'text', text: '完整版（遛娃打卡）：顺时针环湖 2～2.5 小时，可打卡龙形浮桥、天鹅水岸、临湖草坪。' },
      { type: 'text', text: '轻松半圈：北门→金龙卧波桥→天鹅湖折返，约 1 小时，适合老人和小孩。' },
      { type: 'fact', label: '⏰ 最佳时段', text: '早 7:00～10:00 或傍晚 16:30～19:00，避开正午暴晒。' },
      { type: 'section', text: '🍲 吃喝选择' },
      { type: 'text', text: '景区内有北门小吃摊（冰粉、凉面），沿途只有自动贩卖机；就近可选玄天湖鱼庄、田家豆花饭。' },
      { type: 'text', text: '城区餐饮可查看铜梁区三活餐馆、铜梁区原乡头刀菜餐饮店，距离与营业状态以实时信息为准。' },
      { type: 'product-grid', title: '美食推荐', items: [
        { id: 'sanhuochun', name: '铜梁区三活餐馆', image: 'assets/三活春油烧兔.png', meta: '知识库商家' },
        { id: 'toudaocai', name: '铜梁区原乡头刀菜餐饮店', image: 'assets/头刀菜.jpeg', meta: '知识库商家' }
      ] },
      { type: 'section', text: '🏨 住宿与补给' },
      { type: 'text', text: '湖景民宿可选西郊雅社；性价比住宿可选龙城天街连锁酒店。北门游客中心可补给饮用水、零食和铜梁文创。' },
      { type: 'product-grid', title: '住宿推荐', items: [
        { id: 'xijiao-yashe', name: '西郊雅社', image: 'assets/西郊雅社-1.jpeg', meta: '商品展示模板' },
        { id: 'longcheng-hotel', name: '龙城天街连锁酒店', image: 'assets/龙城天街连锁酒店-1.jpeg', meta: '商品展示模板' }
      ] },
      { type: 'section', text: '简易一日行程' },
      { type: 'text', text: '主城出发→玄天湖北门停车租车→环湖骑行拍照→午餐→湖边草坪休整→傍晚骑行追日落→返程。' },
      { type: 'link', text: '要不要地图带你，边走边耍', action: 'explore' }
    ]
  },
  food: '带你去吃头刀肉：示意推介内容。这里将展示推荐门店、招牌菜、排队情况和附近停车信息。',
  fire: '铜梁火龙表演：示意推介内容。这里将展示演出场次、观看位置、入场提醒和周边接驳方案。',
  boat: '安居古镇划龙舟：示意推介内容。这里将展示活动时间、古镇游览路线、观赛位置和出行建议。'
};
const ironFlowerGuide = {
  type: 'event-guide',
  thinking: '正在整理 19:30 打铁花说明',
  blocks: [
    { type: 'lead', text: '已为你整理玄天湖打铁花精简配套说明' },
    { type: 'title', text: '玄天湖打铁花精简配套说明' },
    { type: 'section', text: '一、分清两处打铁花（关键）' },
    { type: 'fact', label: '奇彩梦园（19:30 开场）', text: '纯火龙打铁花专场，19:30～20:30；门票约 68 元。独立花海景区，距玄天湖骑行点驾车约 10 分钟。' },
    { type: 'fact', label: '玄天湖《追梦・铜梁龙》', text: '常规固定 20:30 开演，整场最后 10 分钟打铁花；仅节假日临时加 19:30 早场。可通过“玄天湖文旅”小程序购票，C 区 88 元起，1.2 米以下免票无座。' },
    { type: 'image', src: 'assets/打铁花实景.png', alt: '打铁花实景', caption: '打铁花实景' },
    { type: 'image', src: 'assets/火龙铁花.png', alt: '火龙铁花', caption: '火龙铁花' },
    { type: 'section', text: '二、骑行衔接 19:30 场时间规划' },
    { type: 'text', text: '16:00 玄天湖北门租车环湖（半圈 4.5 km，约 1 小时）。' },
    { type: 'text', text: '17:30 湖边简餐（北门小吃摊 / 田家豆花饭）。' },
    { type: 'text', text: '18:20 驱车前往奇彩梦园停车；19:00 入场等候，19:30 打铁花准时开始。' },
    { type: 'section', text: '三、停车' },
    { type: 'text', text: '玄天湖骑行：北门停车场 10 元 / 12 小时。奇彩梦园观看 19:30 铁花：景区免费停车场。' },
    { type: 'section', text: '四、观演小贴士' },
    { type: 'text', text: '铁花温度极高，别穿浅色或贵重衣物，并远离舞台前排护栏。' },
    { type: 'text', text: '湖边夜间风大，建议带薄外套；带娃可备折叠小板凳。雨天正常打铁花，大风天取消高空火凤凰。' },
    { type: 'section', text: '五、骑行 + 打铁花一日极简路线' },
    { type: 'text', text: '主城→玄天湖北门骑行→湖畔晚餐→奇彩梦园 19:30 打铁花→返程。' }
  ]
};
journeyRecommendations.event = ironFlowerGuide;
const weekendGuide = {
  type: 'weekend-guide',
  thinking: '正在整理重庆铜梁周末两日游攻略',
  blocks: [
    { type: 'lead', text: '已为你整理重庆主城到铜梁的周末 2 日自驾完整攻略' },
    { type: 'title', text: '重庆主城→铜梁周末 2 日自驾攻略' },
    { type: 'section', text: '基础信息' },
    { type: 'text', text: '车程：主城高速约 1 小时。核心免费景点：玄天湖、安居古城、龙文化博物馆、巴岳山。' },
    { type: 'text', text: '演出区分：奇彩梦园 19:30 火龙打铁花（花海夜场 68 元）；玄天湖《追梦・铜梁龙》20:30 山水实景剧（88 元起）。' },
    { type: 'text', text: '导航关键词：玄天湖北门、奇彩梦园、安居古城星辉门、龙门老街。' },
    { type: 'section', text: 'Day 1｜玄天湖环湖骑行 + 19:30 非遗打铁花' },
    { type: 'text', text: '08:40 主城出发→09:40 抵达玄天湖北门。' },
    { type: 'fact', label: '🅿 停车', text: '北门主停车场 10 元 / 12 小时，上千车位，租车点就在出口。' },
    { type: 'section', text: '🚲 骑行游玩（09:40～12:10）' },
    { type: 'text', text: '环湖塑胶绿道 9.2 km，全程平缓、无机动车。单人车 10 元不限时，亲子双人车 30 元。' },
    { type: 'text', text: '推荐顺时针环湖打卡：龙形浮桥、天鹅湖、临湖大草坪、环湖观景台。' },
    { type: 'section', text: '12:10 午餐｜湖边美食' },
    { type: 'text', text: '平价农家：田家餐厅，豆花饭、头刀菜、土鸡汤，人均约 40 元。湖景硬菜：玄天湖鱼庄，生态麻辣 / 酸菜水库鱼，人均约 60 元。' },
    { type: 'product-grid', title: '附近美食推荐', items: [
        { id: 'sanhuochun', name: '铜梁区三活餐馆', image: 'assets/三活春油烧兔-1.png', meta: '知识库商家' },
        { id: 'toudaocai', name: '铜梁区原乡头刀菜餐饮店', image: 'assets/头刀菜.jpeg', meta: '知识库商家' }
    ] },
    { type: 'section', text: '13:30～16:20 湖边休闲' },
    { type: 'text', text: '免费参观龙文化博物馆看龙灯非遗，也可以草坪野餐、喂天鹅；自动贩卖机可补给饮品。' },
    { type: 'text', text: '16:30 驱车约 10 分钟前往奇彩梦园。景区提供免费大型停车场。' },
    { type: 'text', text: '17:00 逛花海、灯光布景和小吃集市，可选冰粉、烤肠、冲冲糕。' },
    { type: 'section', text: '19:30 核心演出｜火龙打铁花' },
    { type: 'text', text: '1600℃ 火龙打铁花 + 飞天凤凰，全程约 40 分钟，视觉震撼。建议穿旧衣物，铁花易烫；夜间风大带薄外套；1.2 米以下儿童半票。' },
    { type: 'section', text: '20:40 回城住宿｜三档任选' },
    { type: 'text', text: '湖景度假（280～480 元 / 晚）：西郊雅社，下楼即环湖，庭院茶室，含早餐。温泉放松（360～600 元 / 晚）：玄天湖龙温泉酒店，骑行后泡汤解乏。性价比首选（130～200 元 / 晚）：龙城天街连锁酒店，楼下餐饮超市齐全。' },
    { type: 'product-grid', title: '住宿推荐', items: [
      { id: 'xijiao-yashe', name: '西郊雅社', image: 'assets/西郊雅社-1.jpeg', meta: '商品展示模板' },
      { id: 'longcheng-hotel', name: '龙城天街连锁酒店', image: 'assets/龙城天街连锁酒店-1.jpeg', meta: '商品展示模板' }
    ] },
    { type: 'section', text: 'Day 2｜老城早茶→安居古城→巴岳山→采购返程' },
    { type: 'text', text: '08:00 龙门老街早茶：油茶、酱肉包、三角粑、凉虾、兰花根；老茶馆竹椅慢坐，看手工龙灯小店。' },
    { type: 'section', text: '09:00～12:00 安居古城（免费，游览约 3 小时）' },
    { type: 'text', text: '停车：古城门口市政车位 5 元不限时。打卡星辉门城墙、湖广会馆、天后宫、涪江码头；可坐乌篷船 20 元 / 人看两江交汇。' },
    { type: 'text', text: '古城小吃：手工糍粑、翰林酥、安居米粉、泡椒鳝鱼。' },
    { type: 'section', text: '12:20 城区特色正餐' },
    { type: 'text', text: '三活春油烧兔是铜梁招牌，活兔现炒，搭配小煎鸡、炝炒鱼，人均约 50 元；备选赵木二羊肉汤锅 / 羊肉米粉。' },
    { type: 'section', text: '13:40～16:00 巴岳山避暑轻徒步' },
    { type: 'text', text: '导航黄桷门停车场（免费），走平缓林荫线：夫妻古树→三丰洞→巴岳寺。全程树荫，气温低 6～8℃，寺内可喝茶歇脚。' },
    { type: 'section', text: '16:10 集中采购伴手礼' },
    { type: 'text', text: '文创文旅：玄天湖北门游客中心，可买铜梁龙玩偶、龙灯摆件、巴岳山茶、葛粉礼盒。' },
    { type: 'text', text: '美食特产：龙城天街 / 老城卤味店，可买泡椒铜梁凤爪、真空油烧兔、翰林酥、兰花根、安居糍粑礼盒。' },
    { type: 'text', text: '手工非遗：龙门老街可选竹编、油纸伞、蓝印花布小物件。' },
    { type: 'text', text: '17:00 自驾返回主城。' },
    { type: 'section', text: '全品类美食汇总' },
    { type: 'text', text: '早餐：龙门老街油茶、三角粑、羊肉米粉。湖边简餐：豆花饭、水库鱼、冰粉凉面。城区硬菜：三活春油烧兔、赵木二羊肉、头刀菜。古城小吃：翰林酥、手工糍粑、冲冲糕。夜场小吃：烤肠、糊辣壳鸡爪、手工冰粉。' },
    { type: 'section', text: '住宿优缺点速览' },
    { type: 'text', text: '龙温泉酒店：骑行泡汤舒服，价格偏高，离城区约 10 分钟。西郊雅社：临湖风景好、安静，适合情侣亲子。天街连锁酒店：吃饭购物方便，性价比高，但无湖景。' },
    { type: 'section', text: '全点位停车清单' },
    { type: 'text', text: '玄天湖北门：10 元 / 12 小时，骑行首选。奇彩梦园：全天免费。安居古城：路边 5 元不限时。巴岳山黄桷门：小型免费停车场。龙门老街：早 8 点前免费路边车位。' },
    { type: 'section', text: '实用出行贴士' },
    { type: 'text', text: '骑行最佳时段：早 7～10 点、傍晚 16 点后，避开正午暴晒。打铁花雨天正常演出，大风天取消飞天凤凰。周末玄天湖 9 点后易堵车，尽量早到；演出票建议线上提前买。巴岳山徒步带驱蚊水，凉鞋可踩山间溪水。' },
    { type: 'text', text: '全部核心景点大门免费，仅骑行、游船、演出收费。' },
    { type: 'section', text: '重庆铜梁两日游｜极简分段时间轴' },
    { type: 'section', text: 'Day1' },
    { type: 'text', text: '09:40～16:30 玄天湖环湖骑行、湖边休闲' },
    { type: 'text', text: '16:40～20:20 奇彩梦园赏花' },
    { type: 'text', text: '19:30 看打铁花' },
    { type: 'text', text: '20:30 入住酒店休整' },
    { type: 'section', text: 'Day2' },
    { type: 'text', text: '08:00～08:50 龙门老街早茶' },
    { type: 'text', text: '09:00～12:10 安居古城' },
    { type: 'text', text: '12:20～13:30 城区三活春午饭' },
    { type: 'text', text: '13:40～16:00 巴岳山徒步' },
    { type: 'text', text: '16:10～16:50 天街 / 游客中心采购' },
    { type: 'text', text: '17:00 自驾返回主城' },
    { type: 'save-plan', text: '加入我的计划' }
  ]
};
document.querySelectorAll('[data-journey-marquee]').forEach(journeyMarquee => {
  const journeyTrack = document.createElement('div');
  journeyTrack.className = 'journey-track';
  const journeyChips = [...journeyMarquee.children];
  journeyChips.forEach(chip => journeyTrack.append(chip));
  journeyChips.forEach(chip => {
    const duplicate = chip.cloneNode(true);
    duplicate.setAttribute('aria-hidden', 'true');
    duplicate.tabIndex = -1;
    journeyTrack.append(duplicate);
  });
  journeyMarquee.append(journeyTrack);

  let journeyPointerStart = null;
  let journeyScrollStart = 0;
  const resetJourneyPosition = () => { journeyMarquee.scrollLeft = 0; };
  resetJourneyPosition();
  window.addEventListener('load', resetJourneyPosition, { once: true });
  journeyMarquee.addEventListener('pointerdown', event => {
    journeyPointerStart = event.clientX;
    journeyScrollStart = journeyMarquee.scrollLeft;
    journeyMarquee.classList.add('dragging');
  });
  journeyMarquee.addEventListener('pointermove', event => {
    if (journeyPointerStart === null) return;
    journeyMarquee.scrollLeft = journeyScrollStart + journeyPointerStart - event.clientX;
  });
  const stopJourneyDrag = () => {
    journeyPointerStart = null;
    journeyMarquee.classList.remove('dragging');
  };
  journeyMarquee.addEventListener('pointerup', stopJourneyDrag);
  journeyMarquee.addEventListener('pointercancel', stopJourneyDrag);
});

function getCompanionGuide() {
  return {
    role: 'assistant',
    type: 'companion-guide',
    thinking: '正在获取您当前位置的伴游信息',
    blocks: [
      { type: 'lead', text: '根据您当前的位置，已为您整理以下伴游信息' },
      { type: 'title', text: '玄天湖AI伴游全程讲解（当前定位玄天湖景区）' },
      { type: 'section', text: '一、景区简介' },
      { type: 'text', text: '这里是4A级巴岳山玄天湖旅游度假区，也被叫做渝西小西湖，全天免费入园、无大门门票。' },
      { type: 'text', text: '依托巴岳山的中型人工水库，湖面1500亩，环湖9.2km彩色塑胶绿道，核心地标215米金龙卧波龙形浮桥，常年栖息黑白天鹅，是铜梁龙文化核心展示地，山水+非遗一体，亲子、骑行、散心都合适。' },
      { type: 'image', src: 'assets/玄天湖全景航拍.jpeg', alt: '玄天湖全景航拍', caption: '' },
      { type: 'image', src: 'assets/龙形浮桥.jpeg', alt: '龙形浮桥', caption: '' },
      { type: 'section', text: '二、景区内游玩项目' },
      { type: 'fact', label: '1. 环湖骑行（人气首选）', text: '北门停车场出口即可租车：单人车10元全天不限时，双人亲子车30元，路面平缓无陡坡；完整环湖2-2.5小时，半圈1小时轻松打卡。沿路打卡龙浮桥、天鹅投喂点、临水大草坪、多座观景台。' },
      { type: 'fact', label: '2. 徒步散步/草坪野餐', text: '环湖步道全程树荫，西岸大片免费草坪，可自带帐篷野餐，多处石凳休息，适合老人小孩慢逛。' },
      { type: 'fact', label: '3. 水上项目', text: '画舫游湖、电瓶船、快艇，近距离观湖景水鸟；天鹅点可买菜叶喂水禽。' },
      { type: 'fact', label: '4. 龙文化博物馆（免费）', text: '北门旁，参观铜梁龙灯非遗展品，了解龙舞历史。' },
      { type: 'fact', label: '5. 夜间实景演出', text: '龙文化演艺中心《追梦·铜梁龙》，周末/节假日20:30开场，尾声10分钟1600℃非遗打铁花，震撼火雨表演。' },
      { type: 'section', text: '三、停车、卫生间等公共配套' },
      { type: 'fact', label: '1. 停车场（按推荐度排序）', text: '① 北门主停车场（骑行/看演出首选）景区正入口，上千车位，12小时10元；租车点、游客中心、演艺中心步行3分钟，周末建议9点前抵达。② 东门小型停车场：免费，车位少，只适合东侧民宿住户。③ 黄桶门登山口停车场：免费小型车位，适合骑行+巴岳山爬山组合行程。' },
      { type: 'fact', label: '2. 公共设施', text: '卫生间：环湖步道每隔800米1处，北门游客中心、龙舞广场有大型公共厕所，干净配套洗手台；补给点：沿路自动贩卖机，北门小吃集市（冰粉、凉面、烤肠）；便民：免费饮水点、遮阳观景平台、无障碍步道。' },
      { type: 'section', text: '四、周边吃、住、购全指南' },
      { type: 'section', text: '（一）餐饮' },
      { type: 'text', text: '1. 景区内简餐：北门龙舞广场小吃摊、玄天湖龙火锅（湖景就餐）' },
      { type: 'text', text: '2. 近郊农家乐（骑车10分钟）田家餐厅：豆花饭、土鸡汤、头刀菜平价农家菜；玄天湖鱼庄主打生态水库鱼；巴岳寺旁素食餐厅。' },
      { type: 'text', text: '3. 城区特色（开车10分钟）三活春油烧兔（铜梁招牌）、赵木二羊肉汤锅；龙门老街早茶：油茶、三角粑、凉虾。' },
      { type: 'section', text: '（二）住宿三档可选' },
      { type: 'text', text: '1. 湖景民宿：西郊雅社，下楼直达环湖道，庭院茶室，280-480元/晚；' },
      { type: 'text', text: '2. 温泉度假：玄天湖龙温泉酒店，骑行爬山后泡汤放松，350元起；' },
      { type: 'text', text: '3. 高性价比：龙城天街连锁酒店130-200元，楼下商超餐馆齐全。' },
      { type: 'section', text: '（三）购物' },
      { type: 'text', text: '1. 即时补给：北门游客中心商铺，饮用水、零食、喂天鹅菜叶、简易骑行配件；' },
      { type: 'text', text: '2. 文创伴手礼：玄天湖文旅商店，铜梁龙玩偶、龙灯摆件、巴岳山茶、葛粉礼盒；' },
      { type: 'text', text: '3. 特产美食：天街超市/老城卤味，真空油烧兔、非遗泡椒凤爪、翰林酥。' },
      { type: 'section', text: '五、2026年8月近期活动安排' },
      { type: 'fact', label: '1. 日常固定演出（玄天湖演艺中心）', text: '每周六、法定节假日20:30《追梦·铜梁龙》实景剧，整场包含龙舞、灯光、压轴打铁花；线上小程序「玄天湖文旅」购票，1.2米以下儿童免票无座，票价88元起。' },
      { type: 'fact', label: '2. 奇彩梦园19:30打铁花（距玄天湖10分钟车程）', text: '每日晚间19:30火龙打铁花专场，花海灯光配套，门票68元，适合想看早场铁花的游客。' },
      { type: 'fact', label: '3. 夏日环湖休闲活动', text: '全月开放环湖骑行、草坪露营、傍晚日落观景打卡，周末湖畔增设小吃市集。' },
      { type: 'section', text: '六、简短游玩小贴士' },
      { type: 'text', text: '1. 骑行最佳时段：早7-10点、下午16:30-19点，避开正午暴晒；' },
      { type: 'text', text: '2. 打铁花注意：穿旧衣物，高温铁花易烫坏面料，夜间湖边风大，带薄外套；' },
      { type: 'text', text: '3. 全程核心山水景点免费，仅租车、游船、演出单独收费。' },
      { type: 'section', text: '相关视频' }
    ]
  };
}

const sharedConversationKey = 'tongliang-shared-conversation-v1';
const activeConversationKey = 'tongliang-active-conversation-v1';
const clearedMainConversationKey = 'tongliang-main-conversation-cleared-v1';
const mainConversationId = 'main';
let sharedConversationMessages = [];
let sharedConversationRevision = 0;
let activeConversationId = mainConversationId;
const consumerAgentRequests = new Map();
const isMainConversationCleared = () => {
  try { return sessionStorage.getItem(clearedMainConversationKey) === 'true'; } catch (_) { return false; }
};
const markMainConversationCleared = () => {
  try { sessionStorage.setItem(clearedMainConversationKey, 'true'); } catch (_) {}
};
const clearMainConversationReset = () => {
  try { sessionStorage.removeItem(clearedMainConversationKey); } catch (_) {}
};
const readActiveConversationId = () => {
  try { return sessionStorage.getItem(activeConversationKey) || mainConversationId; } catch (_) { return mainConversationId; }
};
const setActiveConversation = id => {
  activeConversationId = id || mainConversationId;
  try { sessionStorage.setItem(activeConversationKey, activeConversationId); } catch (_) {}
};
const writeMainConversation = () => {
  try { sessionStorage.setItem(sharedConversationKey, JSON.stringify(sharedConversationMessages)); } catch (_) {}
};
const persistActiveConversation = () => {
  if (activeConversationId === mainConversationId) {
    writeMainConversation();
    if (sharedConversationMessages.length) {
      const records = readConversationDrawerHistory();
      const existing = records.find(record => record.id === mainConversationId);
      const record = { id: mainConversationId, title: drawerThreadTitle(sharedConversationMessages), createdAt: existing?.createdAt || Date.now(), updatedAt: new Date().toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }), messages: JSON.parse(JSON.stringify(sharedConversationMessages)), pinned: Boolean(existing?.pinned) };
      writeConversationDrawerHistory([record, ...records.filter(item => item.id !== mainConversationId)].slice(0, 30));
    }
    return;
  }
  const records = readConversationDrawerHistory();
  const record = records.find(item => item.id === activeConversationId);
  if (!record) {
    setActiveConversation(mainConversationId);
    writeMainConversation();
    return;
  }
  record.messages = JSON.parse(JSON.stringify(sharedConversationMessages));
  record.title = drawerThreadTitle(record.messages);
  record.updatedAt = new Date().toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  writeConversationDrawerHistory(records);
};
const activateMainConversation = () => {
  cancelConsumerAgentRequests();
  sharedConversationRevision += 1;
  persistActiveConversation();
  setActiveConversation(mainConversationId);
  if (isMainConversationCleared()) {
    sharedConversationMessages = [];
    renderSharedConversation();
    return;
  }
  try {
    const messages = JSON.parse(sessionStorage.getItem(sharedConversationKey) || '[]');
    sharedConversationMessages = Array.isArray(messages) ? messages.map(recoverStoredAgentMessage) : [];
  } catch (_) { sharedConversationMessages = []; }
  renderSharedConversation();
};
try {
  activeConversationId = readActiveConversationId();
  const records = readConversationDrawerHistory();
  const storedConversation = activeConversationId === mainConversationId
    ? isMainConversationCleared() ? [] : JSON.parse(sessionStorage.getItem(sharedConversationKey) || '[]')
    : records.find(record => record.id === activeConversationId)?.messages;
  if (Array.isArray(storedConversation)) {
    sharedConversationMessages = storedConversation.map(message => {
      if (message.type === 'agent') return recoverStoredAgentMessage(message);
      if (message.type === 'ride-case' || message.type === 'ride-guide') return { role: 'assistant', ...journeyRecommendations.ride };
      if (message.type === 'feature-knowledge-guide') return getFeatureKnowledgeGuide(message.guideKey) || message;
      if (message.type === 'weekend-guide') return { role: 'assistant', ...weekendGuide };
      if (message.type === 'companion-guide') return getCompanionGuide();
      if (message.type === 'event-guide' || (message.role === 'assistant' && message.text === '今晚 19:30 安居古城有打铁花表演。建议提前 30 分钟到达，附近可安排头刀肉晚餐和停车接驳。')) {
        return { role: 'assistant', ...ironFlowerGuide };
      }
      return message;
    });
  } else setActiveConversation(mainConversationId);
} catch (_) {}

refreshConversationDrawer();
const activeConversationThread = () => embeddedMapHost ? planConversationList : (mapScreen ? mapConversationList : planConversationList);
const typewriterDelay = 22;
const typewriter = (element, text, thread, delay = typewriterDelay) => {
  let index = 0;
  const writeNext = () => {
    element.textContent = text.slice(0, index);
    if (index >= text.length) {
      element.classList.remove('is-typewriting');
      return;
    }
    index += 1;
    if (typeof thread?.scrollTo === 'function') thread.scrollTo({ top: thread.scrollHeight, behavior: 'smooth' });
    window.setTimeout(writeNext, delay);
  };
  writeNext();
};
const createRideGuideBlock = (block, { typewrite = false, thread, onComplete } = {}) => {
  const element = document.createElement(['link', 'save-plan'].includes(block.type) ? 'button' : 'div');
  element.className = `ride-guide-block ride-guide-${block.type}`;
  if (block.type === 'image') {
    if (block.full) element.classList.add('ride-guide-image-full');
    element.innerHTML = `<img src="${assetUrl(block.src)}" alt="${escapeHTML(block.alt)}">${block.caption ? `<span>${escapeHTML(block.caption)}</span>` : ''}`;
  } else if (block.type === 'amap-link') {
    const link = document.createElement('a');
    link.href = block.href;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.textContent = block.text;
    element.append(link);
  } else if (block.type === 'knowledge-recommendations') {
    const entityItems = [];
    const textItems = [];
    (block.items || []).forEach(item => {
      const entity = marqueeEntityCatalog[item.name];
      if (entity && ['product', 'merchant'].includes(entity.type)) entityItems.push({ item, entity });
      else textItems.push(item);
    });
    const textMarkup = textItems.map(item => `<div class="knowledge-recommendation-row"><button type="button" class="knowledge-recommendation-link" data-feature-knowledge="${escapeHTML(item.name)}"><span>${escapeHTML(item.name)}</span><small>${escapeHTML(item.meta || '')}</small></button></div>`).join('');
    const entityMarkup = entityItems.map(({ item, entity }) => {
      const itemId = marqueeEntityWishlistKey(item.name, entity);
      const added = isWishlistItemAdded(itemId);
      const address = escapeHTML(featureKnowledgePoi(item.name, entity).address);
      const addressLink = `<button type="button" class="knowledge-recommendation-address" data-feature-knowledge-navigate="${escapeHTML(item.name)}" aria-label="导航到${escapeHTML(item.name)}" title="导航到${address}">${icons.navigation}<span>${address}</span></button>`;
      return `<article class="knowledge-recommendation-card"><button type="button" class="knowledge-recommendation-link" data-feature-knowledge="${escapeHTML(item.name)}" aria-label="查看${escapeHTML(item.name)}详情"><img src="${assetUrl(entity.image)}" alt="${escapeHTML(item.name)}"><span><strong>${escapeHTML(item.name)}</strong></span></button>${addressLink}<div class="knowledge-recommendation-card-actions"><button type="button" class="knowledge-recommendation-action knowledge-recommendation-locate" data-feature-knowledge-locate="${escapeHTML(item.name)}" aria-label="定位${escapeHTML(item.name)}" title="定位">${icons.pin}</button><button type="button" class="knowledge-recommendation-action knowledge-recommendation-wishlist${added ? ' is-added' : ''}" data-feature-knowledge-wishlist="${escapeHTML(itemId)}" data-feature-knowledge-name="${escapeHTML(item.name)}" data-feature-knowledge-kind="${escapeHTML(entity.type)}" aria-label="${added ? `从心愿单移除${escapeHTML(item.name)}` : `将${escapeHTML(item.name)}加入我的心愿单`}" title="${added ? '取消心愿单' : '加入心愿单'}">${icons.heart}</button><button type="button" class="knowledge-recommendation-action knowledge-recommendation-chat" data-feature-knowledge-chat="${escapeHTML(item.name)}" aria-label="咨询${escapeHTML(item.name)}" title="拉起对话">${icons.chat}</button></div></article>`;
    }).join('');
    element.innerHTML = `<strong class="knowledge-recommendations-title">${escapeHTML(block.title || '关联推荐')}</strong><div class="knowledge-recommendations-list">${textMarkup}${entityMarkup ? `<div class="knowledge-recommendation-carousel" aria-label="商品和商户推荐">${entityMarkup}</div>` : ''}</div>`;
  } else if (block.type === 'feature-intent-question') {
    element.innerHTML = `<strong class="feature-intent-question-title">${escapeHTML(block.question)}</strong>`;
  } else if (block.type === 'product-grid') {
    const itemKind = item => /xijiao|longcheng|hotel|yashe/.test(item.id) ? 'merchant' : 'product';
    const itemDistance = index => `距你 ${(index + 1.2).toFixed(1)}km`;
    const isAlreadyAdded = itemId => {
      try { return JSON.parse(sessionStorage.getItem('tongliang-added-wishlist-items-v1') || '[]').some(saved => saved.id === itemId || saved.id.startsWith(`${itemId}-`)); } catch (_) { return false; }
    };
    element.innerHTML = `<strong class="ride-product-grid-title">${escapeHTML(block.title)}</strong><div class="ride-product-grid">${block.items.map((item, index) => {
      const kind = itemKind(item);
      const added = isAlreadyAdded(item.id);
      const distance = itemDistance(index);
      const price = kind === 'product' ? (item.id === 'sanhuochun' ? '¥48 起' : '¥39 起') : '';
      return `<article class="ride-product-card"><img src="${assetUrl(item.image)}" alt="${escapeHTML(item.name)}"><span><b>${escapeHTML(item.name)}</b><small>${escapeHTML(item.meta)}</small></span><div class="ride-product-actions"><button class="ride-map-action" type="button" data-ride-map="${escapeHTML(item.id)}" data-ride-name="${escapeHTML(item.name)}" data-ride-kind="${kind}" data-ride-image="${escapeHTML(item.image)}" data-ride-price="${price}" data-ride-distance="${distance}" aria-label="在地图查看${escapeHTML(item.name)}"><img src="${assetUrl('assets/高德图标.png')}" alt=""></button><button class="ride-wishlist-add${added ? ' is-added' : ''}" type="button" data-wishlist-add="${escapeHTML(item.id)}" data-wishlist-name="${escapeHTML(item.name)}" data-wishlist-kind="${kind}" aria-label="${added ? `已将${escapeHTML(item.name)}加入我的心愿单` : `将${escapeHTML(item.name)}加入我的心愿单`}"${added ? ' disabled' : ''}>${icons.heart}</button><button class="ride-detail-action" type="button" data-ride-detail="${escapeHTML(item.id)}">查看详情</button></div></article>`;
    }).join('')}</div>`;
    element.querySelectorAll('[data-wishlist-add]').forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        if (button.disabled) return;
        button.disabled = true;
        button.classList.add('is-added');
        button.setAttribute('aria-label', `已将${button.dataset.wishlistName}加入我的心愿单`);
        addWishlistItem({ id: button.dataset.wishlistAdd, name: button.dataset.wishlistName, kind: button.dataset.wishlistKind }, button);
      });
    });
    element.querySelectorAll('[data-ride-map]').forEach(button => {
      button.addEventListener('click', () => {
        const item = { id: button.dataset.rideMap, name: button.dataset.rideName, kind: button.dataset.rideKind, image: button.dataset.rideImage, price: button.dataset.ridePrice, distance: button.dataset.rideDistance, intro: '本地推荐商户，适合顺路到访。' };
        if (switchConsumerBackground('map')) renderMarqueePoi(item);
        else location.href = 'explore.html';
      });
    });
    element.querySelectorAll('[data-ride-detail]').forEach(button => {
      button.addEventListener('click', () => { saveProductReturn(); location.href = `product-detail.html?item=${encodeURIComponent(button.dataset.rideDetail)}`; });
    });
  } else if (block.type === 'save-plan') {
    const updateState = saved => {
      element.textContent = saved ? '已加入我的计划' : block.text;
      element.disabled = saved;
      element.setAttribute('aria-label', saved ? '已加入我的计划' : block.text);
    };
    element.type = 'button';
    element.dataset.saveWeekendPlan = '';
    updateState(hasSavedWeekendPlan());
    element.addEventListener('click', () => {
      if (!saveWeekendPlan()) return notify('计划保存失败，请重试');
      document.querySelectorAll('[data-save-weekend-plan]').forEach(button => {
        button.textContent = '已加入我的计划';
        button.disabled = true;
        button.setAttribute('aria-label', '已加入我的计划');
      });
      addSharedConversationMessage({ role: 'assistant', type: 'plan-followup' });
      notify('已加入我的计划');
    });
  } else if (block.type === 'link') {
    element.type = 'button';
    element.dataset.routeExplore = '';
    element.setAttribute('aria-label', block.text);
    element.innerHTML = `<span>${icons.map}</span>${escapeHTML(block.text)}<i>${icons.chevron}</i>`;
  } else {
    if (block.label) element.innerHTML = `<strong>${escapeHTML(block.label)}</strong><span></span>`;
    else element.innerHTML = '<span></span>';
    const target = element.querySelector('span');
    if (typewrite) {
      const delay = Math.max(4, Math.min(typewriterDelay, Math.round(320 / Math.max(1, block.text.length))));
      target.classList.add('is-typewriting');
      typewriter(target, block.text, thread, delay);
      window.setTimeout(() => {
        target.innerHTML = renderMarqueeEntityText(block.text);
        onComplete();
      }, Math.max(220, block.text.length * delay + 100));
      return element;
    }
    target.innerHTML = renderMarqueeEntityText(block.text);
  }
  window.setTimeout(onComplete, typewrite ? 220 : 0);
  return element;
};
const renderStructuredGuide = (container, blocks, { typewrite = false, thread, thinkingText = '正在整理攻略', onComplete } = {}) => {
  const appendBlock = index => {
    if (index >= blocks.length) {
      onComplete?.();
      return;
    }
    const block = createRideGuideBlock(blocks[index], {
      typewrite,
      thread,
      onComplete: () => appendBlock(index + 1)
    });
    container.append(block);
    if (typeof thread?.scrollTo === 'function') thread.scrollTo({ top: thread.scrollHeight, behavior: 'smooth' });
  };
  if (!typewrite) {
    appendBlock(0);
    return;
  }
  const thinking = document.createElement('div');
  thinking.className = 'ride-guide-thinking';
  thinking.textContent = thinkingText;
  container.append(thinking);
  window.setTimeout(() => {
    thinking.remove();
    appendBlock(0);
  }, 520);
};
// Marquee topics are intentionally data-driven so the same configuration can be managed by the content backend.
// Topic snapshots remain local; new replies use the server-side live agent.
const marqueeIntentConfigs = {
  'local-01': { domain: '游', title: '铜梁龙舞体验', entities: ['POI：铜梁龙文化演艺中心', '活动：铜梁龙舞展演', '商户：重庆市铜梁区龙文化传媒有限公司'], question: '你想了解龙舞的看点，还是想安排一场现场观看？', choices: ['了解看点', '安排观看'], result: '推荐先到铜梁龙文化演艺中心看展演，再按实时场次预约；离场可顺路查看重庆市铜梁区龙文化传媒有限公司的文创商品。' },
  'local-02': { domain: '游 + 吃', title: '安居古城游逛与用餐', entities: ['POI：安居古城', '商户：涪江山居餐饮', '活动：古城讲解'], question: '这次更想慢逛古城，还是优先解决一顿饭？', choices: ['慢逛古城', '先吃一顿'], result: '慢逛可从东门进、沿老街到码头；想吃可先联系涪江山居餐饮，再倒推古城游逛时间。' },
  'local-03': { domain: '游', title: '玄天湖骑行', entities: ['POI：玄天湖环湖道', '商品：骑行租赁', '商户：玄天湖龙火锅（龙舞广场店）'], question: '你更在意轻松骑一圈，还是骑完顺路吃饭休息？', choices: ['轻松骑行', '骑完吃饭'], result: '轻松骑行建议从玄天湖北门租车环湖；如需餐饮，可将玄天湖龙火锅（龙舞广场店）作为候选终点，并以实时营业状态为准。' },
  'local-04': { domain: '吃', title: '铜梁辣度与餐饮', entities: ['商户：铜梁区原乡头刀菜餐饮店', '商户：铜梁区三活餐馆'], question: '你想找微辣友好的第一餐，还是想挑战一顿地道川渝味？', choices: ['微辣友好', '地道辣味'], result: '第一次可向铜梁区原乡头刀菜餐饮店备注微辣；想吃地道辣味可选择铜梁区三活餐馆，并提前确认口味和营业状态。' },
  'local-05': { domain: '交通 + 游', title: '安居古城周末出行', entities: ['POI：安居古城停车场', 'POI：安居古城', '商户：涪江山居餐饮'], question: '你是自驾前往，还是想让我按公共交通安排？', choices: ['自驾前往', '公共交通'], extraQuestion: '预计上午到，还是午后到？', extraChoices: ['上午到', '午后到'], result: '自驾建议上午 9:20 前抵达并优先使用古城停车场；午后出发请预留排队时间，再安排古城与涪江山居餐饮。' },
  'local-06': { domain: '游 + 活动', title: '铜梁龙互动演出', entities: ['POI：铜梁龙文化演艺中心', '活动：互动龙舞展演', '商户：重庆市铜梁区龙文化传媒有限公司'], question: '你想看一场固定演出，还是想找适合拍摄的互动场次？', choices: ['固定演出', '互动拍摄'], extraQuestion: '你计划白天到，还是夜间到？', extraChoices: ['白天', '夜间'], result: '夜间场更适合看完整灯光和互动效果；白天可先参观演艺中心，再查看重庆市铜梁区龙文化传媒有限公司的文创商品。' },
  'local-07': { domain: '游', title: '奇彩梦园拍照', entities: ['POI：奇彩梦园', '活动：花海夜游', '商品：摄影服务'], question: '你是想拍花海人像，还是只想轻松逛园看花？', choices: ['拍人像', '轻松逛园'], result: '拍人像建议预约傍晚光线和花海主景区；轻松逛园可按园内步道慢走，夜间可衔接灯光活动。' },
  'local-08': { domain: '吃', title: '铜梁早餐', entities: ['商户：铜梁区原乡头刀菜餐饮店', 'POI：龙门老街'], question: '早餐更想吃热面，还是尝铜梁本地小吃？', choices: ['热面', '本地小吃'], result: '想尝本地味可将龙门老街的小吃与铜梁区原乡头刀菜餐饮店的特色菜组合安排，具体营业时段请以实时信息为准。' },
  'local-09': { domain: '游', title: '雨天玄天湖', entities: ['POI：玄天湖观景台', '商户：玄天湖湖景火锅', '商品：雨具补给'], question: '下雨天你还想在湖边走走，还是想找室内休息和吃饭？', choices: ['湖边走走', '室内休息'], result: '雨天湖边可走北门至观景台的短线并注意防滑；需要避雨可将玄天湖湖景火锅作为候选，营业状态请以实时信息为准。' },
  'local-10': { domain: '吃 + 游', title: '首次到铜梁的本地味道', entities: ['商户：铜梁区三活餐馆', '商户：铜梁区原乡头刀菜餐饮店', 'POI：龙门老街'], question: '这是你在铜梁的第一顿饭，还是想为行程加一站特色小吃？', choices: ['第一顿正餐', '加一站小吃'], result: '第一顿正餐可优先考虑铜梁区三活餐馆；若只是加餐，可到龙门老街后再选择铜梁区原乡头刀菜餐饮店。' },
  'local-11': { domain: '交通', title: '铜梁附近距离', entities: ['POI：玄天湖', 'POI：安居古城', '商户：涪江山居餐饮'], question: '你想确认哪个地方离你最近？', choices: ['玄天湖', '安居古城', '附近餐饮'], extraQuestion: '你打算步行、骑行还是开车？', extraChoices: ['步行', '骑行', '开车'], result: '我会按你的出行方式计算实际到达时间，并优先推荐可顺路到达的 POI、商户和活动。' },
  'local-12': { domain: '游', title: '铜梁轻徒步', entities: ['POI：巴岳山步道', '商品：徒步补给', '商户：巴岳山素食餐厅'], question: '你想走轻松观景线，还是想走完整徒步线？', choices: ['轻松观景', '完整徒步'], result: '轻松观景可走黄桷门至观景台；完整徒步请预留 2 小时，并在出发前补给饮水和轻食。' },
  'local-13': { domain: '活动 + 游', title: '火龙表演', entities: ['活动：火龙表演', 'POI：奇彩梦园', '商户：玄天湖龙火锅（龙舞广场店）'], question: '你想重点确认演出时间，还是想把晚餐和演出一起安排？', choices: ['确认场次', '晚餐加演出'], extraQuestion: '同行有小朋友吗？', extraChoices: ['有小朋友', '成人同行'], result: '建议提前 30 分钟抵达火龙表演现场；亲子同行选择视野开阔的安全区域，并把晚餐安排在演出前。玄天湖龙火锅（龙舞广场店）的营业与排位请以实时信息为准。' },
  'local-14': { domain: '吃', title: '铜梁夜宵', entities: ['商户：玄天湖龙火锅（龙舞广场店）', '商户：玄天湖湖景火锅'], question: '夜宵是朋友聚餐，还是一个人想吃点热乎的？', choices: ['朋友聚餐', '一个人吃'], result: '朋友聚餐可将玄天湖龙火锅（龙舞广场店）作为候选；一个人用餐可优先查找就近简餐，具体营业信息以实时数据为准。' },
  'local-15': { domain: '交通', title: '铜梁停车', entities: ['POI：玄天湖北门主停车场', 'POI：龙舞广场停车区', '活动：夜间演出'], question: '你是去玄天湖停车，还是去看演出需要停车？', choices: ['玄天湖', '看演出'], extraQuestion: '预计几点到？', extraChoices: ['白天', '傍晚/夜间'], result: '玄天湖优先北门主停车场；看演出可选龙舞广场停车区，周末建议比演出开场早 30 分钟到。' },
  'local-16': { domain: '游 + 活动', title: '第一次看铜梁龙', entities: ['POI：铜梁龙文化演艺中心', '活动：铜梁龙舞展演', '商户：重庆市铜梁区龙文化传媒有限公司'], question: '第一次来，你更想了解铜梁龙文化，还是直接看一场演出？', choices: ['了解文化', '直接看演出'], result: '想了解文化可先去演艺中心；直接看演出请按实时场次预约，结束后可查看重庆市铜梁区龙文化传媒有限公司的文创商品。' },
  'local-17': { domain: '游 + 住', title: '铜梁慢游休憩', entities: ['POI：玄天湖观景台', '商户：西郊雅社民宿', '商品：下午茶'], question: '你想找一个下午茶发呆点，还是想顺便安排住一晚？', choices: ['下午茶', '住一晚'], result: '下午茶可选玄天湖观景台周边；住一晚可优先查看西郊雅社民宿，房态与预订信息请以实时数据为准。' },
  'local-18': { domain: '游 + 吃 + 活动', title: '铜梁夜游', entities: ['POI：玄天湖', '商户：玄天湖龙火锅（龙舞广场店）', '活动：火龙表演'], question: '今晚更想看夜景、吃晚饭，还是围绕演出安排？', choices: ['看夜景', '吃晚饭', '看演出'], result: '夜游可从玄天湖日落开始，接玄天湖龙火锅（龙舞广场店）晚饭，再根据当天实时场次前往火龙表演。' },
  'local-19': { domain: '游 + 吃 + 购', title: '铜梁一日游', entities: ['POI：玄天湖', 'POI：安居古城', '商户：涪江山居餐饮', '商户：风物集市'], question: '一日游更偏向山水、古城，还是想兼顾吃和买？', choices: ['山水', '古城', '吃和买'], result: '首次来访可用玄天湖-安居古城-涪江山居餐饮-风物集市的顺路组合，少走回头路。' },
  'local-20': { domain: '吃 + 游', title: '铜梁美食留客', entities: ['商户：铜梁区原乡头刀菜餐饮店', '商户：铜梁区三活餐馆', 'POI：龙门老街'], question: '你想先找一顿代表菜，还是把美食串进完整游玩路线？', choices: ['一顿代表菜', '美食路线'], result: '代表菜可从铜梁区原乡头刀菜餐饮店或铜梁区三活餐馆开始；美食路线可接龙门老街、安居古城等游玩 POI。' }
};
const marqueeTopics = {
  'local-01': { template: 'watch', lead: '铜梁人看龙舞，动作里全是门道。外地朋友第一次看，通常先安静三秒。', title: '铜梁龙舞现场', media: 'assets/火龙铁花.png', prompt: '你第一次看铜梁龙是什么反应？' },
  'local-02': { template: 'vote', lead: '安居古城到底该慢逛，还是直奔那家馆子？先站队，再给你本地人答案。', title: '安居古城，先逛还是先吃？', options: [['慢逛古城', '31%'], ['直奔馆子', '49%'], ['边走边吃', '20%']] },
  'local-03': { template: 'route', lead: '玄天湖这一圈，骑到后半段就会开始认真找拍照位。', title: '玄天湖骑行路线', meta: '骑行 8.6km · 约70分钟 · 难度轻松', summary: '北门出发 · 湖畔观景 · 日落点', steps: ['北门出发', '湖畔观景', '日落点'] },
  'local-04': { template: 'food', lead: '铜梁的“微辣”，建议第一次先听听本地人的劝。', shop: { name: '铜梁区原乡头刀菜餐饮店', distance: '距离请以地图为准', price: '价格请以门店为准', note: '可先确认微辣口味与营业状态', id: 'toudaocai' } },
  'local-05': { template: 'route', lead: '不算，但晚半小时出发，可能就得先练耐心了。给你整理了条少堵、好逛、能吃到饭的半日路线。', title: '安居古城·避堵半日游', meta: '4小时 · 适合周末 · 约80元', summary: '09:20 出发 → 10:10 入城 → 午饭', detail: '3个停车点 · 2个拍照点 · 1家馆子', steps: ['停车点', '古城拍照点', '午饭馆子'] },
  'local-06': { template: 'watch', lead: '铜梁龙不只会飞，真正精彩的是那些突然“整活”的瞬间。', title: '铜梁龙的高光瞬间', media: 'assets/火龙铁花.png', prompt: '这个动作，你想现场看吗？' },
  'local-07': { template: 'watch', lead: '奇彩梦园拍照，不用着急出片，先把花海最好的光线等到。', title: '奇彩梦园实拍', media: 'assets/feature-4.png', prompt: '你会先拍人，还是先拍花？' },
  'local-08': { template: 'food', lead: '铜梁人的早餐局，真正的隐藏冠军往往不在最显眼的位置。', shop: { name: '铜梁区原乡头刀菜餐饮店', distance: '距离请以地图为准', price: '价格请以门店为准', note: '特色菜与营业时段请以门店实时信息为准', id: 'toudaocai' } },
  'local-09': { template: 'watch', lead: '下雨天的玄天湖，像开了铜梁限定滤镜，湖边反而更适合慢下来。', title: '雨天玄天湖', media: 'assets/玄天湖全景航拍.jpeg', prompt: '雨天出门，你会去湖边吗？' },
  'local-10': { template: 'food', lead: '第一次来铜梁，最容易错过的不是景点，是本地人拐进巷子才会吃的那一口。', shop: { name: '铜梁区三活餐馆', distance: '距离请以地图为准', price: '价格请以门店为准', note: '可优先咨询油烧兔等招牌菜的供应情况', id: 'sanhuochun' } },
  'local-11': { template: 'vote', lead: '铜梁人说“就在附近”，通常是一个很有弹性的概念。', title: '“附近”到底是多久？', options: [['5分钟，真附近', '18%'], ['15分钟，可以接受', '46%'], ['半小时，也叫附近', '36%']] },
  'local-12': { template: 'route', lead: '这条铜梁徒步线，走着走着就会忘了自己原本只想出门活动一下。', title: '巴岳山轻徒步路线', meta: '徒步 5.2km · 约2小时 · 难度适中', summary: '黄桷门 · 林间步道 · 观景台', steps: ['黄桷门集合', '林间步道', '山顶观景台'] },
  'local-13': { template: 'watch', lead: '火龙表演现场，建议别眨眼，怕错过高光。', title: '火龙表演现场', media: 'assets/打铁花实景.png', prompt: '你会坐前排，还是留在安全距离看？' },
  'local-14': { template: 'food', lead: '铜梁夜宵有多卷？胃说它还可以再战，但最好先选对第一家。', shop: { name: '玄天湖龙火锅（龙舞广场店）', distance: '距离请以地图为准', price: '价格请以门店为准', note: '营业状态与排位请以实时信息为准', id: 'xuantian-hotpot' } },
  'local-15': { template: 'vote', lead: '在铜梁找停车位，确实有一点看缘分。不过提前十分钟，会好很多。', title: '停车位靠不靠谱？', options: [['提前到，稳一点', '55%'], ['绕两圈，总会有', '28%'], ['随缘停车', '17%']] },
  'local-16': { template: 'watch', lead: '外地朋友第一次见铜梁龙，反应都很一致：先震撼，再问这是什么时候练出来的。', title: '第一次见铜梁龙', media: 'assets/火龙铁花.png', prompt: '你的第一反应会是哪一种？' },
  'local-17': { template: 'watch', lead: '铜梁适合发呆的地方，藏在湖边、古城转角和一杯茶里。', title: '铜梁慢下来的一刻', media: 'assets/玄天湖全景航拍.jpeg', prompt: '你想把下午留给哪里？' },
  'local-18': { template: 'route', lead: '谁说铜梁晚上没得耍？把傍晚到夜里的几个点串起来，刚好够一晚。', title: '铜梁夜游路线', meta: '约3小时 · 适合傍晚 · 夜景友好', summary: '玄天湖日落 · 天街晚饭 · 火龙夜场', steps: ['玄天湖日落', '天街晚饭', '火龙夜场'] },
  'local-19': { template: 'route', lead: '这条本地人私藏的一日游路线，少走弯路，也给吃饭和拍照留足了时间。', title: '铜梁一日游路线', meta: '约8小时 · 适合首次来访 · 自驾友好', summary: '玄天湖 · 安居古城 · 奇彩梦园', steps: ['玄天湖', '安居古城', '奇彩梦园'] },
  'local-20': { template: 'food', lead: '你以为来铜梁是旅游，结果先被美食留下来了。第一顿吃对，后面的行程才有底气。', shop: { name: '铜梁区原乡头刀菜餐饮店', distance: '距离请以地图为准', price: '价格请以门店为准', note: '适合多人分享，口味与供应请以门店为准', id: 'toudaocai' } }
};
const marqueeSystemPrompt = config => `你是铜梁本地伴游。用户由弹幕进入「${config.title}」主题。先依据已有信息给出实质答案，再在末尾按需附上最多一个关键追问；不重复询问已知条件，不机械推进固定问答轮次。缺少关键对象而无法作答时才先最小澄清。未核验的路线、营业、价格和实时信息不可编造。正式规则由服务端统一维护。`;
// Stand-in for the backend's per-topic prompt field. Display copy, prompts and
// simulated responses are independent: never construct a request from a chip label.
// Published prompt copy is selected by the current UI language, never translated at send time.
const marqueePromptConfigs = {
  'local-01': { prompt: '请介绍铜梁龙舞的特色看点，并告诉我如何安排一次现场观看。' },
  'local-02': { prompt: '我想去安居古城，请帮我安排古城慢逛与当地用餐，推荐可以顺路到达的地方。' },
  'local-03': { prompt: '我想在玄天湖骑行，请介绍适合的路线、租车方式，以及沿途拍照和休息的地方。' },
  'local-04': { prompt: '我不太能吃辣，请介绍铜梁餐饮的辣度特点，推荐适合的本地菜和点餐注意事项。' },
  'local-05': { prompt: '我计划周末去安居古城，怎样安排出行方式、停车和古城游逛会更方便？' },
  'local-06': { prompt: '我想体验铜梁龙的互动演出，请介绍演出与互动拍摄的看点，以及安排体验前需要确认的信息。' },
  'local-07': { prompt: '我想去奇彩梦园拍照和看花，怎样安排拍摄路线和游逛时间更合适？' },
  'local-08': { prompt: '铜梁有哪些值得体验的本地早餐？特色吃法和选择建议是什么？' },
  'local-09': { prompt: '下雨天去玄天湖，适合怎样安排短途游逛、避雨休息和用餐？' },
  'local-10': { prompt: '我是第一次来铜梁，请推荐有代表性的本地美食和小吃，并帮我安排到游玩行程里。' },
  'local-11': { prompt: '铜梁的目的地离我有多远？从我现在的位置怎么去更方便？' },
  'local-12': { prompt: '我想在铜梁徒步，请推荐巴岳山适合的路线，说明体力、时间和补给方面需要考虑的事项。' },
  'local-13': { prompt: '我想现场看铜梁火龙表演，怎样确认场次、安排观看位置并衔接晚餐？' },
  'local-14': { prompt: '今晚在铜梁吃夜宵，有哪些适合不同人数和口味的选择？' },
  'local-15': { prompt: '在铜梁游玩时，哪里停车更方便？请按景点和行程给我一些停车建议。' },
  'local-16': { prompt: '我是第一次看铜梁龙，请介绍龙文化与演出的入门看点，并推荐适合初次体验的安排。' },
  'local-17': { prompt: '我想在铜梁找安静放松的地方，请推荐湖边休憩、下午茶或住一晚的选择。' },
  'local-18': { prompt: '请帮我安排铜梁夜游，把夜景、晚餐和演出合理衔接，并说明需要提前确认的信息。' },
  'local-19': { prompt: '请帮我规划铜梁一日游，结合山水、古城、美食和购物，尽量顺路并留出休息时间。' },
  'local-20': { prompt: '我想围绕铜梁美食安排游玩，请推荐代表菜，并把用餐与附近景点串成合适的路线。' }
};
const marqueeEnglishPrompts = {
  'local-01': 'What makes Tongliang dragon dances special, and how can I plan to watch one in person?',
  'local-02': 'I would like to visit Anju Ancient Town. Can you suggest a leisurely walk, local food and places to visit along the way?',
  'local-03': 'I would like to cycle around Xuantian Lake. What routes, bicycle rental options, photo spots and rest stops should I consider?',
  'local-04': 'I cannot eat very spicy food. What local dishes and ordering tips would you recommend in Tongliang?',
  'local-05': 'I am visiting Anju Ancient Town this weekend. How should I arrange transport, parking and a walk through the town?',
  'local-06': 'I would like to experience an interactive Tongliang dragon performance. What are the highlights, photo opportunities and details to check before visiting?',
  'local-07': 'I want to photograph the flowers at Qicai Dream Garden. What walking route and visiting time would suit a photography trip?',
  'local-08': 'Which local breakfasts should I try in Tongliang, and what is special about the way they are served?',
  'local-09': 'How could I enjoy a short visit to Xuantian Lake on a rainy day, including sheltered rest stops and a meal?',
  'local-10': 'This is my first visit to Tongliang. Which local dishes and snacks should I try, and how can I fit them into my sightseeing?',
  'local-11': 'How far are the places I want to visit in Tongliang from my current location, and what is the most convenient way to get there?',
  'local-12': 'I would like to hike on Bayue Mountain in Tongliang. What routes should I consider, and how should I prepare for the effort, time and supplies needed?',
  'local-13': 'I want to see a Tongliang fire dragon performance. How can I check the schedule, choose a viewing spot and fit dinner into the evening?',
  'local-14': 'What late-night food would you recommend in Tongliang tonight for different group sizes and tastes?',
  'local-15': 'Where is it convenient to park when visiting Tongliang? Can you suggest parking options for my sights and itinerary?',
  'local-16': 'This will be my first Tongliang dragon performance. What should I know about dragon culture, the highlights and planning a first visit?',
  'local-17': 'Where can I relax quietly in Tongliang? I would like suggestions for lakeside breaks, afternoon tea or an overnight stay.',
  'local-18': 'Can you plan an evening in Tongliang combining night views, dinner and a performance, including what I should check in advance?',
  'local-19': 'Can you plan a relaxed day in Tongliang with nature, an ancient town, local food and shopping, keeping the stops convenient and allowing time to rest?',
  'local-20': 'I would like to explore Tongliang through its food. Which signature dishes should I try, and how can I combine meals with nearby sights?'
};
const getMarqueePrompt = key => {
  const prompt = currentLanguage === 'en' ? marqueeEnglishPrompts[key] : marqueePromptConfigs[key]?.prompt;
  return typeof prompt === 'string' ? prompt.trim() : '';
};
const marqueeEntityCatalog = {
  '铜梁龙文化演艺中心': { type: 'poi', id: 'fire-dragon', image: 'assets/火龙铁花.png', intro: '铜梁龙文化展演与夜间演出的主要场地。' },
  '安居古城': { type: 'poi', id: 'tiandeng-stone', image: 'assets/trip-stone-scenic-hd.png', intro: '可慢逛老街、码头与古城文化景点。' },
  '玄天湖环湖道': { type: 'poi', id: 'xuantian-lake-trail', image: 'assets/trip-day-tour-hd.png', intro: '适合骑行、散步与观景的环湖路线。' },
  '安居古城停车场': { type: 'poi', id: 'tiandeng-stone', image: 'assets/trip-stone-scenic-hd.png', intro: '周末到古城可优先使用的停车点。' },
  '奇彩梦园': { type: 'poi', id: 'fire-dragon', image: 'assets/打铁花实景.png', intro: '花海、夜游与火龙表演的体验点。' },
  '龙门老街': { type: 'poi', id: 'toudaocai', image: 'assets/头刀菜.jpeg', intro: '适合寻找铜梁早餐和本地小吃的老街。' },
  '巴岳山步道': { type: 'poi', id: 'xuantian-lake-trail', image: 'assets/trip-day-tour-hd.png', intro: '适合轻徒步与观景的山野步道。' },
  '玄天湖观景台': { type: 'poi', id: 'xuantian-lake-trail', image: 'assets/玄天湖全景航拍.jpeg', intro: '适合看湖景、日落与慢游休憩。' },
  '玄天湖': { type: 'poi', id: 'xuantian-lake-trail', image: 'assets/玄天湖全景航拍.jpeg', intro: '铜梁湖景、骑行与夜游的重要起点。' },
  '玄天湖北门主停车场': { type: 'poi', id: 'xuantian-lake-trail', image: 'assets/玄天湖全景航拍.jpeg', intro: '靠近游客中心和环湖骑行入口。' },
  '龙舞广场停车区': { type: 'poi', id: 'fire-dragon', image: 'assets/火龙铁花.png', intro: '靠近夜间演艺与龙舞活动的停车点。' },
  '涪江山居餐饮': { type: 'merchant', id: 'history', knowledgeRef: 'merchant-fujiang-shanju-food', image: 'assets/头刀菜.jpeg', intro: '安居古城内已确认入驻的龙乡美食与特色江湖菜商家。' },
  '铜梁区三活餐馆': { type: 'merchant', id: 'sanhuochun', knowledgeRef: 'merchant-sanhuo-restaurant', image: 'assets/三活春油烧兔-1.png', intro: '提供非遗油烧兔、药膳炖铜梁黑鸡等特色菜。' },
  '铜梁区原乡头刀菜餐饮店': { type: 'merchant', id: 'toudaocai', knowledgeRef: 'merchant-yuanxiang-toudao', image: 'assets/头刀菜.jpeg', intro: '提供非遗泡椒头刀菜、双椒红袍鸡肾和油烧兔等特色菜。' },
  '玄天湖湖景火锅': { type: 'merchant', id: 'xuantian-hotpot', knowledgeRef: 'merchant-xuantian-lake-view-hotpot', image: 'assets/湖景火锅.jpeg', intro: '玄天湖景区内特色火锅，具体营业信息请以实时数据为准。' },
  '玄天湖龙火锅（龙舞广场店）': { type: 'merchant', id: 'xuantian-hotpot', knowledgeRef: 'merchant-xuantian-lake-dragon-hotpot', image: 'assets/湖景火锅.jpeg', intro: '玄天湖景区内餐饮候选，具体营业信息请以实时数据为准。' },
  '巴岳山步道': { type: 'poi', id: 'xuantian-lake-trail', image: 'assets/trip-day-tour-hd.png', intro: '巴岳山与玄天湖景区相连的山野游览区域。' },
  '巴岳山素食餐厅': { type: 'merchant', id: 'history', knowledgeRef: 'merchant-bayue-vegetarian', image: 'assets/trip-day-tour-hd.png', intro: '巴岳寺旁素食餐厅，营业信息请以实时数据为准。' },
  '西郊雅社民宿': { type: 'merchant', id: 'xijiao-yashe', knowledgeRef: 'merchant-xijiao-yashe-homestay', image: 'assets/西郊雅社-1.jpeg', intro: '携程四钻民宿，10 间客房，房态请以实时信息为准。' },
  '重庆西温泉度假酒店': { type: 'merchant', id: 'history', knowledgeRef: 'merchant-west-hot-spring-hotel', image: 'assets/trip-day-tour-hd.png', intro: '玄天湖景区内度假酒店，89 间客房，房态请以实时信息为准。' },
  '涪江山居民宿': { type: 'merchant', id: 'history', knowledgeRef: 'merchant-fujiang-shanju-stay', image: 'assets/recommend-3.png', intro: '安居古城内已确认入驻的全国乙级民宿，房态请以实时信息为准。' },
  '翰林山居民宿': { type: 'merchant', id: 'history', knowledgeRef: 'merchant-hanlin-shanju', image: 'assets/recommend-3.png', intro: '安居古城内已确认入驻的全国丙级民宿，房态请以实时信息为准。' },
  '风物集市': { type: 'merchant', id: 'history', knowledgeRef: 'merchant-fengwu-market', image: 'assets/火龙冰箱贴.png', intro: '安居古城文创商铺，为样板对接商家。' },
  '重庆市铜梁区龙文化传媒有限公司': { type: 'merchant', id: 'history', knowledgeRef: 'merchant-dragon-culture-media', image: 'assets/火龙冰箱贴.png', intro: '铜梁文创及非遗伴手礼商家，支持分钟级库存同步 API。' },
  '铜梁龙玩偶': { type: 'product', id: 'history', image: 'assets/火龙冰箱贴.png' },
  '骑行租赁': { type: 'product', id: 'history', image: 'assets/玄天湖骑行案例.jpg' },
  '摄影服务': { type: 'product', id: 'history', image: 'assets/feature-4.png' },
  '雨具补给': { type: 'product', id: 'history', image: 'assets/玄天湖全景航拍.jpeg' },
  '徒步补给': { type: 'product', id: 'history', image: 'assets/trip-day-tour-hd.png' },
  '下午茶': { type: 'product', id: 'history', image: 'assets/玄天湖全景航拍.jpeg' },
  '铜梁夜宵': { type: 'product', id: 'history', image: 'assets/湖景火锅.jpeg' },
  '泡椒头刀菜': { type: 'product', id: 'toudaocai', knowledgeRef: 'merchant-yuanxiang-toudao', image: 'assets/头刀菜.jpeg' },
  '双人火锅套餐': { type: 'product', id: 'xuantian-hotpot', knowledgeRef: 'merchant-xuantian-lake-view-hotpot', image: 'assets/湖景火锅.jpeg' },
  '油烧兔': { type: 'product', id: 'sanhuochun', knowledgeRef: 'merchant-sanhuo-restaurant', image: 'assets/三活春油烧兔-1.png' },
  '铜梁龙舞展演': { type: 'activity', id: 'dragon-dance', image: 'assets/火龙铁花.png', intro: '近距离感受铜梁龙舞的动作、节奏与互动。' },
  '追梦·铜梁龙非遗山水实景剧': { type: 'activity', id: 'dragon-night-show', image: 'assets/火龙铁花.png', intro: '以铜梁龙文化和鲤鱼化龙故事为载体的山水实景剧，场次需实时确认。' },
  '玄天湖环湖骑行': { type: 'activity', id: 'xuantian-lake-trail', image: 'assets/玄天湖骑行案例.jpg', intro: '玄天湖景区内约 10 公里环湖绿道的骑行体验，开放状态请以实时信息为准。' },
  '古城讲解': { type: 'activity', id: 'ancient-town-guide', image: 'assets/trip-stone-scenic-hd.png', intro: '跟随讲解慢逛安居古城，了解老街与码头故事。' },
  '互动龙舞展演': { type: 'activity', id: 'dragon-dance', image: 'assets/火龙铁花.png', intro: '适合拍摄和参与互动的铜梁龙舞展演。' },
  '花海夜游': { type: 'activity', id: 'garden-night', image: 'assets/feature-4.png', intro: '傍晚走进奇彩梦园，体验花海与夜间灯光。' },
  '火龙表演': { type: 'activity', id: 'fire-dragon-show', image: 'assets/打铁花实景.png', intro: '夜间火龙表演，建议提前到场选择安全观演区。' },
  '夜间演出': { type: 'activity', id: 'dragon-night-show', image: 'assets/火龙铁花.png', intro: '铜梁龙文化演艺中心夜间场次。' }
};
const marqueeEntityButton = (name, label = name) => {
  const entity = marqueeEntityCatalog[name];
  if (!entity) return escapeHTML(label);
  return `<button type="button" class="marquee-entity-link" data-marquee-entity="${escapeHTML(name)}" aria-label="查看${escapeHTML(name)}">${escapeHTML(label)}</button>`;
};
const marqueeEntityWishlistKey = (name, entity) => entity?.knowledgeRef || `marquee-${entity?.type || 'entity'}-${name}`;
const marqueeEntityWishlistButton = name => {
  const entity = marqueeEntityCatalog[name];
  if (!entity || !['product', 'merchant'].includes(entity.type)) return '';
  const itemId = marqueeEntityWishlistKey(name, entity);
  const added = marqueeWishlistAlreadyAdded(itemId);
  return `<button type="button" class="marquee-entity-wishlist${added ? ' is-added' : ''}" data-marquee-entity-wishlist="${escapeHTML(itemId)}" data-marquee-entity-name="${escapeHTML(name)}" data-marquee-entity-kind="${escapeHTML(entity.type)}" aria-label="${added ? `已将${escapeHTML(name)}加入我的心愿单` : `将${escapeHTML(name)}加入我的心愿单`}" title="${added ? '已加入心愿单' : '加入心愿单'}"${added ? ' disabled' : ''}>${icons.heart}</button>`;
};
const renderMarqueeEntityText = value => {
  const names = Object.keys(marqueeEntityCatalog).sort((left, right) => right.length - left.length);
  let cursor = 0;
  let output = '';
  const source = String(value);
  while (cursor < source.length) {
    const name = names.find(item => source.startsWith(item, cursor));
    if (name) {
      output += marqueeEntityButton(name);
      cursor += name.length;
    } else {
      output += escapeHTML(source[cursor]);
      cursor += 1;
    }
  }
  return output;
};
const renderMarqueeEntityList = entities => entities.map(entity => {
  const separator = entity.indexOf('：');
  const name = separator === -1 ? entity : entity.slice(separator + 1);
  return `${escapeHTML(separator === -1 ? '' : entity.slice(0, separator + 1))}${marqueeEntityButton(name)}${marqueeEntityWishlistButton(name)}`;
}).join('<i aria-hidden="true">·</i>');
const renderMarqueeEntityCards = entities => {
  const inlineItems = [];
  const cardItems = [];
  (entities || []).forEach(entityText => {
    const separator = entityText.indexOf('：');
    const name = separator === -1 ? entityText : entityText.slice(separator + 1);
    const entity = marqueeEntityCatalog[name];
    if (entity && ['product', 'merchant'].includes(entity.type)) cardItems.push({ entityText, name, entity });
    else inlineItems.push(entityText);
  });
  const inlineMarkup = inlineItems.length ? `<div class="marquee-entity-inline-list">${renderMarqueeEntityList(inlineItems)}</div>` : '';
  const cardMarkup = cardItems.map(({ entityText, name, entity }) => {
    const itemId = marqueeEntityWishlistKey(name, entity);
    const added = marqueeWishlistAlreadyAdded(itemId);
    const entityType = entity.type === 'merchant' ? '商户' : '商品';
    const category = entityText.includes('：') ? entityText.slice(0, entityText.indexOf('：')) : '';
    const subline = category && category !== entityType ? `${entityType} · ${category}` : entityType;
    const address = entity.address || '重庆市铜梁区玄天湖周边';
    return `<article class="marquee-entity-card"><button type="button" class="marquee-entity-card-main" data-marquee-entity="${escapeHTML(name)}" aria-label="查看${escapeHTML(name)}详情"><img src="${assetUrl(entity.image)}" alt="${escapeHTML(name)}"><span><strong>${escapeHTML(name)}</strong><small>${escapeHTML(subline)}</small></span></button><button type="button" class="marquee-entity-card-address" data-marquee-map="${escapeHTML(name)}" data-marquee-name="${escapeHTML(name)}" data-marquee-kind="${escapeHTML(entity.type)}" data-marquee-image="${escapeHTML(entity.image)}" data-marquee-intro="${escapeHTML(entity.intro || '')}" data-marquee-distance="距你 1.8km" aria-label="导航到${escapeHTML(name)}">${icons.pin}<span>${escapeHTML(address)}</span></button><div class="marquee-entity-card-actions"><button type="button" class="marquee-entity-card-map" data-marquee-map="${escapeHTML(name)}" data-marquee-name="${escapeHTML(name)}" data-marquee-kind="${escapeHTML(entity.type)}" data-marquee-image="${escapeHTML(entity.image)}" data-marquee-intro="${escapeHTML(entity.intro || '')}" data-marquee-distance="距你 1.8km" aria-label="定位${escapeHTML(name)}">${icons.pin}</button><button type="button" class="marquee-entity-wishlist${added ? ' is-added' : ''}" data-marquee-entity-wishlist="${escapeHTML(itemId)}" data-marquee-entity-name="${escapeHTML(name)}" data-marquee-entity-kind="${escapeHTML(entity.type)}" aria-label="${added ? `已将${escapeHTML(name)}加入我的心愿单` : `将${escapeHTML(name)}加入我的心愿单`}" title="${added ? '已加入心愿单' : '加入心愿单'}">${icons.heart}</button><button type="button" class="marquee-entity-chat" data-marquee-entity-chat="${escapeHTML(name)}" aria-label="咨询${escapeHTML(name)}" title="咨询">${icons.chat}</button></div></article>`;
  }).join('');
  return `${inlineMarkup}${cardMarkup ? `<div class="marquee-entity-carousel" aria-label="商品和商户推荐">${cardMarkup}</div>` : ''}`;
};
const renderWishlistPlanMessage = message => {
  const rows = Array.isArray(message.planRows) ? message.planRows : [];
  const times = ['09:30', '12:00', '15:00', '18:30', '20:00'];
  const cards = rows.map((item, index) => {
    const entity = marqueeEntityCatalog[item.name] || {};
    const image = entity.image || (item.kind === 'merchant' ? 'assets/西郊雅社-1.jpeg' : 'assets/头刀菜.jpeg');
    const itemId = item.key || item.id || item.name;
    const added = isWishlistItemAdded(itemId);
    const address = entity.address || '重庆市铜梁区玄天湖周边';
    return `<article class="marquee-entity-card"><button type="button" class="marquee-entity-card-main" data-marquee-entity="${escapeHTML(item.name)}" aria-label="查看${escapeHTML(item.name)}详情"><img src="${assetUrl(image)}" alt="${escapeHTML(item.name)}"><span><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(times[index % times.length])} · ${escapeHTML(item.kind === 'merchant' ? '商户' : '目的地')}</small></span></button><button type="button" class="marquee-entity-card-address" data-marquee-map="${escapeHTML(item.name)}" data-marquee-name="${escapeHTML(item.name)}" data-marquee-kind="${escapeHTML(item.kind || 'merchant')}" data-marquee-image="${escapeHTML(image)}" data-marquee-intro="${escapeHTML(entity.intro || '')}" data-marquee-distance="距你 ${index + 1}.${index + 2}km" aria-label="导航到${escapeHTML(item.name)}">${icons.pin}<span>${escapeHTML(address)}</span></button><div class="marquee-entity-card-actions"><button type="button" class="marquee-entity-card-map" data-marquee-map="${escapeHTML(item.name)}" data-marquee-name="${escapeHTML(item.name)}" data-marquee-kind="${escapeHTML(item.kind || 'merchant')}" data-marquee-image="${escapeHTML(image)}" data-marquee-intro="${escapeHTML(entity.intro || '')}" data-marquee-distance="距你 ${index + 1}.${index + 2}km" aria-label="定位${escapeHTML(item.name)}">${icons.pin}</button><button type="button" class="marquee-entity-wishlist${added ? ' is-added' : ''}" data-marquee-entity-wishlist="${escapeHTML(itemId)}" data-marquee-entity-name="${escapeHTML(item.name)}" data-marquee-entity-kind="${escapeHTML(item.kind || 'merchant')}" aria-label="${added ? `已将${escapeHTML(item.name)}加入我的心愿单` : `将${escapeHTML(item.name)}加入我的心愿单`}" title="${added ? '已加入心愿单' : '加入心愿单'}">${icons.heart}</button><button type="button" class="marquee-entity-chat" data-marquee-entity-chat="${escapeHTML(item.name)}" aria-label="咨询${escapeHTML(item.name)}" title="咨询">${icons.chat}</button></div></article>`;
  }).join('');
  return `<div class="marquee-copy"><p>${escapeHTML(message.text || '已按当前定位和心愿单顺路安排。')} 建议依次前往：</p><p>${rows.map((item, index) => `${times[index % times.length]} ${escapeHTML(item.name)}，预留约 1 小时游览或用餐。`).join('<br>')}</p></div><div class="marquee-entity-carousel" aria-label="心愿计划商户推荐">${cards}</div>`;
};
// Free-form input shares the entity catalog used by marquee conversations so every
// recommendation has the same map, detail and wishlist path.
const inputIntentConfigs = {
  eat: {
    label: '吃',
    knowledge: '已从餐饮知识中匹配口味、用餐场景与景区周边服务。营业、排位和套餐价格请以实时信息为准。',
    answer: '可先以玄天湖为用餐落点，骑行或看演出前后安排一顿热菜；想继续缩小范围，我可以按口味、人数或用餐时间再筛选。',
    entities: ['POI：玄天湖', '商户：玄天湖龙火锅（龙舞广场店）', '商品：铜梁夜宵', '活动：火龙表演']
  },
  stay: {
    label: '住',
    knowledge: '已从住宿知识中匹配景区位置、房态和线上预订能力。房型、价格与可订状态请以实时信息为准。',
    answer: '如果想把玄天湖安排得更从容，可优先查看湖区内的重庆西温泉度假酒店；也可以再告诉我住几晚、同行人数或预算。',
    entities: ['POI：玄天湖观景台', '商户：重庆西温泉度假酒店', '商品：下午茶', '活动：夜间演出']
  },
  tour: {
    label: '游',
    knowledge: '已从游玩知识中匹配景区、路线、体验服务与活动，推荐会优先保留可继续进入地图或详情页的关联内容。',
    answer: '可从玄天湖环湖道开始，先选骑行或慢游节奏，再衔接餐饮和夜间活动；需要我按半日、全天或亲子同行继续安排也可以。',
    entities: ['POI：玄天湖环湖道', '商户：巴岳山素食餐厅', '商品：骑行租赁', '活动：玄天湖环湖骑行']
  },
  shop: {
    label: '购',
    knowledge: '已从文创和伴手礼知识中匹配商户、商品与古城游逛场景，库存和价格请以实时信息为准。',
    answer: '想带走铜梁记忆，可把安居古城和风物集市串在一起；文创款式与库存建议在到店前再次确认。',
    entities: ['POI：安居古城', '商户：风物集市', '商品：铜梁龙玩偶', '活动：古城讲解']
  }
};
const inputIntentEntityConfigs = [
  {
    matcher: /头刀菜|头刀肉|泡椒/,
    domain: 'eat',
    subject: '铜梁头刀菜',
    knowledge: '已从原乡头刀菜餐饮知识中匹配非遗泡椒头刀菜、双椒红袍鸡肾和油烧兔等特色菜信息；口味、营业和套餐价格请以实时信息为准。',
    answer: '想尝铜梁代表菜，可优先查看铜梁区原乡头刀菜餐饮店；第一次点单可从泡椒头刀菜入手，并向商家确认辣度和同行人数对应的套餐。',
    entities: ['商户：铜梁区原乡头刀菜餐饮店', '商品：泡椒头刀菜', 'POI：龙门老街', '活动：古城讲解']
  },
  {
    matcher: /火锅|锅底/,
    domain: 'eat',
    subject: '玄天湖湖景火锅',
    knowledge: '已从玄天湖湖景火锅知识中匹配景区餐饮、用餐时段与周边游玩服务；营业、排位、锅底和套餐价格请以实时信息为准。',
    answer: '如果准备在玄天湖附近用餐，可优先查看玄天湖湖景火锅；建议结合骑行或夜游结束时间提前确认排位，再按人数选择双人或多人套餐。',
    entities: ['POI：玄天湖', '商户：玄天湖湖景火锅', '商品：双人火锅套餐', '活动：火龙表演']
  },
  {
    matcher: /三活|油烧兔|烧兔/,
    domain: 'eat',
    subject: '铜梁三活油烧兔',
    knowledge: '已从三活餐馆知识中匹配油烧兔、药膳炖铜梁黑鸡等特色菜及城区用餐场景；菜品供应、口味和营业状态请以实时信息为准。',
    answer: '想吃铜梁特色正餐，可查看铜梁区三活餐馆的油烧兔；如同行人数较多，建议先确认招牌菜份量和当日可点套餐。',
    entities: ['商户：铜梁区三活餐馆', '商品：油烧兔', 'POI：龙门老街', '活动：火龙表演']
  }
];
const inputIntentDomains = [
  ['eat', /吃|饭|餐|火锅|小吃|夜宵|早餐|口味|辣|美食/],
  ['stay', /住|酒店|民宿|房态|住宿|订房|客房/],
  ['tour', /游|玩|景|玄天湖|安居|古城|徒步|骑行|龙舞|火龙|打铁花|路线|停车|拍照|演出/],
  ['shop', /买|购|文创|特产|伴手礼|礼物|商品|纪念品/]
];
const inputIntentChoiceLabels = Object.fromEntries(Object.entries(inputIntentConfigs).map(([key, config]) => [key, `想安排${config.label}`]));
const findInputIntentEntityConfig = value => inputIntentEntityConfigs.find(config => config.matcher.test(value));
const findInputIntentDomains = value => inputIntentDomains
  .filter(([domain, matcher]) => matcher.test(value) && !new RegExp(`不(?:要|想|吃).{0,5}(?:${matcher.source})`).test(value))
  .map(([domain]) => domain);
const hasInputIntentInterrupt = value => /不(?:要|想)|换|改成|另外|先不|别.*(吃|住|玩|买)/.test(value);
const latestPendingInputIntent = () => {
  const latest = [...sharedConversationMessages].reverse().find(message => message.role === 'assistant' && message.type === 'input-intent');
  return latest?.phase === 'result' ? null : latest;
};
const latestConfirmedInputIntent = () => [...sharedConversationMessages].reverse().find(message => message.role === 'assistant' && message.type === 'input-intent' && message.phase === 'result');
const inputIntentClarification = (phase = 'domain', domain = '') => ({
  role: 'assistant',
  type: 'input-intent',
  phase,
  domain,
  question: phase === 'scope'
    ? '这次还涉及出行、时间或同行人，我再确认一项：你计划什么时候出发？'
    : '我想先确认你这次最想解决的事：吃、住、游还是购？',
  choices: phase === 'scope' ? ['今天/今晚', '明天', '周末'] : Object.keys(inputIntentConfigs).map(key => inputIntentChoiceLabels[key])
});
const inputIntentResult = (domain, mode = 'new', entityConfig = null) => {
  const config = entityConfig || inputIntentConfigs[domain];
  return { role: 'assistant', type: 'input-intent', phase: 'result', domain, mode, subject: config.subject || '', knowledge: config.knowledge, answer: config.answer, entities: config.entities };
};
const renderInputIntent = message => {
  if (message.phase !== 'result') {
    return `<section class="input-intent-card input-intent-question"><strong>${escapeHTML(message.question)}</strong><div>${message.choices.map((choice, index) => `<button type="button" data-input-intent-choice="${escapeHTML(choice)}" data-input-intent-domain="${escapeHTML(message.domain || Object.keys(inputIntentConfigs)[index] || '')}" data-input-intent-phase="${escapeHTML(message.phase)}">${escapeHTML(choice)}</button>`).join('')}</div></section>`;
  }
  return `<section class="input-intent-card input-intent-result"><p>${escapeHTML(message.knowledge)}</p><b>推荐</b><p>${renderMarqueeEntityText(message.answer)}</p>${renderMarqueeEntityCards(message.entities || [])}</section>`;
};
const renderMarqueeIntent = message => {
  const config = marqueeIntentConfigs[message.topic];
  if (!config) return '';
  const isResult = message.stage === 'result';
  const isSecondRound = message.stage === 2;
  const question = isSecondRound ? config.extraQuestion : config.question;
  const choices = isSecondRound ? config.extraChoices : config.choices;
  const replyHint = choices?.length
    ? `你可以回复我，${choices.join('、')}，也可以直接在下方输入你的想法`
    : '也可以直接在下方输入你的想法';
  const questionMarkup = `<div class="marquee-intent-question"><strong>${escapeHTML(question)}</strong><small>${escapeHTML(replyHint)}</small></div>`;
  return `<section class="marquee-intent-card">${isResult
    ? `<div class="marquee-intent-result"><strong>推荐</strong><p>${renderMarqueeEntityText(config.result)}</p>${renderMarqueeEntityCards(config.entities)}</div>`
    : questionMarkup}</section>`;
};
const marqueeRouteNodeDetail = (topic, index) => {
  const node = topic.steps?.[index] || '路线节点';
  const details = [
    `${node}：建议提前10分钟到达，地图已为你标记入口与停车位置。`,
    `${node}：这里适合停留拍照，也能顺路补给饮品和小吃。`,
    `${node}：把这一站留给收尾，附近有休息点和本地人常去的店。`
  ];
  return details[index] || details[0];
};
const marqueeLinkedItem = (topic, shop) => {
  if (shop) {
    const itemId = shop.id === 'sanhuochun' ? 'sanhuochun' : shop.id === 'xuantian-hotpot' ? 'xuantian-hotpot' : 'toudaocai';
    const image = itemId === 'sanhuochun' ? 'assets/三活春油烧兔-1.png' : itemId === 'xuantian-hotpot' ? 'assets/湖景火锅.jpeg' : 'assets/头刀菜.jpeg';
    return { id: itemId, name: shop.name, kind: 'product', image, price: shop.price.replace('人均', ''), distance: shop.distance };
  }
  const isRoute = topic.template === 'route';
  return {
    id: isRoute ? 'xuantian-lake-trail' : topic.template === 'watch' ? 'fire-dragon' : 'xijiao-yashe',
    name: topic.title,
    kind: isRoute || topic.template === 'watch' ? 'merchant' : 'merchant',
    image: topic.media || (isRoute ? 'assets/trip-day-tour-hd.png' : 'assets/西郊雅社-1.jpeg'),
    intro: topic.summary || topic.prompt || topic.lead,
    distance: '距你 1.8km'
  };
};
const marqueeWishlistAlreadyAdded = itemId => {
  try { return JSON.parse(sessionStorage.getItem('tongliang-added-wishlist-items-v1') || '[]').some(item => item.id === itemId || item.id.startsWith(`${itemId}-`)); } catch (_) { return false; }
};
const renderMarqueeActions = (topicKey, item) => {
  const added = marqueeWishlistAlreadyAdded(item.id);
  return `<div class="marquee-link-actions"><button type="button" class="marquee-detail-action" data-marquee-detail="${escapeHTML(item.id)}">查看详情</button><button type="button" class="marquee-icon-action marquee-map-action" data-marquee-map="${escapeHTML(topicKey)}" data-marquee-name="${escapeHTML(item.name)}" data-marquee-kind="${item.kind}" data-marquee-image="${escapeHTML(item.image)}" data-marquee-price="${escapeHTML(item.price || '')}" data-marquee-intro="${escapeHTML(item.intro || '')}" data-marquee-distance="${escapeHTML(item.distance)}" aria-label="在地图查看${escapeHTML(item.name)}"><img src="${assetUrl('assets/高德图标.png')}" alt=""></button><button type="button" class="marquee-icon-action marquee-wishlist-action${added ? ' is-added' : ''}" data-marquee-wishlist="${escapeHTML(item.id)}" data-marquee-name="${escapeHTML(item.name)}" aria-label="${added ? `已将${escapeHTML(item.name)}加入我的心愿单` : `将${escapeHTML(item.name)}加入我的心愿单`}"${added ? ' disabled' : ''}>${icons.heart}</button></div>`;
};
const renderMarqueeTemplate = (message) => {
  const topic = marqueeTopics[message.topic];
  if (!topic) return '';
  if (message.type === 'marquee-intent') return renderMarqueeIntent(message);
  if (message.type === 'marquee-route-steps') {
    const item = marqueeLinkedItem(topic);
    return `<div class="marquee-copy"><p>路线拆成三站，按自己的节奏走就行。</p></div><section class="marquee-card marquee-route-steps"><strong>${escapeHTML(topic.title)}</strong><div class="marquee-route-nodes">${topic.steps.map((step, index) => `<button type="button" data-marquee-route-node data-topic="${escapeHTML(message.topic)}" data-node-index="${index}"><i>${index + 1}</i>${escapeHTML(step)}<span>›</span></button>`).join('')}</div>${renderMarqueeActions(message.topic, item)}</section>`;
  }
  if (message.type === 'marquee-route-node') {
    const detail = marqueeRouteNodeDetail(topic, Number(message.nodeIndex));
    const item = marqueeLinkedItem(topic);
    return `<section class="marquee-card marquee-node-detail"><strong>${escapeHTML(topic.steps?.[Number(message.nodeIndex)] || '路线节点')}</strong><p>${escapeHTML(detail)}</p><button type="button" data-marquee-node-map>在地图查看 →</button>${renderMarqueeActions(message.topic, item)}</section>`;
  }
  if (message.type === 'marquee-vote-comments') {
    const item = marqueeLinkedItem(topic);
    return `<section class="marquee-card marquee-comments"><strong>大家怎么吐槽</strong><p>“说附近就别问几分钟，问就是马上到。”</p><p>“停车位不是没有，是它还没和你见面。”</p><button type="button" data-marquee-share-story>说说我的经历</button>${renderMarqueeActions(message.topic, item)}</section>`;
  }
  if (topic.template === 'route') {
    const item = marqueeLinkedItem(topic);
    return `<div class="marquee-copy"><p>${escapeHTML(topic.lead)}</p></div><section class="marquee-card marquee-route-card"><strong>${escapeHTML(topic.title)}</strong><p class="marquee-meta">${escapeHTML(topic.meta)}</p><p>${escapeHTML(topic.summary)}</p>${topic.detail ? `<p>${escapeHTML(topic.detail)}</p>` : ''}<button type="button" data-marquee-action="route" data-topic="${escapeHTML(message.topic)}">带我去玩 <span>→</span></button>${renderMarqueeActions(message.topic, item)}</section>`;
  }
  if (topic.template === 'food') {
    const shops = [topic.shop, { ...topic.shop, name: '玄天湖湖景火锅', distance: '距离请以地图为准', price: '价格请以门店为准', note: '玄天湖景区内餐饮候选，营业状态请以实时信息为准', id: 'xuantian-hotpot' }];
    const shop = shops[Math.min(Number(message.shopIndex) || 0, shops.length - 1)];
    const item = marqueeLinkedItem(topic, shop);
    return `<div class="marquee-copy"><p>${escapeHTML(topic.lead)}</p></div><section class="marquee-card marquee-food-card"><strong>本地人会带朋友去的 ${Number(message.shopIndex) === 1 ? '第 2 家' : '第 1 家'}</strong><div><b>${escapeHTML(shop.name)}</b><span>${escapeHTML(shop.distance)} · ${escapeHTML(shop.price)} · 营业中</span><p>${escapeHTML(shop.note)}</p></div>${renderMarqueeActions(message.topic, item)}${Number(message.shopIndex) !== 1 ? `<button type="button" class="marquee-secondary-action" data-marquee-next data-topic="${escapeHTML(message.topic)}">看下一家</button>` : ''}</section>`;
  }
  if (topic.template === 'vote') {
    const item = marqueeLinkedItem(topic);
    return `<div class="marquee-copy"><p>${escapeHTML(topic.lead)}</p></div><section class="marquee-card marquee-vote-card"><strong>${escapeHTML(topic.title)}</strong><div>${topic.options.map((option, index) => `<button type="button" data-marquee-vote data-topic="${escapeHTML(message.topic)}" data-choice="${index}"><span>${escapeHTML(option[0])}</span><b>${escapeHTML(option[1])}</b></button>`).join('')}</div>${renderMarqueeActions(message.topic, item)}</section>`;
  }
  const item = marqueeLinkedItem(topic);
  return `<div class="marquee-copy"><p>${escapeHTML(topic.lead)}</p></div><section class="marquee-card marquee-watch-card"><img src="${assetUrl(topic.media)}" alt="${escapeHTML(topic.title)}"><strong>${escapeHTML(topic.title)}</strong><p>${escapeHTML(topic.prompt)}</p><button type="button" data-marquee-action="watch" data-topic="${escapeHTML(message.topic)}">说说我的 <span>→</span></button>${renderMarqueeActions(message.topic, item)}</section>`;
};
const nearbyServiceResults = {
  eat: { label: '吃', title: '附近餐饮推荐', intro: '玄天湖西岸骑行后，先去湖畔坐一坐。', items: [
    { name: '玄天湖龙火锅（龙舞广场店）', meta: '玄天湖景区内 · 营业与排位请以实时信息为准', image: 'assets/湖景火锅.jpeg', id: 'xuantian-hotpot', knowledgeRef: 'merchant-xuantian-lake-dragon-hotpot' },
    { name: '玄天湖湖景火锅', meta: '玄天湖景区内 · 营业与排位请以实时信息为准', image: 'assets/湖景火锅.jpeg', id: 'xuantian-hotpot', knowledgeRef: 'merchant-xuantian-lake-view-hotpot' }
  ] },
  stay: { label: '住', title: '附近住宿推荐', intro: '今晚住在湖边，明早可以直接继续环湖。', items: [
    { name: '重庆西温泉度假酒店', meta: '玄天湖景区内 · 89 间客房 · 房态请以实时信息为准', image: 'assets/trip-day-tour-hd.png', id: 'history', knowledgeRef: 'merchant-west-hot-spring-hotel' },
    { name: '西郊雅社民宿', meta: '西来村 · 10 间客房 · 房态请以实时信息为准', image: 'assets/西郊雅社-1.jpeg', id: 'xijiao-yashe', knowledgeRef: 'merchant-xijiao-yashe-homestay' }
  ] },
  tour: { label: '游', title: '附近游玩推荐', intro: '从玄天湖出发，先选一段轻松又顺路的玩法。', items: [
    { name: '玄天湖环湖骑行', meta: '距北门 300m · 8.6km 环湖线', image: 'assets/玄天湖骑行案例.jpg', id: 'history' },
    { name: '铜梁龙文化演艺中心', meta: '距玄天湖 1.1km · 晚间可看打铁花', image: 'assets/打铁花实景.png', id: 'history' }
  ] },
  shop: { label: '购', title: '附近好物推荐', intro: '顺路带一件铜梁记忆回去。', items: [
    { name: '重庆市铜梁区龙文化传媒有限公司', meta: '铜梁文创与非遗伴手礼 · 库存可分钟级同步', image: 'assets/火龙冰箱贴.png', id: 'history', knowledgeRef: 'merchant-dragon-culture-media' },
    { name: '风物集市', meta: '安居古城文创商铺 · 商品与库存请以实时信息为准', image: 'assets/非遗竹编.png', id: 'history', knowledgeRef: 'merchant-fengwu-market' }
  ] },
  parking: { label: '停车位', title: '附近停车位', intro: '按当前定位，优先推荐进出方便、靠近服务点的停车场。', items: [
    { name: '玄天湖北门主停车场', meta: '距当前位置 350m · 余约 126 个车位 · 12小时 ¥10', image: 'assets/玄天湖全景航拍.jpeg' },
    { name: '龙舞广场停车区', meta: '距当前位置 900m · 余约 48 个车位 · 靠近演艺中心', image: 'assets/周末到铜梁.png' }
  ] },
  restroom: { label: '卫生间', title: '附近卫生间', intro: '以下点位均为公共卫生间，按步行距离排序。', items: [
    { name: '玄天湖北门游客中心卫生间', meta: '距当前位置 280m · 无障碍卫生间 · 开放中', image: 'assets/玄天湖全景航拍.jpeg' },
    { name: '龙舞广场公共卫生间', meta: '距当前位置 760m · 母婴台 · 开放中', image: 'assets/玄天湖骑行案例.jpg' }
  ] }
};
const renderNearbyService = message => {
  const result = nearbyServiceResults[message.nearbyType];
  if (!result) return '';
  const cards = result.items.map(item => {
    const itemId = item.knowledgeRef || item.id || item.name;
    const added = isWishlistItemAdded(itemId);
    const address = featureKnowledgePoi(item.name, marqueeEntityCatalog[item.name]).address || item.meta || '重庆市铜梁区玄天湖周边';
    const data = `data-nearby-id="${escapeHTML(itemId)}" data-nearby-image="${escapeHTML(item.image)}"`;
    return `<article><button type="button" class="nearby-result-main" data-nearby-locate="${escapeHTML(item.name)}" ${data} aria-label="查看${escapeHTML(item.name)}详情"><img src="${assetUrl(item.image)}" alt="${escapeHTML(item.name)}"><strong title="${escapeHTML(item.name)}">${escapeHTML(item.name)}</strong></button><button type="button" class="nearby-result-address" data-nearby-navigate="${escapeHTML(item.name)}" ${data} aria-label="导航到${escapeHTML(item.name)}">${icons.navigation}<span>${escapeHTML(address)}</span></button><div class="nearby-result-actions"><button type="button" class="nearby-result-action nearby-result-locate" data-nearby-locate="${escapeHTML(item.name)}" ${data} aria-label="定位${escapeHTML(item.name)}" title="定位">${icons.pin}</button><button type="button" class="nearby-result-action nearby-result-wishlist${added ? ' is-added' : ''}" data-nearby-wishlist="${escapeHTML(itemId)}" data-nearby-name="${escapeHTML(item.name)}" aria-label="${added ? `从心愿单移除${escapeHTML(item.name)}` : `将${escapeHTML(item.name)}加入我的心愿单`}" title="${added ? '取消心愿单' : '加入心愿单'}">${icons.heart}</button><button type="button" class="nearby-result-action nearby-result-chat" data-nearby-chat="${escapeHTML(item.name)}" aria-label="咨询${escapeHTML(item.name)}" title="咨询">${icons.chat}</button></div></article>`;
  }).join('');
  return `<section class="nearby-result-card"><div class="nearby-result-head"><span>${escapeHTML(message.location)}</span><strong>${escapeHTML(result.title)}</strong></div><p>${escapeHTML(result.intro)}</p><div class="nearby-result-list" aria-label="${escapeHTML(result.title)}">${cards}</div></section>`;
};
const appendAiMessageFooter = (bubble, language = 'zh') => {
  if (!bubble || bubble.querySelector('.ai-message-footer')) return;
  const footer = document.createElement('div');
  footer.className = 'ai-message-footer';
  const en = language === 'en';
  footer.innerHTML = `<span class="ai-message-disclaimer">${en ? 'AI-generated. For reference only.' : '内容由 AI 生成，仅供参考'}</span><div class="ai-message-actions"><button type="button" data-message-action="copy" aria-label="${en ? 'Copy response' : '复制回复'}" title="${en ? 'Copy response' : '复制回复'}">${icons.copy}</button><button type="button" data-message-action="like" aria-label="${en ? 'Like response' : '喜欢回复'}" title="${en ? 'Like response' : '喜欢回复'}">${icons.thumbUp}</button><button type="button" data-message-action="dislike" aria-label="${en ? 'Dislike response' : '不喜欢回复'}" title="${en ? 'Dislike response' : '不喜欢回复'}">${icons.thumbDown}</button></div>`;
  bubble.append(footer);
};
const upgradeConversationMapIcons = root => {
  root?.querySelectorAll('.knowledge-recommendation-map, .ride-map-action, .marquee-map-action, .marquee-entity-card-map').forEach(button => {
    if (button.querySelector('img')) button.innerHTML = icons.pin;
  });
};
const createConversationMessage = (message, { typewrite = false, thread } = {}) => {
  const element = document.createElement('div');
  element.className = `chat-message dynamic-message${message.role === 'user' ? ' user' : ''}`;
  if (message.role === 'user') {
    element.innerHTML = `<div class="bubble">${escapeHTML(message.text)}</div><span class="avatar-user">${icons.user}</span>`;
  } else if (message.type === 'agent') {
    const en = message.language === 'en';
    let content;
    if (message.status === 'pending') {
      content = `<div class="agent-status agent-skeleton-status" role="status" aria-live="polite"><span class="agent-skeleton-lines" aria-hidden="true"><i></i><i></i><i></i></span><span class="agent-skeleton-label">${en ? 'Preparing your answer…' : '正在为你整理回答…'}</span></div>`;
    } else if (message.status === 'error') {
      const errorText = window.TongliangAgent?.errorText(message.error, message.language) || (en ? 'Unable to reply. Please retry.' : '暂时无法回复，请重试。');
      content = `<p class="agent-status agent-error" role="status">${escapeHTML(errorText)}</p><div class="agent-response-controls"><button type="button" data-agent-retry="${escapeHTML(message.id)}">${en ? 'Retry' : '重试'}</button></div>`;
    } else {
      content = `<div class="agent-answer">${window.TongliangAgentUI?.renderAnswer?.(message) || escapeHTML(message.text || '')}</div>${window.TongliangAgentUI?.render(message, isWishlistItemAdded) || ''}${message.followUp ? `<p class="agent-follow-up">${window.TongliangAgentUI?.renderInline?.(message.followUp, message.language) || escapeHTML(message.followUp)}</p>` : ''}`;
    }
    if (message.routePlan?.status === 'ready') content += `<button type="button" class="agent-route-reopen" data-conversation-route="${escapeHTML(message.id)}">${en ? 'View this itinerary on the map' : '查看本次行程路线'}</button>`;
    element.innerHTML = `<img class="dragon-mini" src="${assetUrl('assets/dragon .png')}" alt="${en ? 'Tongliang guide' : '伴游龙'}"><div class="bubble agent-bubble">${content}</div>`;
  } else if (['ride-guide', 'event-guide', 'weekend-guide', 'companion-guide', 'feature-knowledge-guide'].includes(message.type)) {
    element.classList.add('chat-message-guide');
    element.innerHTML = `<img class="dragon-mini" src="${assetUrl('assets/dragon .png')}" alt="伴游龙"><div class="bubble ride-guide-bubble"></div>`;
    const bubble = element.querySelector('.ride-guide-bubble');
    renderStructuredGuide(bubble, message.blocks, {
      typewrite,
      thread,
      thinkingText: message.thinking,
      onComplete: () => {
        upgradeConversationMapIcons(bubble);
        appendAiMessageFooter(bubble);
      }
    });
  } else if (message.type === 'plan-followup') {
    element.classList.add('chat-message-plan-followup');
    element.innerHTML = `<img class="dragon-mini" src="${assetUrl('assets/dragon .png')}" alt="伴游龙"><div class="bubble plan-followup-bubble"><strong>计划已添加，是否边走边耍？</strong><div class="plan-followup-actions"><button type="button" data-plan-go>要得</button><button type="button" data-plan-stay>我自己看看</button></div></div>`;
  } else if (message.type === 'wishlist-plan') {
    element.classList.add('chat-message-marquee');
    element.innerHTML = `<img class="dragon-mini" src="${assetUrl('assets/dragon .png')}" alt="铜梁小小龙"><div class="bubble marquee-bubble">${renderWishlistPlanMessage(message)}</div>`;
  } else if (message.type?.startsWith('marquee-')) {
    element.classList.add('chat-message-marquee');
    element.innerHTML = `<img class="dragon-mini" src="${assetUrl('assets/dragon .png')}" alt="铜梁小小龙"><div class="bubble marquee-bubble">${renderMarqueeTemplate(message)}</div>`;
  } else if (message.type === 'nearby-service') {
    element.classList.add('chat-message-nearby');
    element.innerHTML = `<img class="dragon-mini" src="${assetUrl('assets/dragon .png')}" alt="铜梁小小龙"><div class="bubble nearby-bubble">${renderNearbyService(message)}</div>`;
  } else if (message.type === 'input-intent') {
    element.classList.add('chat-message-input-intent');
    element.innerHTML = `<img class="dragon-mini" src="${assetUrl('assets/dragon .png')}" alt="铜梁小小龙"><div class="bubble input-intent-bubble">${renderInputIntent(message)}</div>`;
  } else {
    element.innerHTML = `<img class="dragon-mini" src="${assetUrl('assets/dragon .png')}" alt="伴游龙"><div class="bubble">${renderMarqueeEntityText(message.text)}</div>`;
  }
  upgradeConversationMapIcons(element);
  if (message.role !== 'user') {
    const bubble = element.querySelector('.bubble');
    if (bubble && !['ride-guide', 'event-guide', 'weekend-guide', 'companion-guide', 'feature-knowledge-guide'].includes(message.type) &&
        (message.type !== 'agent' || message.status === 'complete')) appendAiMessageFooter(bubble, message.language || 'zh');
  }
  return element;
};
const getConversationBodyText = messageElement => {
  const bubble = messageElement?.querySelector('.bubble');
  if (!bubble) return '';
  const copy = bubble.cloneNode(true);
  copy.querySelector('.ai-message-footer')?.remove();
  copy.querySelector('.agent-response-controls')?.remove();
  return copy.innerText?.trim() || '';
};
// A display-only greeting: never store it as a model response or send it upstream.
const createConversationWelcome = () => {
  const en = currentLanguage === 'en';
  const element = document.createElement('div');
  element.className = 'chat-message dynamic-message conversation-welcome';
  element.innerHTML = `<img class="dragon-mini" src="${assetUrl('assets/dragon .png')}" alt="${en ? 'Tongliang guide' : '伴游龙'}"><div class="bubble"><strong>${en ? 'Hi! I’m your Tongliang travel companion 🐉' : '你好呀！我是你的铜梁伴游小助手 🐉'}</strong><p>${en ? 'I can help you explore Tongliang, find food and places to stay, pick souvenirs, and plan your trip.' : '想逛景点、找美食、选住宿、挑伴手礼，或安排游玩行程，都可以问我。'}</p><p>${en ? 'Try asking: “How can I spend a relaxed day in Tongliang?” or “What can I do around Xuantian Lake?”' : '你可以这样问：“铜梁一日游怎么安排比较轻松？”或“玄天湖周边有什么好玩的？”'}</p><p>${en ? 'What would you like to explore first?' : '这次来铜梁，你最想体验什么？'}</p></div>`;
  return element;
};
const renderSharedConversation = ({ typewriteLast = false } = {}) => {
  const threads = [mapConversationList, planConversationList].filter(Boolean);
  const activeThread = activeConversationThread();
  threads.forEach(thread => {
    thread.querySelectorAll('.dynamic-message, .map-conversation-empty, .plan-conversation-empty').forEach(message => message.remove());
    if (!sharedConversationMessages.length) {
      thread.appendChild(createConversationWelcome());
      return;
    }
    sharedConversationMessages.forEach((message, index) => {
      const element = createConversationMessage(message, {
        typewrite: typewriteLast && thread === activeThread && index === sharedConversationMessages.length - 1 && ['ride-guide', 'event-guide', 'weekend-guide', 'companion-guide', 'feature-knowledge-guide'].includes(message.type),
        thread
      });
      element.dataset.conversationIndex = String(index);
      thread.appendChild(element);
    });
  });
};
document.addEventListener('agent-catalog-ready', () => renderSharedConversation());
const restoreSharedConversation = () => {
  try {
    activeConversationId = readActiveConversationId();
    const records = readConversationDrawerHistory();
    const savedConversation = activeConversationId === mainConversationId
      ? isMainConversationCleared() ? [] : JSON.parse(sessionStorage.getItem(sharedConversationKey) || '[]')
      : records.find(record => record.id === activeConversationId)?.messages;
    if (!Array.isArray(savedConversation)) {
      setActiveConversation(mainConversationId);
      sharedConversationMessages = [];
      renderSharedConversation();
      return;
    }
    sharedConversationMessages = savedConversation.map(message => {
      if (message.type === 'agent') return recoverStoredAgentMessage(message);
      if (message.type === 'ride-case' || message.type === 'ride-guide') return { role: 'assistant', ...journeyRecommendations.ride };
      if (message.type === 'feature-knowledge-guide') return getFeatureKnowledgeGuide(message.guideKey) || message;
      if (message.type === 'weekend-guide') return { role: 'assistant', ...weekendGuide };
      if (message.type === 'companion-guide') return getCompanionGuide();
      if (message.type === 'event-guide') {
        return { role: 'assistant', ...ironFlowerGuide };
      }
      return message;
    });
    renderSharedConversation();
  } catch (_) {}
};
window.addEventListener('pageshow', event => {
  if (!event.persisted) return;
  restoreSharedConversation();
  if (planScreen) {
    planScreen.classList.remove('is-conversation-open', 'is-conversation-full');
    planConversationPanel?.setAttribute('aria-hidden', 'true');
    planConversationHandle?.setAttribute('aria-expanded', 'false');
    planScreen.querySelector('.plan-theme-content')?.scrollTo({ top: 0 });
  }
});
function addSharedConversationMessage(message) {
  clearMainConversationReset();
  sharedConversationMessages.push(message);
  persistActiveConversation();
  renderSharedConversation({ typewriteLast: ['ride-guide', 'event-guide', 'weekend-guide', 'companion-guide', 'feature-knowledge-guide'].includes(message.type) });
  const thread = activeConversationThread();
  if (typeof thread?.scrollTo === 'function') {
    thread.scrollTo({ top: thread.scrollHeight, behavior: 'smooth' });
  }
  return message;
}

function appendJourneyRecommendation(key, label = '', configuredPrompt = '') {
  const livePrompt = configuredPrompt?.trim() || getMarqueePrompt(key) || (currentLanguage === 'en' ? {
    event: 'How can I plan a visit to experience Tongliang dragon dances and fire dragon performances, and where can I check performance details?',
    food: 'Which local dishes and dining experiences should I try during a visit to Tongliang?',
    boat: 'Can you suggest a leisurely visit to Anju Ancient Town, including walks by the river and how to check available boat activities?'
  } : {
    event: '我想体验铜梁龙舞和火龙表演，怎样安排游玩，并在哪里确认演出信息？',
    food: '我想体验铜梁本地美食，有哪些值得尝试的特色菜和用餐选择？',
    boat: '我想去安居古城休闲游逛，怎样安排古城和江边散步，如何了解可体验的水上项目？'
  })[key];
  if (livePrompt) {
    sendComposerMessage(livePrompt, { marqueeTopic: getMarqueePrompt(key) ? key : '' });
    openActiveConversation('half');
    return;
  }
  const marqueeTopic = marqueeTopics[key];
  if (marqueeTopic) {
    document.querySelectorAll('[data-journey-key]').forEach(item => item.classList.toggle('is-selected', item.dataset.journeyKey === key));
    const intentConfig = marqueeIntentConfigs[key];
    if (intentConfig) {
      addSharedConversationMessage({ role: 'user', text: label || intentConfig.title, speak: false });
      addSharedConversationMessage({ role: 'assistant', type: 'marquee-intent', topic: key, stage: 1 });
    } else {
      addSharedConversationMessage({ role: 'assistant', type: `marquee-${marqueeTopic.template}`, topic: key });
    }
    openActiveConversation('half');
    return;
  }
  const recommendation = journeyRecommendations[key] || (label
    ? `${label}：已为你整理这条铜梁本地灵感的推荐内容，包含适合前往的时间、游玩重点和周边好吃好耍的去处。`
    : null);
  if (!recommendation) return;
  document.querySelectorAll('[data-journey-key]').forEach(item => item.classList.toggle('is-selected', item.dataset.journeyKey === key));
  addSharedConversationMessage(typeof recommendation === 'string'
    ? { role: 'assistant', text: recommendation }
    : { role: 'assistant', ...recommendation });
  openActiveConversation('half');
}
function submitMarqueePrompt(key) {
  const prompt = getMarqueePrompt(key);
  if (!prompt || !marqueeIntentConfigs[key]) {
    notify(currentLanguage === 'en' ? 'This topic has no prompt configured yet.' : '该话题暂未配置提示词，请稍后再试');
    return;
  }
  document.querySelectorAll('[data-journey-key]').forEach(item => {
    item.classList.toggle('is-selected', item.dataset.journeyKey === key);
  });
  // Submit through the shared composer pipeline; keep any unrelated draft.
  const draft = composerInput?.value || '';
  const keyboardDraft = keyboardComposerInput?.value || '';
  if (composerInput) composerInput.value = prompt;
  if (keyboardComposerInput) keyboardComposerInput.value = prompt;
  updateComposerState();
  openActiveConversation('half');
  try {
    sendComposerMessage(prompt, { marqueeTopic: key });
  } finally {
    if (composerInput) composerInput.value = draft;
    if (keyboardComposerInput) keyboardComposerInput.value = keyboardDraft;
    updateComposerState();
  }
}
function appendWeekendGuide() {
  addSharedConversationMessage({ role: 'assistant', ...weekendGuide });
  openActiveConversation('half');
}
function appendFeatureKnowledgeGuide(key, configuredPrompt = '') {
  const prompt = configuredPrompt?.trim() || (currentLanguage === 'en' ? {
    'xuantian-lake': 'Can you suggest a relaxed visit to Xuantian Lake, including scenic walks, places to rest and meal options?',
    'weekend': 'Can you plan a weekend in Tongliang combining lakes and mountains, an ancient town and local food?',
    'xuantian-lake-ride': 'I would like to cycle around Xuantian Lake. How should I plan the ride, check bicycle rental options and arrange a rest and meal afterwards?'
  } : {
    'xuantian-lake': '我想去玄天湖休闲游玩，怎样安排湖边散步、观景、休息和用餐？',
    'weekend': '我想去铜梁过周末，怎样安排兼顾山水、古城和本地美食的行程？',
    'xuantian-lake-ride': '我想去玄天湖骑行，怎样安排骑行、了解租车方式，以及骑行后的休息和用餐？'
  })[key];
  if (prompt) {
    sendComposerMessage(prompt);
    openActiveConversation('half');
    return;
  }
  const guide = getFeatureKnowledgeGuide(key);
  if (!guide) return;
  addSharedConversationMessage(guide);
  openActiveConversation('half');
}
const latestPendingMarqueeIntent = () => {
  const latest = [...sharedConversationMessages].reverse().find(message => message.role === 'assistant' && message.type === 'marquee-intent');
  return latest?.stage === 'result' ? null : latest;
};
const advanceMarqueeIntent = (topic, stage) => {
  const config = marqueeIntentConfigs[topic];
  if (!config) return;
  const nextStage = Number(stage) === 1 && config.extraQuestion ? 2 : 'result';
  addSharedConversationMessage({ role: 'assistant', type: 'marquee-intent', topic, stage: nextStage });
};
const openMarqueeEntity = name => {
  const entity = marqueeEntityCatalog[name];
  if (!entity) return;
  if (entity.type === 'poi') {
    const poi = { id: entity.id, name, kind: 'merchant', image: entity.image, intro: entity.intro, distance: '距你 1.8km' };
    if (switchConsumerBackground('map')) renderMarqueePoi(poi);
    else location.href = `explore.html?poi=${encodeURIComponent(name)}`;
    return;
  }
  if (entity.type === 'activity') {
    const query = new URLSearchParams({ item: entity.id, name, image: entity.image, intro: entity.intro || '' });
    location.href = `activity-detail.html?${query}`;
    return;
  }
  saveProductReturn();
  const query = entity.id === 'history'
    ? new URLSearchParams({ item: 'history', name, image: `../${entity.image}`, knowledgeRef: entity.knowledgeRef || '' })
    : new URLSearchParams({ item: entity.id, knowledgeRef: entity.knowledgeRef || '' });
  location.href = `product-detail.html?${query}`;
};
document.addEventListener('click', event => {
  const routeButton = event.target.closest('[data-conversation-route]');
  if (routeButton) {
    const message = sharedConversationMessages.find(row => row.id === routeButton.dataset.conversationRoute);
    activeWishlistRouteRequestId = message?.id || '';
    showConversationRoute(message);
    return;
  }
  const agentDetail = event.target.closest('[data-agent-detail]');
  if (agentDetail) saveProductReturn();
  const agentChat = event.target.closest('[data-agent-chat]');
  if (agentChat) {
    const entity = window.TongliangAgentUI?.getEntity(agentChat.dataset.agentChat);
    if (entity?.enabled) consultEntityCard(entity);
    return;
  }
  const agentWishlist = event.target.closest('[data-agent-wishlist]');
  if (agentWishlist) {
    const entity = window.TongliangAgentUI?.getEntity(agentWishlist.dataset.agentWishlist);
    if (!entity?.enabled) return;
    const itemId = entity.id.replace(/^product:/, '');
    if (isWishlistItemAdded(itemId)) removeWishlistItem(itemId);
    else addWishlistItem({ id: itemId, name: entity.name, kind: entity.kind, image: entity.image, address: entity.address }, agentWishlist);
    window.TongliangAgentUI?.syncWishlist?.(isWishlistItemAdded);
    return;
  }
  const agentLocation = event.target.closest('[data-agent-location]');
  if (agentLocation) {
    const en = currentLanguage === 'en';
    if (!window.confirm(en
      ? 'Use your device location once? It will be sent to this local service for subsequent nearby requests and rounded to the weather grid if weather is requested. It expires after 10 minutes.'
      : '是否一次性使用设备位置？位置将用于后续附近查询；查询天气时按区域精度提供给天气服务。10分钟后失效，不保存到历史。')) return;
    agentLocation.disabled = true;
    window.TongliangAgentUI?.authorizeLocation().then(() => {
      notify(en ? 'Location authorized. Send your nearby question again.' : '已授权定位，请重新发送附近查询。');
    }).catch(() => notify(en ? 'Location unavailable. No simulated location was used.' : '未取得定位，不会使用模拟位置。'))
      .finally(() => { agentLocation.disabled = false; });
    return;
  }
  const retryAgent = event.target.closest('[data-agent-retry]');
  if (retryAgent) { retryConsumerAgentMessage(retryAgent.dataset.agentRetry); return; }
  const cancelAgent = event.target.closest('[data-agent-cancel]');
  if (cancelAgent) { cancelConsumerAgentRequests(cancelAgent.dataset.agentCancel); return; }
  const inputIntentChoice = event.target.closest('[data-input-intent-choice]');
  if (inputIntentChoice) {
    sendComposerMessage(inputIntentChoice.dataset.inputIntentChoice);
    return;
  }
  const featureIntentChoice = event.target.closest('[data-feature-intent-choice]');
  if (featureIntentChoice) {
    const guide = featureKnowledgeGuides[featureIntentChoice.dataset.featureIntentChoice];
    const choiceIndex = Number(featureIntentChoice.dataset.featureIntentIndex);
    const choice = guide?.blocks.find(block => block.type === 'feature-intent-question')?.choices?.[choiceIndex];
    const result = guide?.intent?.results?.[choiceIndex];
    if (!guide || !choice || !result) return;
    document.querySelectorAll('[data-feature-intent-choice]').forEach(button => {
      if (button.dataset.featureIntentChoice === featureIntentChoice.dataset.featureIntentChoice) button.disabled = true;
    });
    sendComposerMessage(choice);
    return;
  }
  const featureKnowledgeWishlist = event.target.closest('[data-feature-knowledge-wishlist]');
  if (featureKnowledgeWishlist) {
    const itemId = featureKnowledgeWishlist.dataset.featureKnowledgeWishlist;
    const name = featureKnowledgeWishlist.dataset.featureKnowledgeName;
    const added = isWishlistItemAdded(itemId);
    document.querySelectorAll('[data-feature-knowledge-wishlist]').forEach(button => {
      if (button.dataset.featureKnowledgeWishlist !== itemId) return;
      button.classList.toggle('is-added', !added);
      button.setAttribute('aria-label', added ? `将${button.dataset.featureKnowledgeName}加入我的心愿单` : `从心愿单移除${button.dataset.featureKnowledgeName}`);
      button.title = added ? '加入心愿单' : '取消心愿单';
    });
    if (added) {
      removeWishlistItem(itemId);
      notify(`已从心愿单移除${name}`);
    } else {
      addWishlistItem({ id: itemId, name, kind: featureKnowledgeWishlist.dataset.featureKnowledgeKind }, featureKnowledgeWishlist);
      notify(`已加入心愿单：${name}`);
    }
    return;
  }
  const featureKnowledgeLocate = event.target.closest('[data-feature-knowledge-locate]');
  if (featureKnowledgeLocate) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const item = featureKnowledgePoi(featureKnowledgeLocate.dataset.featureKnowledgeLocate, marqueeEntityCatalog[featureKnowledgeLocate.dataset.featureKnowledgeLocate]);
    if (switchConsumerBackground('map')) renderMarqueePoi(item);
    else location.href = `explore.html?poi=${encodeURIComponent(item.name)}`;
    return;
  }
  const featureKnowledgeNavigate = event.target.closest('[data-feature-knowledge-navigate]');
  if (featureKnowledgeNavigate) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const item = featureKnowledgePoi(featureKnowledgeNavigate.dataset.featureKnowledgeNavigate, marqueeEntityCatalog[featureKnowledgeNavigate.dataset.featureKnowledgeNavigate]);
    location.href = poiNavigationHref(item);
    return;
  }
  const featureKnowledgeChat = event.target.closest('[data-feature-knowledge-chat]');
  if (featureKnowledgeChat) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const name = featureKnowledgeChat.dataset.featureKnowledgeChat;
    const prompt = `你想了解“${name}”这家店的什么情况？`;
    addSharedConversationMessage({ role: 'assistant', text: prompt });
    openActiveConversation('half');
    const input = document.querySelector('.composer input');
    if (input) {
      setComposerMerchantHint(name);
      input.focus();
    }
    return;
  }
  const featureKnowledgeLink = event.target.closest('[data-feature-knowledge]');
  if (featureKnowledgeLink) {
    openMarqueeEntity(featureKnowledgeLink.dataset.featureKnowledge);
    return;
  }
  const entityLink = event.target.closest('[data-marquee-entity]');
  if (entityLink) {
    openMarqueeEntity(entityLink.dataset.marqueeEntity);
    return;
  }
  const intentChoice = event.target.closest('[data-marquee-intent-choice]');
  if (intentChoice) {
    sendComposerMessage(intentChoice.dataset.marqueeIntentChoice);
    return;
  }
  const marqueeDetail = event.target.closest('[data-marquee-detail]');
  if (marqueeDetail) {
    saveProductReturn();
    location.href = `product-detail.html?item=${encodeURIComponent(marqueeDetail.dataset.marqueeDetail)}`;
    return;
  }
  const marqueeMap = event.target.closest('[data-marquee-map]');
  if (marqueeMap) {
    const item = {
      id: marqueeMap.dataset.marqueeMap,
      name: marqueeMap.dataset.marqueeName,
      kind: marqueeMap.dataset.marqueeKind,
      image: marqueeMap.dataset.marqueeImage,
      price: marqueeMap.dataset.marqueePrice,
      intro: marqueeMap.dataset.marqueeIntro,
      distance: marqueeMap.dataset.marqueeDistance
    };
    if (switchConsumerBackground('map')) renderMarqueePoi(item);
    else location.href = 'explore.html';
    return;
  }
  const marqueeEntityChat = event.target.closest('[data-marquee-entity-chat]');
  if (marqueeEntityChat) {
    const name = marqueeEntityChat.dataset.marqueeEntityChat || '这家店';
    const prompt = `你想了解“${name}”这家店的什么情况？`;
    addSharedConversationMessage({ role: 'assistant', text: prompt });
    openActiveConversation('half');
    return;
  }
  const marqueeEntityWishlist = event.target.closest('[data-marquee-entity-wishlist]');
  if (marqueeEntityWishlist) {
    const itemId = marqueeEntityWishlist.dataset.marqueeEntityWishlist;
    if (isWishlistItemAdded(itemId)) {
      removeWishlistItem(itemId);
      document.querySelectorAll('[data-marquee-entity-wishlist]').forEach(button => {
        if (button.dataset.marqueeEntityWishlist !== itemId) return;
        button.classList.remove('is-added');
        button.disabled = false;
        button.setAttribute('aria-label', `将${button.dataset.marqueeEntityName}加入我的心愿单`);
        button.title = '加入心愿单';
      });
      return;
    }
    document.querySelectorAll('[data-marquee-entity-wishlist]').forEach(button => {
      if (button.dataset.marqueeEntityWishlist !== itemId) return;
      button.disabled = true;
      button.classList.add('is-added');
      button.setAttribute('aria-label', `已将${button.dataset.marqueeEntityName}加入我的心愿单`);
      button.title = '已加入心愿单';
    });
    addWishlistItem({ id: itemId, name: marqueeEntityWishlist.dataset.marqueeEntityName, kind: marqueeEntityWishlist.dataset.marqueeEntityKind }, marqueeEntityWishlist);
    return;
  }
  const marqueeWishlist = event.target.closest('[data-marquee-wishlist]');
  if (marqueeWishlist) {
    if (marqueeWishlist.disabled) return;
    marqueeWishlist.disabled = true;
    marqueeWishlist.classList.add('is-added');
    marqueeWishlist.setAttribute('aria-label', `已将${marqueeWishlist.dataset.marqueeName}加入我的心愿单`);
    const linkedMapButton = marqueeWishlist.closest('.marquee-card')?.querySelector('[data-marquee-kind]');
    addWishlistItem({ id: marqueeWishlist.dataset.marqueeWishlist, name: marqueeWishlist.dataset.marqueeName, kind: linkedMapButton?.dataset.marqueeKind }, marqueeWishlist);
    return;
  }
  const marqueeAction = event.target.closest('[data-marquee-action]');
  if (marqueeAction) {
    const topic = marqueeTopics[marqueeAction.dataset.topic];
    if (marqueeAction.dataset.marqueeAction === 'route' && topic) {
      addSharedConversationMessage({ role: 'assistant', type: 'marquee-route-steps', topic: marqueeAction.dataset.topic });
      return;
    }
    if (marqueeAction.dataset.marqueeAction === 'food') {
      saveProductReturn();
      location.href = `product-detail.html?item=${encodeURIComponent(marqueeAction.dataset.productId)}`;
      return;
    }
    if (marqueeAction.dataset.marqueeAction === 'watch' && topic) {
      addSharedConversationMessage({ role: 'assistant', text: `说说看：${topic.prompt} 我会把你的回答接着聊下去。` });
      return;
    }
  }
  const nextShop = event.target.closest('[data-marquee-next]');
  if (nextShop) {
    addSharedConversationMessage({ role: 'assistant', type: 'marquee-food', topic: nextShop.dataset.topic, shopIndex: 1 });
    return;
  }
  const voteButton = event.target.closest('[data-marquee-vote]');
  if (voteButton) {
    const topic = marqueeTopics[voteButton.dataset.topic];
    const choice = topic?.options?.[Number(voteButton.dataset.choice)]?.[0] || '这个选项';
    addSharedConversationMessage({ role: 'assistant', text: `你选了“${choice}”。恭喜，已经具备铜梁出门的时间观念。` });
    addSharedConversationMessage({ role: 'assistant', type: 'marquee-vote-comments', topic: voteButton.dataset.topic });
    return;
  }
  const routeNode = event.target.closest('[data-marquee-route-node]');
  if (routeNode) {
    addSharedConversationMessage({ role: 'assistant', type: 'marquee-route-node', topic: routeNode.dataset.topic, nodeIndex: Number(routeNode.dataset.nodeIndex) });
    return;
  }
  if (event.target.closest('[data-marquee-node-map]')) {
    if (!switchConsumerBackground('map')) location.href = 'explore.html';
    return;
  }
  if (event.target.closest('[data-marquee-share-story]')) {
    addSharedConversationMessage({ role: 'assistant', text: '我在听。把你遇到的那段经历告诉我，咱们一起把它写进铜梁的小故事里。' });
    return;
  }
  if (event.target.closest('[data-plan-go]')) {
    if (!hasCurrentLocation() && !readCompanionMode()) {
      requestOneTimeLocationForExplore();
      return;
    }
    if (!switchConsumerBackground('map')) location.href = 'explore.html';
    return;
  }
  if (event.target.closest('[data-plan-stay]')) {
    const button = event.target.closest('[data-plan-stay]');
    const bubble = button.closest('.plan-followup-bubble');
    button.blur();
    if (bubble?.dataset.stayResponded) return;
    bubble.dataset.stayResponded = 'true';
    addSharedConversationMessage({ role: 'assistant', text: '好的，需要我做啥子，请随时给我说' });
    return;
  }
  const chip = event.target.closest?.('[data-journey-key]');
  if (!chip || !chip.closest('[data-journey-marquee]')) return;
  submitMarqueePrompt(chip.dataset.journeyKey);
});
const clearConversation = () => {
  cancelConsumerAgentRequests();
  sharedConversationRevision += 1;
  setActiveConversation(mainConversationId);
  sharedConversationMessages = [];
  markMainConversationCleared();
  writeMainConversation();
  clearSavedWeekendPlan();
  renderSharedConversation();
  if (mapScreen) {
    markerLayer?.replaceChildren();
    markerCard?.classList.remove('show', 'wishlist-poi-card', 'poi-action-card');
    document.querySelectorAll('.category').forEach(category => category.classList.remove('active'));
  }
  notify('对话和已加入的计划已清除');
};
document.querySelectorAll('[data-clear-conversation]').forEach(button => button.addEventListener('click', clearConversation));

const setMapConversationHeight = height => {
  if (!mapConversationPanel || !mapScreen) return;
  const maxHeight = mapScreen.clientHeight;
  const nextHeight = Math.round(Math.min(maxHeight, Math.max(0, height)));
  mapConversationPanel.style.setProperty('--map-conversation-height', `${nextHeight}px`);
  mapScreen.classList.toggle('is-conversation-full', nextHeight >= maxHeight - 2);
};
const openMapConversation = (view = 'preserve') => {
  if (!mapConversationPanel || !mapScreen) return;
  const isOpen = mapScreen.classList.contains('is-conversation-open');
  if (view === 'full') setMapConversationHeight(mapScreen.clientHeight);
  else if (view === 'half' || !isOpen) setMapConversationHeight(mapScreen.clientHeight / 2);
  mapScreen.classList.add('is-conversation-open');
  mapConversationPanel.setAttribute('aria-hidden', 'false');
  mapConversationHandle?.setAttribute('aria-expanded', 'true');
  if (!isOpen) renderSharedConversation();
};
const closeMapConversation = () => {
  if (!mapConversationPanel || !mapScreen) return;
  mapScreen.classList.remove('is-conversation-open', 'is-conversation-full');
  mapConversationPanel.setAttribute('aria-hidden', 'true');
  mapConversationHandle?.setAttribute('aria-expanded', 'false');
};

const setPlanConversationHeight = height => {
  if (!planConversationPanel || !planScreen) return;
  const maxHeight = planScreen.clientHeight;
  const nextHeight = Math.round(Math.min(maxHeight, Math.max(0, height)));
  planConversationPanel.style.setProperty('--plan-conversation-height', `${nextHeight}px`);
  planScreen.classList.toggle('is-conversation-full', nextHeight >= maxHeight - 2);
};
const openPlanConversation = (view = 'preserve') => {
  if (!planConversationPanel || !planScreen) return;
  const isOpen = planScreen.classList.contains('is-conversation-open');
  if (view === 'full') setPlanConversationHeight(planScreen.clientHeight);
  else if (view === 'half' || !isOpen) setPlanConversationHeight(planScreen.clientHeight / 2);
  planScreen.classList.add('is-conversation-open');
  planScreen.classList.remove('is-conversation-collapsed');
  planConversationPanel.setAttribute('aria-hidden', 'false');
  planConversationHandle?.setAttribute('aria-expanded', 'true');
  if (!isOpen) renderSharedConversation();
};
const closePlanConversation = () => {
  if (!planConversationPanel || !planScreen) return;
  planScreen.classList.remove('is-conversation-open', 'is-conversation-full');
  planScreen.classList.add('is-conversation-collapsed');
  planConversationPanel.setAttribute('aria-hidden', 'true');
  planConversationHandle?.setAttribute('aria-expanded', 'false');
};
const openActiveConversation = (view = 'preserve') => {
  if (embeddedMapHost) openPlanConversation(view);
  else if (mapScreen) openMapConversation(view);
  else openPlanConversation(view);
};
const closeActiveConversation = () => {
  if (embeddedMapHost) closePlanConversation();
  else if (mapScreen) closeMapConversation();
  else closePlanConversation();
};

if (mapConversationHandle && mapScreen) {
  let dragStartY = 0;
  let dragStartHeight = 0;
  let dragDistance = 0;
  mapConversationHandle.addEventListener('pointerdown', event => {
    dragStartY = event.clientY;
    dragStartHeight = mapConversationPanel.getBoundingClientRect().height;
    dragDistance = 0;
    mapConversationHandle.setPointerCapture?.(event.pointerId);
  });
  mapConversationHandle.addEventListener('pointermove', event => {
    if (!mapConversationHandle.hasPointerCapture?.(event.pointerId)) return;
    dragDistance = Math.max(dragDistance, Math.abs(event.clientY - dragStartY));
    setMapConversationHeight(dragStartHeight + dragStartY - event.clientY);
  });
  const finishConversationDrag = event => {
    if (!mapConversationHandle.hasPointerCapture?.(event.pointerId)) return;
    mapConversationHandle.releasePointerCapture?.(event.pointerId);
    if (dragDistance > 6) {
      const currentHeight = mapConversationPanel.getBoundingClientRect().height;
      if (currentHeight < 120) closeMapConversation();
      else openMapConversation();
    }
  };
  mapConversationHandle.addEventListener('pointerup', finishConversationDrag);
  mapConversationHandle.addEventListener('pointercancel', finishConversationDrag);
  mapConversationHandle.addEventListener('click', event => {
    if (dragDistance > 6) {
      event.preventDefault();
      return;
    }
    openMapConversation(mapScreen.classList.contains('is-conversation-full') ? 'half' : 'full');
  });
}

if (planConversationHandle && planScreen) {
  let dragStartY = 0;
  let dragStartHeight = 0;
  let dragDistance = 0;
  planConversationHandle.addEventListener('pointerdown', event => {
    dragStartY = event.clientY;
    dragStartHeight = planConversationPanel.getBoundingClientRect().height;
    dragDistance = 0;
    planConversationHandle.setPointerCapture?.(event.pointerId);
  });
  planConversationHandle.addEventListener('pointermove', event => {
    if (!planConversationHandle.hasPointerCapture?.(event.pointerId)) return;
    dragDistance = Math.max(dragDistance, Math.abs(event.clientY - dragStartY));
    setPlanConversationHeight(dragStartHeight + dragStartY - event.clientY);
  });
  const finishPlanConversationDrag = event => {
    if (!planConversationHandle.hasPointerCapture?.(event.pointerId)) return;
    planConversationHandle.releasePointerCapture?.(event.pointerId);
    if (dragDistance > 6) {
      const currentHeight = planConversationPanel.getBoundingClientRect().height;
      if (currentHeight < 120) {
        planConversationPanel.dataset.suppressCollapsedClick = 'true';
        closePlanConversation();
      }
      else openPlanConversation();
    }
  };
  planConversationHandle.addEventListener('pointerup', finishPlanConversationDrag);
  planConversationHandle.addEventListener('pointercancel', finishPlanConversationDrag);
  planConversationHandle.addEventListener('click', event => {
    if (dragDistance > 6) {
      event.preventDefault();
      return;
    }
    openPlanConversation(planScreen.classList.contains('is-conversation-full') ? 'half' : 'full');
  });
}

renderSharedConversation();

document.addEventListener('click', event => {
  const actionButton = event.target.closest('[data-message-action]');
  if (!actionButton) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const message = actionButton.closest('.dynamic-message:not(.user)');
  const action = actionButton.dataset.messageAction;
  const text = getConversationBodyText(message);
  if (action === 'copy') {
    navigator.clipboard?.writeText(text).catch(() => {});
    notify('已复制');
  } else if (action === 'like' || action === 'dislike') {
    const actions = actionButton.closest('.ai-message-actions');
    actions?.querySelectorAll('[data-message-action="like"], [data-message-action="dislike"]').forEach(button => button.classList.toggle('is-active', button === actionButton));
    notify(action === 'like' ? '已记录喜欢' : '已记录不喜欢');
  }
});
document.addEventListener('contextmenu', event => {
  if (event.target.closest('.dynamic-message:not(.user)')) event.preventDefault();
});

const companionPermission = document.createElement('div');
companionPermission.className = 'companion-permission-backdrop';
companionPermission.hidden = true;
companionPermission.setAttribute('role', 'presentation');
companionPermission.innerHTML = `<section class="companion-permission-dialog" role="dialog" aria-modal="true" aria-labelledby="companion-permission-title"><button class="companion-permission-close" type="button" data-companion-cancel aria-label="关闭">×</button><div class="companion-permission-brand"><span class="companion-permission-logo"><img src="${assetUrl('assets/龙形象.png')}" alt=""></span><span>周末到铜梁AI伴游</span></div><h2 id="companion-permission-title">获取当前位置</h2><p>为向您展示附近内容和地图位置，需要获取一次当前定位。</p><div class="companion-permission-note"><span class="companion-permission-pin">⌖</span><span><strong>需要获取一次当前位置</strong><small>仅用于展示附近推荐与地图位置</small></span></div><label class="companion-permission-consent"><input type="checkbox" data-companion-consent><span>我同意获取一次当前位置</span></label><button class="companion-permission-allow" type="button" data-companion-allow disabled>同意并进入边走边耍</button><button class="companion-permission-later" type="button" data-companion-cancel>暂不获取</button></section>`;
document.body.append(companionPermission);

const companionConsent = companionPermission.querySelector('[data-companion-consent]');
const companionAllow = companionPermission.querySelector('[data-companion-allow]');
const companionPermissionTitle = companionPermission.querySelector('.companion-permission-dialog h2');
const companionPermissionDescription = companionPermission.querySelector('.companion-permission-dialog > p');
const companionPermissionNoteTitle = companionPermission.querySelector('.companion-permission-note strong');
const companionPermissionNoteDetail = companionPermission.querySelector('.companion-permission-note small');
const companionPermissionConsentLabel = companionConsent?.nextElementSibling;
const companionPermissionLater = companionPermission.querySelector('.companion-permission-later');
let locationPermissionPurpose = 'companion';
let oneTimeLocationDestination = '';
let oneTimeLocationContinuation = null;
let companionNeedsRefresh = false;
function configureLocationPermission(purpose) {
  if (purpose !== 'once') return false;
  const isOneTime = purpose === 'once';
  locationPermissionPurpose = purpose;
  companionPermissionTitle.textContent = isOneTime ? '获取当前位置' : '开启伴游模式';
  companionPermissionDescription.textContent = isOneTime
    ? '为向您展示附近内容和地图位置，需要获取一次当前定位。本次定位仅用于当前浏览，不会开启伴游模式，也不会持续获取实时位置。'
    : '伴游模式会根据您的实时位置，为您介绍附近景点、好吃的、好玩的等相关信息。';
  companionPermissionNoteTitle.textContent = isOneTime ? '需要获取一次当前位置' : '需要获取定位信息';
  companionPermissionNoteDetail.textContent = isOneTime ? '仅用于展示附近推荐与地图位置' : '仅用于提供当前所在位置的伴游内容';
  companionPermissionConsentLabel.textContent = isOneTime ? '我同意获取一次当前位置' : '我同意获取实时定位信息';
  companionAllow.textContent = isOneTime ? '同意并进入边走边耍' : '同意并开启';
  companionPermissionLater.textContent = isOneTime ? '暂不获取' : '暂不开启';
  return true;
}
const hideCompanionPermission = () => {
  companionPermission.hidden = true;
  companionConsent.checked = false;
  companionAllow.disabled = true;
};
const activateCompanionGuide = (forceRefresh = false) => {
  setCompanionMode(true);
  saveCurrentLocation('companion');
  updateLocationContext();
  if (forceRefresh || !sharedConversationMessages.some(message => message.type === 'companion-guide')) {
    addSharedConversationMessage(getCompanionGuide());
  }
  openActiveConversation('half');
};
const requestCompanionMode = () => {
  // 伴游模式已下线；地图和附近服务仅通过一次性定位入口获取位置。
  setCompanionMode(false);
};
function requestOneTimeLocationForExplore() {
  if (hasCurrentLocation() || readCompanionMode()) {
    location.href = 'explore.html';
    return;
  }
  oneTimeLocationContinuation = null;
  oneTimeLocationDestination = 'explore.html';
  configureLocationPermission('once');
  companionPermission.hidden = false;
  companionPermission.querySelector('.companion-permission-dialog')?.focus();
}
function requestOneTimeLocationForNearby(nearbyType) {
  oneTimeLocationDestination = '';
  oneTimeLocationContinuation = () => showNearbyService(nearbyType);
  configureLocationPermission('once');
  companionAllow.textContent = '同意并获取定位';
  companionPermission.hidden = false;
  companionPermission.querySelector('.companion-permission-dialog')?.focus();
}
companionConsent.addEventListener('change', () => { companionAllow.disabled = !companionConsent.checked; });
companionAllow.addEventListener('click', () => {
  if (!companionConsent.checked) return;
  if (locationPermissionPurpose === 'once') {
    const destination = oneTimeLocationDestination || 'explore.html';
    const continuation = oneTimeLocationContinuation;
    oneTimeLocationDestination = '';
    oneTimeLocationContinuation = null;
    saveCurrentLocation('once');
    updateLocationContext();
    hideCompanionPermission();
    if (continuation) {
      continuation();
      return;
    }
    location.href = destination;
    return;
  }
  try { localStorage.setItem(companionConsentKey, 'granted'); } catch (_) {}
  hideCompanionPermission();
  const shouldRefresh = companionNeedsRefresh;
  companionNeedsRefresh = false;
  activateCompanionGuide(shouldRefresh);
  notify('伴游模式已开启');
});
companionPermission.querySelectorAll('[data-companion-cancel]').forEach(button => button.addEventListener('click', () => {
  const wasCompanionRequest = locationPermissionPurpose === 'companion';
  oneTimeLocationDestination = '';
  oneTimeLocationContinuation = null;
  hideCompanionPermission();
  if (wasCompanionRequest) setCompanionMode(false);
}));
companionPermission.addEventListener('click', event => {
  if (event.target !== companionPermission) return;
  oneTimeLocationDestination = '';
  oneTimeLocationContinuation = null;
  hideCompanionPermission();
});
if (readCompanionMode() && !isMainConversationCleared()) activateCompanionGuide();

document.addEventListener('click', event => {
  const action = event.target.closest('[data-context-action]');
  if (!action) return;
  if (action.dataset.contextAction === 'weather') {
    notify('近一周天气功能将于后续开放');
    return;
  }
  if (action.dataset.contextAction === 'event') {
    openActiveConversation('half');
    addSharedConversationMessage({ role: 'assistant', ...ironFlowerGuide });
  }
});

const composerInput = document.querySelector('.composer input');
const composer = document.querySelector('.composer');
const composerSend = document.querySelector('.composer .send');
const composerMore = document.querySelector('[data-composer-more]');
const nearbyCard = document.querySelector('[data-nearby-card]');
const keyboardSimulation = document.querySelector('[data-keyboard-simulation]');
const keyboardComposerInput = document.querySelector('[data-keyboard-composer-input]');
const voiceInput = document.querySelector('[data-voice-input]');
const voiceHint = document.querySelector('.voice-hint');
let voiceRecognition = null;
let composerMerchantName = null;
let voiceHintReady = false;
const composerHintCopy = {
  zh: {
    placeholder: '发消息或按住说话...',
    inputLabel: '发送消息', keyboardLabel: '键盘输入消息',
    hold: '按住说话', tap: '点击说话', listening: '正在聆听...',
    voiceStart: '点击开始语音输入', voiceInput: '语音输入', textInput: '切换到文本输入',
    merchant: name => `你想了解“${name || '这家店'}”这家店的什么情况？`
  },
  en: {
    placeholder: 'Type or hold to talk...',
    inputLabel: 'Send a message', keyboardLabel: 'Type a message',
    hold: 'Hold to talk', tap: 'Tap to talk', listening: 'Listening...',
    voiceStart: 'Tap to start voice input', voiceInput: 'Voice input', textInput: 'Switch to text input',
    merchant: name => `What would you like to know about ${name || 'this place'}?`
  }
};
const updateComposerLanguage = () => {
  const copy = composerHintCopy[currentLanguage];
  const placeholder = composerMerchantName === null ? copy.placeholder : copy.merchant(composerMerchantName);
  // Translate hints only; the user's draft and conversation remain unchanged.
  if (composerInput) {
    composerInput.placeholder = placeholder;
    composerInput.setAttribute('aria-label', copy.inputLabel);
  }
  if (keyboardComposerInput) {
    keyboardComposerInput.placeholder = placeholder;
    keyboardComposerInput.setAttribute('aria-label', copy.keyboardLabel);
  }
  if (voiceHint) {
    voiceHint.textContent = composer?.classList.contains('is-recording') ? copy.listening : voiceHintReady ? copy.tap : copy.hold;
    voiceHint.setAttribute('aria-label', copy.voiceStart);
  }
  voiceInput?.setAttribute('aria-label', composer?.classList.contains('is-voice') ? copy.textInput : copy.voiceInput);
};
const setComposerMerchantHint = name => {
  composerMerchantName = name ?? '';
  updateComposerLanguage();
};
const updateComposerState = () => {
  const generating = consumerAgentRequests.size > 0;
  composer?.classList.toggle('is-ready', generating || Boolean(composerInput?.value.trim()));
  composer?.classList.toggle('is-generating', generating);
  if (composerSend) {
    composerSend.innerHTML = generating ? icons.stop : icons.send;
    composerSend.setAttribute('aria-label', generating ? (currentLanguage === 'en' ? 'Stop generating' : '停止生成') : (currentLanguage === 'en' ? 'Send' : '发送'));
  }
};
const closeNearbyCard = () => {
  if (nearbyCard) nearbyCard.hidden = true;
  composer?.classList.remove('is-nearby-open');
  composerMore?.setAttribute('aria-expanded', 'false');
};
const closeKeyboardSimulation = () => {
  if (keyboardSimulation) keyboardSimulation.hidden = true;
};
const openNearbyCard = () => {
  if (nearbyCard) nearbyCard.hidden = false;
  composer?.classList.add('is-nearby-open');
  composerMore?.setAttribute('aria-expanded', 'true');
  closeKeyboardSimulation();
  leaveVoiceMode();
};
const leaveVoiceMode = () => {
  composer?.classList.remove('is-voice', 'is-recording');
  if (voiceInput) {
    voiceInput.innerHTML = icons.mic;
  }
  updateComposerLanguage();
};
const enterVoiceMode = () => {
  closeNearbyCard();
  closeKeyboardSimulation();
  composer?.classList.add('is-voice');
  openActiveConversation();
  if (voiceInput) {
    voiceInput.innerHTML = icons.keyboard;
  }
  updateComposerLanguage();
  composerInput?.blur();
};
const startVoiceRecognition = () => {
  if (!composer?.classList.contains('is-voice') || voiceRecognition) return;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    notify('当前浏览器不支持语音识别，请输入“关闭伴游”');
    return;
  }
  const recognition = new SpeechRecognition();
  voiceRecognition = recognition;
  recognition.lang = 'zh-CN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onstart = () => {
    composer?.classList.add('is-recording');
    updateComposerLanguage();
  };
  recognition.onresult = event => {
    const transcript = event.results?.[0]?.[0]?.transcript?.trim();
    if (transcript) sendComposerMessage(transcript);
  };
  recognition.onerror = event => {
    if (event.error !== 'no-speech' && event.error !== 'aborted') notify('语音识别未开启，请输入“关闭伴游”');
  };
  recognition.onend = () => {
    voiceRecognition = null;
    composer?.classList.remove('is-recording');
    voiceHintReady = true;
    updateComposerLanguage();
  };
  recognition.start();
};
voiceHint?.setAttribute('role', 'button');
voiceHint?.setAttribute('tabindex', '0');
updateComposerLanguage();
voiceHint?.addEventListener('click', startVoiceRecognition);
voiceHint?.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    startVoiceRecognition();
  }
});
composerInput?.addEventListener('input', () => {
  updateComposerState();
  openActiveConversation();
});
composerInput?.addEventListener('focus', () => {
  closeNearbyCard();
  leaveVoiceMode();
  openActiveConversation();
});
composerMore?.addEventListener('click', () => {
  const willOpen = nearbyCard?.hidden;
  if (willOpen) openNearbyCard();
  else closeNearbyCard();
});
document.addEventListener('click', event => {
  if (nearbyCard?.hidden) return;
  if (event.target.closest('[data-nearby-card], [data-composer-more]')) return;
  closeNearbyCard();
});
const showNearbyService = nearbyType => {
  const result = nearbyServiceResults[nearbyType];
  if (!result) return;
  closeNearbyCard();
  addSharedConversationMessage({
    role: 'assistant',
    type: 'nearby-service',
    nearbyType,
    location: '铜梁区玄天湖附近'
  });
  openActiveConversation('half');
};
nearbyCard?.addEventListener('click', event => {
  const action = event.target.closest('[data-nearby-action]');
  if (!action) return;
  const nearbyType = action.dataset.nearbyAction;
  if (!hasCurrentLocation()) {
    closeNearbyCard();
    requestOneTimeLocationForNearby(nearbyType);
    return;
  }
  showNearbyService(nearbyType);
});
document.addEventListener('click', event => {
  const nearbyLocate = event.target.closest('[data-nearby-locate]');
  if (nearbyLocate) {
    const name = nearbyLocate.dataset.nearbyLocate;
    const poi = featureKnowledgePoi(name, marqueeEntityCatalog[name]);
    poi.id = nearbyLocate.dataset.nearbyId || poi.id;
    poi.wishlistId = poi.id;
    poi.image = nearbyLocate.dataset.nearbyImage || poi.image;
    if (switchConsumerBackground('map')) renderMarqueePoi(poi);
    else location.href = `explore.html?poi=${encodeURIComponent(name)}`;
    return;
  }
  const nearbyNavigate = event.target.closest('[data-nearby-navigate]');
  if (nearbyNavigate) {
    const name = nearbyNavigate.dataset.nearbyNavigate;
    const poi = featureKnowledgePoi(name, marqueeEntityCatalog[name]);
    poi.id = nearbyNavigate.dataset.nearbyId || poi.id;
    poi.image = nearbyNavigate.dataset.nearbyImage || poi.image;
    location.href = poiNavigationHref(poi);
    return;
  }
  const nearbyWishlist = event.target.closest('[data-nearby-wishlist]');
  if (nearbyWishlist) {
    const itemId = nearbyWishlist.dataset.nearbyWishlist;
    if (isWishlistItemAdded(itemId)) {
      removeWishlistItem(itemId);
      document.querySelectorAll('[data-nearby-wishlist]').forEach(button => {
        if (button.dataset.nearbyWishlist !== itemId) return;
        button.classList.remove('is-added');
        button.setAttribute('aria-label', `将${button.dataset.nearbyName}加入我的心愿单`);
        button.title = '加入心愿单';
      });
    } else {
      addWishlistItem({ id: itemId, name: nearbyWishlist.dataset.nearbyName, kind: 'merchant' }, nearbyWishlist);
      document.querySelectorAll('[data-nearby-wishlist]').forEach(button => {
        if (button.dataset.nearbyWishlist !== itemId) return;
        button.classList.add('is-added');
        button.setAttribute('aria-label', `从心愿单移除${button.dataset.nearbyName}`);
        button.title = '取消心愿单';
      });
    }
    return;
  }
  const nearbyChat = event.target.closest('[data-nearby-chat]');
  if (nearbyChat) {
    const prompt = `你想了解“${nearbyChat.dataset.nearbyChat}”这家店的什么情况？`;
    addSharedConversationMessage({ role: 'assistant', text: prompt });
    openActiveConversation('half');
  }
});
keyboardComposerInput?.addEventListener('input', () => {
  if (!composerInput) return;
  composerInput.value = keyboardComposerInput.value;
  updateComposerState();
});
document.querySelector('[data-keyboard-tools-open]')?.addEventListener('click', event => {
  event.stopPropagation();
  openNearbyCard();
});
document.querySelector('[data-keyboard-voice-open]')?.addEventListener('click', event => {
  event.stopPropagation();
  enterVoiceMode();
});
document.querySelector('[data-keyboard-close]')?.addEventListener('click', event => {
  event.stopPropagation();
  closeKeyboardSimulation();
  composerInput?.blur();
});
voiceInput?.addEventListener('click', () => {
  if (composer?.classList.contains('is-voice')) {
    leaveVoiceMode();
    composerInput?.focus();
    return;
  }
  enterVoiceMode();
});
function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}
function needsInputIntentScope(value) {
  return /停车|怎么去|交通|场次|预约|同行|亲子|带小孩|预算/.test(value)
    && !/今天|明天|今晚|周末|上午|下午|傍晚|夜间|几点/.test(value);
}
function resolveInputIntentResponse(value) {
  const detectedDomains = findInputIntentDomains(value);
  const entityConfig = findInputIntentEntityConfig(value);
  const pendingIntent = latestPendingInputIntent();
  const confirmedIntent = latestConfirmedInputIntent();
  if (detectedDomains.length > 1) return inputIntentClarification();
  if (entityConfig && (!detectedDomains.length || detectedDomains[0] === entityConfig.domain)) {
    const mode = confirmedIntent
      ? (confirmedIntent.domain === entityConfig.domain && !hasInputIntentInterrupt(value) ? 'continued' : 'interrupted')
      : 'new';
    return needsInputIntentScope(value) ? inputIntentClarification('scope', entityConfig.domain) : inputIntentResult(entityConfig.domain, mode, entityConfig);
  }
  if (detectedDomains.length === 1) {
    const domain = detectedDomains[0];
    const mode = confirmedIntent
      ? (confirmedIntent.domain === domain && !hasInputIntentInterrupt(value) ? 'continued' : 'interrupted')
      : 'new';
    return needsInputIntentScope(value) ? inputIntentClarification('scope', domain) : inputIntentResult(domain, mode);
  }
  if (pendingIntent?.phase === 'domain') return inputIntentClarification();
  if (pendingIntent?.phase === 'scope') return inputIntentResult(pendingIntent.domain, 'continued');
  if (confirmedIntent && !hasInputIntentInterrupt(value)) return inputIntentResult(confirmedIntent.domain, 'continued');
  return inputIntentClarification();
}
// Live agent bridge: active-thread context only; failed/demo replies are not evidence.
function recoverStoredAgentMessage(message) {
  if (message.type === 'agent' && message.routePlan && !message.id) message = { ...message, id: `route-${message.routePlan.id}` };
  return message.type === 'agent' && message.status === 'pending'
    ? { ...message, status: 'error', error: 'interrupted' } : message;
}
function cancelConsumerAgentRequests(id = '') {
  if (!id) {
    activeWishlistRouteRequestId = '';
    realMap?.clearPlan?.();
    if (wishlistMapDisplayMode === 'route') wishlistMapDisplayMode = 'preview';
  }
  for (const [requestId, controller] of consumerAgentRequests) {
    if (id && requestId !== id) continue;
    controller.abort();
    consumerAgentRequests.delete(requestId);
    const message = sharedConversationMessages.find(item => item.id === requestId && item.type === 'agent');
    if (message) { message.status = 'error'; message.error = 'cancelled'; }
  }
  persistActiveConversation();
  renderSharedConversation();
}
function buildConsumerAgentHistory(beforeIndex = sharedConversationMessages.length) {
  const history = sharedConversationMessages.slice(0, beforeIndex).flatMap(message => {
    if (message.role === 'user' && message.text) return [{ role: 'user', content: message.text.slice(0, 4000) }];
    if (message.type === 'agent' && message.status === 'complete') {
      // Card identity is already passed separately in previousEntityIds.
      // Do not teach the model to echo internal card bookkeeping as prose.
      const clean = text => window.TongliangAgentUI?.cleanAnswer?.(text) ?? text;
      const content = [clean(message.text), clean(message.followUp)].filter(Boolean).join('\n\n').slice(0, 4000);
      return content ? [{ role: 'assistant', content }] : [];
    }
    // Preserve a legacy question if the user resumes a pre-integration thread,
    // but never send the legacy fabricated recommendation as verified knowledge.
    if (message.type === 'marquee-intent' && message.stage !== 'result') {
      const config = marqueeIntentConfigs[message.topic];
      const content = message.stage === 2 ? config?.extraQuestion : config?.question;
      if (content) return [{ role: 'assistant', content }];
    }
    return [];
  });
  let total = 0;
  const selected = [];
  for (const message of history.slice(-24).reverse()) {
    if (total + message.content.length > 24000) break;
    selected.unshift(message);
    total += message.content.length;
  }
  return selected;
}
function routeStopPoi(stop, cards = []) {
  const entity = window.TongliangAgentUI?.getEntity(stop.id) || cards.find(card => card.id === stop.id);
  const categoryEntry = Object.entries(categoryData).flatMap(([category, data]) =>
    data.places.map((place, index) => ({ category, place, index }))).find(row => row.place[0] === stop.name);
  if (!entity && !categoryEntry) return null;
  const wish = getMapWishlistRows().find(row => row.name === stop.name);
  const id = entity?.id?.replace(/^product:/, '') || `category-${categoryEntry.category}-${categoryEntry.index}`;
  return {
    id, wishlistId: wish?.key?.replace(/-\d+$/, '') || id,
    name: entity?.name || stop.name, kind: entity?.kind || 'merchant',
    image: entity?.image || categoryEntry?.place[6],
    address: entity?.address || categoryEntry?.place[4] || (currentLanguage === 'en' ? 'Address not supplied' : '地址待补充'),
    intro: entity?.description || categoryEntry?.place[3] || '',
    detailHref: entity?.hasDetailPage ? entity.detailHref : ''
  };
}
function showConversationRoute(message) {
  if (!message?.routePlan || !realMap) return;
  openActiveConversation('half');
  if (embeddedMapHost) switchConsumerBackground('map');
  wishlistMapDisplayMode = 'route';
  if (markerLayer) markerLayer.innerHTML = '';
  markerCard?.classList.remove('show');
  const displayed = realMap.showPlan?.(message.routePlan, {
    onStopClick: stop => {
      const poi = routeStopPoi(stop, message.cards || []);
      if (!poi) { notify(currentLanguage === 'en' ? 'No original place card is available.' : '该地点暂无原始卡片资料。'); return; }
      activeMarkerPoint = { mapPoint: stop.mapPoint };
      markerCard.innerHTML = renderPoiActionCard(poi);
      markerCard.classList.add('show', 'wishlist-poi-card', 'poi-action-card');
      bindPoiCardActions(poi);
      window.requestAnimationFrame(() => positionMarkerCard(activeMarkerPoint));
    },
    renderStopIcon: stop => {
      const entity = window.TongliangAgentUI?.getEntity(stop.id);
      const category = ['eat', 'stay', 'tour', 'shop'].includes(entity?.category) ? entity.category : getWishlistCategory(stop);
      const icon = { eat: icons.food, stay: icons.hotel, tour: icons.flag, shop: icons.bag }[category];
      return `<span class="wishlist-poi-type wishlist-poi-type-${category}">${icon}</span><span class="wishlist-poi-name">${escapeHTML(truncateWishlistPoiName(stop.name))}</span>`;
    }
  });
  if (!displayed) notify(currentLanguage === 'en' ? 'The map is unavailable. Retry “View this itinerary on the map”.' : '地图暂不可用，请稍后点击“查看本次行程路线”重试。');
}
async function requestConsumerAgentMessage(message) {
  const revision = sharedConversationRevision;
  const conversationId = activeConversationId;
  const controller = new AbortController();
  consumerAgentRequests.set(message.id, controller);
  updateComposerState();
  const isCurrent = () => !controller.signal.aborted && revision === sharedConversationRevision &&
    conversationId === activeConversationId && sharedConversationMessages.includes(message);
  message.status = 'pending';
  delete message.error;
  persistActiveConversation();
  renderSharedConversation();
  try {
    if (!window.TongliangAgent) throw Object.assign(new Error('Agent unavailable'), { code: 'not_configured' });
    const response = await window.TongliangAgent.request({
      language: message.language,
      ...(message.routeRequest ? { routeRequest: message.routeRequest } : {}),
      messages: buildConsumerAgentHistory(sharedConversationMessages.indexOf(message)),
      ...(window.TongliangAgentUI?.getLocation() ? { location: window.TongliangAgentUI.getLocation() } : {}),
      previousEntityIds: [...sharedConversationMessages.slice(0, sharedConversationMessages.indexOf(message))].reverse().find(row => row.type === 'agent' && row.status === 'complete')?.entityIds || []
    }, { signal: controller.signal });
    if (!isCurrent()) return;
    message.status = 'complete';
    message.text = response.answer;
    message.followUp = response.followUp;
    message.model = response.model;
    message.entityIds = response.entityIds || [];
    message.cards = response.cards || [];
    message.tools = response.tools || [];
    message.needsLocation = response.needsLocation || false;
    message.scene = response.scene;
    if (response.routePlan) {
      message.routePlan = response.routePlan;
      if (message.id === activeWishlistRouteRequestId && wishlistMapDisplayMode === 'route') showConversationRoute(message);
    }
  } catch (error) {
    if (!isCurrent()) return;
    message.status = 'error';
    message.error = error.code || 'unavailable';
  } finally {
    if (consumerAgentRequests.get(message.id) === controller) consumerAgentRequests.delete(message.id);
    updateComposerState();
    if (isCurrent()) {
      persistActiveConversation();
      renderSharedConversation();
      const thread = activeConversationThread();
      thread?.scrollTo?.({ top: thread.scrollHeight, behavior: 'smooth' });
    }
  }
}
function retryConsumerAgentMessage(id) {
  const message = sharedConversationMessages.find(item => item.id === id && item.type === 'agent');
  if (!message || message.status !== 'error') return;
  if (message.routeRequest) {
    activeWishlistRouteRequestId = message.id;
    wishlistMapDisplayMode = 'route';
    realMap?.clearPlan?.();
    if (markerLayer) markerLayer.innerHTML = '';
  }
  if (consumerAgentRequests.size) return notify(currentLanguage === 'en' ? 'Please wait for the current answer.' : '请等待当前回复完成。');
  // Retrying an older failure after later turns would invalidate their context.
  // Only retry the latest assistant turn; start a fresh question for older ones.
  if (sharedConversationMessages.indexOf(message) !== sharedConversationMessages.length - 1) {
    return notify(currentLanguage === 'en' ? 'Please send that question again in the current conversation.' : '后面已有新对话，请在输入框重新发送该问题。');
  }
  message.language = currentLanguage;
  requestConsumerAgentMessage(message);
}
window.addEventListener('pagehide', () => cancelConsumerAgentRequests());
function getOriginalHome(language) {
  const copy = languageCopy[language];
  const marqueeRows = originalHomeMarqueeRows.map(row => row.map(({ key, icon }) => ({
    id: `all-${key}`, icon, title: journeyMarqueeCopy[language][key],
    prompt: language === 'en' ? marqueeEnglishPrompts[key] : marqueePromptConfigs[key]?.prompt
  })));
  return {
    lineOne: copy.planHeroLineOne, lineTwo: copy.planHeroLineTwo,
    summary: copy.planHeroSummary, gallery: copy.planFeatureTitle,
    items: marqueeRows.flat(), marqueeRows,
    slides: window.TongliangFeatureContent?.locales?.[language]
  };
}
window.TongliangHomeThemes?.install({
  screen: planScreen,
  getLanguage: () => currentLanguage,
  getOriginalHome,
  assetUrl,
  refreshCarousel: force => updateFeatureCarouselLanguage(force),
  submit: prompt => sendComposerMessage(prompt, { preserveDraft: true }),
  openConversation: () => openActiveConversation('half'),
  showHome: () => {
    switchConsumerBackground('plan');
    closeActiveConversation();
  },
  notify
});
function sendComposerMessage(rawValue, { marqueeTopic = '', preserveDraft = false } = {}) {
  const value = rawValue.trim();
  if (!value) return notify(currentLanguage === 'en' ? 'Please enter a question.' : '请输入问题');
  if (value.length > 4000) return notify(currentLanguage === 'en' ? 'Please keep your question under 4,000 characters.' : '问题请控制在4000字以内。');
  if (consumerAgentRequests.size) return notify(currentLanguage === 'en' ? 'Please wait for the current answer, or stop it first.' : '请等待当前回复完成，或先停止生成。');
  const isMarqueePrompt = Boolean(marqueeTopic && marqueeIntentConfigs[marqueeTopic] && getMarqueePrompt(marqueeTopic) === value);
  const isCompanionStopCommand = isCompanionModeActive() && isCompanionStopRequest(value);
  addSharedConversationMessage({ role: 'user', text: value, ...(isMarqueePrompt ? { source: 'marquee', topic: marqueeTopic, speak: false } : {}) });
  if (isCompanionStopCommand) {
    deactivateCompanionMode();
  } else {
    const message = { role: 'assistant', type: 'agent', id: `agent-${Date.now()}-${Math.random().toString(36).slice(2)}`, status: 'pending', language: currentLanguage };
    addSharedConversationMessage(message);
    requestConsumerAgentMessage(message);
  }
  if (!preserveDraft) {
    if (composerInput) composerInput.value = '';
    if (keyboardComposerInput) keyboardComposerInput.value = '';
  }
  updateComposerState();
  closeKeyboardSimulation();
  closeNearbyCard();
}
document.querySelector('.send')?.addEventListener('click', () => {
  if (consumerAgentRequests.size) return cancelConsumerAgentRequests([...consumerAgentRequests.keys()][0]);
  sendComposerMessage(composerInput?.value || '');
});
composerInput?.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendComposerMessage(composerInput.value);
  }
});
keyboardComposerInput?.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendComposerMessage(keyboardComposerInput.value);
  }
});

const historyList = document.querySelector('[data-history-list]');
const historyHiddenStorageKey = 'tongliang-hidden-history-records-v1';
const readHiddenHistoryRecords = () => {
  try {
    const records = JSON.parse(localStorage.getItem(historyHiddenStorageKey) || '[]');
    return Array.isArray(records) ? records : [];
  } catch (_) { return []; }
};
const hideHistoryRecord = key => {
  try {
    const records = readHiddenHistoryRecords();
    if (!records.includes(key)) localStorage.setItem(historyHiddenStorageKey, JSON.stringify([...records, key]));
  } catch (_) {}
};
const historyProductIds = {
  '玄天湖环湖步道': 'xuantian-lake-trail',
  '天灯石景区': 'tiandeng-stone',
  '铜梁火龙': 'fire-dragon',
  '湖畔生态鱼庄': 'lake-eco-fish',
  '铜梁头刀肉': 'toudaocai',
  '玄天湖湖景火锅': 'xuantian-hotpot'
};
const historyCategoryKeys = {
  '玄天湖环湖步道': 'tour',
  '天灯石景区': 'tour',
  '铜梁火龙': 'tour',
  '湖畔生态鱼庄': 'eat',
  '铜梁头刀肉': 'eat',
  '玄天湖湖景火锅': 'eat'
};
const historyProductDetails = {
  '玄天湖环湖步道': { title: '玄天湖环湖步道套餐', price: '1 份 | 总价 ¥68.00', date: '2026年07月9日' },
  '天灯石景区': { title: '天灯石景区门票套餐', price: '1 份 | 总价 ¥88.00', date: '2026年07月8日' },
  '铜梁火龙': { title: '铜梁火龙体验套餐', price: '1 份 | 总价 ¥98.00', date: '2026年07月7日' },
  '湖畔生态鱼庄': { title: '湖畔生态鱼套餐', price: '1 份 | 总价 ¥128.00', date: '2026年07月8日' },
  '铜梁头刀肉': { title: '铜梁头刀肉套餐', price: '1 份 | 总价 ¥98.00', date: '2026年07月7日', image: 'assets/头刀菜.jpeg' },
  '玄天湖湖景火锅': { title: '玄天湖湖景火锅套餐', price: '1 份 | 总价 ¥168.00', date: '2026年07月6日' }
};
if (historyList) {
  const setupHistoryCards = () => {
    const hiddenRecords = readHiddenHistoryRecords();
    historyList.querySelectorAll('.history-order-card').forEach((card, index) => {
      const revisit = card.querySelector('[data-history-product]');
      const recordKey = card.dataset.historyRecordKey || revisit?.dataset.historyProduct || `history-${index}`;
      card.dataset.historyRecordKey = recordKey;
      if (hiddenRecords.includes(recordKey)) {
        card.remove();
        return;
      }
      if (!revisit || revisit.parentElement?.classList.contains('record-row-actions')) return;
      const actions = document.createElement('div');
      actions.className = 'record-row-actions';
      revisit.replaceWith(actions);
      actions.append(revisit);
      const deleteButton = document.createElement('button');
      deleteButton.className = 'record-delete';
      deleteButton.type = 'button';
      deleteButton.dataset.historyRecordDelete = recordKey;
      deleteButton.setAttribute('aria-label', '删除此条记录');
      deleteButton.setAttribute('title', '删除此条记录');
      deleteButton.innerHTML = icons.trash;
      actions.append(deleteButton);
    });
    orderCards = [...document.querySelectorAll('.order-card[data-order-category], .history-item[data-order-category]')];
  };
  try {
    const items = JSON.parse(localStorage.getItem('tongliang-history') || '[]');
    if (items.length) {
      historyList.innerHTML = items.slice(0, 3).map(item => {
        const productId = historyProductIds[item.name] || 'history';
        const category = item.category || historyCategoryKeys[item.name] || 'tour';
        const icon = orderCategoryIcons[category] || 'ticket';
        const details = historyProductDetails[item.name] || { title: item.name, price: '1 份 | 总价 ¥128.00', date: '2026年07月8日' };
        const storeName = item.store || item.name;
        const image = details.image || item.image;
        return `<article class="order-card history-order-card" data-order-category="${category}" data-history-record-key="${productId}"><div class="order-store"><span class="order-store-mark history-order-mark">${icons[icon]}</span><strong>${escapeHTML(storeName)}</strong><em>${escapeHTML(item.date || details.date)}</em></div><div class="order-product-row"><img src="${escapeHTML(assetUrl(image))}" alt="${escapeHTML(details.title)}"><div><strong>${escapeHTML(details.title)}</strong><b>${escapeHTML(item.price || details.price)}</b></div><div class="record-row-actions"><button class="history-revisit" type="button" data-history-product="${productId}" data-history-name="${escapeHTML(item.name)}" data-history-image="${escapeHTML(image)}">再逛一逛</button><button class="record-delete" type="button" data-history-record-delete="${productId}" aria-label="删除此条记录" title="删除此条记录">${icons.trash}</button></div></div></article>`;
      }).join('');
    }
  } catch (_) {}
  setupHistoryCards();
  historyList.addEventListener('click', event => {
    const deleteButton = event.target.closest('[data-history-record-delete]');
    if (!deleteButton) return;
    event.preventDefault();
    event.stopPropagation();
    const card = deleteButton.closest('.history-order-card');
    requestRecordDelete({
      title: '确认删除此条记录吗？',
      onConfirm: () => {
        hideHistoryRecord(deleteButton.dataset.historyRecordDelete);
        card?.remove();
        orderCards = [...document.querySelectorAll('.order-card[data-order-category], .history-item[data-order-category]')];
        notify('已删除记录');
      }
    });
  });
}
document.querySelectorAll('[data-history-product]').forEach(item => item.addEventListener('click', () => {
  saveProductReturn();
  const query = new URLSearchParams({ item: item.dataset.historyProduct });
  if (item.dataset.historyProduct === 'history') {
    query.set('name', item.dataset.historyName || '推荐内容');
    query.set('image', item.dataset.historyImage || 'assets/recommend-2.png');
  }
  location.href = `product-detail.html?${query}`;
}));

document.querySelectorAll('[data-recommend-tab]').forEach(tab => {
  tab.addEventListener('click', () => {
    const category = tab.dataset.recommendTab;
    document.querySelectorAll('[data-recommend-tab]').forEach(item => {
      const active = item === tab;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll('[data-recommend-panel]').forEach(panel => {
      const active = panel.dataset.recommendPanel === category;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
    });
  });
});

function setupRecommendationFeedback() {
  document.querySelectorAll('.profile-screen .recommend-product').forEach(card => {
    if (card.dataset.feedbackReady === 'true') return;
    const product = document.createElement('article');
    product.className = card.className;
    product.dataset.feedbackReady = 'true';
    const main = document.createElement('button');
    main.type = 'button';
    main.className = 'recommend-product-main';
    main.dataset.toast = card.dataset.toast || '';
    if (card.dataset.productDetail) main.dataset.productDetail = card.dataset.productDetail;
    while (card.firstChild) main.append(card.firstChild);
    main.querySelector('span')?.classList.add('recommend-product-name');
    main.addEventListener('click', () => {
      if (main.dataset.productDetail) {
        saveProductReturn();
        location.href = `product-detail.html?item=${encodeURIComponent(main.dataset.productDetail)}`;
        return;
      }
      notify(main.dataset.toast);
    });
    const feedback = document.createElement('div');
    feedback.className = 'recommend-feedback';
    feedback.innerHTML = `<button type="button" data-recommend-feedback="like" aria-label="喜欢">${icons.thumbUp}</button><button type="button" data-recommend-feedback="dislike" aria-label="不喜欢">${icons.thumbDown}</button>`;
    const choices = feedback.querySelectorAll('[data-recommend-feedback]');
    choices.forEach(choice => choice.addEventListener('click', () => {
      const kind = choice.dataset.recommendFeedback;
      choices.forEach(item => item.classList.toggle('is-selected', item === choice));
      notify(kind === 'like' ? '已记录喜欢' : '已记录不喜欢');
    }));
    product.append(main, feedback);
    card.replaceWith(product);
  });
}
setupRecommendationFeedback();

const profileEatRecommendations = [
  { name: '铜梁区原乡头刀菜餐饮店', image: 'assets/头刀菜.jpeg' },
  { name: '铜梁区三活餐馆', image: 'assets/三活春油烧兔-1.png' },
  { name: '玄天湖龙火锅（龙舞广场店）', image: 'assets/湖景火锅.jpeg' }
];
document.querySelectorAll('.profile-screen [data-recommend-panel="eat"] .recommend-product').forEach((item, index) => {
  const recommendation = profileEatRecommendations[index];
  if (!recommendation) return;
  const image = item.querySelector('img');
  const label = item.querySelector('.recommend-product-name');
  if (image) {
    image.src = assetUrl(recommendation.image);
    image.alt = recommendation.name;
  }
  if (label) label.textContent = recommendation.name;
  const main = item.querySelector('.recommend-product-main');
  if (main) main.dataset.toast = `已打开${recommendation.name}`;
});

const profileTourRecommendations = [
  { name: '天灯石景区', image: 'assets/trip-stone-scenic-hd.png' },
  { name: '安居古城', image: 'assets/recommend-3.png' },
  { name: '铜梁火龙', image: 'assets/火龙铁花.png' }
];

const profileShopRecommendations = [
  { name: '重庆市铜梁区龙文化传媒有限公司', image: 'assets/recommend-4.png' },
  { name: '火龙冰箱贴', image: 'assets/火龙冰箱贴.png' },
  { name: '非遗竹编', image: 'assets/非遗竹编.png' }
];

function applyProfileRecommendations(category, recommendations) {
  document.querySelectorAll(`.profile-screen [data-recommend-panel="${category}"] .recommend-product`).forEach((item, index) => {
    const recommendation = recommendations[index];
    if (!recommendation) return;
    const image = item.querySelector('img');
    const label = item.querySelector('.recommend-product-name');
    if (image) {
      image.src = assetUrl(recommendation.image);
      image.alt = recommendation.name;
    }
    if (label) label.textContent = recommendation.name;
    const main = item.querySelector('.recommend-product-main');
    if (main) main.dataset.toast = `已打开${recommendation.name}`;
  });
}

applyProfileRecommendations('tour', profileTourRecommendations);
applyProfileRecommendations('shop', profileShopRecommendations);

const qrDialog = document.querySelector('[data-qr-dialog]');
document.querySelectorAll('[data-verify-qr]').forEach(button => button.addEventListener('click', () => {
  if (!qrDialog) return;
  const title = qrDialog.querySelector('[data-qr-title]');
  const note = qrDialog.querySelector('[data-qr-note]');
  if (title) title.textContent = button.dataset.verifyTitle || '核销凭证';
  if (note) note.textContent = button.dataset.verifyNote || '请向商户出示核销凭证完成核销';
  qrDialog.hidden = false;
}));
qrDialog?.querySelectorAll('[data-qr-close]').forEach(button => button.addEventListener('click', () => {
  qrDialog.hidden = true;
}));

document.querySelectorAll('.review-card').forEach(card => {
  let selectedReviewScore = 0;
  const reviewForm = card.querySelector('[data-review-form]');
  const reviewStars = [...card.querySelectorAll('[data-review-star]')];
  const reviewScore = card.querySelector('[data-review-score]');
  const reviewText = card.querySelector('[data-review-text]');
  const reviewCount = card.querySelector('[data-review-count]');
  const reviewStart = card.querySelector('[data-review-start]');
  const reviewStatus = card.querySelector('.order-store em');

  reviewStart?.addEventListener('click', () => {
    if (!reviewForm || reviewStart.classList.contains('is-reviewed')) return;
    const expanded = reviewForm.hidden;
    reviewForm.hidden = !expanded;
    reviewStart.textContent = expanded ? '收起评价' : '去评价';
    reviewStart.classList.toggle('is-expanded', expanded);
    reviewStart.setAttribute('aria-expanded', String(expanded));
  });
  reviewStars.forEach(star => star.addEventListener('click', () => {
    selectedReviewScore = Number(star.dataset.reviewStar);
    reviewStars.forEach(item => item.classList.toggle('is-selected', Number(item.dataset.reviewStar) <= selectedReviewScore));
    if (reviewScore) reviewScore.textContent = `${selectedReviewScore} 分`;
  }));
  reviewText?.addEventListener('input', () => {
    if (reviewCount) reviewCount.textContent = String(reviewText.value.length);
  });
  card.querySelector('[data-submit-review]')?.addEventListener('click', () => {
    if (!selectedReviewScore) return notify('请先选择评分');
    if (reviewForm) reviewForm.hidden = true;
    if (reviewStart) {
      reviewStart.textContent = '已评价';
      reviewStart.classList.remove('order-primary', 'is-expanded');
      reviewStart.classList.add('is-reviewed');
      reviewStart.disabled = true;
      reviewStart.setAttribute('aria-expanded', 'false');
    }
    if (reviewStatus) reviewStatus.textContent = '已评价';
    notify('评价已发布，感谢您的反馈');
  });
});

const checkinTemplateSizes = { four: 4, six: 6, nine: 9, story: 3 };
const checkinTemplateColumns = { four: 2, six: 3, nine: 3, story: 1 };
const checkinGeneratedImageSets = [
  [
    'assets/trip-day-tour-hd.png', 'assets/trip-cycling-hd.png', 'assets/trip-stone-scenic-hd.png',
    'assets/trip-cultural-base-hd.png', 'assets/火龙铁花.png', 'assets/feature-3.png',
    'assets/三活春油烧兔-1.png', 'assets/头刀菜.jpeg', 'assets/火龙铁花.png'
  ],
  [
    'assets/trip-stone-scenic-hd.png', 'assets/trip-cultural-base-hd.png', 'assets/feature-4.png',
    'assets/吃的.png', 'assets/三活春油烧兔-2.png', 'assets/头刀菜.jpeg',
    'assets/头刀菜-简介.jpg', 'assets/吃的.png', 'assets/三活春油烧兔-2.png'
  ]
];

function loadCheckinImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = assetUrl(source);
  });
}

document.querySelectorAll('[data-checkin-record]').forEach((record, recordIndex) => {
  let selectedTemplate = 'four';
  let activeImageIndex = 0;
  const gallery = record.querySelector('[data-checkin-gallery]');
  const fileInput = record.querySelector('[data-checkin-file]');
  const panel = record.querySelector('.checkin-ai-panel');
  const toggle = record.querySelector('[data-checkin-toggle]');
  const images = [...(checkinGeneratedImageSets[recordIndex] || checkinGeneratedImageSets[0])];

  const renderCheckinGallery = () => {
    const count = checkinTemplateSizes[selectedTemplate];
    gallery.dataset.template = selectedTemplate;
    gallery.innerHTML = images.slice(0, count).map((source, index) => `<button class="checkin-photo" type="button" data-checkin-photo="${index}" aria-label="替换第 ${index + 1} 张打卡照"><img src="${assetUrl(source)}" alt="AI 生成的打卡照 ${index + 1}"></button>`).join('');
  };

  toggle?.addEventListener('click', () => {
    const expanded = panel.hidden;
    panel.hidden = !expanded;
    toggle.setAttribute('aria-expanded', String(expanded));
    if (expanded && !gallery.childElementCount) renderCheckinGallery();
  });
  record.querySelectorAll('[data-checkin-template]').forEach(button => button.addEventListener('click', () => {
    selectedTemplate = button.dataset.checkinTemplate;
    record.querySelectorAll('[data-checkin-template]').forEach(item => {
      const selected = item === button;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    renderCheckinGallery();
  }));
  gallery?.addEventListener('click', event => {
    const photo = event.target.closest('[data-checkin-photo]');
    if (!photo || !fileInput) return;
    activeImageIndex = Number(photo.dataset.checkinPhoto);
    fileInput.click();
  });
  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    images[activeImageIndex] = URL.createObjectURL(file);
    renderCheckinGallery();
    fileInput.value = '';
  });
  record.querySelector('[data-checkin-generate]')?.addEventListener('click', async () => {
    const count = checkinTemplateSizes[selectedTemplate];
    const columns = checkinTemplateColumns[selectedTemplate];
    const rows = Math.ceil(count / columns);
    const cellWidth = selectedTemplate === 'story' ? 720 : 240;
    const cellHeight = selectedTemplate === 'story' ? 400 : 240;
    const canvas = document.createElement('canvas');
    canvas.width = columns * cellWidth;
    canvas.height = rows * cellHeight;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    try {
      const photoNodes = [...gallery.querySelectorAll('img')];
      const loadedImages = await Promise.all(photoNodes.map(image => loadCheckinImage(image.src)));
      loadedImages.forEach((image, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        context.drawImage(image, column * cellWidth, row * cellHeight, cellWidth, cellHeight);
      });
      const link = document.createElement('a');
      link.download = `${record.dataset.checkinName}-AI打卡照.jpg`;
      link.href = canvas.toDataURL('image/jpeg', .92);
      link.click();
      notify('AI 打卡照已生成并保存到本地');
    } catch (_) {
      notify('图片生成失败，请重新选择图片后再试');
    }
  });
});
