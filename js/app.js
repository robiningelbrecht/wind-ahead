import { WEATHER_CODES } from './constants';
import { GeoUtils } from './utils/GeoUtils';
import { GpxParser } from './services/GpxParser';
import { WeatherService } from './services/WeatherService';
import { RouteAnalyzer } from './services/RouteAnalyzer';
import { MapRenderer } from './components/MapRenderer';
import { WindStrip } from './components/WindStrip';
import { Tour } from './components/Tour';

const gpxParser = new GpxParser();
const weatherService = new WeatherService();
const routeAnalyzer = new RouteAnalyzer();
const mapRenderer = new MapRenderer();
const windStrip = new WindStrip();
const tour = new Tour();

const $ = (id) => document.getElementById(id);

const state = {
    view: 'upload',
    loading: false,
    dateTime: '',
    dateMin: '',
    dateMax: '',
    avgSpeed: parseInt(localStorage.getItem('wind-analyzer-speed')) || 25,
    points: null,
    centroid: null,
    waypoints: [],
    analysis: null,
    weather: null,
    windDir: 0,
    windSpeed: 0,
    windRose: [],
    segmentTable: [],
    segmentTableOpen: false,
    _weatherCache: null,
};

function setView(view) {
    state.view = view;
    const isResults = view === 'results';
    $('uploadView').classList.toggle('hidden', isResults);
    $('resultsView').classList.toggle('hidden', !isResults);
    $('resetBtn').classList.toggle('hidden', !isResults);
    $('tourBtn').classList.toggle('hidden', !isResults);
}

function setLoading(on) {
    state.loading = on;
    $('loadingOverlay').classList.toggle('hidden', !on);
}

function setError(msg) {
    const box = $('errorBox');
    if (msg) {
        box.textContent = msg;
        box.classList.remove('hidden');
    } else {
        box.classList.add('hidden');
    }
}

function renderResults() {
    const { analysis, weather, windDir, windSpeed, windRose } = state;
    if (!analysis) return;

    $('dateInput').value = state.dateTime;
    $('dateInput').min = state.dateMin;
    $('dateInput').max = state.dateMax;
    $('speedInput').value = state.avgSpeed;

    const d = new Date(state.dateTime);
    const opts = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    $('dateNote').textContent = d.toLocaleDateString(undefined, { weekday: 'short', ...opts });

    // Stats
    $('statsRow').classList.remove('hidden');
    $('statDist').textContent = (analysis.totalDist / 1000).toFixed(1);

    const hasEle = analysis.maxEle !== null;
    $('elevContainer').classList.toggle('hidden', !hasEle);
    if (hasEle) $('statElev').textContent = analysis.elevGain.toFixed(0);

    const netEl = $('statNetValue');
    netEl.className = 'text-2xl font-extrabold tabular-nums tracking-[-0.02em] leading-[1.2]';
    if (analysis.avgHead > 0.5) {
        netEl.classList.add('text-red-600');
        $('statNetLabel').textContent = 'Net Headwind';
    } else if (analysis.avgHead < -0.5) {
        netEl.classList.add('text-green-600');
        $('statNetLabel').textContent = 'Net Tailwind';
    } else {
        netEl.classList.add('text-amber-600');
        $('statNetLabel').textContent = 'Net Crosswind';
    }
    $('statNet').textContent = Math.abs(analysis.avgHead).toFixed(1);

    const hasWeather = !!weather;
    $('tempContainer').classList.toggle('hidden', !hasWeather);
    $('windSpeedContainer').classList.toggle('hidden', !hasWeather);
    if (hasWeather) {
        $('statTemp').textContent = weather.temperature_2m;
        $('statWindSpeed').textContent = weather.wind_speed_10m;
    }

    $('cardsSection').classList.toggle('hidden', !hasWeather);
    if (hasWeather) {
        renderBreakdown(analysis);
        renderWindRose(windRose, windDir);
        renderWeather(weather, windDir);
    }

    renderSegmentTable(state.segmentTable);

    mapRenderer.render(state.points, analysis, windDir, windSpeed, state.waypoints);
    windStrip.render(analysis.segments);
}

