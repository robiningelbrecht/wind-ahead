import { $ } from '../state';

export class Breakdown {
    constructor() {
        this.headArc = $('pctHeadArc');
        this.tailArc = $('pctTailArc');
        this.crossArc = $('pctCrossArc');
        this.dominantPct = $('dominantPct');
        this.dominantType = $('dominantType');
        this.headText = $('pctHeadText');
        this.tailText = $('pctTailText');
        this.crossText = $('pctCrossText');
    }

    render(state) {
        const { pctHead, pctTail, pctCross } = state.analysis;

        this.headArc.setAttribute('stroke-dasharray', `${pctHead} ${100 - pctHead}`);
        this.tailArc.setAttribute('stroke-dasharray', `${pctTail} ${100 - pctTail}`);
        this.tailArc.setAttribute('stroke-dashoffset', 25 - pctHead);
        this.crossArc.setAttribute('stroke-dasharray', `${pctCross} ${100 - pctCross}`);
        this.crossArc.setAttribute('stroke-dashoffset', 25 - pctHead - pctTail);

        const dominant = pctHead >= pctTail && pctHead >= pctCross ? 'Headwind'
            : pctTail >= pctCross ? 'Tailwind' : 'Crosswind';
        const dominantVal = Math.max(pctHead, pctTail, pctCross).toFixed(0);
        const colorClass = dominant === 'Headwind' ? 'text-red-600'
            : dominant === 'Tailwind' ? 'text-green-600' : 'text-amber-600';

        this.dominantPct.className = `text-[1.4rem] font-extrabold leading-[1.1] ${colorClass}`;
        this.dominantPct.textContent = dominantVal + '%';
        this.dominantType.textContent = dominant;
        this.headText.textContent = pctHead.toFixed(0) + '%';
        this.tailText.textContent = pctTail.toFixed(0) + '%';
        this.crossText.textContent = pctCross.toFixed(0) + '%';
    }
}
