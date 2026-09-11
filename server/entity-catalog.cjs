const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
let cache;
let signature = '';

// Read ONLY local, developer-owned object literals. Never evaluate downloaded
// pages, request text, or a complete application script.
function literal(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  if (from < 0 || to < 0) throw new Error('catalog_schema_changed');
  return new vm.Script(`(${source.slice(from + start.length, to).trim().replace(/;$/, '')})`)
    .runInNewContext(Object.create(null), { timeout: 1000 });
}
function imagePath(value) {
  const image = String(value || '').replace(/^\.\.\//, '');
  if (!/^assets\/[^<>]*\.(png|jpe?g|webp|svg)$/i.test(image) || image.includes('..')) return 'assets/map.png';
  return fs.existsSync(path.join(root, image)) ? image : 'assets/map.png';
}
function getCatalog() {
  const detailFile = path.join(root, 'consumer/product-detail.html');
  const appFile = path.join(root, 'app.js');
  const researchedFile = path.join(root, 'data/researched-cards.js');
  const stamp = `${fs.statSync(detailFile).mtimeMs}:${fs.statSync(appFile).mtimeMs}:${fs.statSync(researchedFile).mtimeMs}`;
  if (cache && stamp === signature) return cache;
  const html = fs.readFileSync(detailFile, 'utf8');
  const app = fs.readFileSync(appFile, 'utf8');
  const products = literal(html, 'const productCatalog = ', '    const knowledgeDetailCatalog');
  const knowledge = literal(html, 'const knowledgeDetailCatalog = ', '    const productQuery');
  const marquee = literal(app, 'const marqueeEntityCatalog = ', 'const marqueeEntityButton');
  const rows = [];
  const updatedAt = fs.statSync(detailFile).mtime.toISOString();
  const make = (id, entry, href, kind = 'merchant') => ({
    id, name: entry.name, category: entry.type || (/酒店|民宿|雅舍/.test(entry.name) ? 'stay' : 'eat'),
    kind, aliases: [entry.name, entry.merchant].filter(Boolean),
    image: imagePath(entry.images?.[0]), address: entry.info?.address || '',
    description: String(entry.info?.description || '').replace(/，?支持分钟级库存同步 API。?/g, '。'),
    specialties: Array.from(entry.info?.specialties || []),
    detailHref: href, hasDetailPage: true, provenance: 'consumer/product-detail.html', updatedAt,
    freshness: 'local_snapshot', enabled: true
  });
  for (const [key, entry] of Object.entries(knowledge)) {
    rows.push(make(key, entry, `product-detail.html?knowledgeRef=${encodeURIComponent(key)}`));
  }
  for (const [key, entry] of Object.entries(products)) {
    if (rows.some(row => row.name === entry.name)) continue;
    rows.push(make(`product:${key}`, entry, `product-detail.html?item=${encodeURIComponent(key)}`, entry.type === 'tour' ? 'poi' : 'product'));
  }
  delete require.cache[require.resolve(researchedFile)];
  for (const entry of require(researchedFile)) {
    if (rows.some(row => row.id === entry.id || row.name === entry.name)) throw new Error('duplicate_researched_card');
    rows.push({
      ...make(entry.id, entry, `product-detail.html?researchRef=${encodeURIComponent(entry.id)}`, entry.type === 'tour' ? 'poi' : 'merchant'),
      aliases: [...new Set([entry.name, ...entry.aliases])],
      provenance: 'data/researched-cards.js', updatedAt: entry.checkedAt,
      sources: entry.sources, imageNote: entry.imageNote, visitNote: entry.visitNote
    });
  }
  for (const [name, entity] of Object.entries(marquee)) {
    const existing = rows.find(row => row.id === entity.knowledgeRef || row.name === name);
    if (existing) { existing.aliases = [...new Set([...existing.aliases, name])]; continue; }
    // Legacy POI identifiers sometimes point to another attraction. Do not
    // inherit those routes or the old "1.8km" simulated coordinates.
    if (!['poi', 'activity'].includes(entity.type)) continue;
    const id = `place:${name}`;
    rows.push({
      id, name, category: 'tour', kind: entity.type, aliases: [name],
      image: imagePath(entity.image), address: entity.address || '',
      description: entity.intro || '', specialties: [],
      // Brief topic records are knowledge only, not full product cards.
      // Never manufacture a generic intermediate detail destination for them.
      detailHref: '', hasDetailPage: false,
      provenance: 'app.js:marqueeEntityCatalog', updatedAt: fs.statSync(appFile).mtime.toISOString(),
      freshness: 'local_snapshot', enabled: true
    });
  }
  cache = rows;
  signature = stamp;
  return rows;
}
function findEntity(id) { return getCatalog().find(row => row.id === id && row.enabled); }
function cardFor(row) {
  return { ...row, sourceId: `entity:${row.id}` };
}
module.exports = { getCatalog, findEntity, cardFor, literal };
