import { $ } from '../state';
import { unitLabel, convertUnit } from '../utils/units';
import { UV_BANDS } from '../constants';

const STAT_VALUE_CLASS = 'text-2xl font-extrabold tabular-nums tracking-[-0.02em] leading-[1.2]';

export class RouteStats {
    constructor() {
        this.statsRow = $('statsRow');
        this.statDist = $('statDist');
        this.distUnit = $('distUnit');
        this.elevContainer = $('elevContainer');
        this.statElev = $('statElev');
        this.elevUnit = $('elevUnit');
        this.statNetValue = $('statNetValue');
        this.statNetLabel = $('statNetLabel');
        this.statNet = $('statNet');
        this.netWindUnit = $('netWindUnit');
        this.tempContainer = $('tempContainer');
        this.statTemp = $('statTemp');
        this.tempUnit = $('tempUnit');
        this.windSpeedContainer = $('windSpeedContainer');
        this.statWindSpeed = $('statWindSpeed');
        this.windSpeedUnit = $('windSpeedUnit');
        this.uvContainer = $('uvContainer');
        this.statUvValue = $('statUvValue');
        this.statUv = $('statUv');
        this.statUvLabel = $('statUvLabel');
    }

    render(state) {
        const { analysis, weather, unitSystem } = state;
        this.statsRow.classList.remove('hidden');

        const dist = convertUnit(analysis.totalDist / 1000, 'dist', unitSystem);
        this.statDist.textContent = dist.toFixed(1);
        this.distUnit.textContent = unitLabel(unitSystem, 'dist');

        const hasEle = analysis.maxEle !== null;
        this.elevContainer.classList.toggle('hidden', !hasEle);
        if (hasEle) {
            this.statElev.textContent = convertUnit(analysis.elevGain, 'elev', unitSystem).toFixed(0);
            this.elevUnit.textContent = unitLabel(unitSystem, 'elev');
        }

        this.statNetValue.className = STAT_VALUE_CLASS;
        if (analysis.avgHead > 0.5) {
            this.statNetValue.classList.add('text-red-600');
            this.statNetLabel.textContent = 'Net Headwind';
        } else if (analysis.avgHead < -0.5) {
            this.statNetValue.classList.add('text-green-600');
            this.statNetLabel.textContent = 'Net Tailwind';
        } else {
            this.statNetValue.classList.add('text-amber-600');
            this.statNetLabel.textContent = 'Net Crosswind';
        }
        this.statNet.textContent = Math.abs(analysis.avgHead).toFixed(1);
        this.netWindUnit.textContent = unitLabel(unitSystem, 'speed');

        const hasWeather = !!weather;
        this.tempContainer.classList.toggle('hidden', !hasWeather);
        this.windSpeedContainer.classList.toggle('hidden', !hasWeather);
        if (hasWeather) {
            this.statTemp.textContent = weather.temperature2m;
            this.tempUnit.textContent = unitLabel(unitSystem, 'temp');
            this.statWindSpeed.textContent = weather.windSpeed10m;
            this.windSpeedUnit.textContent = unitLabel(unitSystem, 'speed');
        }

        const hasUv = hasWeather && weather.uvIndexMax != null;
        this.uvContainer.classList.toggle('hidden', !hasUv);
        if (hasUv) {
            const band = UV_BANDS.find(b => weather.uvIndexMax < b.max);
            this.statUv.textContent = weather.uvIndexMax.toFixed(0);
            this.statUvLabel.textContent = band.label;
            this.statUvValue.className = `${STAT_VALUE_CLASS} ${band.color}`.trim();
            this.uvContainer.title = `${band.label} - ${band.advice}`;
        }
    }

    hide() {
        this.statsRow.classList.add('hidden');
    }
}
