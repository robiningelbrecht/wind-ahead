import { GeoUtils } from '../utils/GeoUtils';

export class RouteAnalyzer {
    analyze(points, windData, startIdx, avgSpeedKmh) {
        const segments = [];
        let totalDist = 0, headwindDist = 0, tailwindDist = 0, crosswindDist = 0;
        let weightedHeadwind = 0, weightedCrosswind = 0;
        let elevGain = 0, elevLoss = 0, cumDist = 0;
        const avgSpeedMs = avgSpeedKmh / 3.6;
        const maxIdx = windData.speeds.length - 1;

        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i], p2 = points[i + 1];
            const dist = GeoUtils.haversine(p1.lat, p1.lon, p2.lat, p2.lon);
            if (dist < 0.5) continue;
            const wIdx = Math.min(startIdx + Math.floor((cumDist / avgSpeedMs) / 3600), maxIdx);
            const windSpeed = windData.speeds[wIdx];
            const windDir = windData.dirs[wIdx];
            const brng = GeoUtils.bearing(p1.lat, p1.lon, p2.lat, p2.lon);
            const relAngle = GeoUtils.toRad(windDir - brng);
            const headComp = windSpeed * Math.cos(relAngle);
            const crossComp = windSpeed * Math.sin(relAngle);
            const headFactor = Math.cos(relAngle);
            const absRel = Math.abs(((GeoUtils.toDeg(relAngle) % 360) + 360) % 360);
            const norm = absRel > 180 ? 360 - absRel : absRel;
            const type = norm < 50 ? 'headwind' : norm > 130 ? 'tailwind' : 'crosswind';
            if (type === 'headwind') headwindDist += dist;
            else if (type === 'tailwind') tailwindDist += dist;
            else crosswindDist += dist;
            weightedHeadwind += headComp * dist;
            weightedCrosswind += Math.abs(crossComp) * dist;
            cumDist += dist;
            totalDist += dist;
            if (p1.ele !== null && p2.ele !== null) {
                const diff = p2.ele - p1.ele;
                if (diff > 0) elevGain += diff; else elevLoss += Math.abs(diff);
            }
            segments.push({ p1, p2, dist, brng, headComp, crossComp, headFactor, type });
        }

        const elevations = points.map(p => p.ele).filter(e => e !== null);
        const result = {
            segments, totalDist,
            avgHead: totalDist > 0 ? weightedHeadwind / totalDist : 0,
            avgCross: totalDist > 0 ? weightedCrosswind / totalDist : 0,
            pctHead: totalDist > 0 ? headwindDist / totalDist * 100 : 0,
            pctTail: totalDist > 0 ? tailwindDist / totalDist * 100 : 0,
            pctCross: totalDist > 0 ? crosswindDist / totalDist * 100 : 0,
            elevGain, elevLoss,
            maxEle: elevations.length ? Math.max(...elevations) : null,
            minEle: elevations.length ? Math.min(...elevations) : null,
        };
        return result;
    }

    buildWindRose(segments) {
        const DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const bins = DIRS.map(() => ({ dist: 0, headW: 0 }));
        let totalDist = 0;
        for (const seg of segments) {
            const idx = Math.round(seg.brng / 45) % 8;
            bins[idx].dist += seg.dist;
            bins[idx].headW += seg.headFactor * seg.dist;
            totalDist += seg.dist;
        }
        const maxDist = Math.max(...bins.map(b => b.dist), 1);
        const cx = 50, cy = 50, maxR = 36;
        return DIRS.map((label, i) => {
            const b = bins[i];
            const pctOfMax = b.dist / maxDist;
            const r = maxR * Math.max(pctOfMax, 0.06);
            const angleDeg = i * 45;
            const avgHeadFactor = b.dist > 0 ? b.headW / b.dist : 0;
            const a1 = GeoUtils.toRad(angleDeg - 22.5 - 90);
            const a2 = GeoUtils.toRad(angleDeg + 22.5 - 90);
            const x1 = cx + r * Math.cos(a1);
            const y1 = cy + r * Math.sin(a1);
            const x2 = cx + r * Math.cos(a2);
            const y2 = cy + r * Math.sin(a2);
            return {
                label,
                path: `M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r.toFixed(1)},${r.toFixed(1)} 0 0,1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`,
                color: GeoUtils.segmentColor(avgHeadFactor),
                pct: (pctOfMax * 100).toFixed(0),
                distPct: totalDist > 0 ? (b.dist / totalDist * 100).toFixed(0) : '0',
            };
        });
    }

    buildKmTable(segments) {
        const rows = [];
        let cumDist = 0, bucketDist = 0;
        let bucketHeadW = 0, bucketCrossW = 0;
        let bucketBrngX = 0, bucketBrngY = 0;
        let lastEle = null;
        let nextKm = 1000;
        for (const seg of segments) {
            cumDist += seg.dist;
            bucketDist += seg.dist;
            bucketHeadW += seg.headComp * seg.dist;
            bucketCrossW += Math.abs(seg.crossComp) * seg.dist;
            bucketBrngX += Math.cos(GeoUtils.toRad(seg.brng)) * seg.dist;
            bucketBrngY += Math.sin(GeoUtils.toRad(seg.brng)) * seg.dist;
            lastEle = seg.p2.ele;
            if (cumDist >= nextKm) {
                const avgHead = bucketDist > 0 ? bucketHeadW / bucketDist : 0;
                const avgCross = bucketDist > 0 ? bucketCrossW / bucketDist : 0;
                const avgBrng = (GeoUtils.toDeg(Math.atan2(bucketBrngY, bucketBrngX)) + 360) % 360;
                const type = avgHead > 2 ? 'headwind' : avgHead < -2 ? 'tailwind' : 'crosswind';
                rows.push({ km: rows.length + 1, bearing: avgBrng, headComp: avgHead, crossComp: avgCross, elevation: lastEle, type });
                bucketDist = 0; bucketHeadW = 0; bucketCrossW = 0; bucketBrngX = 0; bucketBrngY = 0;
                nextKm += 1000;
            }
        }
        if (bucketDist > 100) {
            const avgHead = bucketHeadW / bucketDist;
            const avgCross = bucketCrossW / bucketDist;
            const avgBrng = (GeoUtils.toDeg(Math.atan2(bucketBrngY, bucketBrngX)) + 360) % 360;
            const type = avgHead > 2 ? 'headwind' : avgHead < -2 ? 'tailwind' : 'crosswind';
            rows.push({ km: rows.length + 1, bearing: avgBrng, headComp: avgHead, crossComp: avgCross, elevation: lastEle, type });
        }
        return rows;
    }
}