function renderBreakdown(analysis) {
    const { pctHead, pctTail, pctCross } = analysis;

    $('pctHeadArc').setAttribute('stroke-dasharray', `${pctHead} ${100 - pctHead}`);
    $('pctTailArc').setAttribute('stroke-dasharray', `${pctTail} ${100 - pctTail}`);
    $('pctTailArc').setAttribute('stroke-dashoffset', 25 - pctHead);
    $('pctCrossArc').setAttribute('stroke-dasharray', `${pctCross} ${100 - pctCross}`);
    $('pctCrossArc').setAttribute('stroke-dashoffset', 25 - pctHead - pctTail);

    const dominant = pctHead >= pctTail && pctHead >= pctCross ? 'Headwind'
        : pctTail >= pctCross ? 'Tailwind' : 'Crosswind';
    const dominantVal = Math.max(pctHead, pctTail, pctCross).toFixed(0);
    const colorClass = dominant === 'Headwind' ? 'text-red-600'
        : dominant === 'Tailwind' ? 'text-green-600' : 'text-amber-600';

    const pctEl = $('dominantPct');
    pctEl.className = `text-[1.4rem] font-extrabold leading-[1.1] ${colorClass}`;
    pctEl.textContent = dominantVal + '%';
    $('dominantType').textContent = dominant;
    $('pctHeadText').textContent = pctHead.toFixed(0) + '%';
    $('pctTailText').textContent = pctTail.toFixed(0) + '%';
    $('pctCrossText').textContent = pctCross.toFixed(0) + '%';
}

function renderWindRose(windRose, windDir) {
    let svg = windRose.map(p =>
        `<path d="${p.path}" fill="${p.color}" fill-opacity="0.5" stroke="${p.color}" stroke-width="0.5"/>`
    ).join('');
    const toX = 50 + 22 * Math.sin(GeoUtils.toRad(windDir + 180));
    const toY = 50 - 22 * Math.cos(GeoUtils.toRad(windDir + 180));
    svg += `<line x1="50" y1="50" x2="${toX.toFixed(1)}" y2="${toY.toFixed(1)}" stroke="#FC4C02" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>`;
    svg += `<circle cx="${toX.toFixed(1)}" cy="${toY.toFixed(1)}" r="2.5" fill="#FC4C02" opacity="0.8"/>`;
    $('windRosePaths').innerHTML = svg;

    $('windRoseLegend').innerHTML = windRose.map(p => `
        <div class="flex items-center gap-1.5">
            <span class="text-[0.72rem] font-semibold text-gray-600 w-5.5">${p.label}</span>
            <div class="flex-1 h-1.25 bg-gray-200 rounded-sm overflow-hidden">
                <div class="h-full rounded-sm transition-[width] duration-400" style="width:${p.pct}%;background:${p.color}"></div>
            </div>
            <span class="text-[0.68rem] text-gray-500 tabular-nums w-7 text-right">${p.distPct}%</span>
        </div>`).join('');
}

function renderWeather(weather, windDir) {
    const d = new Date(state.dateTime);
    const opts = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    $('weatherTitle').textContent = `Weather - ${d.toLocaleDateString(undefined, opts)}`;
    $('weatherWindSpeed').textContent = weather.wind_speed_10m;
    $('weatherWindLabel').textContent = GeoUtils.windLabel(windDir) + ' (' + windDir + '\u00b0)';
    $('weatherGusts').textContent = weather.wind_gusts_10m + ' km/h';
    $('windNeedle').style.transform = `rotate(${(windDir + 180) % 360}deg)`;
    $('conditionText').textContent = WEATHER_CODES[weather.weather_code] || `Code ${weather.weather_code}`;
    $('feelsLike').textContent = weather.apparent_temperature + '\u00b0C';
    $('humidity').textContent = weather.relative_humidity_2m + '%';
    $('precipitation').textContent = weather.precipitation + ' mm';
    $('clouds').textContent = weather.cloud_cover + '%';
    $('pressure').textContent = weather.surface_pressure + ' hPa';
}

