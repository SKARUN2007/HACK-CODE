import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';

export interface MapCivicReport {
  id: string;
  reportCode: string;
  title: string;
  category: string;
  issueType: string;
  locationText: string;
  latitude: number;
  longitude: number;
  priorityLevel: string;
  actionPriorityScore: number;
  evidenceConfidenceScore: number;
  status: string;
  createdAt: string | Date;
  independentReportCount: number;
  confirmationCount: number;
  isDemoCase?: boolean;
}

export interface HotspotMarkerData {
  hotspotId: string;
  localityName: string;
  centerLat: number;
  centerLong: number;
  reportCount: number;
  independentCitizenCount?: number;
  highPriorityCount: number;
  dominantCategory: string;
  attentionLevel: string;
  explainableReasons: string[];
}

export interface RouteStopMarker {
  sequence: number;
  reportCode: string;
  latitude: number;
  longitude: number;
  category: string;
  issueType: string;
  priorityLevel: string;
  locationText?: string;
}

interface CivicHeatmapCanvasProps {
  reports: MapCivicReport[];
  hotspots?: HotspotMarkerData[];
  routeStops?: RouteStopMarker[];
  displayMode: 'HEATMAP' | 'CLUSTERS' | 'INDIVIDUAL_REPORTS' | 'AREA_SUMMARY';
  selectedCategory?: string;
  onSelectReport?: (report: MapCivicReport) => void;
  onSelectHotspot?: (hotspot: HotspotMarkerData) => void;
}

