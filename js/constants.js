export const WEATHER_CODES = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Rime fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Dense drizzle',
    56: 'Freezing drizzle', 57: 'Heavy freezing drizzle',
    61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
    66: 'Freezing rain', 67: 'Heavy freezing rain',
    71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
    80: 'Light showers', 81: 'Showers', 82: 'Heavy showers',
    85: 'Light snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm + hail', 99: 'Thunderstorm + heavy hail'
};

export const WEATHER_ICONS = {
    0: '\u2600\uFE0F',      1: '\u{1F324}\uFE0F',   2: '\u26C5',            3: '\u2601\uFE0F',
    45: '\u{1F32B}\uFE0F',  48: '\u{1F32B}\uFE0F',
    51: '\u{1F326}\uFE0F',  53: '\u{1F326}\uFE0F',  55: '\u{1F326}\uFE0F',
    56: '\u2744\uFE0F',     57: '\u2744\uFE0F',
    61: '\u{1F327}\uFE0F',  63: '\u{1F327}\uFE0F',  65: '\u{1F327}\uFE0F',
    66: '\u{1F327}\uFE0F',  67: '\u{1F327}\uFE0F',
    71: '\u{1F328}\uFE0F',  73: '\u{1F328}\uFE0F',  75: '\u{1F328}\uFE0F',  77: '\u{1F328}\uFE0F',
    80: '\u{1F326}\uFE0F',  81: '\u{1F327}\uFE0F',  82: '\u{1F327}\uFE0F',
    85: '\u{1F328}\uFE0F',  86: '\u{1F328}\uFE0F',
    95: '\u26A1',           96: '\u26A1',           99: '\u26A1',
};

export const WIND_LABELS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];

export const TILE_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
export const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

export const WEATHER_PARAMS = [
    'temperature_2m', 'relative_humidity_2m', 'apparent_temperature',
    'precipitation', 'weather_code', 'cloud_cover', 'surface_pressure',
    'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m'
].join(',');

export const TOUR_KEY = 'wind-analyzer-tour-done';
