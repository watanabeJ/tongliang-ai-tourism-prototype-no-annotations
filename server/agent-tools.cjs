const { getCatalog, findEntity, cardFor } = require('./entity-catalog.cjs');
const { buildRoute, buildMockRoute } = require('./wishlist-route.cjs');
const readRouteMode = () => {
  try { return JSON.parse(require('node:fs').readFileSync(require('node:path').join(__dirname, 'route-mode.json'), 'utf8')).mode === 'mock' ? 'mock' : 'live'; }
  catch { return 'live'; }
};
const DEFAULT_AREA = { latitude: 29.85, longitude: 106.05, label: '铜梁城区参考区域 / Tongliang area' };
const statusError = (code, status = 502) => Object.assign(new Error(code), { code, status });
const validLocation = location => location?.consent === true && location.source === 'browser-geolocation' &&
  Number.isFinite(location.latitude) && Math.abs(location.latitude) <= 90 &&
  Number.isFinite(location.longitude) && Math.abs(location.longitude) <= 180 &&
  Number.isFinite(location.timestamp) && Math.abs(Date.now() - location.timestamp) <= 10 * 60 * 1000;
const shanghaiDate = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
const shiftDate = (date, days) => new Date(Date.parse(`${date}T12:00:00Z`) + days * 86400000).toISOString().slice(0, 10);
function requestedDate(text, today) {
  const explicit = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (explicit) return explicit[1];
  if (/后天|day after tomorrow/i.test(text)) return shiftDate(today, 2);
  if (/明天|tomorrow/i.test(text)) return shiftDate(today, 1);
  if (/周末|weekend/i.test(text)) {
    const weekday = new Date(`${today}T12:00:00Z`).getUTCDay();
    return shiftDate(today, weekday === 0 ? 0 : (6 - weekday + 7) % 7);
  }
  return today;
}
function planRequest(messages) {
  const turns = messages.filter(message => message.role === 'user').map(message => message.content);
  const latest = turns.at(-1) || '';
  const history = turns.join('\n');
  const areas = [
    ['安居古城', /安居|Anju/i], ['玄天湖', /玄天|Xuantian/i], ['巴岳山', /巴岳|Bayue/i],
    ['奇彩梦园', /奇彩|Qicai/i], ['铜梁城区', /铜梁城区|Tongliang (?:town|city)/i]
  ];
  const places = areas.filter(([, pattern]) => pattern.test(latest));
  const previous = [...turns].reverse().map(turn => areas.filter(([, pattern]) => pattern.test(turn))).find(list => list.length);
  const destination = (places.length ? places : previous || []).map(([name]) => name);
  const category = /住宿|酒店|民宿|住一晚|hotel|stay|accommodation/i.test(latest) ? 'stay'
    : /吃|餐|火锅|素食|美食|清淡|辣|food|restaurant|hotpot|vegetarian|spicy/i.test(latest) ? 'eat'
      : /买|购物|文创|伴手礼|shop|souvenir/i.test(latest) ? 'shop' : 'tour';
  const weather = /天气|下雨|降雨|气温|温度|weather|rain|temperature|forecast/i.test(latest);
  const map = /怎么去|导航|路线|开车|自驾|停车|地图|附近|多远|距离|route|directions|drive|parking|nearby|distance|map/i.test(latest);
  const search = /搜索|查一下|查查|最新|实时|今天.*演出|今晚|开放|营业|场次|票价|新闻|search|latest|current|open(?:ing)?|schedule|ticket|news/i.test(latest);
  const scene = /换|改成|不想|调整|change|replace|instead/i.test(latest) ? 'modify'
    : weather || search ? 'live'
      : /附近|厕所|卫生间|nearby|toilet|restroom/i.test(latest) ? 'nearby'
        : /行程|安排|规划|周末|一日游|itinerary|plan|weekend/i.test(latest) ? 'plan'
          : /推荐|找|吃|住宿|recommend|find|hotel|restaurant/i.test(latest) ? 'recommend' : 'explain';
  const mode = [...turns].reverse().map(turn => /不自驾|不.*开车|公共交通|公交|public transport|bus/i.test(turn) ? 'transit'
    : /步行|走路|walk/i.test(turn) ? 'walking' : /自驾|开车|driv/i.test(turn) ? 'driving' : '').find(Boolean) || '';
  return { scene, latest, destination, category, weather, map, search, mode,
    family: /带.*孩|亲子|children|child|family/i.test(history),
    excludes: /不.*爬山|不.*登山|no hiking/i.test(history) ? ['巴岳'] : [],
    vegetarian: /素食|vegetarian|vegan/i.test(latest),
    nearby: /附近|nearby|离我|from me/i.test(latest) };
}
function retrieveEntities(plan, limit = 6) {
  const itinerary = plan.scene === 'plan';
  const candidates = getCatalog().filter(row => row.enabled &&
    (plan.scene === 'plan' || plan.category === 'tour' || row.category === plan.category)).map(row => {
    const text = [row.name, row.address, row.description, ...row.aliases, ...row.specialties].join(' ');
    let score = row.aliases.some(alias => plan.latest.includes(alias)) ? 30 : 0;
    if (row.category === plan.category) score += 5;
    if (itinerary && row.category === 'tour') score += 6;
    if (itinerary && /古城|ancient town|old town/i.test(plan.latest) && row.name === '安居古城') score += 20;
    if (itinerary && /山水|湖|lake|nature/i.test(plan.latest) && row.name === '玄天湖') score += 18;
    if (itinerary && /山水|登山|山景|mountain|hiking/i.test(plan.latest) && row.name === '巴岳山步道') score += 16;
    if (itinerary && row.category === 'shop' && /购物|买|伴手礼|shop|souvenir/i.test(plan.latest)) score += 5;
    if (plan.destination.some(area => text.includes(area) || text.includes(area.replace('古城', '')))) score += 10;
    if (plan.vegetarian) score += /素食|素佛/.test(text) ? 20 : -40;
    if (plan.excludes.some(term => text.includes(term))) score = -100;
    // Recommendations outside an explicit destination are not "nearby".
    if (plan.destination.length && !plan.destination.some(area => text.includes(area) || text.includes(area.replace('古城', '')))) score -= 10;
    // Nearby matching must be based on the recorded address or explicit name,
    // not marketing copy mentioning several distant attractions.
    if (plan.nearby && plan.destination.length && !plan.destination.some(area => [row.address, row.name].join(' ').includes(area.replace('古城', '')))) score -= 25;
    return { row, score };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);
  const names = new Set();
  const unique = candidates.filter(({ row }) => {
    const canonical = row.name.replace(/（.*?）|\(.*?\)/g, '');
    if (names.has(canonical)) return false;
    names.add(canonical);
    return true;
  });
  if (itinerary) {
    // A mixed itinerary must not turn into six restaurant records just because
    // "food" appears in the question. Keep both attractions and requested services.
    const selected = unique.filter(({ row }) => row.category === 'tour').slice(0, 3);
    for (const category of ['eat', 'shop', 'stay']) {
      if (category === 'shop' && !/购物|买|伴手礼|shop|souvenir/i.test(plan.latest)) continue;
      if (category === 'stay' && !/住宿|酒店|民宿|住一晚|hotel|stay|accommodation/i.test(plan.latest)) continue;
      const candidate = unique.find(({ row }) => row.category === category);
      if (candidate) selected.push(candidate);
    }
    for (const candidate of unique) if (!selected.includes(candidate) && selected.length < limit) selected.push(candidate);
    return selected.slice(0, limit).map(({ row }) => cardFor(row));
  }
  return unique.slice(0, limit).map(({ row }) => cardFor(row));
}
async function readLimitedJson(response) {
  if (!response.ok) { await response.body?.cancel(); throw statusError(response.status === 429 ? 'rate_limited' : 'provider_error'); }
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 512000) throw statusError('response_too_large');
      chunks.push(Buffer.from(value));
    }
  } finally { await reader.cancel(); }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
