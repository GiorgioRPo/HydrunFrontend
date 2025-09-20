import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import axios from "axios";

// default marker icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

// Folder color mapping
const folderColors = {
  "Mandai Wildlife Reserve (Ticketed)": "blue",
  "Unverified: Google Forms": "yellow",
  "Verified: Google Forms": "green",
  "User Input": "red"
};

function getColoredMarker(color) {
  return new L.Icon({
    iconUrl: `/icons/marker-icon-2x-${color}.png`,
    iconRetinaUrl: `/icons/marker-icon-2x-${color}.png`,
    shadowUrl: "/icons/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });
}

// Component to move map to current position
function FlyToCurrent({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 16); // zoom in
    }
  }, [position, map]);
  return null;
}

export default function MapView() {
  const [markers, setMarkers] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [nearestMarker, setNearestMarker] = useState(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/locations")
      .then(res => setMarkers(res.data))
      .catch(err => console.error(err));

    // get current position
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const curr = [pos.coords.latitude, pos.coords.longitude];
        setCurrentPosition(curr);

        // find nearest marker
        axios.get("http://127.0.0.1:5000/api/locations")
          .then(res => {
            const locs = res.data;
            if (locs.length === 0) return;
            let minDist = Infinity;
            let nearest = null;

            locs.forEach(m => {
              const d = getDistanceKm(curr, [m.lat, m.lng]);
              if (d < minDist) {
                minDist = d;
                nearest = m;
              }
            });
            setNearestMarker(nearest);
            setDistance(minDist);
          });
      });
    }
  }, []);

  // Haversine formula for distance in km
  const getDistanceKm = ([lat1, lon1], [lat2, lon2]) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <MapContainer center={[1.3521, 103.8198]} zoom={12} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {markers.map((loc, idx) => {
        const color = folderColors[loc.folder] || "red";
        const icon = getColoredMarker(color);
        return (
          <Marker key={idx} position={[loc.lat, loc.lng]} icon={icon}>
            <Popup>
              <strong>{loc.name}</strong> <br />
              Source: {loc.folder} <br />
              Level: {loc.level} <br />
              Available Temperatures: {loc.temp} <br />
              Operator: {loc.operator}
            </Popup>
          </Marker>
        );
      })}

      {currentPosition && (
        <Marker position={currentPosition} icon={getColoredMarker("red")}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {currentPosition && nearestMarker && (
        <>
          <Polyline
            positions={[currentPosition, [nearestMarker.lat, nearestMarker.lng]]}
            color="blue"
          />
          <Marker position={[
            (currentPosition[0] + nearestMarker.lat)/2,
            (currentPosition[1] + nearestMarker.lng)/2
          ]} icon={L.divIcon({
            className: 'distance-label',
            html: `<b>${distance.toFixed(2)} km</b>`
          })} interactive={false} />
        </>
      )}

      {currentPosition && <FlyToCurrent position={currentPosition} />}
    </MapContainer>
  );
}
