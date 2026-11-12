import { useState } from "react";

export default function WeatherLocation({ onLocationFound }) {
  function getLocation() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        console.log("Latitude:", lat);
        console.log("Longitude:", lon);
        console.log("Accuracy:", position.coords.accuracy, "meters");

        onLocationFound({ lat, lon });
      },

      (error) => {
        alert("Resquest failed");
        console.log(error.message);
      },
    );
  }

  return (
    <div>
      <button
        onClick={getLocation}
        style={{
          color: "blue",
          fontSize: "20px",
          background: "none",
          border: "none",
        }}
      >
        <i className="fa-solid fa-location-dot"></i>
      </button>
    </div>
  );
}
