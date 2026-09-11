(function () {
  let catalog = new Map();
  let location = null;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  function safeUrl(value) {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password || /^(localhost|127\.|10\.|192\.168\.|169\.254\.|\[)/i.test(url.hostname)) return '';
      return url.href;
    } catch { return ''; }
  }
  function detailUrl(row) {
    return row.hasDetailPage !== false && /^product-detail\.html\?(?:item|knowledgeRef|researchRef)=/.test(row.detailHref || '') ? row.detailHref : '';
  }
  function localizedDetail(row, language) {
    const href = detailUrl(row);
    return href ? `${href}&lang=${language === 'en' ? 'en' : 'zh'}` : '';
  }
  function entityText(text, language) {
    // Longest exact name wins. Ambiguous aliases never guess which card to open.
    const names = new Map();
    for (const row of catalog.values()) {
      if (!row.enabled || !detailUrl(row)) continue;
      const baseName = row.name.replace(/（[^）]*）|\([^)]*\)/g, '').trim();
      const aliases = (row.aliases || []).filter(alias => row.kind !== 'poi' || alias.includes(baseName));
      for (const name of new Set([row.name, baseName, ...aliases])) {
        if (typeof name !== 'string' || name.length < 2) continue;
        if (!names.has(name)) names.set(name, row);
        else if (names.get(name)?.id !== row.id) names.set(name, null);
      }
    }
    const matches = [...names].filter(([, row]) => row).sort((a, b) => b[0].length - a[0].length);
    if (!matches.length) return esc(text);
    const pattern = new RegExp(matches.map(([name]) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
    let output = '', cursor = 0;
    for (const match of text.matchAll(pattern)) {
      const name = match[0], index = match.index;
      const row = names.get(name);
      output += esc(text.slice(cursor, index));
      const insideEnglishWord = (/^[A-Za-z0-9]/.test(name) && /[A-Za-z0-9]/.test(text[index - 1] || '')) ||
        (/[A-Za-z0-9]$/.test(name) && /[A-Za-z0-9]/.test(text[index + name.length] || ''));
      output += insideEnglishWord ? esc(name) : `<a class="agent-entity-link" data-agent-detail data-agent-entity="${esc(row.id)}" href="${esc(localizedDetail(row, language))}" title="${language === 'en' ? 'View card details: ' : '查看卡片详情：'}${esc(row.name)}">${esc(name)}</a>`;
      cursor = index + name.length;
    }
    return output + esc(text.slice(cursor));
  }
  function inline(text, language) {
    // Render a deliberately small Markdown subset, never model-authored HTML or URLs.
    const tokens = /\*\*([^*\n]+)\*\*|`([^`\n]+)`|!?\[([^\]\n]+)\]\([^)\n]*\)|https?:\/\/[^\s<>]+|<[^>]*>/g;
    let output = '', cursor = 0;
    for (const token of text.matchAll(tokens)) {
      output += entityText(text.slice(cursor, token.index), language);
      if (token[1]) output += `<strong>${entityText(token[1], language)}</strong>`;
      else if (token[2]) output += `<code>${esc(token[2])}</code>`;
      else if (token[3]) output += entityText(token[3], language);
      else output += esc(token[0]);
      cursor = token.index + token[0].length;
    }
    return output + entityText(text.slice(cursor), language);
  }
  function cleanAnswer(text) {
    // Older model replies may echo the private card-history label. Keep this
    // display/history cleanup narrow: ordinary recommendations remain intact.
    return String(text ?? '').replace(/\r\n?/g, '\n').split('\n').filter(line => {
      const plain = line.replace(/^[\s>#*`-]+/, '').replace(/\*\*/g, '');
      return !/^(?:已展示卡片(?:\s*\/\s*Shown cards)?|Shown cards)\s*[:：]/i.test(plain);
    }).join('\n').trim();
  }
  function renderAnswer(message) {
    const lines = cleanAnswer(message.text ?? message.answer).split('\n');
    const blocks = [];
    let paragraph = [], list = [], listType = '', listStart = '1', quote = [];
    const flush = () => {
      if (paragraph.length) { blocks.push(`<p>${paragraph.map(line => inline(line, message.language)).join('<br>')}</p>`); paragraph = []; }
      if (list.length) {
        blocks.push(`<${listType}${listType === 'ol' ? ` start="${listStart}"` : ''}>${list.map(line => `<li>${inline(line, message.language)}</li>`).join('')}</${listType}>`);
        list = []; listType = '';
      }
      if (quote.length) { blocks.push(`<blockquote>${quote.map(line => inline(line, message.language)).join('<br>')}</blockquote>`); quote = []; }
    };
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) { flush(); continue; }
      const heading = line.match(/^(#{1,3})\s+(.+)$/);
      const legacy = line.match(/^【([^】]+)】(.*)$/);
      const item = line.match(/^(?:[-*+]\s+|(\d{1,3})[.)、]\s+)(.+)$/);
      if (heading || legacy) {
        flush();
        const level = heading?.[1].length === 1 ? 'h2' : 'h3';
        blocks.push(`<${level}>${inline(heading ? heading[2] : legacy[1], message.language)}</${level}>`);
        if (legacy?.[2]) paragraph.push(legacy[2]);
      } else if (/^(?:-{3,}|\*{3,})$/.test(line)) {
        flush(); blocks.push('<hr>');
      } else if (line.startsWith('> ')) {
        if (paragraph.length || list.length) flush();
        quote.push(line.slice(2));
      } else if (item) {
        const type = item[1] ? 'ol' : 'ul';
        if (paragraph.length || quote.length || (listType && listType !== type)) flush();
        if (!list.length) listStart = String(Number(item[1] || 1));
        listType = type; list.push(item[2]);
      } else {
        if (quote.length || list.length) flush();
        paragraph.push(line);
      }
    }
    flush();
    return blocks.join('');
  }
  function weatherLabel(code, en) {
    if (code === 0) return en ? 'Clear' : '晴';
    if (code <= 3) return en ? 'Cloudy' : '多云';
    if (code <= 48) return en ? 'Fog' : '雾';
    if (code <= 67) return en ? 'Rain / drizzle' : '降雨';
    if (code <= 77) return en ? 'Snow' : '降雪';
    if (code <= 82) return en ? 'Rain showers' : '阵雨';
    if (code <= 86) return en ? 'Snow showers' : '阵雪';
    return en ? 'Thunderstorms' : '雷雨';
  }
  const unavailable = (tool, en) => {
    const labels = en ? { weather: 'Weather', search: 'Web search', map: 'Map lookup' } : { weather: '天气', search: '网页搜索', map: '地图检索' };
    const states = en ? { not_configured: 'service key not configured', error: 'request failed', empty: 'no matching results', out_of_range: 'date outside the 7-day forecast range' }
      : { not_configured: '尚未配置服务密钥，未取得结果', error: '请求失败，未取得结果', empty: '没有匹配结果', out_of_range: '超出7天天气预报范围' };
    return `${labels[tool.tool] || tool.tool}：${states[tool.status] || (en ? 'unavailable' : '暂不可用')}`;
  };
  function render(message, isAdded = () => false) {
    const en = message.language === 'en';
    const ids = Array.isArray(message.entityIds) ? message.entityIds : [];
    const cards = [...new Set(ids)].map(id => catalog.get(id)).filter(row => row?.enabled && detailUrl(row)).slice(0, 3);
    const cardMarkup = cards.map(row => {
      const wishId = row.id.replace(/^product:/, '');
      const added = isAdded(wishId);
      const href = localizedDetail(row, message.language);
      return `<article class="marquee-entity-card agent-entity-card">
        <a class="marquee-entity-card-main" href="${esc(href)}" data-agent-detail><img src="../${esc(row.image)}" alt="" loading="lazy"><span><strong>${esc(row.name)}</strong></span></a>
        <a class="poi-address-navigate agent-card-address" href="agent-map.html?id=${encodeURIComponent(row.id)}&lang=${en ? 'en' : 'zh'}" title="${esc(row.address || (en ? 'Address not supplied' : '地址待补充'))}" aria-label="${esc(en ? `View location: ${row.name}` : `查看${row.name}位置`)}"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path fill="currentColor" stroke="none" d="M21.4 3.2 3.3 10.7a.8.8 0 0 0 .1 1.5l6.8 2.2 2.2 6.8a.8.8 0 0 0 1.5.1l7.5-18.1a.8.8 0 0 0-1-1Zm-8 15.3-1.4-4.4 3.7-3.7-3.7 3.7-4.4-1.4L19 7.9l-5.6 10.6Z"/></svg><span>${esc(row.address || (en ? 'Address not supplied' : '地址待补充'))}</span></a>
        <div class="marquee-entity-card-actions">
          <a class="marquee-entity-card-map" href="explore.html" aria-label="${en ? 'Open Live guide map' : '进入边走边耍地图'}" title="${en ? 'Open Live guide map' : '进入边走边耍地图'}"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg></a>
          <button type="button" class="marquee-entity-wishlist${added ? ' is-added' : ''}" data-agent-wishlist="${esc(row.id)}" data-agent-language="${en ? 'en' : 'zh'}" aria-pressed="${added}" aria-label="${added ? (en ? 'Remove from wishlist' : '取消心愿') : (en ? 'Add to wishlist' : '加入心愿单')}" title="${added ? (en ? 'Remove from wishlist' : '取消心愿') : (en ? 'Add to wishlist' : '加入心愿单')}"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="${added ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg></button>
          <button type="button" class="marquee-entity-chat" data-agent-chat="${esc(row.id)}" aria-label="${esc(en ? `Ask about ${row.name}` : `咨询${row.name}`)}" title="${en ? 'Ask the travel assistant' : '咨询文旅智能体'}"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11.5a8 8 0 0 1-8 8H4l1.4-4.1A8 8 0 1 1 20 11.5Z"/></svg></button>
        </div></article>`;
    }).join('');
    const toolMarkup = (Array.isArray(message.tools) ? message.tools : []).map(tool => {
      // Empty map results are internal state, not a consumer chat notice.
      // Keep the evidence intact and retain the card's map entry points.
      if (tool.tool === 'map' && tool.status === 'empty') return '';
      if (tool.tool === 'weather' && tool.status === 'ok' && tool.daily) {
        return `<section class="agent-weather"><strong>${esc(tool.requestedDate)} · ${esc(weatherLabel(tool.daily.code, en))}</strong><p>${esc(tool.daily.min)}–${esc(tool.daily.max)} °C · ${en ? 'Rain probability' : '降雨概率'} ${esc(tool.daily.rainProbability ?? '—')}%</p><small>${esc(tool.area)} · ${en ? 'Forecast / model estimate' : '预报/模型估算'}</small><small>${en ? 'Retrieved' : '查询时间'} ${esc(tool.fetchedAt)} · <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a></small></section>`;
      }
      if (tool.tool === 'search' && tool.status === 'ok') {
        // Search evidence still informs the answer; the source drawer is not
        // part of the consumer UI, including for restored historical replies.
        return '';
      }
      if (tool.tool === 'map' && ['ok', 'handoff_only'].includes(tool.status)) {
        return '';
      }
      return `<p class="agent-tool-note" role="status">${esc(unavailable(tool, en))}</p>`;
    }).join('');
    // Keep location consent explicit; hiding this reply UI never authorizes GPS.
    return `${toolMarkup}${cards.length ? `<section class="agent-related"><div class="marquee-entity-carousel">${cardMarkup}</div></section>` : ''}`;
  }
  function syncWishlist(isAdded) {
    // Update every occurrence in place: preserve carousel position and focus.
    document.querySelectorAll('[data-agent-wishlist]').forEach(button => {
      const added = Boolean(isAdded(button.dataset.agentWishlist.replace(/^product:/, '')));
      const en = button.dataset.agentLanguage === 'en';
      const label = added ? (en ? 'Remove from wishlist' : '取消心愿') : (en ? 'Add to wishlist' : '加入心愿单');
      button.classList.toggle('is-added', added);
      button.setAttribute('aria-pressed', String(added));
      button.setAttribute('aria-label', label);
      button.title = label;
      button.querySelector('svg')?.setAttribute('fill', added ? 'currentColor' : 'none');
    });
  }
  async function authorizeLocation() {
    if (!navigator.geolocation) throw new Error('geolocation_unavailable');
    const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }));
    location = { latitude: position.coords.latitude, longitude: position.coords.longitude, timestamp: position.timestamp, consent: true, source: 'browser-geolocation' };
    return location;
  }
  function getLocation() {
    return location && Date.now() - location.timestamp < 10 * 60000 ? { ...location } : undefined;
  }
  async function loadCatalog() {
    const response = await fetch('/api/consumer-agent/entities', { credentials: 'same-origin' });
    if (!response.ok) throw new Error('catalog_unavailable');
    const data = await response.json();
    catalog = new Map(data.entities.filter(row => typeof row.id === 'string').map(row => [row.id, row]));
    document.dispatchEvent(new Event('agent-catalog-ready'));
  }
  window.TongliangAgentUI = { render, renderAnswer, cleanAnswer, renderInline: inline, syncWishlist, getLocation, authorizeLocation, getEntity: id => catalog.get(id), loadCatalog, safeUrl };
  loadCatalog().catch(() => { /* Main conversation still works; never invent cards if the catalog fails. */ });
})();
