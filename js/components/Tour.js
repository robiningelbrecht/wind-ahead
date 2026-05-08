import { TOUR_KEY } from '../constants';

export class Tour {
    run() {
        const d = window.driver.js.driver;
        const tour = d({
            showProgress: true,
            popoverClass: 'driver-popover',
            steps: [
                { element: '#tour-datebar', popover: { title: 'Date & Speed', description: 'Pick when you plan to ride and set your average speed. The analysis updates automatically.', side: 'bottom' } },
                { element: '#tour-besttime', popover: { title: 'Best Departure Time', description: 'We scan all 24 hours and show the top 3 start times with the least headwind. Click one to jump to that hour.', side: 'bottom' } },
                { element: '#tour-map', popover: { title: 'Route Map', description: 'Your route colored by wind effect: green = tailwind, red = headwind. Toggle the wind overlay arrows in the top-right.', side: 'bottom' } },
                { element: '#tour-strip', popover: { title: 'Wind Strip', description: 'A minimap of wind along your route. Hover to see details and a marker on the map.', side: 'top' } },
                { element: '#tour-breakdown', popover: { title: 'Wind Breakdown', description: 'How much of your route faces headwind, tailwind, or crosswind \u2014 shown as percentages and averages.', side: 'top' } },
                { element: '#tour-rose', popover: { title: 'Wind Rose', description: 'Shows which directions your route travels. Petal size = distance, color = wind effect. The orange arrow shows wind direction.', side: 'top' } },
                { element: '#tour-weather', popover: { title: 'Weather Conditions', description: 'Forecast details for the selected hour: temperature, humidity, precipitation, wind speed & gusts with compass.', side: 'top' } },
                { element: '#tour-segments', popover: { title: 'Segment Details', description: 'Click to expand a per-kilometer table with bearing, headwind, crosswind, and elevation for each km.', side: 'top' } },
            ]
        });
        tour.drive();
    }

    hasCompleted() {
        return !!localStorage.getItem(TOUR_KEY);
    }

    markCompleted() {
        localStorage.setItem(TOUR_KEY, '1');
    }
}
