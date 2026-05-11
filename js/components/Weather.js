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
        const d = new Date(dateTime);
        const opts = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        this.title.textContent = `Weather - ${d.toLocaleDateString(undefined, opts)}`;
        this.windSpeedEl.textContent = weather.wind_speed_10m;
        this.windLabelEl.textContent = GeoUtils.windLabel(windDir) + ' (' + windDir + '\u00b0)';
        this.speedUnit.textContent = speed;
        this.gusts.textContent = weather.wind_gusts_10m + ' ' + speed;
        this.needle.style.transform = `rotate(${(windDir + 180) % 360}deg)`;
        const icon = WEATHER_ICONS[weather.weather_code] || '';
        this.condition.textContent = icon + ' ' + (WEATHER_CODES[weather.weather_code] || `Code ${weather.weather_code}`);
        this.feelsLike.textContent = weather.apparent_temperature + unitLabel(unitSystem, 'temp');
        this.humidity.textContent = weather.relative_humidity_2m + '%';
        this.precipitation.textContent = convertUnit(weather.precipitation, 'precip', unitSystem).toFixed(2) + ' ' + unitLabel(unitSystem, 'precip');
        this.clouds.textContent = weather.cloud_cover + '%';
        this.pressure.textContent = convertUnit(weather.surface_pressure, 'pressure', unitSystem).toFixed(unitSystem === IMPERIAL ? 2 : 0) + ' ' + unitLabel(unitSystem, 'pressure');
    }
}
