"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, FeatureGroup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

// --- FIX: Leaflet Icons in Next.js ---
// Leaflet's default icon paths break in Next.js/Webpack. This fixes it.
const iconFix = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
};

const circleToPolygon = (circle: L.Circle, points = 64) => {
  const center = circle.getLatLng();
  const radius = circle.getRadius(); // in meters
  const coords: [number, number][] = [];

  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI; // radians
    const dx = radius * Math.cos(angle);
    const dy = radius * Math.sin(angle);

    // Approximate meters → lat/lng
    const deltaLat = (dy / 6378137) * (180 / Math.PI); // Earth radius in meters
    const deltaLng =
      ((dx / 6378137) * (180 / Math.PI)) /
      Math.cos((center.lat * Math.PI) / 180);

    coords.push([center.lng + deltaLng, center.lat + deltaLat]);
  }

  return {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [coords] },
    properties: {},
  };
};

// --- CONTROLS: Geoman Implementation ---
const GeomanControls = ({
  onUpdate,
  featureGroupRef,
}: {
  onUpdate: (geojson: any) => void;
  featureGroupRef: React.RefObject<L.FeatureGroup>;
}) => {
  const map = useMap();
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;

    // Initialize Geoman
    // @ts-ignore

    map.pm.addControls({
      position: "topleft",
      drawCircle: true, // keep if you want regular circles
      drawCircleMarker: false, // ❌ disable circle marker
      drawMarker: false, // ❌ disable point markers
      drawPolyline: false, // optional
      drawRectangle: true,
      drawPolygon: true,
      drawText: false, // ❌ disable text
      editMode: true,
      dragMode: true,
      removalMode: true,
    });

    const updateAllLayers = () => {
      const layers = featureGroupRef.current?.getLayers() ?? [];
      const geojson = layers.map((l: any) => {
        if (l instanceof L.Circle) return circleToPolygon(l);
        else return l.toGeoJSON(); // Polygon/Rectangle
      });
      onUpdate(geojson.length > 0 ? geojson : null);
    };

    // When a new layer is created
    map.on("pm:create", (e: any) => {
      const layer = e.layer;
      featureGroupRef.current?.addLayer(layer);

      // Listen for edits on this layer
      layer.on("pm:edit", updateAllLayers);
      layer.on("pm:remove", updateAllLayers);

      updateAllLayers();
    });

    // Global removal/edit in case user removes layers via toolbar
    map.on("pm:remove", (e: any) => {
      const layer = e.layer;
      featureGroupRef.current?.removeLayer(layer); // <-- remove it from FeatureGroup
      updateAllLayers();
    });

    return () => {
      map.pm.removeControls();
      map.off("pm:create");
      map.off("pm:remove");
    };
  }, [map, onUpdate, featureGroupRef]);

  return null;
};

// --- MAIN COMPONENT ---
interface MapProps {
  onUpdate: (geojson: any) => void;
  initialGeoJSON?: any; // Pass this if editing an existing instance
}

export default function Map({ onUpdate, initialGeoJSON }: MapProps) {
  useEffect(() => {
    iconFix();
  }, []);

  const featureGroupRef = useRef<L.FeatureGroup>(null);

  return (
    <div className="h-[480px] w-full rounded-lg overflow-hidden border border-gray-300 relative z-0">
      <MapContainer
        center={[40.344, -74.6514]} // Default: Princeton, NJ
        zoom={14}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <FeatureGroup ref={featureGroupRef} />
        <GeomanControls onUpdate={onUpdate} featureGroupRef={featureGroupRef} />
      </MapContainer>
    </div>
  );
}
