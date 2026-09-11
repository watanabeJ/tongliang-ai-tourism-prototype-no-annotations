const { randomUUID } = require('node:crypto');
const { getCatalog } = require('./entity-catalog.cjs');
const fail = code => Object.assign(new Error(code), { code, status: 422 });
const normalize = value => String(value || '').replace(/[\s·•（）()]/g, '').toLowerCase();

function validateRouteRequest(input, { allowMock = false } = {}) {
  if (!input || input.mode !== 'driving' || !Array.isArray(input.stops) ||
      input.stops.length < 2 || input.stops.length > 10) throw fail('invalid_route_request');
  const seen = new Set();
  const stops = input.stops.map(stop => {
    if (!stop || typeof stop.name !== 'string' || !stop.name.trim() || stop.name.length > 150) throw fail('invalid_route_request');
    const matches = getCatalog().filter(row => row.enabled &&
      (row.id === stop.id || normalize(row.name) === normalize(stop.name)));
    if (matches.length !== 1 && !allowMock) throw fail('route_place_unresolved');
    const entity = matches.length === 1 ? matches[0] : {
      id: `mock:${require('node:crypto').createHash('sha256').update(normalize(stop.name)).digest('hex').slice(0, 16)}`,
      name: stop.name.trim()
    };
    if (seen.has(entity.id)) throw fail('route_duplicate_stop');
    seen.add(entity.id);
    return { id: entity.id, name: entity.name };
  });
  return { mode: 'driving', stops };
}

// Numerical inverse of the GCJ-02 offset. Keep provider coordinates for requests,
// and convert once to WGS84 for the existing OpenStreetMap/Leaflet base layer.
function wgsToGcj([lng, lat]) {
  if (lng < 72.004 || lng > 137.8347 || lat < .8293 || lat > 55.8271) return [lng, lat];
  const x = lng - 105, y = lat - 35, pi = Math.PI;
  let a = -100 + 2*x + 3*y + .2*y*y + .1*x*y + .2*Math.sqrt(Math.abs(x));
  let b = 300 + x + 2*y + .1*x*x + .1*x*y + .1*Math.sqrt(Math.abs(x));
  const wave = (20*Math.sin(6*x*pi) + 20*Math.sin(2*x*pi))*2/3;
  a += wave + (20*Math.sin(y*pi) + 40*Math.sin(y*pi/3))*2/3 +
    (160*Math.sin(y*pi/12) + 320*Math.sin(y*pi/30))*2/3;
  b += wave + (20*Math.sin(x*pi) + 40*Math.sin(x*pi/3))*2/3 +
    (150*Math.sin(x*pi/12) + 300*Math.sin(x*pi/30))*2/3;
  const rad = lat*pi/180, magic = 1 - .006693421622965943*Math.sin(rad)**2;
  return [lng + b*180/(6378245/Math.sqrt(magic)*Math.cos(rad)*pi),
    lat + a*180/(6378245*(1-.006693421622965943)/(magic*Math.sqrt(magic))*pi)];
}
function gcjToWgs(point) {
  let result = [...point];
  for (let i = 0; i < 5; i++) {
    const shifted = wgsToGcj(result);
    result = result.map((value, axis) => value - (shifted[axis] - point[axis]));
  }
  return result.map(value => Number(value.toFixed(6)));
}
const validPoint = point => Array.isArray(point) && point.length === 2 &&
  point.every(Number.isFinite) && Math.abs(point[0]) <= 180 && Math.abs(point[1]) <= 90;

function buildMockRoute(input) {
  // Stable synthetic positions near the prototype's lake reference, not POI
  // coordinates. Never forward them to a provider or label them as geolocation.
  const used = new Set();
  const stops = input.stops.map(stop => {
    let hash = 2166136261;
    for (const char of stop.id) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
    let slot = hash % 10000;
    while (used.has(slot)) slot = (slot + 1) % 10000;
    used.add(slot);
    const mapPoint = [Number((106.035 + (slot % 100) * .0004).toFixed(6)),
      Number((29.778 + Math.floor(slot / 100) * .0004).toFixed(6))];
    return { ...stop, mapPoint, address: '模拟点位 / Mock location', simulated: true };
  });
  const legs = stops.slice(1).map((stop, i) => ({
    from: stops[i].id, to: stop.id, geometry: [stops[i].mapPoint, stop.mapPoint],
    distance: null, duration: null, simulated: true
  }));
  return { id: randomUUID(), status: 'ready', mode: input.mode, origin: 'first-selected-stop',
    ordering: 'selected-order', coordinateSystem: 'WGS84', provider: 'Prototype mock',
    simulated: true, generatedAt: new Date().toISOString(), stops, legs, distance: null, duration: null };
}

