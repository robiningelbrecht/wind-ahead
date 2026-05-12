import { METRIC } from './utils/units';

export const $ = (id) => document.getElementById(id);

export const state = {
    view: 'upload',
    loading: false,
    dateTime: '',
    dateMin: '',
    dateMax: '',
    avgSpeed: parseInt(localStorage.getItem('wind-analyzer-speed')) || 25,
    points: null,
    reversedPoints: null,
    centroid: null,
    routeName: null,
    analysis: null,
    weather: null,
    windDir: 0,
    windSpeed: 0,
    windRose: [],
    segmentTable: [],
    reversed: false,
    unitSystem: localStorage.getItem('wind-analyzer-units') || METRIC,
    _weatherCache: null,
};

export function setView(view) {
    state.view = view;
    const isResults = view === 'results';
    $('uploadView').classList.toggle('hidden', isResults);
    $('resultsView').classList.toggle('hidden', !isResults);
    $('resetBtn').classList.toggle('hidden', !isResults);
    $('tourItem').classList.toggle('hidden', !isResults);
}

export function setLoading(on) {
    state.loading = on;
    $('loadingOverlay').classList.toggle('hidden', !on);
}

export function setError(msg) {
    const box = $('errorBox');
    if (msg) {
        box.textContent = msg;
        box.classList.remove('hidden');
    } else {
        box.classList.add('hidden');
    }
}
