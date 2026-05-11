import { $ } from '../state';
import { GeoUtils } from '../utils/GeoUtils';
import { unitLabel, convertUnit } from '../utils/units';

export class SegmentTable {
    constructor() {
        this.container = $('segmentDetails');
        this.body = $('segmentTableBody');
    }

    render(state) {
        const rows = state.segmentTable;
        const { unitSystem } = state;
        const speed = unitLabel(unitSystem, 'speed');
        const elev = unitLabel(unitSystem, 'elev');
        if (!rows.length) {
            this.container.classList.add('hidden');
            return;
        }
        this.container.classList.remove('hidden');
        this.body.innerHTML = rows.map(row => {
            const colorClass = row.headComp > 0.5 ? 'text-red-600' : row.headComp < -0.5 ? 'text-green-600' : '';
            const dotClass = row.type === 'headwind' ? 'bg-red-600' : row.type === 'tailwind' ? 'bg-green-600' : 'bg-amber-600';
            const elevVal = row.elevation !== null ? convertUnit(row.elevation, 'elev', unitSystem).toFixed(0) + '\u00a0' + elev : '-';
            return `<tr class="even:bg-gray-50">
                <td>${row.index}</td>
                <td>${row.bearing.toFixed(0)}\u00b0 <span class="text-[0.68rem] text-gray-500">${GeoUtils.windLabel(row.bearing)}</span></td>
                <td><span class="${colorClass}">${row.headComp.toFixed(1)}\u00a0${speed}</span></td>
                <td>${row.crossComp.toFixed(1)}\u00a0${speed}</td>
                <td>${elevVal}</td>
                <td><span class="inline-block size-2 rounded-full mr-1.5 align-middle ${dotClass}"></span>${row.type.charAt(0).toUpperCase() + row.type.slice(1)}</td>
            </tr>`;
        }).join('');
    }

    hide() {
        this.container.classList.add('hidden');
    }
}
