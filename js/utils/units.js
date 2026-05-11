export const METRIC = 'metric';
export const IMPERIAL = 'imperial';

export const UNIT_LABELS = {
    [METRIC]:   { dist: 'km', elev: 'm', speed: 'km/h', temp: '\u00b0C', precip: 'mm', pressure: 'hPa' },
    [IMPERIAL]: { dist: 'mi', elev: 'ft', speed: 'mph', temp: '\u00b0F', precip: 'in', pressure: 'inHg' },
};

export const UNIT_CONVERTERS = {
    dist:     v => v / 1.609344,
    elev:     v => v * 3.28084,
    precip:   v => v / 25.4,
    pressure: v => v / 33.8639,
};

export function unitLabel(unitSystem, type) {
    return UNIT_LABELS[unitSystem][type];
}

export function convertUnit(value, type, unitSystem) {
    if (unitSystem === METRIC || !UNIT_CONVERTERS[type]) return value;
    return UNIT_CONVERTERS[type](value);
}
