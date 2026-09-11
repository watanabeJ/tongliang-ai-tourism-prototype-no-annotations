const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'consumer-map.js'), 'utf8');
const start = source.indexOf('      function constrainViewport()');
const end = source.indexOf('      function show()', start);
assert(start >= 0 && end > start);

test('static backdrop dimensions match the local image', () => {
  const png = fs.readFileSync(path.join(root, 'assets/map.png'));
  const size = source.match(/const BACKDROP_SIZE = \[(\d+), (\d+)\]/);
  assert.deepEqual(size.slice(1).map(Number), [png.readUInt32BE(16), png.readUInt32BE(20)]);
  assert.match(source, /BACKDROP_OVERSCAN = 2/);
});

test('minimum zoom covers every viewport and is recalculated on both larger and smaller resize', () => {
  for (const initial of [[320, 640], [373, 810], [430, 932], [932, 430]]) {
    const scale = Math.max(initial[0] / 408, initial[1] / 791) * 2;
    const span = { x: 408 * scale - 8, y: 791 * scale - 8 };
    let viewport;
    let minimum;
    let maximum;
    let constrained = 0;
    const context = vm.createContext({
      Math, ZOOM_STEP: 0.25, limitingView: false,
      reference: { zoom: 14 },
      navigationBounds: { getSouthEast: () => 'se', getNorthWest: () => 'nw' },
      map: {
        project: () => ({ subtract: () => span }),
        getSize: () => viewport,
        setMaxZoom: value => { maximum = value; },
        setMinZoom: value => { minimum = value; },
        panInsideBounds: (_, options) => {
          assert.equal(options.animate, false);
          constrained++;
          // Pinch/move callbacks can be reentrant; the guard must terminate.
          vm.runInContext('constrainViewport()', context);
        }
      }
    });
    vm.runInContext(source.slice(start, end), context);
    for (const [x, y] of [[373, 810], [1024, 1366], [320, 568], [844, 390], [390, 844]]) {
      viewport = { x, y };
      vm.runInContext('constrainViewport()', context);
      const factor = 2 ** (minimum - 14);
      assert(span.x * factor >= x && span.y * factor >= y, 'image must cover the viewport');
      assert(minimum <= maximum);
      assert.equal(minimum % 0.25, 0);
      assert(span.x * factor / 2 ** 0.25 < x || span.y * factor / 2 ** 0.25 < y,
        'use the closest safe zoom, including after shrinking the viewport');
    }
    assert.equal(constrained, 5);
    assert.equal(context.limitingView, false);
  }
});

test('drag, wheel and pinch limits are enabled without inertial overscroll', () => {
  for (const option of ['maxBoundsViscosity: 1', 'inertia: false', 'bounceAtZoomLimits: false']) {
    assert(source.includes(option));
  }
  assert(source.includes('map.setMaxBounds(navigationBounds)'));
  assert(source.includes("if (event.pinch) constrainViewport()"));
  assert(!source.includes('tile.openstreetmap.org'));
});
