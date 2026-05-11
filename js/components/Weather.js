import { $ } from '../state';
import { WEATHER_CODES } from '../constants';
import { GeoUtils } from '../utils/GeoUtils';

export class Weather {
    constructor() {
        this.title = $('weatherTitle');
        this.windSpeed = $('weatherWindSpeed');
        this.windLabel = $('weatherWindLabel');
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
        const { weather, windDir, dateTime } = state;
        const d = new Date(dateTime);
        const opts = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        this.title.textContent = `Weather - ${d.toLocaleDateString(undefined, opts)}`;
        this.windSpeed.textContent = weather.wind_speed_10m;
        this.windLabel.textContent = GeoUtils.windLabel(windDir) + ' (' + windDir + '\u00b0)';
        this.gusts.textContent = weather.wind_gusts_10m + ' km/h';
        this.needle.style.transform = `rotate(${(windDir + 180) % 360}deg)`;
        this.condition.textContent = WEATHER_CODES[weather.weather_code] || `Code ${weather.weather_code}`;
        this.feelsLike.textContent = weather.apparent_temperature + '\u00b0C';
        this.humidity.textContent = weather.relative_humidity_2m + '%';
        this.precipitation.textContent = weather.precipitation + ' mm';
        this.clouds.textContent = weather.cloud_cover + '%';
        this.pressure.textContent = weather.surface_pressure + ' hPa';
    }
}
