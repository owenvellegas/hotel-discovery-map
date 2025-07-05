import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Constants
const SEATTLE_COORDINATES = {
  lng: -122.335167,
  lat: 47.608013,
  zoom: 12,
} as const;

// Set access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

const Map: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) {
      setError('Map container not found');
      return;
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [SEATTLE_COORDINATES.lng, SEATTLE_COORDINATES.lat],
        zoom: SEATTLE_COORDINATES.zoom,
      });

      map.current.on('load', () => {
        setIsLoading(false);
      });

      map.current.on('error', () => {
        setError('Failed to load map');
        setIsLoading(false);
      });

    } catch (err) {
      setError('Failed to initialize map');
      setIsLoading(false);
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="text-gray-600">Loading map...</div>
        </div>
      )}
      <div
        ref={mapContainer}
        className="h-full w-full"
      />
    </div>
  );
};

export default Map;
