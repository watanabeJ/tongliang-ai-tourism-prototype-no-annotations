/* Real basemap adapter. Business POIs remain explicitly labelled demo data. */
(() => {
  'use strict';

  const DEFAULT_CENTER = [29.7968734, 106.0581745];
  const DEFAULT_BOUNDS = [[29.7904470, 106.0487967], [29.8032265, 106.0820720]];
  const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  window.TongliangMap = {
    create(host, { onMapInteraction = () => {}, onViewChange = () => {} } = {}) {
      const canvas = host?.querySelector('.map-canvas');
      if (!canvas) return null;
      const markerLayer = host.querySelector('.marker-layer');
      const referenceMarker = host.querySelector('.map-current-location');
      let map = null;
      let tiles = null;
      let reference = null;
      let loadTimer = null;
      let tileErrors = 0;
      let tileSuccesses = 0;
      let planLayer = null;

      host.classList.add('has-real-map');
      canvas.setAttribute('role', 'region');
      canvas.setAttribute('aria-label', '玄天湖真实地图，可拖动，使用滚轮或双指缩放');
      const note = document.createElement('div');
      note.className = 'map-data-note';
      note.textContent = '真实底图 · 商户点位、路线为演示';
      const credits = document.createElement('div');
      credits.className = 'map-credits';
      credits.innerHTML = '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a>';
      const status = document.createElement('div');
      status.className = 'map-load-status';
      status.setAttribute('role', 'status');
      status.hidden = true;
      const message = document.createElement('span');
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.textContent = '重试';
      retry.hidden = true;
      status.append(message, retry);
      host.append(note, credits, status);
      if (referenceMarker) {
        referenceMarker.setAttribute('aria-label', '玄天湖参考中心，非设备定位');
        referenceMarker.title = '玄天湖参考中心，非设备定位';
      }
      host.querySelector('.map-locate')?.setAttribute('aria-label', '回到玄天湖并显示周边演示点位');

      function setStatus(text, canRetry = false) {
        message.textContent = text;
        status.hidden = !text;
        retry.hidden = !canRetry;
      }

      // Freeze the old percentage layout against the FIRST visible map viewport.
      // Later filtering, panning and resizing must not assign new coordinates.
      function latLngForPoint(point) {
        if (!map || !reference) return null;
        return map.unproject([
          reference.x + reference.width * point[0] / 100,
          reference.y + reference.height * point[1] / 100
        ], reference.zoom);
      }

      function projectPoint(point) {
        if (point?.mapPoint) return map?.latLngToContainerPoint([point.mapPoint[1], point.mapPoint[0]]) || null;
        const latLng = point && latLngForPoint(point);
        return latLng ? map.latLngToContainerPoint(latLng) : null;
      }

      function positionMarker(marker, point) {
        const position = projectPoint(point);
        if (!position) return;
        marker.style.left = `${position.x}px`;
        marker.style.top = `${position.y}px`;
      }

      function setMarkerPoint(marker, point) {
        marker.dataset.mapPoint = point.join(',');
        positionMarker(marker, point);
      }

      function setRoutePoints(segment, points) {
        segment.dataset.mapPoints = points.map(point => point.join(',')).join(' ');
      }

      function sync() {
        if (!map || !reference) return;
        markerLayer?.querySelectorAll('[data-map-point]').forEach(marker => {
          positionMarker(marker, marker.dataset.mapPoint.split(',').map(Number));
        });
        // Only route canvases use map-sized viewBoxes; POI icons keep their own.
        markerLayer?.querySelectorAll('svg.wishlist-poi-route, svg.plan-route-layer').forEach(route => {
          const size = map.getSize();
          route.setAttribute('viewBox', `0 0 ${size.x} ${size.y}`);
          route.querySelectorAll('[data-map-points]').forEach(segment => {
            const points = segment.dataset.mapPoints.split(' ').map(value => projectPoint(value.split(',').map(Number)));
            if (segment.tagName.toLowerCase() === 'polyline') {
              segment.setAttribute('points', points.map(point => `${point.x},${point.y}`).join(' '));
            } else if (points.length === 2) {
              segment.setAttribute('x1', points[0].x);
              segment.setAttribute('y1', points[0].y);
              segment.setAttribute('x2', points[1].x);
              segment.setAttribute('y2', points[1].y);
            }
          });
        });
        if (referenceMarker) {
          const position = map.latLngToContainerPoint(DEFAULT_CENTER);
          referenceMarker.style.left = `${position.x}px`;
          referenceMarker.style.top = `${position.y}px`;
        }
        onViewChange();
      }

      function fitDefaultView() {
        map.fitBounds(DEFAULT_BOUNDS, {
          paddingTopLeft: [28, 146],
          paddingBottomRight: [60, 120],
          maxZoom: 15,
          animate: false
        });
      }

      function show() {
        // The plan page starts with this layer display:none.
        if (!canvas.clientWidth || !canvas.clientHeight) return false;
        if (map) {
          map.invalidateSize({ animate: false, pan: false });
          sync();
          return true;
        }
        const L = window.L;
        if (!L?.map) {
          setStatus('地图组件未加载，请刷新页面后重试。', true);
          return false;
        }
        try {
          map = L.map(canvas, {
            zoomControl: false,
            attributionControl: false,
            minZoom: 4,
            maxZoom: 19,
            dragging: true,
            touchZoom: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            keyboard: true,
            // Keep the existing DOM POIs exactly in sync during pinch/wheel zoom.
            zoomAnimation: false,
            fadeAnimation: false
          });
          fitDefaultView();
          const size = map.getSize();
          const origin = map.project(map.getCenter(), map.getZoom());
          reference = {
            x: origin.x - size.x / 2,
            y: origin.y - size.y / 2,
            width: size.x,
            height: Math.max(1, size.y - 56),
            zoom: map.getZoom()
          };
          map.on('click dragstart zoomstart', onMapInteraction);
          map.on('move zoom resize', sync);
          tiles = L.tileLayer(TILE_URL, {
            minZoom: 4,
            maxZoom: 19,
            updateWhenIdle: true,
            keepBuffer: 1,
            detectRetina: false,
            referrerPolicy: 'strict-origin-when-cross-origin'
          });
          tiles.on('loading', () => {
            tileErrors = 0;
            tileSuccesses = 0;
            setStatus('正在加载真实地图…');
            window.clearTimeout(loadTimer);
            loadTimer = window.setTimeout(() => {
              setStatus('地图加载较慢，请检查网络或重试。', true);
            }, 12000);
          });
          tiles.on('tileload', () => { tileSuccesses += 1; });
          tiles.on('tileerror', () => {
            tileErrors += 1;
            setStatus('部分底图未加载，请检查网络后重试。', true);
          });
          tiles.on('load', () => {
            window.clearTimeout(loadTimer);
            setStatus(tileErrors
              ? (tileSuccesses ? '部分底图未加载，可重试。' : '底图加载失败，请检查网络后重试。')
              : '', tileErrors > 0);
          });
          tiles.addTo(map);
          host.classList.add('is-map-ready');
          sync();
          return true;
        } catch (error) {
          window.clearTimeout(loadTimer);
          map?.remove();
          map = null;
          tiles = null;
          reference = null;
          host.classList.remove('is-map-ready');
          setStatus('地图初始化失败，请重试。', true);
          console.warn('Tongliang map initialization failed:', error);
          return false;
        }
      }

      function reloadTiles() {
        if (show()) tiles?.redraw();
      }
      function clearPlan() {
        if (planLayer) { planLayer.remove(); planLayer = null; }
        note.textContent = '真实底图 · 商户点位、路线为演示';
      }
      function showPlan(route, { renderStopIcon, onStopClick } = {}) {
        const L = window.L;
        if (!route || route.status !== 'ready' || route.coordinateSystem !== 'WGS84' ||
            !Array.isArray(route.stops) || !Array.isArray(route.legs) ||
            route.stops.length < 2 || route.legs.length !== route.stops.length - 1 || !show()) return false;
        const valid = point => Array.isArray(point) && point.length === 2 && point.every(Number.isFinite) &&
          Math.abs(point[0]) <= 180 && Math.abs(point[1]) <= 90;
        if (route.stops.some(stop => !valid(stop.mapPoint)) || route.legs.some((leg, i) =>
          leg.from !== route.stops[i].id || leg.to !== route.stops[i+1].id ||
          !Array.isArray(leg.geometry) || leg.geometry.length < 2 || !leg.geometry.every(valid))) return false;
        clearPlan();
        planLayer = L.layerGroup().addTo(map);
        const bounds = [];
        route.legs.forEach(leg => {
          const points = leg.geometry.map(([lng, lat]) => [lat, lng]);
          L.polyline(points, { color: '#1664ff', weight: 5, opacity: .85, ...(route.simulated ? { dashArray: '8 8' } : {}) }).addTo(planLayer);
          bounds.push(...points);
        });
        route.stops.forEach((stop, index) => {
          const point = [stop.mapPoint[1], stop.mapPoint[0]];
          const label = document.createElement('span');
          label.textContent = stop.name;
          const icon = L.divIcon({ className: 'route-poi-marker',
            html: renderStopIcon ? renderStopIcon(stop) : label,
            iconSize: [116, 66], iconAnchor: [58, 31], popupAnchor: [0, -16] });
          L.marker(point, { icon, alt: `${index+1}. ${stop.name}`, keyboard: true, bubblingMouseEvents: false })
            .on('click', () => onStopClick?.(stop)).addTo(planLayer);
          bounds.push(point);
        });
        const en = host.closest?.('[data-language]')?.getAttribute('data-language') === 'en';
        note.textContent = route.simulated ? (en ? 'MOCK route · test only · not for navigation' : '模拟路线 · 仅用于功能测试 · 不可导航')
          : en ? 'AMap driving route · same stop order as the itinerary · from first stop'
          : '高德驾车路线 · 与本次回复同序 · 从首站出发';
        const panel = host.closest?.('.plan-screen')?.querySelector('.plan-conversation-panel');
        const mapBox = canvas.getBoundingClientRect();
        const panelBox = panel?.getBoundingClientRect();
        const covered = panelBox && panelBox.top > mapBox.top && panelBox.top < mapBox.bottom
          ? mapBox.bottom - panelBox.top + 30 : 120;
        map.fitBounds(bounds, { paddingTopLeft: [35, 150], paddingBottomRight: [80, covered], maxZoom: 15, animate: false });
        return true;
      }
      retry.addEventListener('click', reloadTiles);
      window.addEventListener('online', () => {
        if (map && canvas.clientWidth && !status.hidden) reloadTiles();
      });
      const resizeObserver = typeof ResizeObserver === 'function'
        ? new ResizeObserver(() => show()) : null;
      resizeObserver?.observe(canvas);
      window.addEventListener('resize', show);
      window.requestAnimationFrame(show);

      return {
        show,
        sync,
        projectPoint,
        setMarkerPoint,
        setRoutePoints,
        showPlan,
        clearPlan,
        recenter() {
          if (!show()) return;
          onMapInteraction();
          fitDefaultView();
          sync();
        },
        focusPoint(point) {
          if (!show()) return;
          map.panTo(latLngForPoint(point), { animate: false });
          sync();
        }
      };
    }
  };
})();
