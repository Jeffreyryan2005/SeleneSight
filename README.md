# 🌔 SeleneSight — Lunar Landing Site Navigator
**NASA International Space Apps Challenge 2026**  
**Challenge:** [Lunar Landing Site Navigator](https://www.spaceappschallenge.org/2026/challenges/lunar-landing-site-navigator/)  
**Live Repo:** [Jeffreyryan2005/SeleneSight](https://github.com/Jeffreyryan2005/SeleneSight)

---

## Why We Built This

When we dug into the Artemis III candidate landing regions, one reality struck us: **the lighting conditions at the Moon's South Pole are unforgiving.** 

Because the Moon has almost no axial tilt ($1.54^\circ$), the Sun never climbs high into the sky. It circles around the horizon at just 1.5° to 3° above the ground. If your lander touches down even a few hundred meters on the wrong side of a crater ridge, you could be plunged into freezing darkness for two weeks—draining your batteries and cutting off your direct radio link to Earth.

NASA has incredible tools like the SPICE toolkit and the legacy Horizon Program to calculate these positions. But most of them are command-line scripts or heavy desktop programs that make it tedious to quickly test "what-if" scenarios across different launch dates.

We built **SeleneSight** over the hackathon weekend to solve that exact headache: an interactive, browser-based mission planning tool that reconstructs the 360° terrain horizon for any spot on the lunar South Pole and tells you immediately when you'll have solar power and Earth communications.

---

## What It Actually Does

1. **360° Local Horizon Profiling:**  
   Pick any coordinate near the South Pole, and the app calculates the local terrain silhouette (how tall the surrounding crater rims and mountains appear) using NASA LOLA 30m altimetry data with spherical curvature corrections.
2. **Real-time Sun & Earth Celestial Tracking:**  
   We calculate the apparent topocentric azimuth and elevation of the Sun and Earth. As you scrub across mission dates, you can watch the Sun and Earth trace paths across the local sky dome and see exactly when mountain peaks block them.
3. **Power & Comms "Golden Windows":**  
   The timeline charts both solar irradiance ($W/m^2$) and Direct-to-Earth (DTE) radio links over a 14-day lunar daylight cycle. It highlights the "Golden Windows"—the critical periods where astronauts or solar-powered CLPS landers have both full sun and live communications.
4. **Multi-Criteria Site Scorer:**  
   Compare candidate sites (like Shackleton Rim, Connecting Ridge, and Malapert Mountain) based on slope steepness, sunlight hours, and distance to water-ice cold traps.
5. **Kaggle Crater & Boulder Hazard Scanner:**  
   We cross-referenced the Robbins Lunar Crater Database (1.3M+ craters) to warn if a landing point is inside a crater floor or within rough ejecta boulder zones.
6. **1-Click Mission Brief:**  
   Generates a clean, printable NASA Flight Readiness Review summary ready for mission planning folders.

---

## How It Works Under the Hood

```
[ NASA LOLA 30m Elevation ] ──┐
[ NASA JPL Horizons API ]   ──┼──► [ SeleneSight Math Engine ] ──► [ Interactive Cockpit ]
[ Kaggle Robbins Crater DB ]──┘      - 360° Radial Horizon Raymarch     - Sky Chart (Panoramic & Dome)
                                     - Lunar Topocentric Ephemerides    - 14-Day Power/Comms Gantt
                                     - MCDA Site Scoring                - South Pole Polar Map
```

* **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS, Lucide icons.
* **Physics & Math:** Client-side topocentric coordinate transforms, Horn's slope convolution, and radial horizon raymarching.
* **APIs & Data:** NASA JPL Horizons REST API, NASA Moon Trek WMTS, NASA Planetary Data System (LOLA), and Kaggle Robbins Crater Dataset.

---

## The Real Challenges We Faced

* **The Curvature Problem:** The Moon's radius is only 1,737 km (about a quarter of Earth's), meaning the surface drops off much faster over distance. In our early tests, distant mountain rims like Malapert appeared too high until we applied the proper curvature correction drop: $\Delta h = d^2 / (2 R_{moon})$.
* **Libration Wobble:** The Earth doesn't stay fixed in the lunar sky—it wobbles in an apparent ellipse due to lunar libration in latitude ($\pm 6.7^\circ$) and longitude ($\pm 7.9^\circ$). Modeling this properly was crucial because a 2-degree shift is the difference between a clean DSN signal and hitting a crater wall.
* **Keeping It Fast in the Browser:** Raymarching 360 degrees of terrain on every frame can easily freeze a web browser. We optimized the calculations so everything runs at 60 FPS client-side without needing a massive backend server.

---

## Getting Started Locally

```bash
git clone https://github.com/Jeffreyryan2005/SeleneSight.git
cd SeleneSight
npm install
npm run dev
```
Open `http://localhost:3000` to run the mission navigator.

---

## Data & Open Science Citations

* **NASA JPL Horizons API:** For topocentric Sun & Earth ephemerides (`CENTER='coord@301'`).
* **NASA LRO LOLA Team (PDS Geosciences):** Digital Elevation Models of the South Pole (SLDEM2015).
* **NASA Solar System Treks:** Moon Trek South Pole WMTS tile infrastructure.
* **Kaggle Open Data:** Stuart Robbins Lunar Crater Database & LU3M6TGT Crater Detection Dataset.

*Built by our team for the 2026 NASA International Space Apps Challenge.*
