import { $ } from '../state';
import { WEATHER_CODES, WEATHER_ICONS } from '../constants';
import { GeoUtils } from '../utils/GeoUtils';
import { unitLabel, convertUnit, IMPERIAL } from '../utils/units';

export class Weather {
    constructor() {
        this.title = $('weatherTitle');
        this.windSpeedEl = $('weatherWindSpeed');
        this.windLabelEl = $('weatherWindLabel');
        this.speedUnit = $('weatherSpeedUnit');
        this.gusts = $('weatherGusts');
        this.needle = $('windNeedle');
        this.condition = $('conditionText');
        this.feelsLike = $('feelsLike');
        this.humidity = $('humidity');
        this.precipitation = $('precipitation');
        this.clouds = $('clouds');
        this.pressure = $('pressure');
    }

    render(state) {
        const { weather, windDir, dateTime, unitSystem } = state;
        const speed = unitLabel(unitSystem, 'speed');
        const date = new Date(dateTime);
        const opts = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        this.title.textContent = `Weather - ${date.toLocaleDateString(undefined, opts)}`;
        this.windSpeedEl.textContent = weather.windSpeed10m;
        this.windLabelEl.textContent = GeoUtils.windLabel(windDir) + ' (' + windDir + '\u00b0)';
        this.speedUnit.textContent = speed;
        this.gusts.textContent = weather.windGusts10m + ' ' + speed;
        this.needle.style.transform = `rotate(${(windDir + 180) % 360}deg)`;
        const icon = WEATHER_ICONS[weather.weatherCode] || '';
        this.condition.textContent = icon + ' ' + (WEATHER_CODES[weather.weatherCode] || `Code ${weather.weatherCode}`);
        this.feelsLike.textContent = weather.apparentTemperature + unitLabel(unitSystem, 'temp');
        this.humidity.textContent = weather.relativeHumidity2m + '%';
        this.precipitation.textContent = convertUnit(weather.precipitation, 'precip', unitSystem).toFixed(2) + ' ' + unitLabel(unitSystem, 'precip');
        this.clouds.textContent = weather.cloudCover + '%';
        this.pressure.textContent = convertUnit(weather.surfacePressure, 'pressure', unitSystem).toFixed(unitSystem === IMPERIAL ? 2 : 0) + ' ' + unitLabel(unitSystem, 'pressure');
    }
}