function renderSegmentTable(rows) {
    const container = $('segmentDetails');
    if (!rows.length) {
        container.classList.add('hidden');
        return;
    }
    container.classList.remove('hidden');
    $('segmentTableBody').innerHTML = rows.map(row => {
        const colorClass = row.headComp > 0.5 ? 'text-red-600' : row.headComp < -0.5 ? 'text-green-600' : '';
        const dotClass = row.type === 'headwind' ? 'bg-red-600' : row.type === 'tailwind' ? 'bg-green-600' : 'bg-amber-600';
        return `<tr class="even:bg-gray-50">
            <td>${row.index}</td>
            <td>${row.bearing.toFixed(0)}\u00b0 <span class="text-[0.68rem] text-gray-500">${GeoUtils.windLabel(row.bearing)}</span></td>
            <td><span class="${colorClass}">${row.headComp.toFixed(1)}\u00a0km/h</span></td>
            <td>${row.crossComp.toFixed(1)}\u00a0km/h</td>
            <td>${row.elevation !== null ? row.elevation.toFixed(0) + '\u00a0m' : '-'}</td>
            <td><span class="inline-block size-2 rounded-full mr-1.5 align-middle ${dotClass}"></span>${row.type.charAt(0).toUpperCase() + row.type.slice(1)}</td>
        </tr>`;
    }).join('');
}

function onStripHover(event) {
    if (!windStrip.segments.length || !mapRenderer.map) return;
    const strip = event.currentTarget;
    const rect = strip.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const seg = windStrip.getSegmentAtPosition(pct);
    if (!seg) return;
    const midLat = (seg.p1.lat + seg.p2.lat) / 2;
    const midLon = (seg.p1.lon + seg.p2.lon) / 2;
    const dist = (seg.cumDist / 1000).toFixed(1);
    const typeClass = seg.type === 'headwind' ? 'text-red-600' : seg.type === 'tailwind' ? 'text-green-600' : 'text-amber-600';
    const tip = $('stripTooltip');
    tip.innerHTML = `<span class="font-semibold ${typeClass}">${seg.type.charAt(0).toUpperCase() + seg.type.slice(1)}</span> &middot; ${dist} km<br>Head: ${seg.headComp.toFixed(1)} km/h &middot; Cross: ${Math.abs(seg.crossComp).toFixed(1)} km/h`;
    tip.style.left = (event.clientX - rect.left) + 'px';
    tip.classList.remove('hidden');
    mapRenderer.showHoverMarker(midLat, midLon, seg.headFactor);
}

async function processFile(file) {
    setView('results');
    setLoading(true);
    setError(null);

    try {
        const text = await file.text();
        const parsed = gpxParser.parse(text);
        state.points = parsed.points;
        state.waypoints = parsed.waypoints;
        state.centroid = state.points.reduce(
            (acc, p) => ({ lat: acc.lat + p.lat / state.points.length, lon: acc.lon + p.lon / state.points.length }),
            { lat: 0, lon: 0 }
        );
        const now = new Date();
        now.setMinutes(0, 0, 0);
        const maxDate = new Date(now);
        maxDate.setDate(maxDate.getDate() + 7);
        state.dateTime = GeoUtils.toLocalStr(now);
        state.dateMin = GeoUtils.toLocalStr(now);
        state.dateMax = GeoUtils.toLocalStr(maxDate);

        await runAnalysis();
        if (!tour.hasCompleted()) {
            setTimeout(() => tour.run(), 600);
            tour.markCompleted();
        }
    } catch (err) {
        setLoading(false);
        setView('upload');
        setError(err.message || 'Something went wrong');
    }
}

