import React, { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

interface HazardCircleProps {
  center: { lat: number; lng: number };
  radiusMeters: number;
  severity: 'critical' | 'high' | 'moderate' | 'low';
}

export const HazardCircle: React.FC<HazardCircleProps> = ({
  center,
  radiusMeters,
  severity,
}) => {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  const colors = {
    critical: { stroke: '#EF4444', fill: '#EF4444' },
    high: { stroke: '#F97316', fill: '#F97316' },
    moderate: { stroke: '#EAB308', fill: '#EAB308' },
    low: { stroke: '#06B6D4', fill: '#06B6D4' },
  }[severity];

  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps) return;

    const circle = new google.maps.Circle({
      map,
      center,
      radius: radiusMeters,
      strokeColor: colors.stroke,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: colors.fill,
      fillOpacity: 0.15,
      clickable: false,
    });

    circleRef.current = circle;

    return () => {
      circle.setMap(null);
    };
  }, [map, center.lat, center.lng, radiusMeters, colors.stroke, colors.fill]);

  return null;
};
