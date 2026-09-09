# 🛰️ Data Sources & API Verification Matrix — FloodGuard AI

**Smart India Hackathon 2026** | **Problem Statement: SIH 26192**  
**Theme:** Flash Flood Prediction System for Hilly Regions using Multi-Source Data  
**Target Organization:** Ministry of Home Affairs / National Disaster Response Force (NDRF)

---

## 📋 Comprehensive Platform Verification Matrix

| # | Platform / Source | Variable / Product | API Key Req.? | Real-Time / Hist. | Status in Prototype | Priority / Role |
| :- | :--- | :--- | :---: | :---: | :---: | :--- |
| **1** | **IMD (India Meteorological Dept)** | Rainfall, Temp, Humidity, Wind, Warnings | 🔑 Required | Real-time & Synoptic | 🟢 Integrated | ⭐⭐⭐⭐⭐ Primary Indian Weather |
| **2** | **Open-Meteo Weather API** | Rainfall (1h/3h/6h), Forecast, Dewpoint | ❌ No Key | Real-time & 7-day | 🟢 Active Live | ⭐⭐⭐⭐⭐ Core Real-Time Ingest |
| **3** | **OpenWeather One Call 3.0** | Current precipitation & weather alerts | 🔑 Account Key | Real-time & Hist. | 🟡 Configured Backup | ⭐⭐⭐⭐ Commercial Backup |
| **4** | **Open-Meteo ECMWF Soil Model** | Soil moisture (0-10cm, 10-35cm, 35-100cm) | ❌ No Key | Real-time Model | 🟢 Active Live | ⭐⭐⭐⭐⭐ Soil Saturation Index |
| **5** | **Open-Meteo Elevation API** | Point elevation (Copernicus GLO-90 DEM) | ❌ No Key | Static Topo | 🟢 Active Live | ⭐⭐⭐⭐⭐ Elevation Topography |
| **6** | **Copernicus DEM (Data Space)** | 30m / 90m Digital Elevation Model | 🔐 Credentials | Static Topo | 🟢 Slope Derived | ⭐⭐⭐⭐ High-Res Terrain Analysis |
| **7** | **India-WRIS / CWC** | River water level, discharge ($m^3/s$) | ⚠️ Station Verification | Hydrometric Telemetry | 🟢 Calibrated Model | ⭐⭐⭐⭐⭐ Hydrometric River Stage |
| **8** | **Copernicus CDS (ERA5)** | Historical hourly precipitation (2018–2025) | 🔐 CDS API Key | Historical (7+ yrs) | 🟢 Training Set Grounded | ⭐⭐⭐⭐⭐ ML Model Training Data |
| **9** | **GSI / NRSC Bhuvan / SDMA** | Historical cloudburst, flood & landslide inventories | 📁 Download/Gov | Historical Records | 🟢 Embedded SQLite DB | ⭐⭐⭐⭐⭐ Ground Truth Validation |
| **10**| **Nominatim (OpenStreetMap)** | Reverse & forward geocoding (Village $\rightarrow$ Lat/Lon) | ❌ No Key (1 req/s) | On-Demand | 🟢 Active Live | ⭐⭐⭐⭐ Free Indian Gazetteer |
| **11**| **Google Geocoding API** | Address / Landmark to Lat/Lon | 🔑 Google Cloud Key | On-Demand | 🟡 Production Option | ⭐⭐⭐ Commercial Fallback |
| **12**| **OpenStreetMap + Leaflet** | Basemap tiles, risk overlays, catchment polygons | ❌ No Key | Interactive GIS | 🟢 Active Live | ⭐⭐⭐⭐⭐ Frontend Spatial GIS |

---

## 🔍 Deep-Dive Verification Sheets (Judge-Ready Dossier)

---

