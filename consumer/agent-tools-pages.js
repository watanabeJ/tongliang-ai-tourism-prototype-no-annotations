(function () {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const en = params.get('lang') === 'en';
  document.documentElement.lang = en ? 'en' : 'zh-CN';
  const mapElement = document.querySelector('#agent-map');
  const text = (selector, value) => { const node = document.querySelector(selector); if (node) node.textContent = value; };
  text('[data-back]', en ? 'Back to conversation' : '返回对话');
  text('[data-heading]', mapElement ? (en ? 'Destination map' : '推荐地点地图') : (en ? 'Project record' : '推荐地点资料'));
  text('[data-retry]', en ? 'Retry' : '重新查询');
  const status = value => text('[data-status]', value);
  document.querySelector('[data-back]').addEventListener('click', event => {
    if (document.referrer.startsWith(location.origin + '/consumer/')) { event.preventDefault(); history.back(); }
  });
  if (mapElement) {
    const backdrop = new URL('../assets/map.png', document.currentScript.src).href;
    mapElement.style.background = `#d9f0d6 url("${backdrop}") center / cover no-repeat`;
    mapElement.setAttribute('role', 'img');
    mapElement.setAttribute('aria-label', en ? 'Static schematic map, not for navigation' : '静态示意底图，不可用于导航');
  }
  async function load() {
    const retry = document.querySelector('[data-retry]');
    retry.disabled = true;
    try {
      const response = await fetch('/api/consumer-agent/entities', { signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error('catalog_unavailable');
      const row = (await response.json()).entities.find(item => item.id === id && item.enabled);
      if (!row) { status(en ? 'This record is unavailable. Return to the conversation.' : '该条资料不存在或已停用，请返回对话。'); return; }
      text('[data-name]', row.name);
      text('[data-address]', row.address || (en ? 'Address not supplied' : '地址未提供'));
      text('[data-description]', row.description);
      const image = document.querySelector('[data-image]');
      if (image && /^assets\/[^<>]+\.(png|jpe?g|webp)$/i.test(row.image) && !row.image.includes('..')) { image.src = '../' + row.image; image.hidden = false; }
      const mapPage = document.querySelector('[data-map-page]');
      if (mapPage) { mapPage.href = `agent-map.html?id=${encodeURIComponent(id)}&lang=${en ? 'en' : 'zh'}`; mapPage.hidden = false; mapPage.textContent = en ? 'View map' : '查看地图'; }
      if (!mapElement) {
        status(en ? `Project record, not live verification. Source: ${row.provenance}.` : `项目已有资料，非实时核验结果。来源：${row.provenance}。`);
        return;
      }
      const detail = document.querySelector('[data-entity-detail]');
      const hasDetail = row.hasDetailPage === true && /^product-detail\.html\?(?:item|knowledgeRef|researchRef)=/.test(row.detailHref || '');
      detail.hidden = !hasDetail;
      if (hasDetail) detail.href = row.detailHref;
      else detail.removeAttribute('href');
      detail.textContent = en ? 'View project record' : '查看项目资料';
      const external = document.querySelector('[data-map-handoff]');
      external.href = `https://www.amap.com/search?query=${encodeURIComponent(`${row.name} ${row.address || '重庆铜梁'}`)}`;
      external.hidden = false;
      external.textContent = en ? 'Verify destination and navigate in AMap' : '在高德地图核对地点并导航';
      const lookup = await fetch(`/api/consumer-agent/map?id=${encodeURIComponent(id)}`, { signal: AbortSignal.timeout(15000) });
      if (!lookup.ok) throw new Error('map_unavailable');
      const result = await lookup.json();
      const list = document.querySelector('[data-candidates]');
      list.replaceChildren();
      if (result.status === 'ok') {
        status((en ? 'Choose the correct AMap candidate. Exact navigation opens in AMap; this base map shows the reference area only. Retrieved: ' : '请核对高德返回的候选地点，精确导航在高德中打开；此底图仅展示铜梁参考区域。查询时间：') + result.fetchedAt);
        for (const place of result.places) {
          const link = document.createElement('a');
          link.textContent = `${place.name} · ${place.address}`;
          // Candidate coordinates are not plotted on this schematic backdrop.
          link.href = `https://uri.amap.com/marker?position=${encodeURIComponent(`${place.longitude},${place.latitude}`)}&name=${encodeURIComponent(place.name)}&coordinate=gaode&callnative=1`;
          link.target = '_blank'; link.rel = 'noopener noreferrer'; list.append(link);
        }
      } else {
        status(result.status === 'empty'
          ? (en ? 'AMap returned no matching destination for this project record. Unrelated businesses have been excluded. The base map is only a Tongliang reference area; verify the record before travelling.' : '高德未找到与该项目资料相匹配的地点，已排除名称不符的店铺。底图仅为铜梁参考区域，不是商户定位；请先核对资料再出行。')
          : (en ? 'In-app place lookup is not configured. The map is a Tongliang reference area, not this merchant’s location. Use AMap below to find the destination.' : '站内地点检索尚未配置。底图仅为铜梁参考区域，不是商户定位；请在高德中搜索并核对目的地。'));
      }
    } catch {
      status(en ? 'Lookup failed. Please retry or use the AMap link if available.' : '查询失败，请重试；如已显示高德入口，也可直接打开核对。');
    } finally { retry.disabled = false; }
  }
  document.querySelector('[data-retry]').addEventListener('click', load);
  load();
})();
