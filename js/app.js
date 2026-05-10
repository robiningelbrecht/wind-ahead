import Alpine from 'alpinejs';
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

Alpine.data('windAnalyzer', () => {
    const savedTheme = localStorage.getItem('wind-analyzer-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    return {
        view: 'upload',
        loading: false,
        error: null,
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
        weatherLabel: '',
        dateNote: '',
        windRose: [],
        segmentTable: [],
        segmentTableOpen: false,
        _lastRenderKey: null,
        _weatherCache: null,

        get netColorClass() {
            if (!this.analysis) return '';
            if (this.analysis.avgHead > 0.5) return 'text-red-600';
            if (this.analysis.avgHead < -0.5) return 'text-green-600';
            return 'text-amber-600';
        },
        get netLabel() {
            if (!this.analysis) return '';
            if (this.analysis.avgHead > 0.5) return 'Net Headwind';
            if (this.analysis.avgHead < -0.5) return 'Net Tailwind';
            return 'Net Crosswind';
        },
        get dominantType() {
            if (!this.analysis) return '';
            const { pctHead: h, pctTail: t, pctCross: c } = this.analysis;
            return h >= t && h >= c ? 'Headwind' : t >= c ? 'Tailwind' : 'Crosswind';
        },
        get dominantPct() {
            if (!this.analysis) return 0;
            return Math.max(this.analysis.pctHead, this.analysis.pctTail, this.analysis.pctCross).toFixed(0);
        },
        get dominantColorClass() {
            if (this.dominantType === 'Headwind') return 'text-red-600';
            if (this.dominantType === 'Tailwind') return 'text-green-600';
            return 'text-amber-600';
        },
        get conditionText() {
            if (!this.weather) return '';
            return WEATHER_CODES[this.weather.weather_code] || `Code ${this.weather.weather_code}`;
        },
        get windRoseSvg() {
            if (!this.windRose.length) return '';
            let svg = this.windRose.map(p =>
                `<path d="${p.path}" fill="${p.color}" fill-opacity="0.5" stroke="${p.color}" stroke-width="0.5"/>`
            ).join('');
            const toX = 50 + 22 * Math.sin(GeoUtils.toRad(this.windDir + 180));
            const toY = 50 - 22 * Math.cos(GeoUtils.toRad(this.windDir + 180));
            svg += `<line x1="50" y1="50" x2="${toX.toFixed(1)}" y2="${toY.toFixed(1)}" stroke="#FC4C02" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>`;
            svg += `<circle cx="${toX.toFixed(1)}" cy="${toY.toFixed(1)}" r="2.5" fill="#FC4C02" opacity="0.8"/>`;
            return svg;
        },

        windLabelFn: GeoUtils.windLabel,

        onStripHover(event) {
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
            const tip = document.getElementById('stripTooltip');
            tip.innerHTML = `<span class="font-semibold ${typeClass}">${seg.type.charAt(0).toUpperCase() + seg.type.slice(1)}</span> &middot; ${dist} km<br>Head: ${seg.headComp.toFixed(1)} km/h &middot; Cross: ${Math.abs(seg.crossComp).toFixed(1)} km/h`;
            tip.style.left = (event.clientX - rect.left) + 'px';
            tip.classList.remove('hidden');
            mapRenderer.showHoverMarker(midLat, midLon, seg.headFactor);
        },

        hideStripHover() {
            const tip = document.getElementById('stripTooltip');
            if (tip) tip.classList.add('hidden');
            mapRenderer.removeHoverMarker();
        },

        startTour() {
            if (this.view === 'results') tour.run();
        },

        onAnalysisChange() {
            if (!this.analysis) return;
            const key = JSON.stringify([this.windDir, this.windSpeed, this.analysis.totalDist, this.analysis.pctHead]);
            if (key === this._lastRenderKey) return;
            this._lastRenderKey = key;
            this.$nextTick(() => {
                mapRenderer.render(this.points, this.analysis, this.windDir, this.windSpeed, this.waypoints);
                windStrip.render(this.analysis.segments);
            });
        },

        toggleTheme() {
            const next = mapRenderer.isDark() ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('wind-analyzer-theme', next);
            mapRenderer.updateTiles();
        },

        saveSpeed() {
            localStorage.setItem('wind-analyzer-speed', this.avgSpeed);
        },

        handleDrop(event) {
            const file = event.dataTransfer.files[0];
            if (file && file.name.endsWith('.gpx')) this.processFile(file);
            else this.error = 'Please drop a .gpx file';
        },

        handleFileInput(event) {
            if (event.target.files[0]) this.processFile(event.target.files[0]);
        },

        async processFile(file) {
            this.view = 'results';
            this.loading = true;
            this.error = null;

            try {
                const text = await file.text();
                const parsed = gpxParser.parse(text);
                this.points = parsed.points;
                this.waypoints = parsed.waypoints;
                this.centroid = this.points.reduce(
                    (acc, p) => ({ lat: acc.lat + p.lat / this.points.length, lon: acc.lon + p.lon / this.points.length }),
                    { lat: 0, lon: 0 }
                );
                const now = new Date();
                now.setMinutes(0, 0, 0);
                const maxDate = new Date(now);
                maxDate.setDate(maxDate.getDate() + 7);
                this.dateTime = GeoUtils.toLocalStr(now);
                this.dateMin = GeoUtils.toLocalStr(now);
                this.dateMax = GeoUtils.toLocalStr(maxDate);

                await this.runAnalysis();
                if (!tour.hasCompleted()) {
                    setTimeout(() => tour.run(), 600);
                    tour.markCompleted();
                }
            } catch (err) {
                this.loading = false;
                this.view = 'upload';
                this.error = err.message || 'Something went wrong';
            }
        },

        async runAnalysis() {
            this.loading = true;
            this.error = null;
            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

            try {
                const lat = this.centroid.lat.toFixed(4);
                const lon = this.centroid.lon.toFixed(4);
                const dateStr = this.dateTime.split('T')[0];
                const cacheKey = `${lat},${lon},${dateStr}`;

                let data;
                if (this._weatherCache && this._weatherCache.key === cacheKey) {
                    data = this._weatherCache.data;
                } else {
                    data = await weatherService.fetch(lat, lon, this.dateTime);
                    this._weatherCache = { key: cacheKey, data };
                }
                const w = weatherService.extract(data, this.dateTime);

                const windData = { speeds: data.hourly.wind_speed_10m, dirs: data.hourly.wind_direction_10m };
                const targetHour = this.dateTime.slice(0, 13);
                let startIdx = data.hourly.time.findIndex(t => t.startsWith(targetHour));
                if (startIdx === -1) startIdx = 0;
                this.analysis = routeAnalyzer.analyze(this.points, windData, startIdx, this.avgSpeed);
                this.weather = w;
                this.windDir = w.wind_direction_10m;
                this.windSpeed = w.wind_speed_10m;

                this.windRose = routeAnalyzer.buildWindRose(this.analysis.segments);
                this.segmentTable = routeAnalyzer.buildSegmentTable(this.analysis.segments);

                const d = new Date(this.dateTime);
                const opts = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
                this.weatherLabel = `Weather - ${d.toLocaleDateString(undefined, opts)}`;
                this.dateNote = d.toLocaleDateString(undefined, { weekday: 'short', ...opts });
                this.loading = false;
            } catch (err) {
                this.loading = false;
                this.error = err.message || 'Failed to fetch weather data';
            }
        },

        reset() {
            this.view = 'upload';
            this.error = null;
            this.analysis = null;
            this.weather = null;
            this.points = null;
            this.centroid = null;
            this.waypoints = [];
            this.windRose = [];
            this.segmentTable = [];
            this.segmentTableOpen = false;
            this._lastRenderKey = null;
            this._weatherCache = null;
            document.getElementById('fileInput').value = '';
            mapRenderer.destroy();
        }
    };
});

Alpine.start();
