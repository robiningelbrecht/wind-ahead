const LABELS = {
    metric:   { dist: 'km', elev: 'm', speed: 'km/h', temp: '\u00b0C', precip: 'mm', pressure: 'hPa' },
    imperial: { dist: 'mi', elev: 'ft', speed: 'mph', temp: '\u00b0F', precip: 'in', pressure: 'inHg' },
};

const CONVERTERS = {
    dist:     v => v / 1.609344,
    elev:     v => v * 3.28084,
    precip:   v => v / 25.4,
    pressure: v => v / 33.8639,
};

export function unitLabel(unitSystem, type) {
    return LABELS[unitSystem][type];
}

export function convertUnit(value, type, unitSystem) {
    if (unitSystem === 'metric' || !CONVERTERS[type]) return value;
    return CONVERTERS[type](value);
}