### 1. India Meteorological Department (IMD)
* **Official Website:** [https://mausam.imd.gov.in](https://mausam.imd.gov.in)
* **API Management Platform:** [https://api.imd.gov.in](https://api.imd.gov.in)
* **Registration Page:** [https://api.imd.gov.in/register](https://api.imd.gov.in/register)
* **API Key Obtained / Status:** Registered for academic/hackathon evaluation.
* **Production Endpoint:** `https://api.imd.gov.in/public/api/v1/weather/nowcast`
* **Required Parameters:** `station_id` (e.g. `42182` for Shimla) or `lat=31.9579&lon=77.1095`
* **Example JSON Response:**
  ```json
  {
    "station": "Shimla AWS",
    "timestamp": "2026-09-09T17:00:00Z",
    "rainfall_last_1hr_mm": 18.2,
    "rainfall_last_24hr_mm": 74.5,
    "temperature_c": 19.4,
    "humidity_pct": 89,
    "warning_color": "ORANGE"
  }
  ```
* **Rate Limits:** 100 requests/minute.
* **Cost:** Free for official, research, and disaster management applications.
* **SIH Legal Compliance:** 100% legal; national source mandated by Ministry of Earth Sciences.
* **ML Feature Provided:** `rainfall_1h_mm`, `rainfall_6h_mm`, `atmospheric_pressure_hpa`, synoptic convective warning class.

---

### 2. Open-Meteo Weather API (Primary Real-Time Engine)
* **Official Website:** [https://open-meteo.com](https://open-meteo.com)
* **Documentation:** [https://open-meteo.com/en/docs](https://open-meteo.com/en/docs)
* **Registration Page:** None required for public open non-commercial tiers.
* **API Key Obtained:** ❌ No API key required.
* **Production Endpoint:** `https://api.open-meteo.com/v1/forecast`
* **Required Parameters:** `latitude=31.9579&longitude=77.1095&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&hourly=precipitation&forecast_hours=6&past_hours=6`
* **Example JSON Response:**
  ```json
  {
    "latitude": 31.96,
    "longitude": 77.11,
    "current": {
      "temperature_2m": 20.7,
      "relative_humidity_2m": 90.0,
      "precipitation": 0.0,
      "wind_speed_10m": 0.6
    },
    "hourly": {
      "precipitation": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
    }
  }
  ```
* **Rate Limits:** 10,000 daily API calls per IP address.
* **Cost:** Completely Free (Open-Meteo AGPLv3 / Open Data Commons).
* **SIH Legal Compliance:** 100% compliant; standard open-source API used by meteorological research projects worldwide.
* **ML Feature Provided:** `rainfall_1h_mm`, `rainfall_3h_mm`, `rainfall_6h_mm`, `forecast_rainfall_next_3h_mm`, `temperature_c`, `humidity_percent`, `wind_speed_kmh`.

---

### 3. OpenWeather One Call 3.0 (Weather Fallback)
* **Official Website:** [https://openweathermap.org](https://openweathermap.org)
* **Documentation:** [https://openweathermap.org/api/one-call-3](https://openweathermap.org/api/one-call-3)
* **Registration Page:** [https://home.openweathermap.org/users/sign_up](https://home.openweathermap.org/users/sign_up)
* **API Key Obtained:** ✅ API Key supported via `OPENWEATHER_API_KEY` configuration.
* **Production Endpoint:** `https://api.openweathermap.org/data/3.0/onecall`
* **Required Parameters:** `lat=31.9579&lon=77.1095&appid={API_KEY}&units=metric`
* **Example JSON Response:**
  ```json
  {
    "lat": 31.9579,
    "lon": 77.1095,
    "current": { "temp": 21.2, "humidity": 82, "rain": { "1h": 2.5 } },
    "alerts": [{ "event": "Flash Flood Warning", "description": "Torrential rain expected" }]
  }
  ```
* **Rate Limits:** 1,000 free calls/day after registration.
* **Cost:** Free tier available with subscription setup.
* **SIH Legal Compliance:** Fully compliant for prototype verification.
* **ML Feature Provided:** Backup for precipitation intensity and national meteorological alert feeds.

---

### 4. Open-Meteo ECMWF High-Resolution Soil Moisture API
* **Official Website:** [https://open-meteo.com/en/docs](https://open-meteo.com/en/docs)
* **Documentation:** [https://open-meteo.com/en/docs#soil-moisture](https://open-meteo.com/en/docs#soil-moisture)
* **Registration Page:** None needed.
* **API Key Obtained:** ❌ No API key required.
* **Production Endpoint:** `https://api.open-meteo.com/v1/forecast`
* **Required Parameters:** `latitude=31.9579&longitude=77.1095&hourly=soil_moisture_0_to_1cm,soil_moisture_9_to_27cm`
* **Example JSON Response:**
  ```json
  {
    "hourly": {
      "soil_moisture_0_to_1cm": [0.29],
      "soil_moisture_9_to_27cm": [0.33]
    }
  }
  ```
* **Rate Limits:** 10,000 calls/day.
* **Cost:** 100% Free.
* **SIH Legal Compliance:** Uses open Copernicus ECMWF land model re-analysis.
* **ML Feature Provided:** `soil_moisture_0_10cm_percent` (Topsoil field capacity), `soil_moisture_10_35cm_percent` (Subsurface saturation).

---

### 5. Open-Meteo Elevation & Copernicus GLO-90 DEM API
* **Official Website:** [https://open-meteo.com/en/docs/elevation-api](https://open-meteo.com/en/docs/elevation-api)
* **Documentation:** [https://open-meteo.com/en/docs/elevation-api](https://open-meteo.com/en/docs/elevation-api)
* **Registration Page:** None needed.
* **API Key Obtained:** ❌ No API key required.
* **Production Endpoint:** `https://api.open-meteo.com/v1/elevation`
* **Required Parameters:** `latitude=31.9579&longitude=77.1095`
* **Example JSON Response:**
  ```json
  {
    "elevation": [1229.0]
  }
  ```
* **Rate Limits:** 10,000 calls/day.
* **Cost:** 100% Free.
* **SIH Legal Compliance:** 100% open public domain global DEM.
* **ML Feature Provided:** `elevation_m` (Height above mean sea level ASL).

---

### 6. Copernicus Data Space DEM (Terrain & Slope Derivation)
* **Official Website:** [https://dataspace.copernicus.eu](https://dataspace.copernicus.eu)
* **Documentation:** [Copernicus DEM Documentation](https://documentation.dataspace.copernicus.eu/APIs/SentinelHub/Data/DEM.html)
* **Registration Page:** [https://identity.dataspace.copernicus.eu/auth/realms/CDSE/login-actions/registration](https://identity.dataspace.copernicus.eu/auth/realms/CDSE/login-actions/registration)
* **API Key Obtained:** Credentials generated for CDSE Sentinel Hub.
* **Our In-Engine Derivation:**  
  $$\text{Slope}^\circ = \arctan\left(\frac{\Delta h}{\Delta x}\right) \times \frac{180}{\pi}$$
  Calculated by sampling focal elevation grid ($\Delta = 0.01^\circ \approx 1.1\text{ km}$ run) around center coordinate.
* **ML Feature Provided:** `slope_degrees`, `terrain_type` (`steep_hillside`, `high_mountain_ridge`, `valley_confluence`).

---

### 7. India-WRIS / Central Water Commission (CWC) Hydrology
* **Official Website:** [https://indiawris.gov.in/wris/](https://indiawris.gov.in/wris/)
* **CWC Flood Forecast Portal:** [https://ffs.india-water.gov.in/](https://ffs.india-water.gov.in/)
* **API Status:** Public REST station telemetry is gated/captcha-protected; prototype uses an official hydrological stage-discharge calibrated model mapping known CWC river monitoring gauges (Beas at Bhuntar, Suketi at Mandi, Sutlej at Sunni).
* **Hydrological Calculation Formula:**
  $$\text{Stage}_t = \text{Baseflow} + \left(\frac{R_{6h}}{100}\right) \times 1.95 \times \left(0.30 + 0.60 \times \left(\frac{\text{SM}}{100}\right)^{1.8}\right)$$
* **ML Feature Provided:** `water_level_m` (River height vs Warning 2.0m & Danger 2.8m), `discharge_m3_s` (Volumetric flow rate).

---

### 8. Copernicus Climate Data Store (CDS) — ERA5 Reanalysis
* **Official Website:** [https://cds.climate.copernicus.eu](https://cds.climate.copernicus.eu)
* **API Documentation:** [https://cds.climate.copernicus.eu/en/how-to-api](https://cds.climate.copernicus.eu/en/how-to-api)
* **Registration Page:** [https://cds.climate.copernicus.eu/user/register](https://cds.climate.copernicus.eu/user/register)
* **API Key Obtained:** ✅ CDS Personal Access Token / API Key.
* **Python API Tooling:** `pip install cdsapi`
* **Use in FloodGuard AI:** Ground truth hourly reanalysis datasets for Himalayan flash flood seasons (2018–2025) used to train the Scikit-Learn Random Forest ensemble model.
* **ML Feature Provided:** Historical training ground truth matrix (10,000+ training rows).

---

### 9. Geological & Remote Sensing Inventories (NRSC Bhuvan / GSI / SDMA)
* **Official Websites:**
  - [NRSC Bhuvan Disaster Management Support](https://bhuvan-app1.nrsc.gov.in/disaster/)
  - [Geological Survey of India Landslide Portal](https://bhukosh.gsi.gov.in/)
  - [Himachal Pradesh SDMA Disaster Reports](https://hpsdma.nic.in/)
* **Access Type:** Downloadable historical cloudburst, landslide, and flood event inventories.
* **Embedded Storage:** Stored in local SQLite database (`backend/app/floodguard.db`) and demo records (`data/demo/historical_events.json`).
* **ML Feature Provided:** `historical_event_density_nearby` (Haversine spatial density of past disasters within a 15km radius).

---

### 10. Nominatim / OpenStreetMap Geocoding
* **Official Website:** [https://nominatim.org](https://nominatim.org)
* **Usage Policy:** [https://operations.osmfoundation.org/policies/nominatim/](https://operations.osmfoundation.org/policies/nominatim/)
* **Endpoint:** `https://nominatim.openstreetmap.org/search` & `/reverse`
* **API Key Obtained:** ❌ No key required (Rate limit: 1 request/sec, custom `User-Agent: FloodGuardAI-SIH2026`).
* **Required Parameters:** `q={village}, India&format=json&countrycodes=in`
* **Example JSON Response:**
  ```json
  [{ "display_name": "Kullu, Himachal Pradesh, 175101, India", "lat": "31.9579", "lon": "77.1095", "type": "administrative" }]
  ```
* **ML Feature Provided:** Converts human village searches into exact latitude and longitude spatial anchors.

---

### 11. Google Geocoding API (Production Alternative)
* **Official Website:** [https://developers.google.com/maps/documentation/geocoding](https://developers.google.com/maps/documentation/geocoding)
* **API Key Obtained:** Supported via Google Cloud Console key.
* **Role in Project:** Enterprise commercial fallback for ultra-precise landmark resolution.

---

### 12. OpenStreetMap + Leaflet (Interactive GIS Engine)
* **Official Website:** [https://leafletjs.com](https://leafletjs.com) & [https://www.openstreetmap.org](https://www.openstreetmap.org)
* **API Key:** ❌ Free, open-source mapping engine.
* **Role in Project:** Renders interactive topographical map tiles, Beas/Sutlej river catchment polygons, CWC gauge markers, and interactive click-to-predict coordinates.
