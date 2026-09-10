from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
from datetime import datetime

# 1. Health
class HealthResponse(BaseModel):
    status: str = "ok"
    timestamp: str

# 2. Location
class LocationResult(BaseModel):
    name: str
    latitude: float
    longitude: float
    type: str = "village"

class LocationSearchResponse(BaseModel):
    results: List[LocationResult]

class LocationReverseResponse(BaseModel):
    name: str
    latitude: float
    longitude: float

# 3. Environment
class WeatherData(BaseModel):
    rainfall_1h_mm: float
    rainfall_3h_mm: float
    rainfall_6h_mm: float
    forecast_rainfall_next_3h: float
    temperature_c: float
    humidity_percent: float
    wind_speed_kmh: float
    source: str = "Open-Meteo"
    updated_at: str

class SoilData(BaseModel):
    soil_moisture_0_10cm_percent: float
    soil_moisture_10_35cm_percent: float
    source: str = "Open-Meteo"
    updated_at: str

class WaterData(BaseModel):
    water_level_m: float
    discharge_m3_s: float
    source: str = "India-WRIS"
    updated_at: str

class LocationCoordinates(BaseModel):
    name: Optional[str] = None
    latitude: float
    longitude: float

class DataStatus(BaseModel):
    source: str
    updated_at: str
    mode: str = "DEMO"
    availability_percent: int = 85
    confidence_note: str = "Confidence is based on availability and freshness of input telemetry data; it is distinct from ML model accuracy."

class EnvironmentResponse(BaseModel):
    location: LocationCoordinates
    weather: WeatherData
    soil: SoilData
    water: WaterData
    data_status: Optional[DataStatus] = None

# 4. Terrain
class TerrainResponse(BaseModel):
    elevation_m: float
    slope_degrees: float
    terrain_type: str
    drainage_pattern: str
    source: str = "Open-Meteo Elevation + DEM calculation"

# 5. Historical Risk & Events
class HistoricalEventItem(BaseModel):
    event_id: str
    type: str
    date: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    distance_km: Optional[float] = None
    severity: str
    affected_area: Optional[str] = None
    location: Optional[str] = None
    description: str
    rainfall_recorded_mm: Optional[float] = None
    casualties: Optional[int] = 0

class HistoricalRiskResponse(BaseModel):
    location: Dict[str, float]
    nearby_events: List[HistoricalEventItem]
    event_density: float
    historical_risk_score: float

class HistoricalEventsListResponse(BaseModel):
    events: List[HistoricalEventItem]

# 6. ML Prediction
class PredictRequest(BaseModel):
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    # Optional manual overrides for Demo / Simulator mode
    rainfall_1h_mm: Optional[float] = None
    rainfall_3h_mm: Optional[float] = None
    rainfall_6h_mm: Optional[float] = None
    soil_moisture_percent: Optional[float] = None
    water_level_m: Optional[float] = None
    temperature_c: Optional[float] = None

class ContributingFactor(BaseModel):
    factor: str
    importance: float
    current_value: float
    impact: str  # LOW, MODERATE, HIGH, CRITICAL
    unit: Optional[str] = ""

class PredictionDetails(BaseModel):
    flood_probability: float
    flood_probability_percent: int
    risk_level: str  # LOW, MODERATE, HIGH, CRITICAL
    confidence_score: float

class WarningInfo(BaseModel):
    alert_level: str
    lead_time_minutes: int
    estimated_peak_time: str
    message: str

class HourlyForecastItem(BaseModel):
    hour: int
    time: str
    rainfall_mm: float
    probability_percent: float
    cloud_cover_percent: Optional[float] = 0.0
    temperature_c: Optional[float] = 22.0
    predicted_river_level_m: Optional[float] = None
    predicted_discharge_cumecs: Optional[float] = None
    flood_probability: float
    flood_probability_percent: int
    risk_level: str
    threshold_crossed: bool = False

class TimelineItem(BaseModel):
    time_label: str
    time: str
    rainfall_mm: float
    river_level_m: float
    soil_moisture_percent: float
    flood_probability_percent: int
    risk_level: str
    status: str

class RiverForecastItem(BaseModel):
    hour_ahead: int
    predicted_level_m: float
    predicted_discharge_cumecs: float
    rainfall_driver_mm: float
    status: str

class PredictResponse(BaseModel):
    location: LocationCoordinates
    prediction: PredictionDetails
    contributing_factors: List[ContributingFactor]
    warning: WarningInfo
    recommendations: List[str]
    forecast_3h: Optional[List[HourlyForecastItem]] = []
    forecast_6h: Optional[List[HourlyForecastItem]] = []
    river_forecast: Optional[List[RiverForecastItem]] = []
    timeline: Optional[List[TimelineItem]] = []
    max_probability_next_3h: Optional[float] = 0.0
    forecast_lead_hours: Optional[int] = 3
    cycle_interval_hours: Optional[int] = 2
    cycle_expires_at: Optional[str] = None

class ForecastResponse(BaseModel):
    location: LocationCoordinates
    current: Dict[str, Any]
    next_3_hours: List[HourlyForecastItem]
    next_6_hours: List[HourlyForecastItem]
    river_forecast: List[RiverForecastItem]
    max_probability_next_3h: float
    alert_level: str

# 7. Risk Map
class RiskMapFeature(BaseModel):
    type: str = "village"
    name: str
    coordinates: List[float]  # [lat, lon]
    flood_probability: float
    risk_level: str
    population: int
    district: Optional[str] = None
    altitude_m: Optional[float] = None
    slope_degrees: Optional[float] = None

class RiskMapResponse(BaseModel):
    features: List[RiskMapFeature]

# 8. Alerts
class AlertItem(BaseModel):
    alert_id: str
    location: str
    risk_level: str
    issued_at: str
    expires_at: str
    message: str
    recommended_actions: List[str]

class AlertsResponse(BaseModel):
    active_alerts: List[AlertItem]

# 9. IoT Sensor Data
class SensorDataRequest(BaseModel):
    sensor_id: str
    latitude: float
    longitude: float
    rainfall_mm: float
    soil_moisture_percent: float
    water_level_m: float
    timestamp: str

class SensorDataResponse(BaseModel):
    received: bool = True
    processed: bool = True
    calculated_risk: Optional[str] = None
    probability: Optional[float] = None

# 10. Model Info
class ModelInfoResponse(BaseModel):
    model_type: str = "RandomForest"
    features: List[str]
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    training_data: str
    note: str
