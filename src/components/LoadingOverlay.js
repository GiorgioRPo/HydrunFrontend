// LoadingOverlay.js
import React from "react";

export default function LoadingOverlay({ active }) {
  if (!active) return null;

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
        zIndex: 2000,
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          border: "6px solid #ccc",
          borderTop: "6px solid #007bff",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      ></div>

      {/* Spinner animation keyframes */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
