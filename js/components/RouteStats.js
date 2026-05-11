import { $ } from '../state';

export class RouteStats {
    constructor() {
        this.statsRow = $('statsRow');
        this.statDist = $('statDist');
        this.elevContainer = $('elevContainer');
        this.statElev = $('statElev');
        this.statNetValue = $('statNetValue');
        this.statNetLabel = $('statNetLabel');
        this.statNet = $('statNet');
        this.tempContainer = $('tempContainer');
        this.statTemp = $('statTemp');
        this.windSpeedContainer = $('windSpeedContainer');
        this.statWindSpeed = $('statWindSpeed');
    }

    render(state) {
        const { analysis, weather } = state;
        this.statsRow.classList.remove('hidden');
        this.statDist.textContent = (analysis.totalDist / 1000).toFixed(1);

        const hasEle = analysis.maxEle !== null;
        this.elevContainer.classList.toggle('hidden', !hasEle);
        if (hasEle) this.statElev.textContent = analysis.elevGain.toFixed(0);

        this.statNetValue.className = 'text-2xl font-extrabold tabular-nums tracking-[-0.02em] leading-[1.2]';
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

        const hasWeather = !!weather;
        this.tempContainer.classList.toggle('hidden', !hasWeather);
        this.windSpeedContainer.classList.toggle('hidden', !hasWeather);
        if (hasWeather) {
            this.statTemp.textContent = weather.temperature_2m;
            this.statWindSpeed.textContent = weather.wind_speed_10m;
        }
    }

    hide() {
        this.statsRow.classList.add('hidden');
    }
}
