import { WEATHER_PARAMS } from '../constants';
import { IMPERIAL } from '../utils/units';

export class OpenMeteo {
    async fetch(lat, lon, localDate, unitSystem) {
        const isImperial = unitSystem === IMPERIAL;
        const tempUnit = isImperial ? 'fahrenheit' : 'celsius';
        const windUnit = isImperial ? 'mph' : 'kmh';
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=${WEATHER_PARAMS}&start_date=${localDate.dateStr}&end_date=${localDate.nextDayStr}&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}&timezone=auto`;
        const res = await window.fetch(url);
        if (!res.ok) throw new Error('Weather API request failed');
        return await res.json();
    }

    extract(data, localDate) {
        const hourly = data.hourly;
        let idx = hourly.time.findIndex(t => t.startsWith(localDate.hourPrefix));
        if (idx === -1) {
            const target = localDate.getTime();
            let minDiff = Infinity;
            hourly.time.forEach((t, i) => {
                const diff = Math.abs(new Date(t).getTime() - target);
                if (diff < minDiff) { minDiff = diff; idx = i; }
            });
        }
        return {
            temperature2m: hourly.temperature_2m[idx],
            relativeHumidity2m: hourly.relative_humidity_2m[idx],
            apparentTemperature: hourly.apparent_temperature[idx],
            precipitation: hourly.precipitation[idx],
            weatherCode: hourly.weather_code[idx],
            cloudCover: hourly.cloud_cover[idx],
            surfacePressure: hourly.surface_pressure[idx],
            windSpeed10m: hourly.wind_speed_10m[idx],
            windDirection10m: hourly.wind_direction_10m[idx],
            windGusts10m: hourly.wind_gusts_10m[idx],
        };
    }
}
