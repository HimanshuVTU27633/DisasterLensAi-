import React, { useEffect, useRef, useMemo } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { HistoricalDisasterIncident } from '../../data/historicalDisastersIndia';

export type HeatmapGradientType = 'thermal' | 'imd_radar' | 'emergency' | 'volcanic';
export type HeatmapWeightMetric = 'risk' | 'density' | 'displacement';

interface DisasterHeatmapLayerProps {
  incidents: HistoricalDisasterIncident[];
  visible: boolean;
  radius?: number;
  opacity?: number;
  gradientScheme?: HeatmapGradientType;
  weightMetric?: HeatmapWeightMetric;
  maxIntensity?: number;
}

export const HEATMAP_GRADIENTS: Record<HeatmapGradientType, { name: string; colors: string[] }> = {
  thermal: {
    name: 'Thermal Hazard Spectrum',
    colors: [
      'rgba(0, 255, 255, 0)',
      'rgba(6, 182, 212, 0.7)',
      'rgba(34, 197, 94, 0.85)',
      'rgba(234, 179, 8, 0.9)',
      'rgba(249, 115, 22, 0.95)',
      'rgba(239, 68, 68, 1)',
      'rgba(185, 28, 28, 1)',
    ],
  },
  imd_radar: {
    name: 'IMD Doppler Radar Palette',
    colors: [
      'rgba(0, 0, 0, 0)',
      'rgba(56, 189, 248, 0.75)',
      'rgba(74, 222, 128, 0.85)',
      'rgba(250, 204, 21, 0.9)',
      'rgba(251, 146, 60, 0.95)',
      'rgba(239, 68, 68, 1)',
      'rgba(192, 38, 211, 1)',
    ],
  },
  emergency: {
    name: 'High-Contrast Emergency Alert',
    colors: [
      'rgba(255, 255, 255, 0)',
      'rgba(59, 130, 246, 0.75)',
      'rgba(147, 51, 234, 0.85)',
      'rgba(236, 72, 153, 0.95)',
      'rgba(239, 68, 68, 1)',
    ],
  },
  volcanic: {
    name: 'Volcanic Blaze (Concentration)',
    colors: [
      'rgba(0, 0, 0, 0)',
      'rgba(254, 240, 138, 0.7)',
      'rgba(250, 204, 21, 0.85)',
      'rgba(245, 158, 11, 0.95)',
      'rgba(220, 38, 38, 1)',
      'rgba(127, 29, 29, 1)',
    ],
  },
};

/**
 * Generates a 256-step RGBA color lookup table from color stops
 */
function createGradientPalette(colors: string[]): Uint8ClampedArray {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new Uint8ClampedArray(256 * 4);

  const grad = ctx.createLinearGradient(0, 0, 256, 1);
  const step = 1 / (colors.length - 1);
  colors.forEach((col, idx) => {
    grad.addColorStop(Math.min(1, Math.max(0, idx * step)), col);
  });

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 1);
  return ctx.getImageData(0, 0, 256, 1).data;
}

