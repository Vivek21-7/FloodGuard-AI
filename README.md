# FloodGuard AI — Hyper-Local Flash Flood Early Warning System

**Smart India Hackathon 2026** | **Problem Statement: SIH 26192**  
**Theme:** Flash Flood Prediction System for Hilly Regions using Multi-Source Data  
**Target Organization:** Ministry of Home Affairs / National Disaster Response Force (NDRF)

---

## 🌊 Overview

**FloodGuard AI** is a real-time, multi-source AI-driven flash flood prediction and actionable early warning system tailored specifically for vulnerable mountainous terrains and hilly regions across India (e.g., Himachal Pradesh, Uttarakhand, Western Ghats, Northeast). 

By ingesting multi-temporal rainfall observations, soil moisture dynamics, high-resolution digital elevation data, terrain slope profiles, real-time hydrometric gauges, and localized historical flood frequencies, FloodGuard AI executes an ensemble Random Forest classifier to estimate hyper-local flood probabilities and risk classes (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`) with transparent explainability and estimated lead-time warnings.

---

## 🏛️ System Architecture

```
                                  [ Open-Meteo API / IMD Weather ]
                                  [ Open-Meteo DEM / Terrain GIS  ]
                                  [ India-WRIS Hydrology / CWC    ]
                                  [ IoT Catchment Telemetry       ]
                                                 │
                                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FastAPI Multi-Provider Engine                   │
│  ├─ Geocoding & Village Spatial Indexing (Nominatim / SQLite Spatial)   │
│  ├─ Hydrological & Catchment Feature Pipeline                         │
│  ├─ Random Forest Classification Engine (Scikit-Learn)                │
│  ├─ Interpretability & Contributing Factor Analysis                   │
│  └─ Dynamic Rule-Based Alert & Lead Time Matrix                       │
└────────────────────────────────────────────────────────────────────────┘
                                                 │
                        RESTful Endpoints / JSON Contracts
                                                 │
                                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Vite + React 18 + Tailwind                      │
│  ├─ Dynamic Operations Command Dashboard                              │
│  ├─ Interactive Leaflet GIS Multi-Layer Map (Heatmaps + Catchments)    │
│  ├─ Historical Trend & Hydrometric Analytics Engine                    │
│  ├─ Live IoT Simulation Sandbox (Real-time Dynamic Tuning)            │
│  └─ Disaster Management Decision Matrix & NDRF SOP Directives          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- npm or pnpm

### 1. Backend Setup
```bash
cd floodguard-ai/backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m app.main
```
The FastAPI backend will start at `http://localhost:8000` with interactive Swagger docs at `http://localhost:8000/docs`.

### 2. Frontend Setup
```bash
cd floodguard-ai/frontend
npm install
npm run dev
```
The React frontend will be accessible at `http://localhost:5173`.

---

## 🌟 Key Features

1. **Hyper-Local Geocoding & Selection**: Instant search for Indian Himalayan villages, GPS geolocation, and interactive map coordinate pickers.
2. **Multi-Source Environmental Fusion**: Real-time rainfall (1h, 3h, 6h, 3h forecast), root-zone soil saturation (0-10cm, 10-35cm), elevation profile, slope gradient, and river gauge levels.
3. **Machine Learning Flash Flood Engine**: Trained Random Forest model providing confidence-calibrated flood probabilities and standardized risk bands.
4. **Transparent Explainability**: Clear breakdown of top driving contributors (e.g. soil saturation percentage, flash precipitation intensity, steep slope convergence).
5. **Actionable Alerts & Lead Time**: Automated computation of evacuation windows and NDRF-aligned standard operating procedure directives.
6. **Dual Live & Demo Modes**: Seamless switch between live public APIs and built-in offline simulation mode with interactive sensor sliders.
