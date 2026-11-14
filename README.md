# 🌔 SeleneSight — Lunar South Pole Mission & Trajectory Navigator

**2026 NASA International Space Apps Challenge**  
**Challenge:** [The Next Frontier — Lunar Landing Site Navigator](https://www.spaceappschallenge.org/2026/challenges/lunar-landing-site-navigator/)  
**Live Application:** [selenesight.vercel.app](https://selenesight.vercel.app)  
**Slide Presentation (7 Slides):** [View Submission Deck (PDF)](https://github.com/Jeffreyryan2005/SeleneSight/blob/main/SeleneSight_NASA_Space_Apps_Submission.pdf)  
**Team:** **TwinTech** (Jeffrey Ryan R & Imaya Thillai S — Final Year Computer Science & Engineering, SCAD College of Engineering & Technology, Tamil Nadu, India)

---

## The Reality of the Lunar South Pole

When we started researching the Artemis III landing sites, one harsh physical reality dictated everything: **there is no high noon at the lunar South Pole.**

Because the Moon's axial tilt relative to the ecliptic is only **$1.54^\circ$**, the Sun skims perpetually around the horizon at graze angles of just $1.5^\circ$ to $3.0^\circ$. A mountain massif 5 kilometers tall (like Malapert) or a crater rim (like Shackleton) casts shadows that stretch for 10 to 40 kilometers across the landscape. 

If a lander touches down even a few hundred meters on the wrong side of an elevation crest:
1. **Solar Starvation:** Solar arrays go dark, freezing onboard instruments in temperatures below $-200^\circ\text{C}$ ($73\text{ K}$).
2. **Radio Blackout:** High jagged peaks sever direct line-of-sight to NASA's Deep Space Network (DSN) ground dishes in Goldstone, Madrid, and Canberra.
3. **The Concurrency Problem:** Commercial Lunar Payload Services (CLPS) landers and Artemis astronauts need *both* solar power and Earth comms at the same time. If you have sunlight without comms, you cannot transmit telemetry or video. If you have comms in the dark, your lander runs out of battery.

NASA mission planners traditionally run the SPICE toolkit and the legacy Horizons command-line scripts to evaluate these geometries. But running batch scripts for every coordinate trade study takes days.

We built **SeleneSight** during the hackathon weekend to turn those dense ephemeris tables and digital elevation models into an interactive, real-time mission planning cockpit that anyone can test directly in the browser.

---

## What SeleneSight Does

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                         SELENESIGHT ARCHITECTURE                       │
 ├────────────────────────────┬─────────────────────────────┬─────────────┤
 │     NASA & Planetary Data  │     Client-Side Engine      │  UI Cockpit │
 ├────────────────────────────┼─────────────────────────────┼─────────────┤
 │ • NASA JPL Horizons API    │ • 360° Terrain Raymarcher   │ • Horizon   │
 │ • NASA LRO LOLA (SLDEM2015)│ • Spherical Curvature Math  │   Sky Chart │
 │ • NASA Moon Trek WMTS      │ • Lunar Libration Modeling  │ • 14-Day    │
 │ • Kaggle Robbins Crater DB │ • Horn's Slope Gradient     │   Gantt     │
 │   (1.3M+ South Pole data)  │ • Multi-Criteria Ranking    │ • Polar Map │
 └────────────────────────────┴─────────────────────────────┴─────────────┘
```

### 1. 360° Topographic Horizon Profiling
* For any coordinate selected between $80^\circ\text{S}$ and $90^\circ\text{S}$, SeleneSight constructs a complete panoramic horizon silhouette across all 360 azimuthal degrees.
* You can switch between a **$360^\circ$ Panoramic Strip View** and a **Planar Polar Sky Dome**, with cardinal directions, mountain peak callouts, and elevation grids.

### 2. Live Celestial Trajectory Tracking
* Calculates topocentric apparent positions (Azimuth $0^\circ\text{–}360^\circ$ and Elevation $-5^\circ\text{–}+15^\circ$) for both the **Sun** (solar power) and the **Earth** (direct-to-Earth communications).
* Dynamically detects **topographic eclipses**: if the Sun or Earth drops below the local mountain silhouette, the telemetry badge immediately switches from `VISIBLE` to `ECLIPSED` or `RADIO BLOCKED`.

### 3. The "Golden Window" Concurrency Simulator
* Simulates 14 Earth days (336 hours) of lunar daylight in 2-hour increments.
* Features a three-track interactive Gantt chart:
  * **Track 1 (Gold):** Solar Daylight & Surface Irradiance ($W/m^2$).
  * **Track 2 (Blue):** Direct-to-Earth (DTE) Radio Line of Sight.
  * **Track 3 (Emerald Green):** The **Golden Window** — the exact time window where power and comms overlap simultaneously.

### 4. Kaggle Robbins Crater & Slope Hazard Buffer
* Ingests morphological crater data from the Stuart Robbins Lunar Crater Database (1.3M+ craters) filtered for South Pole latitudes ($>80^\circ\text{S}$).
* Computes safe landing circles: enforces $<5^\circ$ slope limits, clears rim crests, and buffers hazardous ejecta boulder distributions ($k_{\text{rock}}$).
* Directly incorporates lessons from the February 2024 **Odysseus (IM-1)** mission, which tipped over after landing on an unexpected 12° slope near Malapert A.

### 5. Multi-Criteria Decision Analysis (MCDA) Site Leaderboard
* Ranks all 13 official NASA Artemis III candidate landing regions (Shackleton, Malapert Massif, Connecting Ridge, de Gerlache, Faustini, Nobile, etc.) using customizable weight sliders for:
  * Annual Solar Illumination Fraction ($w_{\text{sun}}$)
  * Earth Visibility & DSN Uptime ($w_{\text{earth}}$)
  * Slope & Terrain Roughness ($w_{\text{slope}}$)
  * Proximity to Permanently Shadowed Regions (PSRs / Water Ice) ($w_{\text{ice}}$)

### 6. 1-Click Flight Readiness Review (FRR) Brief
* Generates a printable mission summary report formatted to NASA documentation standards, summarizing coordinates, elevation profiles, slope safety, and golden window operating hours.

---

## The Physics & Mathematics Under the Hood

### 1. Spherical Lunar Curvature Correction
Because the Moon's mean radius is small ($R_{\text{moon}} = 1,737.4\text{ km}$, roughly a quarter of Earth's), the surface curves away rapidly. A mountain 50 km away appears significantly lower than simple flat-plane trigonometry would predict.

Our radial raymarcher accounts for this curvature drop on every single azimuthal step:
$$\Delta z_{\text{drop}} = \frac{d^2}{2 \cdot R_{\text{moon}}}$$
$$\tan(\theta_{\text{apparent}}) = \frac{z_{\text{feature}} - z_{\text{observer}} - \Delta z_{\text{drop}}}{d}$$

Where:
* $d$ = horizontal distance along the lunar sphere (km)
* $z_{\text{observer}}$ = altitude of the landing site above lunar datum (m)
* $z_{\text{feature}}$ = elevation of the terrain feature (m)
* $R_{\text{moon}} = 1,737.4\text{ km}$

### 2. Lunar Libration & Earth Motion
From the Moon's South Pole, the Earth does not rise or set; instead, it hovers just above the northern horizon ($0^\circ$ azimuth), describing an apparent Lissajous loop of:
* $\pm 6.7^\circ$ in latitude (due to the Moon's orbital inclination of $5.14^\circ$ and obliquity of $1.54^\circ$)
* $\pm 7.9^\circ$ in longitude (due to the Moon's orbital eccentricity $e \approx 0.0549$)

A mere $2^\circ$ wobble can cause the Earth to dip behind a nearby crater rim. SeleneSight models these libration cycles to predict line-of-sight outages accurately.

### 3. Horn's Surface Slope Formulation
Using LOLA elevation matrices ($\Delta x = \Delta y = 30\text{ m}$), slopes are evaluated across $3\times3$ cell kernels:
$$\text{Slope} = \arctan\left(\sqrt{\left(\frac{\partial z}{\partial x}\right)^2 + \left(\frac{\partial z}{\partial y}\right)^2}\right)$$
Landing zones exceeding $10^\circ$ are hard-flagged as hazardous.

---

## Tech Stack & Engineering Decisions

* **Framework:** Next.js 16 (App Router, Turbopack)
* **UI & Rendering:** React 19, Tailwind CSS v4, Lucide React
* **Graphics:** Native SVG math rendering for the 360° horizon chart and stereographic polar map (zero heavy canvas/WebGL overhead, lightweight and responsive on mobile and desktop)
* **Data Pipelines:**
  * NASA JPL Horizons REST API (`CENTER='coord@301'`)
  * NASA LRO LOLA PDS Geosciences Archive (SLDEM2015 30m)
  * NASA Solar System Treks (Moon Trek WMTS)
  * Kaggle / USGS Robbins Lunar Crater Database (1.3M+ records)

---

## Running Locally

Clone and run the project locally in under two minutes:

```bash
# 1. Clone the repository
git clone https://github.com/Jeffreyryan2005/SeleneSight.git

# 2. Enter the project directory
cd SeleneSight

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To verify a production build:
```bash
npm run build
npm run start
```

---

## Data & Open Science Citations

1. **NASA Jet Propulsion Laboratory (JPL):** Horizons On-Line Ephemeris System API. [ssd.jpl.nasa.gov/horizons/](https://ssd.jpl.nasa.gov/horizons/)
2. **NASA Lunar Reconnaissance Orbiter (LRO) LOLA Science Team:** Lunar Orbiter Laser Altimeter PDS Archive, Washington University in St. Louis. [pds-geosciences.wustl.edu](https://pds-geosciences.wustl.edu/missions/lro/lola.htm)
3. **NASA Solar System Treks Team:** Moon Trek RESTful Web Map Tile Service (WMTS). [trek.nasa.gov/moon/](https://trek.nasa.gov/moon/)
4. **NASA Headquarters:** Artemis III Candidate Landing Regions Directive & Press Release. [nasa.gov/news-release](https://www.nasa.gov/news-release/nasa-provides-update-on-artemis-iii-moon-landing-regions/)
5. **Arizona State University / NASA:** Lunar Reconnaissance Orbiter Camera (LROC) QuickMap. [quickmap.lroc.asu.edu](https://quickmap.lroc.asu.edu/)
6. **Robbins, S. J. (USGS Astrogeology / Kaggle):** *A New Global Database of Lunar Impact Craters $>1\text{ km}$*. [kaggle.com/datasets/sujaykapadnis/moon-crater-database-v1-robbins](https://www.kaggle.com/datasets/sujaykapadnis/moon-crater-database-v1-robbins)
7. **Lagrassa, R. (Kaggle):** *LU3M6TGT Lunar Impact Crater Object Detection Dataset*. [kaggle.com/datasets/riccardolagrassa/lu3m6tgt](https://www.kaggle.com/datasets/riccardolagrassa/lu3m6tgt)

---

## Meet Team TwinTech

We are final-year Computer Science & Engineering undergraduate students from **SCAD College of Engineering and Technology** (Tirunelveli, Tamil Nadu, India):

* **Jeffrey Ryan R** — *Full Stack & Systems Developer*  
  Lead developer for the celestial trajectory math, Next.js architecture, and NASA API integration.  
  GitHub: [@Jeffreyryan2005](https://github.com/Jeffreyryan2005)

* **Imaya Thillai S** — *Geospatial & Data Integration*  
  Lead researcher for LOLA elevation modeling, Robbins crater catalog ingestion, and MCDA weighting.  
  GitHub: [@Imaya-thillai](https://github.com/Imaya-thillai)

*Submitted with pride for the 2026 NASA International Space Apps Challenge — Track: The Next Frontier.*