async function buildRoute(input, { mapLookup, request, amapKey, signal }) {
  if (!amapKey) throw fail('route_not_configured');
  const resolved = await Promise.all(input.stops.map(async stop => {
    const result = await mapLookup({ entityId: stop.id }, signal);
    // Do not select the first fuzzy search hit or invent a location.
    const places = [...new Map((result.places || [])
      .filter(p => normalize(p.name) === normalize(stop.name))
      .map(p => [p.id, p])).values()];
    if (places.length !== 1) throw fail('route_place_unresolved');
    const p = places[0], point = [p.longitude, p.latitude];
    if (!validPoint(point)) throw fail('route_place_unresolved');
    return { ...stop, address: p.address, point, mapPoint: gcjToWgs(point) };
  }));
  // First selected stop is fixed. Remaining stops use a geographic nearest-next
  // heuristic; this is not a claim of the globally shortest road itinerary.
  const stops = [resolved[0]], remaining = resolved.slice(1);
  while (remaining.length) {
    const previous = stops.at(-1).point;
    const score = row => ((row.point[0]-previous[0])*Math.cos(previous[1]*Math.PI/180))**2 +
      (row.point[1]-previous[1])**2;
    remaining.sort((a, b) => score(a) - score(b));
    stops.push(remaining.shift());
  }
  const legs = [];
  for (let i = 1; i < stops.length; i++) {
    const params = new URLSearchParams({ key: amapKey, origin: stops[i-1].point.join(','),
      destination: stops[i].point.join(','), show_fields: 'cost,polyline', strategy: '32' });
    const result = await request(`https://restapi.amap.com/v5/direction/driving?${params}`, {}, signal);
    const path = result.status === '1' && result.route?.paths?.[0];
    const distance = Number(path?.distance), duration = Number(path?.cost?.duration);
    const geometry = (path?.steps || []).flatMap(step =>
      typeof step.polyline === 'string' ? step.polyline.split(';').map(pair => pair.split(',').map(Number)) : []);
    if (!path || !Number.isFinite(distance) || distance < 0 || !Number.isFinite(duration) || duration < 0 ||
        geometry.length < 2 || geometry.length > 30000 || !geometry.every(validPoint)) throw fail('route_unavailable');
    legs.push({ from: stops[i-1].id, to: stops[i].id, distance, duration,
      geometry: geometry.map(gcjToWgs) });
  }
  return { id: randomUUID(), status: 'ready', mode: input.mode, origin: 'first-selected-stop',
    ordering: 'nearest-next', coordinateSystem: 'WGS84', provider: 'AMap',
    generatedAt: new Date().toISOString(), stops, legs,
    distance: legs.reduce((n, leg) => n + leg.distance, 0),
    duration: legs.reduce((n, leg) => n + leg.duration, 0) };
}