export const DisasterHeatmapLayer: React.FC<DisasterHeatmapLayerProps> = ({
  incidents,
  visible,
  radius = 32,
  opacity = 0.82,
  gradientScheme = 'thermal',
  weightMetric = 'risk',
  maxIntensity = 12,
}) => {
  const map = useMap();
  const overlayRef = useRef<google.maps.OverlayView | null>(null);

  // Pre-generate color palette for current gradient scheme
  const palette = useMemo(() => {
    const scheme = HEATMAP_GRADIENTS[gradientScheme] || HEATMAP_GRADIENTS.thermal;
    return createGradientPalette(scheme.colors);
  }, [gradientScheme]);

  // Keep latest config in ref for overlay draw callback
  const configRef = useRef({
    incidents,
    visible,
    radius,
    opacity,
    palette,
    weightMetric,
    maxIntensity,
  });

  useEffect(() => {
    configRef.current = {
      incidents,
      visible,
      radius,
      opacity,
      palette,
      weightMetric,
      maxIntensity,
    };
    if (overlayRef.current) {
      overlayRef.current.draw();
    }
  }, [incidents, visible, radius, opacity, palette, weightMetric, maxIntensity]);

  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps || !google.maps.OverlayView) {
      return;
    }

    // High-performance canvas-based Heatmap OverlayView compatible with Google Maps 3.65+
    class CanvasHeatmapOverlay extends google.maps.OverlayView {
      private canvas: HTMLCanvasElement | null = null;
      private intensityCanvas: HTMLCanvasElement | null = null;

      onAdd() {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.pointerEvents = 'none';
        canvas.style.top = '0';
        canvas.style.left = '0';
        this.canvas = canvas;

        const intensityCanvas = document.createElement('canvas');
        this.intensityCanvas = intensityCanvas;

        const panes = this.getPanes();
        if (panes?.overlayLayer) {
          panes.overlayLayer.appendChild(canvas);
        }
      }

      draw() {
        if (!this.canvas || !this.intensityCanvas) return;
        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;

        const { visible, incidents, radius, opacity, palette, weightMetric, maxIntensity } =
          configRef.current;

        if (!visible || incidents.length === 0) {
          ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          return;
        }

        const projection = this.getProjection();
        if (!projection) return;

        const bounds = map?.getBounds();
        if (!bounds) return;

        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        const swPix = projection.fromLatLngToDivPixel(sw);
        const nePix = projection.fromLatLngToDivPixel(ne);
        if (!swPix || !nePix) return;

        const pad = radius * 3;
        const minX = Math.min(swPix.x, nePix.x) - pad;
        const minY = Math.min(swPix.y, nePix.y) - pad;
        const maxX = Math.max(swPix.x, nePix.x) + pad;
        const maxY = Math.max(swPix.y, nePix.y) + pad;

        const width = Math.max(10, Math.ceil(maxX - minX));
        const height = Math.max(10, Math.ceil(maxY - minY));

        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.left = `${minX}px`;
        this.canvas.style.top = `${minY}px`;

        this.intensityCanvas.width = width;
        this.intensityCanvas.height = height;
        const intCtx = this.intensityCanvas.getContext('2d');
        if (!intCtx) return;

        intCtx.clearRect(0, 0, width, height);

        // Pre-create radial brush for high-performance point splatting
        const brushCanvas = document.createElement('canvas');
        brushCanvas.width = radius * 2;
        brushCanvas.height = radius * 2;
        const brushCtx = brushCanvas.getContext('2d');
        if (brushCtx) {
          const radial = brushCtx.createRadialGradient(
            radius,
            radius,
            0,
            radius,
            radius,
            radius
          );
          radial.addColorStop(0, 'rgba(0,0,0,1)');
          radial.addColorStop(1, 'rgba(0,0,0,0)');
          brushCtx.fillStyle = radial;
          brushCtx.fillRect(0, 0, radius * 2, radius * 2);
        }

        // Draw intensity points
        incidents.forEach((item) => {
          let weight = 1;
          if (weightMetric === 'risk') {
            weight = item.weight || item.riskScore / 10;
          } else if (weightMetric === 'displacement') {
            weight = Math.min(10, Math.max(1, Math.log10((item.displaced || 100) + 1) * 2));
          } else {
            weight = 1;
          }

          const pt = projection.fromLatLngToDivPixel(
            new google.maps.LatLng(item.location.lat, item.location.lng)
          );
          if (!pt) return;

          const cx = pt.x - minX;
          const cy = pt.y - minY;

          // Check if point is inside buffered canvas region
          if (cx < -radius || cx > width + radius || cy < -radius || cy > height + radius) {
            return;
          }

          // Splat intensity proportional to weight
          const alpha = Math.min(1, Math.max(0.08, weight / maxIntensity));
          intCtx.globalAlpha = alpha;
          intCtx.drawImage(brushCanvas, cx - radius, cy - radius);
        });

        // Colorize intensity values via gradient palette lookup
        const image = intCtx.getImageData(0, 0, width, height);
        const data = image.data;
        const len = data.length;

        for (let i = 0; i < len; i += 4) {
          const alpha = data[i + 3];
          if (alpha > 0) {
            const pIdx = alpha * 4;
            data[i] = palette[pIdx];         // Red
            data[i + 1] = palette[pIdx + 1]; // Green
            data[i + 2] = palette[pIdx + 2]; // Blue
            data[i + 3] = Math.round(alpha * opacity); // Final opacity
          }
        }

        ctx.putImageData(image, 0, 0);
      }

      onRemove() {
        if (this.canvas?.parentNode) {
          this.canvas.parentNode.removeChild(this.canvas);
        }
        this.canvas = null;
        this.intensityCanvas = null;
      }
    }

    const overlay = new CanvasHeatmapOverlay();
    overlay.setMap(map);
    overlayRef.current = overlay;

    return () => {
      overlay.setMap(null);
      overlayRef.current = null;
    };
  }, [map]);

  return null;
};
