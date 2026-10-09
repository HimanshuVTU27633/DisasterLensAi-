import React, { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

interface RouteCorridorProps {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  facilityName: string;
}

export const RouteCorridor: React.FC<RouteCorridorProps> = ({
  origin,
  destination,
  facilityName,
}) => {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps) return;

    // Tactical waypoints path
    const midLat = (origin.lat + destination.lat) / 2 + 0.002;
    const midLng = (origin.lng + destination.lng) / 2 - 0.002;

    const path = [
      origin,
      { lat: midLat, lng: midLng },
      destination,
    ];

    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#00F0FF',
      strokeOpacity: 0.9,
      strokeWeight: 4,
      map,
    });

    polylineRef.current = polyline;

    // Pan bounds to fit
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(origin);
    bounds.extend(destination);
    map.fitBounds(bounds, 80);

    return () => {
      polyline.setMap(null);
    };
  }, [map, origin.lat, origin.lng, destination.lat, destination.lng, facilityName]);

  return null;
};