function routeContract(route) {
  return `${route.simulated ? '本轮使用模拟地点和模拟连线，仅用于功能测试，不是真实道路规划；不能据此推断距离、车程、最优顺序或实际地理位置。' : ''}本轮为已锁定的地图行程。必须仅返回JSON：
{"stops":[{"id":"站点ID","visit":"该站具体游玩/用餐/住宿建议","rest":"该站休息与节奏建议","caution":"该站需核实的信息"}]}。
stops必须与以下ID顺序完全一致，不增删、不改名、不重新排序。每站三段建议各30-80中文字或相当英文长度。
不要输出路线概览、站间距离、行驶时间、驾驶步骤、跨站顺序或其他站点名称；这些由应用使用同一份路线数据统一生成，模拟模式不提供距离和车程。
不把民宿当作景点，不编造营业时间、价格、演出场次。仅依据该站资料，缺失时明确需核实。
锁定路线：${JSON.stringify({ mode: route.mode, stops: route.stops.map(s => ({ id: s.id, name: s.name, address: s.address })) })}`;
}
function formatRouteAnswer(raw, route, language) {
  let data;
  try { data = JSON.parse(raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')); }
  catch { throw fail('route_answer_mismatch'); }
  if (!Array.isArray(data.stops) || data.stops.length !== route.stops.length ||
    data.stops.some((s, i) => s.id !== route.stops[i].id ||
      ['visit','rest','caution'].some(key => typeof s[key] !== 'string' || !s[key].trim() || s[key].length > 1200) ||
      route.stops.some((other, j) => i !== j && ['visit','rest','caution'].some(key => s[key].includes(other.name)))))
    throw fail('route_answer_mismatch');
  const en = language === 'en';
  if (en && data.stops.some(s => ['visit', 'rest', 'caution'].some(key => {
    const copy = route.stops.reduce((text, stop) => text.split(stop.name).join(''), s[key]);
    return (copy.match(/[\u3400-\u9fff]/g) || []).length > 10;
  }))) throw fail('route_answer_mismatch');
  const km = meters => (meters / 1000).toFixed(1);
  const minutes = seconds => Math.ceil(seconds / 60);
  const parts = [
    route.simulated ? (en ? '# 🧪 Mock itinerary — functional test' : '# 🧪 模拟行程 · 功能测试')
      : (en ? '# 🗺️ Your mapped itinerary' : '# 🗺️ 与地图一致的行程安排'),
    route.stops.map((s, i) => `${i+1}. ${s.name}`).join(' → '),
    route.simulated ? (en ? 'The map uses mock locations and straight connecting lines in the same order as this reply. This is not a real driving route or your device location; no distance or travel time has been calculated.'
      : '地图使用模拟点位和直线连线，站点顺序与本次回复一致。不是实际自驾路线，也不是您的当前位置；未计算真实距离或车程。')
      : en ? `Driving assumption, starting at the first selected stop—not your device location. Approx. ${km(route.distance)} km / ${minutes(route.duration)} min driving, excluding visits and breaks.`
      : `暂按自驾，从所选首站出发，不代表从您的当前位置出发。道路合计约 ${km(route.distance)} 公里，预计驾驶 ${minutes(route.duration)} 分钟，不含游玩和休息。`,
    route.simulated ? (en ? '> For functional testing only. Stops follow the submitted selection order, not an optimized travel order. Advice below is AI-generated from project records; verify actual conditions before travelling.'
      : '> 仅用于功能测试。沿用提交的地点顺序，不代表顺路或最优方案。以下建议仍由模型根据项目资料生成，实际出行需另行核对。')
      : en ? '> The remaining stops use a nearest-next geographic order, not a guarantee of the fastest route. Travel times are provider estimates; verify destinations and traffic before leaving.'
      : '> 首站固定，其余按地理邻近顺序安排，不代表最快或绝对无折返。车程为地图服务估算，出行前请核对目的地及路况。'
  ];
  data.stops.forEach((s, i) => {
    const leg = route.legs[i-1];
    parts.push(`## ${i+1}. ${route.stops[i].name}`);
    if (leg && route.simulated) parts.push(en ? `↳ Next after ${route.stops[i-1].name} in the mock sequence.` : `↳ 模拟顺序：接续${route.stops[i-1].name}。`);
    else if (leg) parts.push(en ? `🚗 From ${route.stops[i-1].name}: ${km(leg.distance)} km / approx. ${minutes(leg.duration)} min.`
      : `🚗 从${route.stops[i-1].name}前往：约 ${km(leg.distance)} 公里，预计 ${minutes(leg.duration)} 分钟。`);
    parts.push(`- 🌿 ${s.visit.trim()}\n- ☕ ${s.rest.trim()}\n- 📌 ${s.caution.trim()}`);
  });
  return { answer: parts.join('\n\n'), followUp: '', entityIds: route.stops.map(s => s.id).slice(0, 3), sourceIds: [] };
}
module.exports = { validateRouteRequest, buildRoute, buildMockRoute, routeContract, formatRouteAnswer, wgsToGcj, gcjToWgs };
