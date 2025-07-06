import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
// Define the Hotel interface based on the JSON structure
interface Hotel {
  hotel_id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  price_per_night: number;
  star_rating: number;
  rating: number;
  review_count: number;
  image_url: string;
  amenities: string[];
  room_type: string;
  currency: string;
}

interface MapboxMapProps {
  hotels: Hotel[];
  selectedHotel: Hotel | null;
  onHotelSelect: (hotel: Hotel) => void;
  mapboxToken: string;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ 
  hotels, 
  selectedHotel, 
  onHotelSelect,
  mapboxToken
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const currentPopup = useRef<mapboxgl.Popup | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Ensure container has dimensions
    if (mapContainer.current.offsetWidth === 0 || mapContainer.current.offsetHeight === 0) {
      const timer = setTimeout(() => {
        if (mapContainer.current && mapboxToken) {
          mapboxgl.accessToken = mapboxToken;
          
          map.current = new mapboxgl.Map({
            container: mapContainer.current!,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [-122.3351, 47.6097], // Seattle downtown center
            zoom: 13,
            pitch: 45,
          });

          // Add navigation controls
          map.current.addControl(
            new mapboxgl.NavigationControl({
              visualizePitch: true,
            }),
            'top-right'
          );

          map.current.on('load', () => {
            setMapLoaded(true);
          });

          map.current.on('error', (e) => {
            console.error('Map error:', e);
          });
        }
      }, 100);
      return () => clearTimeout(timer);
    }

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-122.3351, 47.6097], // Seattle downtown center
      zoom: 13,
      pitch: 45,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    map.current.on('error', (e) => {
      console.error('Map error:', e);
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Add clustering data when map is loaded
  useEffect(() => {
    if (!map.current || !mapLoaded || hotels.length === 0) return;

    // Convert hotels to GeoJSON format
    const geojsonData = {
      type: 'FeatureCollection' as const,
      features: hotels.map((hotel) => ({
        type: 'Feature' as const,
        properties: {
          id: hotel.hotel_id,
          name: hotel.name,
          price: hotel.price_per_night,
          rating: hotel.rating,
          address: hotel.address,
          imageUrl: hotel.image_url,
          description: hotel.room_type,
          phoneNumber: `${hotel.star_rating}★ Hotel`,
          amenities: hotel.amenities,
          reviewCount: hotel.review_count
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [hotel.longitude, hotel.latitude]
        }
      }))
    };

    // Add source for clustering
    if (map.current.getSource('hotels')) {
      (map.current.getSource('hotels') as mapboxgl.GeoJSONSource).setData(geojsonData);
    } else {
      map.current.addSource('hotels', {
        type: 'geojson',
        data: geojsonData,
        cluster: true,
        clusterMaxZoom: 16,
        clusterRadius: 50,
        clusterProperties: {
          max_price: ['max', ['get', 'price']]
        }
      });

      // Add cluster layer (for grouped markers)
      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'hotels',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'case',
            ['>=', ['get', 'max_price'], 1500], '#8b5cf6', // purple for luxury ($1500+)
            ['>=', ['get', 'max_price'], 1000], '#f97316', // orange for mid-range ($1000-1499)
            '#10b981' // green for budget (<$1000)
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            25,
            3,
            30,
            5,
            35
          ],
          'circle-stroke-width': 4,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 0.8
        }
      });

      // Add cluster glow effect
      map.current.addLayer({
        id: 'clusters-glow',
        type: 'circle',
        source: 'hotels',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'case',
            ['>=', ['get', 'max_price'], 1500], '#8b5cf6', // purple for luxury
            ['>=', ['get', 'max_price'], 1000], '#f97316', // orange for mid-range
            '#10b981' // green for budget
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            35,
            3,
            40,
            5,
            45
          ],
          'circle-opacity': 0.3,
          'circle-stroke-width': 0
        }
      });

      // Add cluster count layer
      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'hotels',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 16
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1
        }
      });

      // Add individual hotel markers (unclustered points)
      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'hotels',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'case',
            ['>=', ['get', 'price'], 1500], '#8b5cf6', // purple for luxury ($1500+)
            ['>=', ['get', 'price'], 1000], '#f97316', // orange for mid-range ($1000-1499)
            '#10b981' // green for budget (<$1000)
          ],
          'circle-radius': 18,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 0.9
        }
      });

      // Add hotel marker glow effect
      map.current.addLayer({
        id: 'unclustered-point-glow',
        type: 'circle',
        source: 'hotels',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'case',
            ['>=', ['get', 'price'], 1500], '#8b5cf6', // purple for luxury
            ['>=', ['get', 'price'], 1000], '#f97316', // orange for mid-range
            '#10b981' // green for budget
          ],
          'circle-radius': 28,
          'circle-opacity': 0.4,
          'circle-stroke-width': 0
        }
      });

      // Add price labels for individual markers
      map.current.addLayer({
        id: 'unclustered-point-label',
        type: 'symbol',
        source: 'hotels',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': ['concat', '$', ['get', 'price']],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
          'text-offset': [0, 1.5]
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 2
        }
      });

      // Auto-fit map to show all hotels
      if (hotels.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        hotels.forEach(hotel => {
          bounds.extend([hotel.longitude, hotel.latitude]);
        });
        
        map.current.fitBounds(bounds, {
          padding: 50,
          duration: 1000
        });
      }

      // Click handlers for clusters
      map.current.on('click', 'clusters', (e) => {
        const features = map.current!.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });

        const clusterId = features[0].properties!.cluster_id;
        (map.current!.getSource('hotels') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
          clusterId,
          (err, zoom) => {
            if (err) return;

            map.current!.easeTo({
              center: (features[0].geometry as any).coordinates,
              zoom: zoom
            });
          }
        );
      });

      // Click handler for individual markers
      map.current.on('click', 'unclustered-point', (e) => {
        e.preventDefault();
        const feature = e.features![0];
        const hotelId = feature.properties!.id;
        const hotel = hotels.find(h => h.hotel_id === hotelId);
        if (hotel) {
          // Close any existing popup first
          if (currentPopup.current) {
            currentPopup.current.remove();
            currentPopup.current = null;
          }
          
          // Create popup content
          const popupContent = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 260px; padding: 12px;">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                <img src="${hotel.image_url}" alt="${hotel.name}" style="width: 50px; height: 38px; object-fit: cover; border-radius: 6px;">
                <div>
                  <h3 style="margin: 0 0 3px 0; font-size: 14px; font-weight: 600; color: #1f2937;">${hotel.name}</h3>
                  <div style="display: flex; align-items: center; gap: 3px; margin-bottom: 3px;">
                    <span style="color: #f59e0b; font-weight: 600;">★</span>
                    <span style="font-size: 12px; color: #6b7280;">${hotel.rating} (${hotel.review_count} reviews)</span>
                  </div>
                  <div style="font-size: 16px; font-weight: 700; color: #3b82f6;">$${hotel.price_per_night}/night</div>
                </div>
              </div>
              <div style="margin-bottom: 12px;">
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 6px;">📍 ${hotel.address}</div>
                <p style="font-size: 12px; color: #374151; margin: 0; line-height: 1.3;">${hotel.room_type}</p>
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 12px;">
                ${hotel.amenities.slice(0, 3).map(amenity => 
                  `<span style="background: #f3f4f6; color: #374151; padding: 3px 6px; border-radius: 8px; font-size: 11px; font-weight: 500;">${amenity}</span>`
                ).join('')}
                ${hotel.amenities.length > 3 ? `<span style="background: #f3f4f6; color: #6b7280; padding: 3px 6px; border-radius: 8px; font-size: 11px;">+${hotel.amenities.length - 3} more</span>` : ''}
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                <div style="font-size: 12px; color: #6b7280;">${hotel.star_rating}★ Hotel</div>
                <button onclick="window.hotelExplorerSelectHotel('${hotel.hotel_id}')" style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 5px; font-size: 12px; font-weight: 500; cursor: pointer;">View Details</button>
              </div>
            </div>
          `;

          // Create popup immediately
          currentPopup.current = new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: false,
            maxWidth: '280px',
            className: 'hotel-popup',
            offset: 10
          })
          .setLngLat([hotel.longitude, hotel.latitude])
          .setHTML(popupContent)
          .addTo(map.current);

          // Add global function for popup button
          (window as any).hotelExplorerSelectHotel = (id: string) => {
            const selectedHotel = hotels.find(h => h.hotel_id === parseInt(id));
            if (selectedHotel) {
              onHotelSelect(selectedHotel);
            }
            if (currentPopup.current) {
              currentPopup.current.remove();
              currentPopup.current = null;
            }
          };
        }
      });

      // Change cursor on hover for clusters
      map.current.on('mouseenter', 'clusters', () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'clusters', () => {
        map.current!.getCanvas().style.cursor = '';
      });

      // Change cursor on hover for individual markers
      map.current.on('mouseenter', 'unclustered-point', () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'unclustered-point', () => {
        map.current!.getCanvas().style.cursor = '';
      });

      // Close popup when clicking elsewhere on the map
      map.current.on('click', (e) => {
        const features = map.current!.queryRenderedFeatures(e.point, {
          layers: ['unclustered-point', 'clusters']
        });
        
        if (features.length === 0 && currentPopup.current) {
          currentPopup.current.remove();
          currentPopup.current = null;
        }
      });
    }
  }, [hotels, mapLoaded, onHotelSelect]);

  // Update selected hotel appearance
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Update unclustered points color based on selection
    if (selectedHotel) {
      map.current.setPaintProperty('unclustered-point', 'circle-color', [
        'case',
        ['==', ['get', 'id'], selectedHotel.hotel_id],
        '#ffffff', // bright white for selected
        [
          'case',
          ['>=', ['get', 'price'], 1500], '#8b5cf6', // purple for luxury ($1500+)
          ['>=', ['get', 'price'], 1000], '#f97316', // orange for mid-range ($1000-1499)
          '#10b981' // green for budget (<$1000)
        ]
      ]);

      map.current.setPaintProperty('unclustered-point', 'circle-radius', [
        'case',
        ['==', ['get', 'id'], selectedHotel.hotel_id],
        25, // larger for selected
        18  // normal size for others
      ]);

      map.current.setPaintProperty('unclustered-point', 'circle-stroke-width', [
        'case',
        ['==', ['get', 'id'], selectedHotel.hotel_id],
        5, // thicker border for selected
        3   // normal border for others
      ]);

      map.current.setPaintProperty('unclustered-point', 'circle-stroke-color', [
        'case',
        ['==', ['get', 'id'], selectedHotel.hotel_id],
        '#fbbf24', // gold border for selected
        '#ffffff'  // white border for others
      ]);

      // Fly to selected hotel
      map.current.easeTo({
        center: [selectedHotel.longitude, selectedHotel.latitude],
        zoom: Math.max(map.current.getZoom(), 15),
        duration: 1000
      });
    } else {
      // Reset all markers to default appearance
      map.current.setPaintProperty('unclustered-point', 'circle-color', [
        'case',
        ['>=', ['get', 'price'], 1500], '#8b5cf6', // purple for luxury ($1500+)
        ['>=', ['get', 'price'], 1000], '#f97316', // orange for mid-range ($1000-1499)
        '#10b981' // green for budget (<$1000)
      ]);

      map.current.setPaintProperty('unclustered-point', 'circle-radius', 18);
      map.current.setPaintProperty('unclustered-point', 'circle-stroke-width', 3);
      map.current.setPaintProperty('unclustered-point', 'circle-stroke-color', '#ffffff');
    }
  }, [selectedHotel, mapLoaded]);

  // Cleanup popup when hotels change
  useEffect(() => {
    if (currentPopup.current) {
      currentPopup.current.remove();
      currentPopup.current = null;
    }
  }, [hotels]);

  if (!mapboxToken) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center p-8">
          <h3 className="text-lg font-semibold mb-2">Map Unavailable</h3>
          <p className="text-sm text-muted-foreground">Please set your Mapbox access token in the .env file to view the map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
    </div>
  );
};

export default MapboxMap;