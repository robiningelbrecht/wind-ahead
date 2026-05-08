export class GpxParser {
    parse(xml) {
        const doc = new DOMParser().parseFromString(xml, 'application/xml');
        if (doc.querySelector('parsererror')) throw new Error('Invalid GPX file');

        const points = [];
        const trkpts = doc.querySelectorAll('trkpt');
        const rtepts = trkpts.length ? trkpts : doc.querySelectorAll('rtept');
        rtepts.forEach(pt => {
            const lat = parseFloat(pt.getAttribute('lat'));
            const lon = parseFloat(pt.getAttribute('lon'));
            const eleEl = pt.querySelector('ele');
            const ele = eleEl ? parseFloat(eleEl.textContent) : null;
            if (!isNaN(lat) && !isNaN(lon)) points.push({ lat, lon, ele });
        });

        if (points.length < 2) throw new Error('GPX file needs at least 2 points');

        const waypoints = [];
        doc.querySelectorAll('wpt').forEach(wpt => {
            const lat = parseFloat(wpt.getAttribute('lat'));
            const lon = parseFloat(wpt.getAttribute('lon'));
            const nameEl = wpt.querySelector('name');
            const descEl = wpt.querySelector('desc');
            if (!isNaN(lat) && !isNaN(lon)) {
                waypoints.push({
                    lat, lon,
                    name: nameEl ? nameEl.textContent : null,
                    desc: descEl ? descEl.textContent : null
                });
            }
        });
        return { points, waypoints };
    }
}
