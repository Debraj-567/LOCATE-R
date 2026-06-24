import { useState, useCallback } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
  });

  const getLocation = useCallback((): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = 'Geolocation is not supported by your browser';
        setState((s) => ({ ...s, error: err }));
        reject(new Error(err));
        return;
      }

      setState((s) => ({ ...s, loading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setState({ ...coords, error: null, loading: false });
          resolve(coords);
        },
        (error) => {
          let message = 'Unable to get location';
          if (error.code === error.PERMISSION_DENIED) message = 'Location permission denied';
          else if (error.code === error.POSITION_UNAVAILABLE) message = 'Location unavailable';
          else if (error.code === error.TIMEOUT) message = 'Location request timed out';
          setState((s) => ({ ...s, error: message, loading: false }));
          reject(new Error(message));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);

  return { ...state, getLocation };
}
