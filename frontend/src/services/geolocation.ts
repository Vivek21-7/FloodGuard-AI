export interface GeoPosition {
  latitude: number;
  longitude: number;
}

export const getCurrentPosition = (): Promise<GeoPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      // Default to Kullu coordinates if geolocation unsupported
      resolve({ latitude: 31.9579, longitude: 77.1095 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        console.warn('Browser geolocation denied or unavailable, using Kullu Himachal default:', err.message);
        // Fallback to Kullu default
        resolve({ latitude: 31.9579, longitude: 77.1095 });
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  });
};
