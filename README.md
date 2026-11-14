# 🛰️ SeleneSight — Lunar Landing Site Navigator
### NASA International Space Apps Challenge 2026 | Global Award Candidate
**Challenge Category:** *The Next Frontier — Lunar Landing Site Navigator*  
**Official Repository:** [Jeffreyryan2005/Lunar-Landing-Site-Navigator](https://github.com/Jeffreyryan2005/Lunar-Landing-Site-Navigator)

---

## 🚀 Executive Summary & Mission Stakes

As NASA prepares to return humans to the Moon under **Artemis III & IV** and deploys commercial landers via the **Commercial Lunar Payload Services (CLPS)** initiative, the lunar South Pole presents an unprecedented operational challenge:

* **Extreme Grazing Illumination:** At polar latitudes ($85^\circ\text{S} - 90^\circ\text{S}$), the Sun skims the lunar horizon at graze angles of only **$1.5^\circ$ to $3.0^\circ$**. Mountain ridges and crater rims cast long dynamic shadows stretching tens of kilometers.
* **Direct-to-Earth (DTE) Horizon Obstruction:** Due to the Moon's orbital inclination and lunar libration ($\pm 6.7^\circ$ in latitude, $\pm 7.9^\circ$ in longitude), line-of-sight communication to the NASA Deep Space Network (DSN) is frequently blocked by surrounding crater topography.
* **The Decision Bottleneck:** Existing tools for computing celestial ephemerides (such as legacy SPICE command-line routines or NASA's desktop Horizon Program) feature steep learning curves and fragmented workflows, preventing rapid cross-analysis.

**SeleneSight** is an open-source, interactive **Lunar South Pole Mission Planning & Horizon Analytics Engine**. It combines NASA topographical altimetry, real-time JPL celestial ephemerides, and Kaggle planetary machine learning databases into an intuitive, mission-grade web cockpit.

---

## 🌟 Core System Capabilities

### 1. 360° Panoramic Horizon Silhouette & Celestial Masking
* Calculates the exact azimuthal obstruction profile $\theta_{\text{horizon}}(\alpha)$ from $0^\circ$ to $360^\circ$ around any South Pole landing site using **LRO LOLA Digital Elevation Models (30m/px)** with lunar curvature corrections:
  $$\tan(\theta) \approx \frac{z_{\text{feature}} - z_{\text{observer}}}{d} - \frac{d}{2 R_{\text{moon}}}$$
* Visualizes real-time **Sun** and **Earth** topocentric vector paths across the local sky dome, instantly flagging solar eclipses and radio blackouts.

### 2. Synchronized Power & Communications Concurrency (Gantt Engine)
* Maps concurrent availability of **Solar Power** and **Direct-to-Earth (DTE) Comms** over 14-day lunar daylight cycles.
* Automatically identifies and highlights **"Golden Windows"**—vital operational windows where astronauts and solar-powered landers have both uninterrupted solar charging and active communication links.

### 3. Multi-Criteria Decision Analysis (MCDA) Ranking
* Evaluates landing feasibility using weighted multi-attribute decision scoring across five mission dimensions:
  1. Solar illumination duration ($W_{\text{solar}}$)
  2. DTE comms link reliability ($W_{\text{comms}}$)
  3. Touchdown slope safety ($W_{\text{slope}}$)
  4. Permanently Shadowed Region (PSR) ice proximity ($W_{\text{ice}}$)
  5. Crater rim hazard clearance ($W_{\text{hazard}}$)
* Pre-configured with official NASA landing profiles (*Artemis III Crewed*, *Solar-Only CLPS*, *VIPER-Class Ice Prospector*).

### 4. Multisource Data Fusion (NASA APIs + Kaggle Planetary DBs)
* **NASA JPL Horizons API:** Direct REST client querying apparent topocentric azimuth and elevation for the Sun and Earth (`CENTER='coord@301'`).
* **NASA Moon Trek WMTS API:** Direct integration of NASA Solar System Treks South Pole map tiles.
* **Kaggle Robbins Lunar Crater Database (1.3M+ craters):** Computes crater proximity, morphology classification, and continuous ejecta blanket buffer hazards.
* **Kaggle LU3M6TGT Object Detection Dataset:** Simulated AI Terrain Relative Navigation (TRN) for autonomous hazard avoidance (AHA).

### 5. Automated Flight Readiness Review (FRR) PDF Brief
* One-click generation of a standardized NASA Flight Operations Directorate mission brief with coordinates, slope margins, solar availability tables, and flight disposition certification.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          DATA INGESTION LAYER                          │
│                                                                        │
│   [ NASA JPL Horizons API ] ──► Apparent Azimuth & Elevation Vectors   │
│   [ NASA Moon Trek WMTS ]   ──► High-Resolution South Pole Map Tiles   │
│   [ NASA LRO LOLA PDS DEM ] ──► Radial Topographic Height Profiling    │
│   [ Kaggle Robbins DB ]     ──► 1.3M Impact Crater Morphology & Buffer │
│   [ Kaggle LU3M6TGT ]       ──► Micro-Crater & Boulder Object Classes  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   SELENESIGHT CORE ANALYTICS ENGINE                    │
│                                                                        │
│  - Radial Raymarching Horizon Profiler (360° Azimuthal Elevation Mask) │
│  - Lunar Ephemeris & Libration Calculator (Topocentric Observer Frame) │
│  - Multi-Criteria Decision Analysis (MCDA Flight Readiness Index)      │
│  - Automated Hazard Avoidance (AHA) Slope & Ejecta Classifier          │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       MISSION CONTROL DASHBOARD                        │
│                                                                        │
│  • 360° Panoramic & Polar Dome Sky Chart                               │
│  • 14-Day Timeline Scrubbable Gantt Simulator                          │
│  • South Pole Polar Stereographic GIS Map (80°S-90°S)                  │
│  • Artemis III Candidate Site Leaderboard                              │
│  • Live NASA API Inspector (Raw Payload & cURL Generator)              │
│  • Printable NASA Flight Readiness Review (FRR) Brief                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Scientific & Mathematical Foundation

### 1. Horn's Surface Slope Equation
For touchdown stability, local terrain slope is derived from the LOLA digital elevation matrix using a 3x3 convolution window:
$$\text{Slope} = \arctan\left(\sqrt{\left(\frac{\partial z}{\partial x}\right)^2 + \left(\frac{\partial z}{\partial y}\right)^2}\right)$$
* $\text{Slope} < 5.0^\circ$: Nominal / Safe Touchdown
* $5.0^\circ \le \text{Slope} \le 8.0^\circ$: Acceptable Margin
* $\text{Slope} > 12.0^\circ$: Critical Tip-over Hazard (matches Odysseus IM-1 incident at Malapert A)

### 2. Topocentric Solar Elevation at Polar Latitudes
$$\theta_{\text{sun}}(t) = \delta_{\text{sun}}(t) \cos(\text{colatitude}) - \text{colatitude} \cos(\alpha_{\text{sun}}(t))$$
Where $\delta_{\text{sun}}$ is sub-solar latitude oscillating with the tropical year and $\text{colatitude} = 90^\circ + \text{Latitude}$.

---

## 🛠️ Quick Start & Installation

```bash
# Clone the repository
git clone https://github.com/Jeffreyryan2005/Lunar-Landing-Site-Navigator.git
cd Lunar-Landing-Site-Navigator

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Open Science & Attribution

* **NASA Lunar Reconnaissance Orbiter (LRO):** LOLA and LROC Science Teams via NASA Planetary Data System (PDS).
* **NASA Jet Propulsion Laboratory (JPL):** Solar System Dynamics (SSD) Group for Horizons System Ephemeris API.
* **NASA Solar System Exploration Research Virtual Institute (SSERVI):** Solar System Treks (Moon Trek) Project.
* **Kaggle Open Data Platform:** Stuart Robbins Moon Crater Database and LU3M6TGT Crater Detection Dataset.

---

*Developed for the NASA International Space Apps Challenge 2026.*
