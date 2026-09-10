export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface HealthResponse {
  status: string;
  timestamp: string;
}

export interface LocationResult {
  name: string;
  latitude: number;
  longitude: number;
  type: string;
}

export interface LocationSearchResponse {
  results: LocationResult[];
}

export interface LocationReverseResponse {
  name: string;
  latitude: number;
  longitude: number;
}

export interface LocationCoordinates {
  name?: string;
  latitude: number;
  longitude: number;
}

export interface WeatherData {
  rainfall_1h_mm: number;
  rainfall_3h_mm: number;
  rainfall_6h_mm: number;
  forecast_rainfall_next_3h: number;
  temperature_c: number;
  humidity_percent: number;
  wind_speed_kmh: number;
  source: string;
  updated_at: string;
}

export interface SoilData {
  soil_moisture_0_10cm_percent: number;
  soil_moisture_10_35cm_percent: number;
  source: string;
  updated_at: string;
}

export interface WaterData {
  water_level_m: number;
  discharge_m3_s: number;
  source: string;
  updated_at: string;
}

export interface DataStatus {
  source: string;
  updated_at: string;
  mode: 'LIVE' | 'CACHED' | 'DEMO';
  availability_percent: number;
  confidence_note: string;
}

export interface EnvironmentResponse {
  location: LocationCoordinates;
  weather: WeatherData;
  soil: SoilData;
  water: WaterData;
  data_status?: DataStatus;
}

export interface TerrainResponse {
  elevation_m: number;
  slope_degrees: number;
  terrain_type: string;
  drainage_pattern: string;
  source: string;
}

export interface HistoricalEventItem {
  event_id: string;
  type: string;
  date: string;
  latitude?: number;
  longitude?: number;
  distance_km?: number;
  severity: RiskLevel | string;
  affected_area?: string;
  location?: string;
  description: string;
  rainfall_recorded_mm?: number;
  casualties?: number;
}

export interface HistoricalRiskResponse {
  location: { latitude: number; longitude: number };
  nearby_events: HistoricalEventItem[];
  event_density: number;
  historical_risk_score: number;
}

export interface ContributingFactor {
  factor: string;
  importance: number;
  current_value: number;
  impact: RiskLevel;
  unit?: string;
}

export interface PredictionDetails {
  flood_probability: number;
  flood_probability_percent: number;
  risk_level: RiskLevel;
  confidence_score: number;
}

export interface WarningInfo {
  alert_level: RiskLevel;
  lead_time_minutes: number;
  estimated_peak_time: string;
  message: string;
}

export interface HourlyForecastItem {
  hour: number;
  time: string;
  rainfall_mm: number;
  probability_percent: number;
  cloud_cover_percent?: number;
  temperature_c?: number;
  predicted_river_level_m?: number;
  predicted_discharge_cumecs?: number;
  flood_probability: number;
  flood_probability_percent: number;
  risk_level: RiskLevel;
  threshold_crossed?: boolean;
}

export interface RiverForecastItem {
  hour_ahead: number;
  predicted_level_m: number;
  predicted_discharge_cumecs: number;
  rainfall_driver_mm: number;
  status: string;
}

export interface TimelineItem {
  time_label: string;
  time: string;
  rainfall_mm: number;
  river_level_m: number;
  soil_moisture_percent: number;
  flood_probability_percent: number;
  risk_level: RiskLevel;
  status: string;
}

export interface PredictResponse {
  location: LocationCoordinates;
  prediction: PredictionDetails;
  contributing_factors: ContributingFactor[];
  warning: WarningInfo;
  recommendations: string[];
  data_status?: DataStatus;
  forecast_3h?: HourlyForecastItem[];
  forecast_6h?: HourlyForecastItem[];
  river_forecast?: RiverForecastItem[];
  timeline?: TimelineItem[];
  max_probability_next_3h?: number;
}

export interface ForecastResponse {
  location: LocationCoordinates;
  current: {
    flood_probability: number;
    flood_probability_percent: number;
    risk_level: RiskLevel;
    timestamp: string;
  };
  next_3_hours: HourlyForecastItem[];
  next_6_hours: HourlyForecastItem[];
  river_forecast: RiverForecastItem[];
  max_probability_next_3h: number;
  alert_level: RiskLevel;
}

export interface PredictRequest {
  latitude: number;
  longitude: number;
  location_name?: string;
  rainfall_1h_mm?: number;
  rainfall_3h_mm?: number;
  rainfall_6h_mm?: number;
  soil_moisture_percent?: number;
  water_level_m?: number;
  temperature_c?: number;
}

export interface RiskMapFeature {
  type: string;
  name: string;
  coordinates: [number, number]; // [lat, lon]
  flood_probability: number;
  risk_level: RiskLevel;
  population: number;
  district?: string;
  altitude_m?: number;
  slope_degrees?: number;
}

export interface RiskMapResponse {
  features: RiskMapFeature[];
}

export interface AlertItem {
  alert_id: string;
  location: string;
  risk_level: RiskLevel;
  issued_at: string;
  expires_at: string;
  message: string;
  recommended_actions: string[];
}

export interface AlertsResponse {
  active_alerts: AlertItem[];
}

export interface ModelInfoResponse {
  model_type: string;
  features: string[];
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  training_data: string;
  note: string;
}

export interface SensorDataRequest {
  sensor_id: string;
  latitude: number;
  longitude: number;
  rainfall_mm: number;
  soil_moisture_percent: number;
  water_level_m: number;
  timestamp: string;
}

export interface SensorDataResponse {
  received: boolean;
  processed: boolean;
  calculated_risk?: RiskLevel;
  probability?: number;
}

export interface DemoControlsState {
  rainfall: number; // 0 - 200 mm
  soilMoisture: number; // 0 - 100 %
  waterLevel: number; // 0 - 10 m
  temperature: number; // 0 - 40 °C
}

export interface AppSettings {
  isDemoMode: boolean;
  mapStyle: 'street' | 'terrain' | 'satellite';
  units: 'metric' | 'imperial';
  autoRefreshIntervalSec: number;
}
