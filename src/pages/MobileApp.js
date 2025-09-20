import React, { useState, useRef } from "react";
import MapView from "../components/MapView";
import axios from "axios";
import LoadingOverlay from "../components/LoadingOverlay";
import Popup from "../components/Popup";
import "./MobileApp.css";

const BACKEND_URL = "https://adotriharis.pythonanywhere.com/api/locations"

export default function MobileApp() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupVisible, setPopupVisible] = useState(false);

  const sheetRef = useRef(null);

  const [name, setName] = useState("");
  const [level, setLevel] = useState("ground");
  const [temp, setTemp] = useState([]);
  const [operator, setOperator] = useState("");

  const fullHeight = window.innerHeight * 0.7;
  const collapsedHeight = 0; // fully hidden initially
  const dragStartRef = useRef(0);
  const startTranslateRef = useRef(0);
  const draggingRef = useRef(false);

  const toggleSheet = () => {
    if (!sheetRef.current) return;
    if (sheetOpen) {
      sheetRef.current.style.transform = `translateY(100%)`;
      setSheetOpen(false);
    } else {
      sheetRef.current.style.transform = "translateY(0)";
      setSheetOpen(true);
    }
    sheetRef.current.style.transition = "transform 0.3s ease";
  };

  // Dragging logic
  const handleDragStart = (e) => {
    draggingRef.current = true;
    dragStartRef.current = e.touches ? e.touches[0].clientY : e.clientY;
    const currentTransform = sheetRef.current.style.transform;
    startTranslateRef.current = parseFloat(
      currentTransform.replace("translateY(", "").replace("px)", "")
    );
    sheetRef.current.style.transition = "none";
  };

  const handleDrag = (e) => {
    if (!draggingRef.current || !sheetRef.current) return;
    const currentY = e.touches ? e.touches[0].clientY : e.clientY;
    let delta = currentY - dragStartRef.current;
    let newTranslate = startTranslateRef.current + delta;
    newTranslate = Math.max(0, Math.min(newTranslate, fullHeight)); // constrain
    sheetRef.current.style.transform = `translateY(${newTranslate}px)`;
  };

  const handleDragEnd = () => {
    if (!sheetRef.current) return;
    const rect = sheetRef.current.getBoundingClientRect();
    if (rect.top > window.innerHeight / 2) {
      sheetRef.current.style.transform = `translateY(100%)`;
      setSheetOpen(false);
    } else {
      sheetRef.current.style.transform = "translateY(0)";
      setSheetOpen(true);
    }
    draggingRef.current = false;
    sheetRef.current.style.transition = "transform 0.3s ease";
  };

  const handleTempChange = (option) => {
    if (temp.includes(option)) setTemp(temp.filter((t) => t !== option));
    else setTemp([...temp, option]);
  };

  const handleSubmit = async (e) => {
    
    e.preventDefault();
    if (!navigator.geolocation) {
      setPopupMessage("Geolocation not supported :(");
      setPopupVisible(true);

      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const data = {
        name,
        level,
        temp: temp.join(", "),
        operator,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        folder: "User Input",
      };

      try {
        await axios.post(BACKEND_URL, data);
        setPopupMessage("Location successfully added!");
        setPopupVisible(true);

        sheetRef.current.style.transform = "translateY(100%)";
        setSheetOpen(false);
        // Reset form
        setName("");
        setLevel("ground");
        setTemp([]);
        setOperator("");
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
        setPopupMessage("Failed to add location.");
        setPopupVisible(true);

      }
    });
  };

  const handleCancel = () => {
    sheetRef.current.style.transform = "translateY(100%)";
    setSheetOpen(false);
  };

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
      <MapView />

      {/* Floating Plus Button */}
      <button className="floating-plus-button"
      style={{display: sheetOpen ? "none" : "block"}}
        onClick={toggleSheet}
      >
        +
      </button>

      {/* Bottom Sheet */}
      <div className="bottom-sheet"
        ref={sheetRef}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          height: fullHeight,
          backgroundColor: "white",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          boxShadow: "0 -2px 10px rgba(0,0,0,0.3)",
          transform: "translateY(100%)",
          transition: "transform 0.3s ease",
          zIndex: 999,
          overflowY: "auto",
          touchAction: "none",
          padding: 16,
        }}
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchMove={handleDrag}
        onTouchEnd={handleDragEnd}
      >
        {/* Drag Handle */}
        <div
          style={{
            width: 40,
            height: 6,
            backgroundColor: "#ccc",
            borderRadius: 3,
            margin: "8px auto",
            cursor: "grab",
          }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        ></div>

        {/* Sheet Content */}
        <h3>Add a Location</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 8 }}>
            <label>Name of location:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label>Level:</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              required
              style={{ width: "100%" }}
            >
              {["Ground", "1", "2", "3", "B2", "B3"].map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label>Temperature:</label>
            <div className="temp-options">
                {["Cold", "Hot", "Room temperature"].map((option) => (
                <label key={option} className="temp-option">
                    <input
                    id={option}
                    type="checkbox"
                    checked={temp.includes(option)}
                    onChange={() => handleTempChange(option)}
                    />
                    {option}
                </label>
                ))}
            </div>
            </div>


          <div style={{ marginBottom: 8 }}>
            <label>Operator:</label>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              required
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button class="submit" type="submit" style={{ flex: 1 }}>
              Submit
            </button>
            <button
              type="button"
              onClick={handleCancel}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
        
      {/* Loading Overlay */}
      <LoadingOverlay active={loading} />
      <Popup
        message={popupMessage}
        visible={popupVisible}
        onClose={() => setPopupVisible(false)}
        />

    </div>
  );
}
