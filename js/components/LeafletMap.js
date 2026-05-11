import { GeoUtils } from '../utils/GeoUtils';
import { TILE_DARK, TILE_LIGHT } from '../constants';

export class LeafletMap {
    constructor() {
        this.map = null;
        this.tileLayer = null;
        this.layerGroup = null;
        this.windOverlayGroup = null;
        this.cachedWindDir = 0;
        this.windOverlayVisible = true;
        this.hoverMarker = null;
    }

    isDark() {
        return document.documentElement.getAttribute('data-theme') !== 'light';
    }

    createWindArrowIcon(blowsTo) {
        return L.divIcon({
            className: 'wind-arrow-marker',
            html: `<svg viewBox="0 0 24 24" width="24" height="24" style="transform:rotate(${blowsTo}deg)"><path d="M12 2 L16.5 11 L12 8.5 L7.5 11 Z" fill="#FC4C02" fill-opacity="0.35"/></svg>`,
            iconSize: [24, 24], iconAnchor: [12, 12]
        });
    }

    updateWindOverlay() {
        if (!this.map || !this.windOverlayGroup) return;
        this.windOverlayGroup.clearLayers();
        if (!this.windOverlayVisible) return;
        const bounds = this.map.getBounds();
        const rows = 5, cols = 5;
        const latStep = (bounds.getNorth() - bounds.getSouth()) / (rows + 1);
        const lonStep = (bounds.getEast() - bounds.getWest()) / (cols + 1);
        const arrowDir = (this.cachedWindDir + 180) % 360;
        for (let i = 1; i <= rows; i++)
            for (let j = 1; j <= cols; j++)
                L.marker(
                    [bounds.getSouth() + i * latStep, bounds.getWest() + j * lonStep],
                    { icon: this.createWindArrowIcon(arrowDir), interactive: false }
                ).addTo(this.windOverlayGroup);
    }

    render(state) {
        const { points, analysis, windDir: wDir, windSpeed: wSpeed, waypoints } = state;
        if (this.map) { this.map.remove(); this.map = null; }
        this.cachedWindDir = wDir;
        this.windOverlayVisible = true;
        this.map = L.map('map');
        this.tileLayer = L.tileLayer(this.isDark() ? TILE_DARK : TILE_LIGHT, {
            attribution: '&copy; OSM &copy; CARTO'
        }).addTo(this.map);
        this.layerGroup = L.layerGroup().addTo(this.map);

        analysis.segments.forEach(seg => {
            const line = L.polyline(
                [[seg.p1.lat, seg.p1.lon], [seg.p2.lat, seg.p2.lon]],
                { color: GeoUtils.segmentColor(seg.headFactor), weight: 4, opacity: 0.9 }
            );
            line.bindPopup(
                `<b>${seg.type.charAt(0).toUpperCase() + seg.type.slice(1)}</b><br>` +
                `Bearing: ${seg.brng.toFixed(0)}\u00b0<br>` +
                `Headwind: ${seg.headComp.toFixed(1)} km/h<br>` +
                `Crosswind: ${Math.abs(seg.crossComp).toFixed(1)} km/h`
            );
            this.layerGroup.addLayer(line);
        });

        const latlngs = points.map(p => [p.lat, p.lon]);
        this.map.fitBounds(L.latLngBounds(latlngs).pad(0.1));
        L.circleMarker(latlngs[0], {
            radius: 7, color: '#303030', fillColor: '#4cd964', fillOpacity: 1, weight: 2.5
        }).bindTooltip('Start').addTo(this.map);
        L.circleMarker(latlngs[latlngs.length - 1], {
            radius: 7, color: '#303030', fillColor: '#FC4C02', fillOpacity: 1, weight: 2.5
        }).bindTooltip('End').addTo(this.map);

        this.windOverlayGroup = L.layerGroup().addTo(this.map);
        const self = this;
        const WindToggle = L.Control.extend({
            options: { position: 'topright' },
            onAdd() {
                const btn = L.DomUtil.create('div', 'map-wind-toggle active');
                btn.innerHTML = `Wind<br><span class="toggle-label">${GeoUtils.windLabel(wDir)} ${wSpeed} km/h</span>`;
                btn.title = 'Toggle wind overlay';
                L.DomEvent.disableClickPropagation(btn);
                btn.addEventListener('click', () => {
                    self.windOverlayVisible = !self.windOverlayVisible;
                    btn.classList.toggle('active', self.windOverlayVisible);
                    self.updateWindOverlay();
                });
                return btn;
            }
        });
        this.map.addControl(new WindToggle());
        this.map.on('moveend', () => this.updateWindOverlay());
        this.updateWindOverlay();
    }

    updateTiles() {
        if (this.map && this.tileLayer) {
            this.tileLayer.setUrl(this.isDark() ? TILE_DARK : TILE_LIGHT);
        }
    }

    showHoverMarker(lat, lon, headFactor) {
        if (!this.map) return;
        if (!this.hoverMarker) {
            this.hoverMarker = L.circleMarker([lat, lon], {
                radius: 7, color: '#fff', fillColor: GeoUtils.segmentColor(headFactor),
                fillOpacity: 1, weight: 2
            }).addTo(this.map);
        } else {
            this.hoverMarker.setLatLng([lat, lon]);
            this.hoverMarker.setStyle({ fillColor: GeoUtils.segmentColor(headFactor) });
        }
    }

    removeHoverMarker() {
        if (this.hoverMarker && this.map) {
            this.map.removeLayer(this.hoverMarker);
            this.hoverMarker = null;
        }
    }

    destroy() {
        if (this.map) { this.map.remove(); this.map = null; }
    }
}
