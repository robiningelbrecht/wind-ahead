import { GeoUtils } from '../utils/GeoUtils';

export class WindStrip {
    constructor() {
        this.segments = [];
        this.strip = document.getElementById('windStrip');
        this.tooltip = document.getElementById('stripTooltip');
        this.container = document.getElementById('stripContainer');
    }

    render(state) {
        const segments = state.analysis.segments;
        this.strip.innerHTML = '';
        this.segments = [];
        let cumDist = 0;
        segments.forEach(seg => {
            const div = document.createElement('div');
            div.style.flex = `${seg.dist} 0 0`;
            div.style.background = GeoUtils.segmentColor(seg.headFactor);
            this.strip.appendChild(div);
            cumDist += seg.dist;
            this.segments.push({ ...seg, cumDist });
        });
    }

    bind(map) {
        this.strip.addEventListener('mousemove', (event) => {
            if (!this.segments.length || !map.map) return;
            const rect = this.strip.getBoundingClientRect();
            const pct = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
            const seg = this.getSegmentAtPosition(pct);
            if (!seg) return;
            const midLat = (seg.p1.lat + seg.p2.lat) / 2;
            const midLon = (seg.p1.lon + seg.p2.lon) / 2;
            const dist = (seg.cumDist / 1000).toFixed(1);
            const typeClass = seg.type === 'headwind' ? 'text-red-600' : seg.type === 'tailwind' ? 'text-green-600' : 'text-amber-600';
            this.tooltip.innerHTML = `<span class="font-semibold ${typeClass}">${seg.type.charAt(0).toUpperCase() + seg.type.slice(1)}</span> &middot; ${dist} km<br>Head: ${seg.headComp.toFixed(1)} km/h &middot; Cross: ${Math.abs(seg.crossComp).toFixed(1)} km/h`;
            this.tooltip.style.left = (event.clientX - rect.left) + 'px';
            this.tooltip.classList.remove('hidden');
            map.showHoverMarker(midLat, midLon, seg.headFactor);
        });

        this.container.addEventListener('mouseleave', () => {
            this.tooltip.classList.add('hidden');
            map.removeHoverMarker();
        });
    }

    getSegmentAtPosition(pct) {
        if (!this.segments.length) return null;
        const totalDist = this.segments[this.segments.length - 1].cumDist;
        const targetDist = pct * totalDist;
        return this.segments.find(s => s.cumDist >= targetDist) || this.segments[this.segments.length - 1];
    }
}
