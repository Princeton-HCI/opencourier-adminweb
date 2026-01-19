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

const circleToPolygon = (circle: L.Circle, points = 32) => {
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
  initialGeoJSON,
}: {
  onUpdate: (geojson: any) => void;
  featureGroupRef: React.RefObject<L.FeatureGroup>;
  initialGeoJSON?: any;
}) => {
  const map = useMap();
  const isMounted = useRef(false);
  const lastLoadedDataRef = useRef<string | null>(null);

  const updateAllLayers = () => {
    const layers = featureGroupRef.current?.getLayers() ?? [];
    const geojson = layers.map((l: any) => {
      if (l instanceof L.Circle) return circleToPolygon(l);
      else return l.toGeoJSON(); // Polygon/Rectangle
    });
    onUpdate(geojson.length > 0 ? geojson : null);
  };

  // Load initial GeoJSON data
  useEffect(() => {
    if (!initialGeoJSON || !featureGroupRef.current) return;

    // Check if this is the same data we already loaded
    const dataString = JSON.stringify(initialGeoJSON);
    if (lastLoadedDataRef.current === dataString) return;
    lastLoadedDataRef.current = dataString;

    console.log("Loading initial GeoJSON:", initialGeoJSON);

    try {
      // Clear existing layers
      featureGroupRef.current.clearLayers();

      // Convert initial data to Leaflet layers and add to feature group
      const geoJsonLayer = L.geoJSON(initialGeoJSON);
      geoJsonLayer.eachLayer((layer: any) => {
        featureGroupRef.current?.addLayer(layer);

        // Set up event listeners for editing (but don't enable edit mode yet)
        if (layer.pm) {
          layer.on("pm:edit", updateAllLayers);
          layer.on("pm:remove", updateAllLayers);
        }
      });

      // Fit bounds without animation to avoid timing issues
      if (featureGroupRef.current) {
        const bounds = featureGroupRef.current.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], animate: false });
        }
      }
    } catch (error) {
      console.error("Error loading initial GeoJSON:", error);
    }
  }, [initialGeoJSON, featureGroupRef, map]);

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
    <div className="h-[400px] w-4/5 rounded-lg overflow-hidden border border-gray-300 relative z-0">
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
        <GeomanControls
          onUpdate={onUpdate}
          featureGroupRef={featureGroupRef}
          initialGeoJSON={initialGeoJSON}
        />
      </MapContainer>
    </div>
  );
}
