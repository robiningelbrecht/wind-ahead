<p align="center">
    <img src="assets/logo.png" width="250" alt="WindAhead logo">
</p>

<h1 align="center">WindAhead</h1>

<h3 align="center">A weather and wind analysis tool for your cycling and running routes.</h3>
<h4 align="center">Runs 100% in your browser. No uploads. No data stored.</h4>

---

![Example](assets/showcase.png)

## Supported GPX sources

Most GPX files exported from **Strava**, **Komoot**, **Garmin**, **Wahoo**, or similar apps work out of the box.
Track points, route points, waypoints, and elevation data are all supported.

## How it works

1. **Upload** a GPX file
2. **Pick** a date/time and average speed
3. WindAhead fetches hourly wind forecasts from the [Open-Meteo API](https://open-meteo.com) and calculates headwind, crosswind, and tailwind for every segment of your route

## Run it locally

Requires [Node.js](https://nodejs.org/) (no other dependencies needed to serve).

```bash
git clone https://github.com/robiningelbrecht/wind-ahead.git
cd wind-ahead
npm start
```

Then open [http://127.0.0.1:3000](http://127.0.0.1:3000). Override the port with `PORT=8080 npm start`.

## Related

[Statistics for Strava](https://statistics-for-strava.robiningelbrecht.be) - A self-hosted dashboard for your Strava data
