import { $, state } from '../state';
import { GeoUtils } from '../utils/GeoUtils';

export class SegmentTable {
    constructor() {
        this.container = $('segmentDetails');
        this.body = $('segmentTableBody');
        this.wrap = $('segmentTableWrap');
        this.chevron = $('segmentChevron');

        $('segmentToggle').addEventListener('click', () => {
            state.segmentTableOpen = !state.segmentTableOpen;
            this.wrap.classList.toggle('hidden', !state.segmentTableOpen);
            this.chevron.classList.toggle('rotate-180', state.segmentTableOpen);
        });
    }

    render(state) {
        const rows = state.segmentTable;
        if (!rows.length) {
            this.container.classList.add('hidden');
            return;
        }
        this.container.classList.remove('hidden');
        this.body.innerHTML = rows.map(row => {
            const colorClass = row.headComp > 0.5 ? 'text-red-600' : row.headComp < -0.5 ? 'text-green-600' : '';
            const dotClass = row.type === 'headwind' ? 'bg-red-600' : row.type === 'tailwind' ? 'bg-green-600' : 'bg-amber-600';
            return `<tr class="even:bg-gray-50">
                <td>${row.index}</td>
                <td>${row.bearing.toFixed(0)}\u00b0 <span class="text-[0.68rem] text-gray-500">${GeoUtils.windLabel(row.bearing)}</span></td>
                <td><span class="${colorClass}">${row.headComp.toFixed(1)}\u00a0km/h</span></td>
                <td>${row.crossComp.toFixed(1)}\u00a0km/h</td>
                <td>${row.elevation !== null ? row.elevation.toFixed(0) + '\u00a0m' : '-'}</td>
                <td><span class="inline-block size-2 rounded-full mr-1.5 align-middle ${dotClass}"></span>${row.type.charAt(0).toUpperCase() + row.type.slice(1)}</td>
            </tr>`;
        }).join('');
    }

    hide() {
        this.container.classList.add('hidden');
    }
}
