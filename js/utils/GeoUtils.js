import { WIND_LABELS } from '../constants';

export class GeoUtils {
    static toRad(d) { return d * Math.PI / 180; }
    static toDeg(r) { return r * 180 / Math.PI; }

    static windLabel(deg) {
        return WIND_LABELS[Math.round(((deg % 360) + 360) % 360 / 22.5) % 16];
    }

    static bearing(lat1, lon1, lat2, lon2) {
        const dLon = GeoUtils.toRad(lon2 - lon1);
        const y = Math.sin(dLon) * Math.cos(GeoUtils.toRad(lat2));
        const x = Math.cos(GeoUtils.toRad(lat1)) * Math.sin(GeoUtils.toRad(lat2))
                - Math.sin(GeoUtils.toRad(lat1)) * Math.cos(GeoUtils.toRad(lat2)) * Math.cos(dLon);
        return (GeoUtils.toDeg(Math.atan2(y, x)) + 360) % 360;
    }

    static haversine(lat1, lon1, lat2, lon2) {
        const R = 6371000;
        const dLat = GeoUtils.toRad(lat2 - lat1), dLon = GeoUtils.toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(GeoUtils.toRad(lat1)) * Math.cos(GeoUtils.toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    static segmentColor(headFactor) {
        const norm = (headFactor + 1) / 2;
        if (norm <= 0.5) {
            const t = norm / 0.5;
            return `rgb(${Math.round(76 + 175 * t)},${Math.round(217 - 26 * t)},${Math.round(100 - 64 * t)})`;
        }
        const t = (norm - 0.5) / 0.5;
        return `rgb(${Math.round(251 - 12 * t)},${Math.round(191 - 123 * t)},${Math.round(36 + 32 * t)})`;
    }

    static toLocalStr(d) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
}
