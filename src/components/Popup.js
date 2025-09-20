// Popup.js
import React from "react";

export default function Popup({ message, onClose, visible }) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 3000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px 24px",
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          maxWidth: "90%",
          textAlign: "center",
          animation: "fadeIn 0.2s ease",
        }}
      >
        <p style={{ marginBottom: 16 }}>{message}</p>
        <button
          onClick={onClose}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "8px 16px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          OK
        </button>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0; transform: scale(0.95); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}
