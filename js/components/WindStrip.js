import { GeoUtils } from '../utils/GeoUtils';

export class WindStrip {
    constructor() {
        this.segments = [];
    }

    render(segments) {
        const strip = document.getElementById('windStrip');
        strip.innerHTML = '';
        this.segments = [];
        let cumDist = 0;
        segments.forEach(seg => {
            const div = document.createElement('div');
            div.style.flex = `${seg.dist} 0 0`;
            div.style.background = GeoUtils.segmentColor(seg.headFactor);
            strip.appendChild(div);
            cumDist += seg.dist;
            this.segments.push({ ...seg, cumDist });
        });
    }

    getSegmentAtPosition(pct) {
        if (!this.segments.length) return null;
        const totalDist = this.segments[this.segments.length - 1].cumDist;
        const targetDist = pct * totalDist;
        return this.segments.find(s => s.cumDist >= targetDist) || this.segments[this.segments.length - 1];
    }
}
