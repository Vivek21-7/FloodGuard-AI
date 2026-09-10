export interface GeoPosition {
  latitude: number;
  longitude: number;
}

export const getCurrentPosition = (): Promise<GeoPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      // Default to Pan-India center coordinates if geolocation unsupported
      resolve({ latitude: 22.9734, longitude: 78.6569 });
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
        console.warn('Browser geolocation denied or unavailable, using Pan-India national default:', err.message);
        // Fallback to Pan-India center default
        resolve({ latitude: 22.9734, longitude: 78.6569 });
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  });
};
