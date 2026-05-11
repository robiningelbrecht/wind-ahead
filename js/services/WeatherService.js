import { WEATHER_PARAMS } from '../constants';

export class WeatherService {
    async fetch(lat, lon, date, unitSystem) {
        const dateStr = date.split('T')[0];
        const isImperial = unitSystem === 'imperial';
        const tempUnit = isImperial ? 'fahrenheit' : 'celsius';
        const windUnit = isImperial ? 'mph' : 'kmh';
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=${WEATHER_PARAMS}&start_date=${dateStr}&end_date=${dateStr}&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}&timezone=auto`;
        const res = await window.fetch(url);
        if (!res.ok) throw new Error('Weather API request failed');
        return await res.json();
    }

    extract(data, targetDateTime) {
        const h = data.hourly;
        const targetHour = targetDateTime.slice(0, 13);
        let idx = h.time.findIndex(t => t.startsWith(targetHour));
        if (idx === -1) {
            const target = new Date(targetDateTime).getTime();
            let minDiff = Infinity;
            h.time.forEach((t, i) => {
                const diff = Math.abs(new Date(t).getTime() - target);
                if (diff < minDiff) { minDiff = diff; idx = i; }
            });
        }
        return {
            temperature_2m: h.temperature_2m[idx],
            relative_humidity_2m: h.relative_humidity_2m[idx],
            apparent_temperature: h.apparent_temperature[idx],
            precipitation: h.precipitation[idx],
            weather_code: h.weather_code[idx],
            cloud_cover: h.cloud_cover[idx],
            surface_pressure: h.surface_pressure[idx],
            wind_speed_10m: h.wind_speed_10m[idx],
            wind_direction_10m: h.wind_direction_10m[idx],
            wind_gusts_10m: h.wind_gusts_10m[idx],
        };
    }
}
