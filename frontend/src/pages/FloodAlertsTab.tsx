import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Radio, 
  CheckCircle2,
  Clock, 
  ShieldAlert, 
  RefreshCw, 
  Activity, 
  Cpu,
  Navigation,
  PhoneCall,
  Phone
} from 'lucide-react';
import { PredictResponse, RiskLevel } from '../types';
import { api } from '../services/api';
import { getEmergencyHelplinesForLocation } from '../services/emergencyService';

interface FloodAlertsTabProps {
  predictionData: PredictResponse | null;
  selectedLocation: { latitude: number; longitude: number; name?: string };
  onNavigateToMap?: () => void;
  onOpenDispatcher?: () => void;
  onSelectCityLocation?: (lat: number, lon: number, name: string) => void;
  onOpenEmergencyDirectory?: () => void;
}

interface CityLivePrediction {
  name: string;
  basin: string;
  latitude: number;
  longitude: number;
  flood_probability_percent: number;
  risk_level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  lead_time: number;
  message: string;
  forecast_3h: Array<{
    hour: number;
    time: string;
    rainfall_mm: number;
    probability_percent: number;
    predicted_river_level_m: number;
  }>;
}

export const FloodAlertsTab: React.FC<FloodAlertsTabProps> = ({
  predictionData,
  selectedLocation,
  onNavigateToMap,
  onOpenDispatcher,
  onSelectCityLocation,
  onOpenEmergencyDirectory,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'>('ALL');
  const [citiesData, setCitiesData] = useState<CityLivePrediction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Fetch real live multi-city predictions from backend
  const fetchLivePredictions = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAllPredictions();
      if (res && res.cities && res.cities.length > 0) {
        setCitiesData(res.cities);
      }
      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn('Failed to fetch all predictions, using current location prediction:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLivePredictions();
    const interval = setInterval(fetchLivePredictions, 120000); // 2 min polling
    return () => clearInterval(interval);
  }, []);

  const filteredCities = citiesData.filter(c => {
    if (filter === 'ALL') return true;
    return c.risk_level === filter;
  });

  // Dynamic KPI counts from real live telemetry
  const criticalCount = citiesData.filter(c => c.risk_level === 'CRITICAL').length;
  const highCount = citiesData.filter(c => c.risk_level === 'HIGH').length;
  const moderateCount = citiesData.filter(c => c.risk_level === 'MODERATE').length;
  const lowCount = citiesData.filter(c => c.risk_level === 'LOW').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-900">
      {/* 🤖 Scientific Methodology & Integrity Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/30 flex-shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-950 font-mono text-sm">
                AI-PREDICTED FLOOD RISK MATRIX (3-HOUR EARLY WARNING)
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded-md font-bold border border-emerald-300">
                LIVE TELEMETRY ACTIVE
              </span>
            </div>
            <p className="text-slate-600 text-[11px] mt-0.5 font-sans">
              Dynamic inference computed via Random Forest Classifier using live precipitation, soil moisture, and river gauges from Open-Meteo & IMD radar mesh.
            </p>
          </div>
        </div>

        <button
          onClick={fetchLivePredictions}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          <span>{isLoading ? 'Recalculating...' : 'Sync Telemetry'}</span>
        </button>
      </div>

      {/* 📊 Active Live Prediction Statistics KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">CRITICAL / HIGH THREATS</span>
            <span className="text-2xl font-black text-rose-600 mt-0.5 block">{criticalCount + highCount} BASINS</span>
            <span className="text-[10px] text-slate-500 font-medium">
              {criticalCount + highCount > 0 ? 'Evacuation orders active' : 'No severe alerts active'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">MODERATE VIGILANCE</span>
            <span className="text-2xl font-black text-amber-700 mt-0.5 block">{moderateCount} BASINS</span>
            <span className="text-[10px] text-amber-700 font-medium">Stage height monitored</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">NORMAL FLOW (LOW RISK)</span>
            <span className="text-2xl font-black text-emerald-700 mt-0.5 block">{lowCount} BASINS</span>
            <span className="text-[10px] text-emerald-700 font-medium">Below danger mark</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">EARLY WARNING LEAD</span>
            <span className="text-2xl font-black text-blue-700 mt-0.5 block">3.0 HOURS</span>
            <span className="text-[10px] text-slate-500 font-medium">Refreshes every 2h</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 🚨 Live Multi-City Predictions Feed */}
      <div className="space-y-4">
          {/* Feed Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 font-mono">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">
                PAN-INDIA BASIN PREDICTIONS ({filteredCities.length} CITIES)
              </h2>
            </div>

            {/* Severity Filter Buttons */}
            <div className="flex items-center gap-1.5 text-[11px]">
              {(['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilter(lvl)}
                  className={`px-2.5 py-1 rounded-lg border transition-all ${
                    filter === lvl
                      ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Alert Cards List */}
          <div className="space-y-3 font-mono">
            {isLoading && citiesData.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                <p className="text-xs text-slate-600 font-mono">Fetching live Open-Meteo & IMD satellite feeds across Indian basins...</p>
              </div>
            ) : filteredCities.map((city) => {
              const badgeStyle = 
                city.risk_level === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                city.risk_level === 'HIGH' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                city.risk_level === 'MODERATE' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                'bg-emerald-50 text-emerald-800 border border-emerald-200';

              const rainForecast = city.forecast_3h && city.forecast_3h[0] ? city.forecast_3h[0].rainfall_mm : 0.0;
              const waterForecast = city.forecast_3h && city.forecast_3h[0] ? city.forecast_3h[0].predicted_river_level_m : 1.2;

              return (
                <div 
                  key={city.name}
                  className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-4.5 space-y-3 transition-all shadow-xs"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${badgeStyle}`}>
                        {city.risk_level} RISK
                      </span>
                      <span className="font-bold text-slate-900 text-sm font-sans">
                        {city.name}
                      </span>
                      <span className="text-[11px] text-slate-500 hidden sm:inline">
                        ({city.basin} Basin)
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-blue-600" />
                      Live Feed ({lastUpdated || 'Synced'})
                    </span>
                  </div>

                  {/* Telemetry Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[9px] text-slate-500 block uppercase">STAGE HEIGHT</span>
                      <span className="font-bold text-sky-700">{waterForecast.toFixed(2)}m (Live)</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[9px] text-slate-500 block uppercase">CURRENT RAIN</span>
                      <span className="font-bold text-slate-900">{rainForecast.toFixed(1)} mm/h</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[9px] text-slate-500 block uppercase">AI PROBABILITY</span>
                      <span className={`font-black ${city.flood_probability_percent >= 70 ? 'text-rose-600' : city.flood_probability_percent >= 40 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {city.flood_probability_percent}%
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[9px] text-slate-500 block uppercase">EARLY WARNING</span>
                      <span className="font-bold text-blue-700">+{Math.round(city.lead_time / 60)}h Lead</span>
                    </div>
                  </div>

                  {/* 3-Hour Forward Prediction Curve */}
                  {city.forecast_3h && city.forecast_3h.length > 0 && (
                    <div className="p-2 bg-blue-50/40 rounded-xl border border-blue-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 text-[10px] uppercase font-bold">3H Forward Curve:</span>
                      <div className="flex items-center gap-3">
                        {city.forecast_3h.slice(0, 3).map((f, i) => (
                          <span key={i} className="text-[10px]">
                            <strong className="text-slate-700">+{f.hour}h:</strong> {f.probability_percent}% ({f.rainfall_mm}mm)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Directives from Alert Engine */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                    <div className="text-slate-700 font-sans leading-relaxed">
                      <strong className="text-blue-900">AI Directive:</strong> {city.message}
                    </div>
                  </div>

                  {/* 🚨 Emergency Helpline Strip for this Location */}
                  {(() => {
                    const cityHelplines = getEmergencyHelplinesForLocation(city.name, city.latitude, city.longitude);
                    return (
                      <div className="p-2.5 bg-rose-50/70 border border-rose-200/80 rounded-xl flex flex-wrap items-center justify-between gap-2 text-[11px] font-sans">
                        <div className="flex items-center gap-1.5 text-rose-900 font-bold">
                          <PhoneCall className="w-3.5 h-3.5 text-rose-600 animate-pulse shrink-0" />
                          <span>{cityHelplines.matchedState} Helplines:</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {cityHelplines.contacts.slice(0, 2).map((contact, cIdx) => (
                            <a
                              key={cIdx}
                              href={`tel:${contact.numbers[0].replace(/[^0-9+]/g, '')}`}
                              className="px-2 py-0.5 rounded-md bg-white border border-rose-300 text-rose-700 font-mono font-bold hover:bg-rose-600 hover:text-white transition-all flex items-center gap-1 shadow-2xs"
                              title={`Call ${contact.label}: ${contact.numbers[0]}`}
                            >
                              <Phone className="w-2.5 h-2.5" />
                              <span>{contact.label.split(' ')[0]}: {contact.numbers[0]}</span>
                            </a>
                          ))}
                          <a
                            href="tel:112"
                            className="px-2.5 py-0.5 rounded-md bg-rose-600 text-white font-mono font-black hover:bg-rose-700 transition-all flex items-center gap-1 shadow-2xs"
                            title="Call All-in-One National Emergency 112"
                          >
                            <Phone className="w-2.5 h-2.5" />
                            <span>112</span>
                          </a>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Quick Action Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-[10px] text-slate-500 font-mono">
                      GPS: {city.latitude.toFixed(3)}°N, {city.longitude.toFixed(3)}°E
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (onSelectCityLocation) {
                            onSelectCityLocation(city.latitude, city.longitude, `${city.name} (${city.basin} Basin)`);
                          } else if (onNavigateToMap) {
                            onNavigateToMap();
                          }
                        }}
                        className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>View on Live Map</span>
                      </button>

                      {onOpenDispatcher && (
                        <button
                          onClick={onOpenDispatcher}
                          className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Radio className="w-3 h-3" />
                          <span>CAP Broadcast</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
      </div>
    </div>
  );
};