function createTools({ fetchImpl = fetch, amapKey = process.env.AMAP_WEB_KEY, tavilyKey = process.env.TAVILY_API_KEY, keylessSearch = process.env.TAVILY_KEYLESS !== 'false', now = () => new Date() } = {}) {
  const weatherCache = new Map();
  const request = async (url, options = {}, signal) => readLimitedJson(await fetchImpl(url, {
    ...options, redirect: 'error', signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(12000)]) : AbortSignal.timeout(12000)
  }));
  async function weather({ text, location }, signal) {
    const today = shanghaiDate(now());
    const date = requestedDate(text, today);
    if (date < today || date > shiftDate(today, 6)) return { tool: 'weather', status: 'out_of_range', requestedDate: date };
    const point = validLocation(location) ? { ...location, label: '授权位置 / Authorized location' } : DEFAULT_AREA;
    const latitude = Math.round(point.latitude * 100) / 100;
    const longitude = Math.round(point.longitude * 100) / 100;
    const key = `${latitude},${longitude},${today}`;
    let data = weatherCache.get(key);
    if (!data || Date.now() - data.cachedAt > 5 * 60000) {
      const params = new URLSearchParams({
        latitude: String(latitude), longitude: String(longitude), timezone: 'Asia/Shanghai', forecast_days: '7',
        current: 'temperature_2m,weather_code,wind_speed_10m',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max'
      });
      data = { body: await request(`https://api.open-meteo.com/v1/forecast?${params}`, {}, signal), cachedAt: Date.now(), fetchedAt: now().toISOString() };
      weatherCache.set(key, data);
      if (weatherCache.size > 30) weatherCache.delete(weatherCache.keys().next().value);
    }
    const index = data.body.daily?.time?.indexOf(date);
    if (index == null || index < 0) throw statusError('no_forecast');
    return { tool: 'weather', status: 'ok', provider: 'Open-Meteo', sourceId: 'weather:open-meteo',
      sourceUrl: 'https://open-meteo.com/', requestedDate: date, area: point.label,
      fetchedAt: data.fetchedAt, timezone: 'Asia/Shanghai', isAreaEstimate: !validLocation(location),
      // Provider's current values are model estimates, not station observations.
      current: date === today ? data.body.current : null,
      daily: { date, min: data.body.daily.temperature_2m_min[index], max: data.body.daily.temperature_2m_max[index],
        code: data.body.daily.weather_code[index], rainProbability: data.body.daily.precipitation_probability_max?.[index] },
      note: '预报/模型估算，不是现场实况；默认仅代表铜梁城区参考区域。' };
  }
  async function webSearch({ query }, signal) {
    if (!tavilyKey && !keylessSearch) return { tool: 'search', status: 'not_configured', provider: 'Tavily' };
    // Do not forward the full private conversation, only a bounded topic query.
    const data = await request('https://api.tavily.com/search', {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(tavilyKey
        ? { Authorization: `Bearer ${tavilyKey}` } : { 'X-Tavily-Access-Mode': 'keyless' }) },
      body: JSON.stringify({ query: query.slice(0, 220), max_results: 5, search_depth: 'basic', include_answer: false, include_raw_content: false })
    }, signal);
    const results = (data.results || []).filter(row => {
      try { const url = new URL(row.url); return url.protocol === 'https:' && !url.username && !url.password && !/^(localhost|127\.|10\.|192\.168\.|169\.254\.|\[)/i.test(url.hostname); }
      catch { return false; }
    }).slice(0, 5).map((row, index) => ({
      id: `web:${index + 1}`, title: String(row.title || '').slice(0, 200), url: row.url,
      snippet: String(row.content || '').slice(0, 1200), publishedAt: row.published_date || null,
      fetchedAt: now().toISOString(), isOfficial: /\.gov\.cn$/.test(new URL(row.url).hostname)
    }));
    return { tool: 'search', status: results.length ? 'ok' : 'empty', provider: 'Tavily',
      accessMode: tavilyKey ? 'authenticated' : 'keyless_limited', results, fetchedAt: now().toISOString() };
  }
  async function mapLookup({ entityId }, signal) {
    const entity = findEntity(entityId);
    if (!entity) return { tool: 'map', status: 'entity_not_found' };
    const query = `${entity.name} ${entity.address || '重庆铜梁'}`;
    const searchUrl = `https://www.amap.com/search?query=${encodeURIComponent(query)}`;
    if (!amapKey) return { tool: 'map', status: 'handoff_only', entityId, searchUrl, query, provider: '高德地图 / AMap' };
    const params = new URLSearchParams({ key: amapKey, keywords: entity.name, city: '铜梁', citylimit: 'true', offset: '5', page: '1', extensions: 'base' });
    const data = await request(`https://restapi.amap.com/v3/place/text?${params}`, {}, signal);
    if (data.status !== '1') throw statusError('provider_error');
    const normalizeName = value => String(value || '').replace(/[\s·•（）()\-—]/g, '').toLowerCase();
    const names = [entity.name, ...entity.aliases].map(normalizeName).filter(name => name.length >= 3);
    const coreName = normalizeName(entity.name).replace(/(?:餐饮|餐厅|饭店|民宿|酒店|景区|景点)$/, '');
    if (coreName.length >= 4) names.push(coreName);
    const places = (data.pois || []).flatMap(poi => {
      // AMap can return vaguely similar businesses when a prototype record has
      // no real match. Do not offer those as this merchant's navigation targets.
      if (!names.some(name => normalizeName(poi.name).includes(name))) return [];
      const [longitude, latitude] = String(poi.location || '').split(',').map(Number);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return [];
      const province = typeof poi.pname === 'string' ? poi.pname : '';
      const city = typeof poi.cityname === 'string' && poi.cityname !== province ? poi.cityname : '';
      return [{ id: String(poi.id), name: String(poi.name), address: `${province}${city}${typeof poi.adname === 'string' ? poi.adname : ''}${typeof poi.address === 'string' ? poi.address : ''}`, latitude, longitude, coordinateSystem: 'GCJ-02' }];
    });
    return { tool: 'map', status: places.length ? 'ok' : 'empty', entityId, searchUrl, places,
      provider: '高德地图 / AMap', fetchedAt: now().toISOString(), note: '候选地点需用户核对；不是自动确认的商户坐标，不计算虚假距离。' };
  }
  async function run(payload, signal) {
    const plan = planRequest(payload.messages);
    if (payload.routeRequest) {
      const routePlan = readRouteMode() === 'mock' ? buildMockRoute(payload.routeRequest)
        : await buildRoute(payload.routeRequest, { mapLookup, request, amapKey, signal });
      return { plan: { ...plan, scene: 'plan', mode: 'driving' },
        entities: routePlan.stops.map(stop => {
          const entity = findEntity(stop.id);
          return entity ? cardFor(entity) : { id: stop.id, name: stop.name, description: '仅用于原型流程测试的地点名称，没有已核实资料；仅给条件式建议，不编造设施、服务或营业信息。',
            address: '', specialties: [], hasDetailPage: false, enabled: false, freshness: 'mock' };
        }), tools: [],
        routePlan, today: shanghaiDate(now()), needsLocation: false };
    }
    let entities = retrieveEntities(plan);
    const ordinal = plan.latest.match(/第([一二三123])(?:家|个|张)|\b(first|second|third)\b/i);
    if (ordinal) {
      const index = ({ 一: 0, 二: 1, 三: 2, 1: 0, 2: 1, 3: 2, first: 0, second: 1, third: 2 })[(ordinal[1] || ordinal[2]).toLowerCase()];
      const entity = findEntity(payload.previousEntityIds?.[index]);
      if (entity) { entities = [cardFor(entity)]; plan.destination = [entity.name]; }
    }
    const jobs = [];
    if (plan.weather) jobs.push(['weather', () => weather({ text: plan.latest, location: payload.location }, signal)]);
    if (plan.search) jobs.push(['search', () => webSearch({ query: `${plan.destination.join(' ') || '重庆铜梁'} ${plan.latest.replace(/https?:\/\/\S+/g, '').slice(0, 140)}` }, signal)]);
    if (plan.map && entities[0]) jobs.push(['map', () => mapLookup({ entityId: entities[0].id }, signal)]);
    const tools = await Promise.all(jobs.map(async ([name, task]) => {
      try { return await task(); }
      catch (error) { if (signal?.aborted) throw error; return { tool: name, status: 'error', error: error.code || 'unavailable' }; }
    }));
    return { plan, entities, tools, today: shanghaiDate(now()), needsLocation: plan.nearby && !validLocation(payload.location) };
  }
  return { weather, webSearch, mapLookup, run, capabilities: () => ({
    weather: 'available', map: amapKey ? 'available' : 'handoff_only',
    search: tavilyKey ? 'available' : keylessSearch ? 'available_limited' : 'not_configured'
  }) };
}
module.exports = { createTools, planRequest, retrieveEntities, validLocation, requestedDate, shanghaiDate, readRouteMode };