async function runAnalysis() {
    setLoading(true);
    setError(null);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    try {
        const lat = state.centroid.lat.toFixed(4);
        const lon = state.centroid.lon.toFixed(4);
        const dateStr = state.dateTime.split('T')[0];
        const cacheKey = `${lat},${lon},${dateStr}`;

        let data;
        if (state._weatherCache && state._weatherCache.key === cacheKey) {
            data = state._weatherCache.data;
        } else {
            data = await weatherService.fetch(lat, lon, state.dateTime);
            state._weatherCache = { key: cacheKey, data };
        }
        const w = weatherService.extract(data, state.dateTime);

        const windData = { speeds: data.hourly.wind_speed_10m, dirs: data.hourly.wind_direction_10m };
        const targetHour = state.dateTime.slice(0, 13);
        let startIdx = data.hourly.time.findIndex(t => t.startsWith(targetHour));
        if (startIdx === -1) startIdx = 0;

        state.analysis = routeAnalyzer.analyze(state.points, windData, startIdx, state.avgSpeed);
        state.weather = w;
        state.windDir = w.wind_direction_10m;
        state.windSpeed = w.wind_speed_10m;
        state.windRose = routeAnalyzer.buildWindRose(state.analysis.segments);
        state.segmentTable = routeAnalyzer.buildSegmentTable(state.analysis.segments);

        setLoading(false);
        renderResults();
    } catch (err) {
        setLoading(false);
        setError(err.message || 'Failed to fetch weather data');
    }
}

function reset() {
    state.analysis = null;
    state.weather = null;
    state.points = null;
    state.centroid = null;
    state.waypoints = [];
    state.windRose = [];
    state.segmentTable = [];
    state.segmentTableOpen = false;
    state._weatherCache = null;
    $('fileInput').value = '';
    $('statsRow').classList.add('hidden');
    $('cardsSection').classList.add('hidden');
    $('segmentDetails').classList.add('hidden');
    mapRenderer.destroy();
    setView('upload');
    setError(null);
}

function toggleTheme() {
    const next = mapRenderer.isDark() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('wind-analyzer-theme', next);
    mapRenderer.updateTiles();
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('wind-analyzer-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    $('speedInput').value = state.avgSpeed;

    $('resetBtn').addEventListener('click', reset);
    $('tourBtn').addEventListener('click', () => { if (state.view === 'results') tour.run(); });
    $('themeBtn').addEventListener('click', toggleTheme);

    const dropZone = $('uploadView');
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('!border-orange-600', '!bg-orange-500/5');
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('!border-orange-600', '!bg-orange-500/5');
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('!border-orange-600', '!bg-orange-500/5');
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.gpx')) processFile(file);
        else setError('Please drop a .gpx file');
    });

    $('fileInput').addEventListener('change', (e) => {
        if (e.target.files[0]) processFile(e.target.files[0]);
    });

    $('dateInput').addEventListener('change', (e) => {
        state.dateTime = e.target.value;
        runAnalysis();
    });
    $('speedInput').addEventListener('change', (e) => {
        state.avgSpeed = parseInt(e.target.value) || 25;
        localStorage.setItem('wind-analyzer-speed', state.avgSpeed);
        runAnalysis();
    });

    $('segmentToggle').addEventListener('click', () => {
        state.segmentTableOpen = !state.segmentTableOpen;
        $('segmentTableWrap').classList.toggle('hidden', !state.segmentTableOpen);
        $('segmentChevron').classList.toggle('rotate-180', state.segmentTableOpen);
    });

    $('windStrip').addEventListener('mousemove', onStripHover);
    $('stripContainer').addEventListener('mouseleave', () => {
        $('stripTooltip').classList.add('hidden');
        mapRenderer.removeHoverMarker();
    });
});