export const CivicHeatmapCanvas: React.FC<CivicHeatmapCanvasProps> = ({
  reports,
  hotspots = [],
  routeStops = [],
  displayMode,
  selectedCategory = 'ALL',
  onSelectReport,
  onSelectHotspot,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const heatmapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const navigate = useNavigate();

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center default on Trichy, Tamil Nadu
      const defaultLat = 10.805;
      const defaultLng = 78.692;

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | MakkalSaantru Demo',
        maxZoom: 18,
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      // cleanup handled gracefully
    };
  }, []);

  // Update Layers based on reports, hotspots, and displayMode
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // Filter valid reports with coordinates
    const validReports = reports.filter(
      (r) => r.latitude !== null && r.longitude !== null && !isNaN(r.latitude) && !isNaN(r.longitude)
    );

    if (validReports.length > 0) {
      // Fit bounds if reports exist
      const bounds = L.latLngBounds(validReports.map((r) => [r.latitude, r.longitude]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }

    if (routeStops && routeStops.length > 0) {
      const bounds = L.latLngBounds(routeStops.map((s) => [s.latitude, s.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      renderRouteStopsMode(map, layerGroup, routeStops);
    } else if (displayMode === 'HEATMAP') {
      renderHeatmapMode(map, layerGroup, validReports);
    } else if (displayMode === 'CLUSTERS') {
      renderClusterMode(map, layerGroup, validReports, hotspots);
    } else if (displayMode === 'AREA_SUMMARY') {
      renderAreaSummaryMode(map, layerGroup, hotspots);
    } else {
      renderIndividualMode(map, layerGroup, validReports);
    }
  }, [reports, hotspots, routeStops, displayMode, selectedCategory]);

  // ROUTE STOPS MODE WITH SEQUENCED MARKERS & POLYLINE
  const renderRouteStopsMode = (map: L.Map, group: L.LayerGroup, stops: RouteStopMarker[]) => {
    const latLngs: L.LatLngTuple[] = [];

    stops.forEach((s) => {
      latLngs.push([s.latitude, s.longitude]);

      const markerColor = s.priorityLevel === 'URGENT_REVIEW' ? '#dc2626' : s.priorityLevel === 'HIGH' ? '#ea580c' : '#2563eb';

      const customIcon = L.divIcon({
        className: 'route-stop-marker',
        html: `
          <div style="
            background-color: ${markerColor};
            color: #ffffff;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 0.95rem;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 3px solid #ffffff;
          ">
            ${s.sequence}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([s.latitude, s.longitude], { icon: customIcon });

      marker.bindPopup(`
        <div style="padding: 0.25rem; font-family: system-ui, sans-serif;">
          <div style="font-size: 0.72rem; font-weight: 900; color: #2563eb; text-transform: uppercase;">
            STOP ${s.sequence} • ${s.reportCode}
          </div>
          <h4 style="font-size: 0.95rem; font-weight: 800; margin: 0.2rem 0; color: #0f172a;">${s.category} - ${s.issueType}</h4>
          <div style="font-size: 0.78rem; color: #64748b;">
            Priority: <strong>${s.priorityLevel}</strong>
          </div>
          ${s.locationText ? `<div style="font-size: 0.75rem; color: #475569; margin-top: 0.2rem;">📍 ${s.locationText}</div>` : ''}
        </div>
      `);

      group.addLayer(marker);
    });

    if (latLngs.length > 1) {
      const polyline = L.polyline(latLngs, {
        color: '#2563eb',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8',
      });
      group.addLayer(polyline);
    }
  };

  // MODE 1: CANVAS HEATMAP LAYER
  const renderHeatmapMode = (map: L.Map, group: L.LayerGroup, validReports: MapCivicReport[]) => {
    validReports.forEach((r) => {
      const radius = Math.min(45, 15 + (r.actionPriorityScore || 50) * 0.3);
      const intensityColor =
        r.actionPriorityScore >= 80 ? 'rgba(220, 38, 38, 0.45)' :
        r.actionPriorityScore >= 55 ? 'rgba(234, 88, 12, 0.4)' :
        r.actionPriorityScore >= 30 ? 'rgba(234, 179, 8, 0.35)' :
        'rgba(34, 197, 94, 0.3)';

      const circle = L.circle([r.latitude, r.longitude], {
        radius: radius * 12,
        color: 'transparent',
        fillColor: intensityColor,
        fillOpacity: 0.65,
      });

      circle.bindTooltip(`
        <div style="font-weight: 800; font-size: 0.82rem;">
          🔥 ${r.category} Concentration
        </div>
        <div style="font-size: 0.75rem; color: #475569;">
          Priority Score: ${r.actionPriorityScore}/100 • ${r.locationText}
        </div>
      `);

      circle.addTo(group);
    });

    // Also draw individual marker pins over heat circles
    renderIndividualMode(map, group, validReports);
  };

  // MODE 2: MARKER CLUSTERS
  const renderClusterMode = (
    map: L.Map,
    group: L.LayerGroup,
    validReports: MapCivicReport[],
    hotspotData: HotspotMarkerData[]
  ) => {
    // Render hotspots as prominent cluster badges
    hotspotData.forEach((h) => {
      const clusterColor =
        h.attentionLevel === 'HIGH_ATTENTION' ? '#dc2626' :
        h.attentionLevel === 'HIGH_ACTIVITY' ? '#ea580c' :
        '#2563eb';

      const customIcon = L.divIcon({
        className: 'custom-cluster-marker',
        html: `
          <div style="
            background-color: ${clusterColor};
            color: #ffffff;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 0.95rem;
            box-shadow: 0 4px 14px rgba(0,0,0,0.35);
            border: 3px solid #ffffff;
            cursor: pointer;
          ">
            <span>${h.reportCount}</span>
            <span style="font-size: 0.6rem; text-transform: uppercase; font-weight: 700;">Cases</span>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });

      const marker = L.marker([h.centerLat, h.centerLong], { icon: customIcon });

      marker.bindPopup(`
        <div style="padding: 0.25rem; font-family: system-ui, sans-serif; max-width: 240px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
            <span style="font-size: 0.72rem; font-weight: 800; background-color: #fef2f2; color: #dc2626; padding: 0.15rem 0.4rem; borderRadius: 4px;">
              ${h.attentionLevel.replace(/_/g, ' ')}
            </span>
            <span style="font-size: 0.72rem; color: #64748b; font-weight: 700;">250m Radius</span>
          </div>
          <h4 style="font-size: 0.95rem; font-weight: 800; margin: 0 0 0.25rem 0; color: #0f172a;">${h.localityName}</h4>
          <div style="font-size: 0.78rem; color: #334155; margin-bottom: 0.4rem;">
            <strong>${h.reportCount} Reports</strong> • ${h.highPriorityCount} High Priority • Top: ${h.dominantCategory}
          </div>
          <button id="btn-hotspot-${h.hotspotId}" style="
            width: 100%;
            padding: 0.4rem;
            background-color: #0f172a;
            color: #ffffff;
            border: none;
            border-radius: 6px;
            font-size: 0.78rem;
            font-weight: 800;
            cursor: pointer;
          ">
            View Hotspot Intelligence →
          </button>
        </div>
      `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-hotspot-${h.hotspotId}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectHotspot) onSelectHotspot(h);
          };
        }
      });

      marker.addTo(group);
    });

    // Also draw individual report pins
    renderIndividualMode(map, group, validReports);
  };

  // MODE 3: AREA SUMMARY OVERLAYS
  const renderAreaSummaryMode = (map: L.Map, group: L.LayerGroup, hotspotData: HotspotMarkerData[]) => {
    hotspotData.forEach((h) => {
      const polygon = L.circle([h.centerLat, h.centerLong], {
        radius: 280,
        color: '#2563eb',
        fillColor: '#eff6ff',
        fillOpacity: 0.4,
        weight: 2,
        dashArray: '4, 4',
      });

      polygon.bindTooltip(`
        <div style="font-weight: 800; font-size: 0.85rem; color: #1e40af;">
          🏛️ ${h.localityName} Area Intelligence
        </div>
        <div style="font-size: 0.75rem; color: #334155;">
          ${h.reportCount} Reports (${h.highPriorityCount} High Priority) • Most Common: ${h.dominantCategory}
        </div>
      `, { permanent: true, direction: 'top' });

      polygon.addTo(group);
    });
  };

  // MODE 4: INDIVIDUAL REPORT MARKERS
  const renderIndividualMode = (map: L.Map, group: L.LayerGroup, validReports: MapCivicReport[]) => {
    validReports.forEach((r) => {
      const pinColor =
        r.priorityLevel === 'URGENT_REVIEW' || r.actionPriorityScore >= 80 ? '#dc2626' :
        r.priorityLevel === 'HIGH' || r.actionPriorityScore >= 55 ? '#ea580c' :
        r.priorityLevel === 'MEDIUM' || r.actionPriorityScore >= 30 ? '#d97706' :
        '#16a34a';

      const customPin = L.divIcon({
        className: 'custom-report-pin',
        html: `
          <div style="
            background-color: ${pinColor};
            color: #ffffff;
            width: 28px;
            height: 28px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            border: 2px solid #ffffff;
            cursor: pointer;
          ">
            <span style="transform: rotate(45deg); font-size: 0.65rem; font-weight: 900;">${r.actionPriorityScore}</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      const marker = L.marker([r.latitude, r.longitude], { icon: customPin });

      const reportAgeDays = Math.max(0, Math.floor((Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24)));

      marker.bindPopup(`
        <div style="padding: 0.35rem; font-family: system-ui, sans-serif; max-width: 260px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
            <span style="font-size: 0.72rem; font-weight: 800; color: #2563eb; font-family: monospace;">${r.reportCode}</span>
            <span style="font-size: 0.72rem; font-weight: 800; background-color: ${pinColor}20; color: ${pinColor}; padding: 0.15rem 0.4rem; borderRadius: 4px;">
              ${r.priorityLevel} (${r.actionPriorityScore}/100)
            </span>
          </div>

          <h4 style="font-size: 0.92rem; font-weight: 800; margin: 0 0 0.25rem 0; color: #0f172a; line-height: 1.2;">
            ${r.title}
          </h4>

          <div style="font-size: 0.78rem; color: #475569; margin-bottom: 0.5rem; line-height: 1.3;">
            📍 ${r.locationText}<br />
            📂 Category: <strong>${r.category}</strong> • Age: <strong>${reportAgeDays}d ago</strong><br />
            Status: <span style="font-weight: 700; color: #0f172a;">${r.status}</span>
          </div>

          <button id="btn-view-case-${r.id}" style="
            width: 100%;
            padding: 0.45rem;
            background-color: #2563eb;
            color: #ffffff;
            border: none;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 800;
            cursor: pointer;
          ">
            VIEW CASE DETAILS →
          </button>
        </div>
      `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-view-case-${r.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectReport) onSelectReport(r);
            navigate('/authority/dashboard');
          };
        }
      });

      marker.addTo(group);
    });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '540px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
    </div>
  );
};
