import axios from 'axios';
import {
  HealthResponse,
  LocationSearchResponse,
  LocationReverseResponse,
  EnvironmentResponse,
  TerrainResponse,
  HistoricalRiskResponse,
  PredictRequest,
  PredictResponse,
  ForecastResponse,
  TimelineItem,
  RiskMapResponse,
  AlertsResponse,
  HistoricalEventItem,
  ModelInfoResponse,
  SensorDataRequest,
  SensorDataResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // 1. Health
  checkHealth: async (): Promise<HealthResponse> => {
    const res = await apiClient.get<HealthResponse>('/api/health');
    return res.data;
  },

  // 2. Search Location
  searchLocations: async (query: string): Promise<LocationSearchResponse> => {
    const res = await apiClient.get<LocationSearchResponse>('/api/location/search', {
      params: { q: query },
    });
    return res.data;
  },

  // 3. Reverse Geocode
  reverseGeocode: async (lat: number, lon: number): Promise<LocationReverseResponse> => {
    const res = await apiClient.get<LocationReverseResponse>('/api/location/reverse', {
      params: { lat, lon },
    });
    return res.data;
  },

  // 4. Environment Telemetry
  getEnvironment: async (lat: number, lon: number, name?: string): Promise<EnvironmentResponse> => {
    const res = await apiClient.get<EnvironmentResponse>('/api/environment', {
      params: { lat, lon, name },
    });
    return res.data;
  },

  // 5. Terrain Topography
  getTerrain: async (lat: number, lon: number): Promise<TerrainResponse> => {
    const res = await apiClient.get<TerrainResponse>('/api/terrain', {
      params: { lat, lon },
    });
    return res.data;
  },

  // 6. Historical Risk
  getHistoricalRisk: async (lat: number, lon: number, radiusKm: number = 15): Promise<HistoricalRiskResponse> => {
    const res = await apiClient.get<HistoricalRiskResponse>('/api/historical-risk', {
      params: { lat, lon, radius_km: radiusKm },
    });
    return res.data;
  },

  // 7. Predict
  predict: async (req: PredictRequest): Promise<PredictResponse> => {
    const res = await apiClient.post<PredictResponse>('/api/predict', req);
    return res.data;
  },

  // 8. Risk Map
  getRiskMap: async (bounds?: string, resolution: string = 'village'): Promise<RiskMapResponse> => {
    const res = await apiClient.get<RiskMapResponse>('/api/risk-map', {
      params: { bounds, resolution },
    });
    return res.data;
  },

  // 9. Alerts
  getAlerts: async (): Promise<AlertsResponse> => {
    const res = await apiClient.get<AlertsResponse>('/api/alerts');
    return res.data;
  },

  // 10. Sensor Data
  sendSensorData: async (data: SensorDataRequest): Promise<SensorDataResponse> => {
    const res = await apiClient.post<SensorDataResponse>('/api/sensor-data', data);
    return res.data;
  },

  // 11. Historical Events
  getHistoricalEvents: async (
    lat?: number,
    lon?: number,
    type?: string,
    years: number = 5
  ): Promise<{ events: HistoricalEventItem[] }> => {
    const res = await apiClient.get<{ events: HistoricalEventItem[] }>('/api/historical-events', {
      params: { lat, lon, type, years },
    });
    return res.data;
  },

  // 12. Model Info
  getModelInfo: async (): Promise<ModelInfoResponse> => {
    const res = await apiClient.get<ModelInfoResponse>('/api/model/info');
    return res.data;
  },

  // 13. Short-Term Forecast (Next 3-6 Hours)
  getForecast: async (lat: number, lon: number, name?: string): Promise<ForecastResponse> => {
    const res = await apiClient.get<ForecastResponse>('/api/forecast', {
      params: { lat, lon, name },
    });
    return res.data;
  },

  // 14. Timeline (Past 6h -> NOW -> Future 3h)
  getTimeline: async (lat: number, lon: number, name?: string): Promise<{ location: any; timeline: TimelineItem[] }> => {
    const res = await apiClient.get<{ location: any; timeline: TimelineItem[] }>('/api/timeline', {
      params: { lat, lon, name },
    });
    return res.data;
  },

  // 15. Pan-India Multi-City Predictions
  getAllPredictions: async (): Promise<{ cities: any[]; timestamp: string }> => {
    const res = await apiClient.get<{ cities: any[]; timestamp: string }>('/api/predictions/all');
    return res.data;
  },

  // 16. Live Alerts
  getLiveAlerts: async (): Promise<{ live_alerts: any[]; count: number }> => {
    const res = await apiClient.get<{ live_alerts: any[]; count: number }>('/api/alerts/live');
    return res.data;
  },
};
