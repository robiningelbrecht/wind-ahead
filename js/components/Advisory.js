import { $ } from '../state';
import { UV_BANDS } from '../constants';

const SEVERITY_CLASSES = {
    warning: { bar: 'bg-amber-600', title: 'text-amber-600' },
    danger:  { bar: 'bg-red-600',   title: 'text-red-600'   },
};

export class Advisory {
    constructor() {
        this.container = $('advisories');
    }

    render(state) {
        const items = this.compute(state);
        if (!items.length) {
            this.hide();
            return;
        }
        this.container.classList.remove('hidden');
        this.container.innerHTML = items.map(item => {
            const sev = SEVERITY_CLASSES[item.severity] || SEVERITY_CLASSES.warning;
            return `
                <div class="card">
                    <div class="flex items-stretch gap-3">
                        <div class="shrink-0 w-1 rounded-full ${sev.bar}"></div>
                        <div class="flex-1 min-w-0 py-0.5">
                            <div class="font-bold text-[0.95rem] mt-0.5 ${sev.title}">${item.title}</div>
                            <div class="text-[0.82rem] text-gray-600 mt-1">${item.message}</div>
                        </div>
                    </div>
                </div>`;
        }).join('');
    }

    hide() {
        this.container.classList.add('hidden');
        this.container.innerHTML = '';
    }

    compute(state) {
        const items = [];

        const uv = state.weather?.uvIndexMax;
        if (uv != null) {
            const band = UV_BANDS.find(b => uv < b.max);
            items.push({
                title: `UV ${uv.toFixed(0)} - ${band.label}`,
                message: band.advice,
                severity: band.severity,
            });
        }

        return items;
    }
}
