import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import axios from "axios";

// default marker icon fix (Leaflet 1.x issue in React)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});



function AddMarkerOnClick({ setMarkers }) {
  useMapEvents({
    click(e) {
      const newMarker = e.latlng;
      setMarkers((prev) => [...prev, newMarker]);

      // send to backend
      axios.post("http://127.0.0.1:5000/api/markers", newMarker);
    },
  });
  return null;
}

export default function MapView() {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/markers").then((res) => {
      setMarkers(res.data); // array of {lat, lng}
    });
  }, []);

  return (
    <MapContainer center={[1.3521, 103.8198]} zoom={12} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <AddMarkerOnClick setMarkers={setMarkers} />
      
      {markers.map((pos, idx) => (
        <Marker key={idx} position={pos}>
          <Popup>Marker #{idx + 1}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
