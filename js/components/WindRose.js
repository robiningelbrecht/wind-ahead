import { $ } from '../state';
import { GeoUtils } from '../utils/GeoUtils';

export class WindRose {
    constructor() {
        this.paths = $('windRosePaths');
        this.legend = $('windRoseLegend');
    }

    render(state) {
        const { windRose, windDir } = state;
        let svg = windRose.map(p =>
            `<path d="${p.path}" fill="${p.color}" fill-opacity="0.5" stroke="${p.color}" stroke-width="0.5"/>`
        ).join('');
        const toX = 50 + 22 * Math.sin(GeoUtils.toRad(windDir + 180));
        const toY = 50 - 22 * Math.cos(GeoUtils.toRad(windDir + 180));
        svg += `<line x1="50" y1="50" x2="${toX.toFixed(1)}" y2="${toY.toFixed(1)}" stroke="#FC4C02" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>`;
        svg += `<circle cx="${toX.toFixed(1)}" cy="${toY.toFixed(1)}" r="2.5" fill="#FC4C02" opacity="0.8"/>`;
        this.paths.innerHTML = svg;

        this.legend.innerHTML = windRose.map(p => `
            <div class="flex items-center gap-1.5">
                <span class="text-[0.72rem] font-semibold text-gray-600 w-5.5">${p.label}</span>
                <div class="flex-1 h-1.25 bg-gray-200 rounded-sm overflow-hidden">
                    <div class="h-full rounded-sm transition-[width] duration-400" style="width:${p.pct}%;background:${p.color}"></div>
                </div>
                <span class="text-[0.68rem] text-gray-500 tabular-nums w-7 text-right">${p.distPct}%</span>
            </div>`).join('');
    }
}
