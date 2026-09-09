import { AppSettings, DemoControlsState } from '../types';

const SETTINGS_KEY = 'floodguard_settings';
const DEMO_CONTROLS_KEY = 'floodguard_demo_controls';

export const defaultSettings: AppSettings = {
  isDemoMode: true,
  mapStyle: 'terrain',
  units: 'metric',
  autoRefreshIntervalSec: 60,
};

export const defaultDemoControls: DemoControlsState = {
  rainfall: 125,
  soilMoisture: 72,
  waterLevel: 2.8,
  temperature: 24,
};

export const storage = {
  getSettings: (): AppSettings => {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  },

  saveSettings: (settings: AppSettings): void => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  getDemoControls: (): DemoControlsState => {
    try {
      const data = localStorage.getItem(DEMO_CONTROLS_KEY);
      return data ? { ...defaultDemoControls, ...JSON.parse(data) } : defaultDemoControls;
    } catch {
      return defaultDemoControls;
    }
  },

  saveDemoControls: (controls: DemoControlsState): void => {
    try {
      localStorage.setItem(DEMO_CONTROLS_KEY, JSON.stringify(controls));
    } catch (e) {
      console.error('Failed to save demo controls:', e);
    }
  },
};
