import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";

import { useEffect, useState } from "react";
import Logo from "../assets/logo.png";
import WeatherLocation from "./WeatherLocation";

// Popular cities
const popCities = ["Enugu", "Lagos", "London", "Dubai", "Mumbai"];

// OpenWeather API
const API_KEY = import.meta.env.VITE_APP_ID;

const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";

// Leaflet marker icon
const weatherIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Get full country name
function getCountryName(code) {
  if (!code) return "";

  try {
    return new Intl.DisplayNames(["en"], {
      type: "region",
    }).of(code);
  } catch {
    return code;
  }
}

// Reusable temperature conversion
function convertTemperature(temp, unit) {
  if (unit === "F") {
    return (temp * 9) / 5 + 32;
  }

  return temp;
}

// Change map position when selected weather changes
function ChangeMap({ weather }) {
  const map = useMap();

  useEffect(() => {
    if (weather?.coord) {
      map.flyTo([weather.coord.lat, weather.coord.lon], 10, { duration: 1.5 });
    }
  }, [weather, map]);

  return null;
}

// Custom map controls
function MapControls({ onLocate, locateLoading }) {
  const map = useMap();

  return (
    <>
      <div className="controls">
        <button
          className="locate-btn"
          title="My location"
          onClick={onLocate}
          disabled={locateLoading}
        >
          <i
            className={`fa-solid ${
              locateLoading ? "fa-spinner fa-spin" : "fa-location-crosshairs"
            }`}
          ></i>
        </button>

        <div className="map-controls">
          <button title="Zoom in" onClick={() => map.zoomIn()}>
            <i className="fa-solid fa-plus"></i>
          </button>

          <button title="Zoom out" onClick={() => map.zoomOut()}>
            <i className="fa-solid fa-minus"></i>
          </button>
        </div>
      </div>
    </>
  );
}

export default function Map() {
  const [input, setInput] = useState("");

  const [weather, setWeather] = useState(null);
  const [cities, setCities] = useState([]);

  const [loading, setLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [locateLoading, setLocateLoading] = useState(false);

  const [error, setError] = useState("");
  const [fullCountry, setFullCountry] = useState("");

  const [selectedCity, setSelectedCity] = useState("Enugu");

  const [unit, setUnit] = useState(() => localStorage.getItem("unit") || "C");

  const [windUnit, setWindUnit] = useState(
    () => localStorage.getItem("windUnit") || "m/s",
  );

  const [language, setLanguage] = useState(
    () => localStorage.getItem("language") || "en",
  );

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );

  const [mapLayer, setMapLayer] = useState("standard");

  const [showSearch, setShowSearch] = useState(false);

  // --------------------------------
  // SETTINGS LISTENER
  // --------------------------------

  useEffect(() => {
    function updateSettings() {
      setUnit(localStorage.getItem("unit") || "C");

      setWindUnit(localStorage.getItem("windUnit") || "m/s");

      setLanguage(localStorage.getItem("language") || "en");

      const savedTheme = localStorage.getItem("theme") || "light";

      setTheme(savedTheme);

      document.body.classList.remove("light", "dark");
      document.body.classList.add(savedTheme);
    }

    updateSettings();

    window.addEventListener("settingChanged", updateSettings);

    return () => {
      window.removeEventListener("settingChanged", updateSettings);
    };
  }, []);

  // --------------------------------
  // FETCH WEATHER FOR ONE CITY
  // --------------------------------

  async function fetchCityWeather(city) {
    const url =
      `${WEATHER_URL}?q=${encodeURIComponent(city)}` +
      `&units=metric&appid=${API_KEY}&lang=${language}`;

    const response = await fetch(url);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to get weather information");
    }

    return data;
  }

  // --------------------------------
  // GET CURRENT WEATHER
  // --------------------------------

  async function getWeather(city) {
    if (!city?.trim()) return;

    setLoading(true);
    setError("");

    try {
      const result = await fetchCityWeather(city);

      setWeather(result);

      setSelectedCity(result.name);

      setFullCountry(getCountryName(result.sys?.country));

      setInput("");
    } catch (err) {
      setError(
        err.message === "city not found"
          ? "City not found. Please check your spelling."
          : err.message,
      );
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------
  // GET POPULAR CITIES
  // --------------------------------

  async function getPopCities() {
    setCitiesLoading(true);

    const results = await Promise.all(
      popCities.map(async (city) => {
        try {
          return await fetchCityWeather(city);
        } catch (err) {
          console.error(`Could not load ${city}:`, err);

          return null;
        }
      }),
    );

    setCities(results.filter(Boolean));

    setCitiesLoading(false);
  }

  // --------------------------------
  // INITIAL LOAD
  // --------------------------------

  useEffect(() => {
    getWeather("Enugu");
    getPopCities();
  }, [language]);

  // --------------------------------
  // SEARCH CITY
  // --------------------------------

  function addInput(e) {
    e.preventDefault();

    if (!input.trim()) {
      setError("Please enter a city name.");
      return;
    }

    getWeather(input.trim());
  }

  // --------------------------------
  // CLEAR SEARCH
  // --------------------------------

  function clearSearch() {
    setInput("");
    setError("");
  }

  // --------------------------------
  // SELECT POPULAR CITY
  // --------------------------------

  function selectCity(city) {
    getWeather(city.name);
  }

  // --------------------------------
  // GET DEVICE LOCATION
  // --------------------------------

  function getMyLocation() {
    if (!navigator.geolocation) {
      setError("Your browser does not support location.");
      return;
    }

    setLocateLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const url =
            `${WEATHER_URL}?lat=${latitude}` +
            `&lon=${longitude}` +
            `&units=metric&appid=${API_KEY}` +
            `&lang=${language}`;

          const response = await fetch(url);
          const result = await response.json();

          if (!response.ok) {
            throw new Error(
              result.message || "Unable to get your location weather.",
            );
          }

          setWeather(result);
          setSelectedCity(result.name);
          setFullCountry(getCountryName(result.sys?.country));
        } catch (err) {
          setError(err.message);
        } finally {
          setLocateLoading(false);
        }
      },

      (err) => {
        const messages = {
          1: "Location permission was denied.",
          2: "Your location is unavailable.",
          3: "Location request timed out.",
        };

        setError(messages[err.code] || "Unable to get your location.");

        setLocateLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  }

  // --------------------------------
  // TEMPERATURE AND WIND
  // --------------------------------

  const temperature = weather ? convertTemperature(weather.main.temp, unit) : 0;

  const feelLike = weather
    ? convertTemperature(weather.main.feels_like, unit)
    : 0;

  const windSpeed = weather
    ? windUnit === "km/h"
      ? weather.wind.speed * 3.6
      : weather.wind.speed
    : 0;

  // --------------------------------
  // RENDER
  // --------------------------------

  return (
    <div className={`map-main ${theme}`}>
      {/* HEADER */}

      <div className="map-header">
        <div className="map-top">
          <button
            className="map-menu"
            onClick={() => setShowSearch(!showSearch)}
            title="Search city"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className="map-overlay"></div>

          {/* LOGO */}

          <div className="map-logos">
            <img src={Logo} className="map-logo-icon" alt="SkyCast logo" />

            <div className="logo">
              Sky<span>Cast</span>
            </div>
          </div>

          {/* SEARCH ICON */}

          <button
            className="map-search-icon"
            onClick={() => setShowSearch(!showSearch)}
            title="Search"
          >
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>

          {/* SEARCH BOX */}

          <form
            className={`map-input-box ${showSearch ? "show-search" : ""}`}
            onSubmit={addInput}
          >
            <button
              type="button"
              className="map-arrow-icon"
              onClick={() => setShowSearch(false)}
              title="Close search"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>

            <input
              type="text"
              value={input}
              placeholder="Search for city"
              onChange={(e) => setInput(e.target.value)}
              className="map-input"
            />

            <button
              type="button"
              className="map-clear-icon"
              onClick={clearSearch}
              title="Clear search"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <button type="submit" className="map-submit-btn" disabled={loading}>
              {loading ? (
                <i className="fa-solid fa-spinner fa-spin"></i>
              ) : (
                <i className="fa-solid fa-magnifying-glass"></i>
              )}
            </button>
          </form>

          {/* NAVIGATION */}

          <div className="map-nav">
            <div className="map-home-icon">
              <Link to="/">
                <i className="fa-solid fa-house"></i>
              </Link>
            </div>

            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>

              <li>
                <Link to="/forecast">Forecast</Link>
              </li>

              <li>
                <Link to="/map" className="active">
                  Map
                </Link>
              </li>

              <li>
                <Link to="/setting">Settings</Link>
              </li>
            </ul>
          </div>

          <div className="sun-icon">
            <WeatherLocation />
          </div>
        </div>
      </div>

      {/* MAIN PAGE */}

      <div className="map-main-page">
        {/* ERROR MESSAGE */}

        {error && (
          <div className="map-error">
            <p>{error}</p>

            <button onClick={() => setError("")}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        )}

        {/* CURRENT WEATHER */}

        {weather && (
          <div className="current-info-box">
            <div className="current-city">
              <p>
                <span>
                  <i className="fa-solid fa-location-dot"></i>
                </span>
                Current Location
              </p>

              <h3>
                {weather.name}, {fullCountry}
              </h3>
            </div>

            <div className="temp-detailed">
              <div className="temp-descript">
                <div className="icon-temp">
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                    className="temp-icon"
                    alt="Weather"
                  />

                  <p className="temp">
                    {Math.round(temperature)}
                    <sup>°{unit}</sup>
                  </p>
                </div>

                <p>{weather.weather[0].description}</p>
              </div>

              <div className="detailed">
                <p>
                  <span>
                    <i className="fa-solid fa-temperature-half"></i>
                  </span>
                  Feels Like:
                  <span>
                    {Math.round(feelLike)}°{unit}
                  </span>
                </p>

                <p>
                  <span>
                    <i className="fa-solid fa-droplet"></i>
                  </span>
                  Humidity:
                  <span>{weather.main.humidity}%</span>
                </p>

                <p>
                  <span>
                    <i className="fa-solid fa-wind"></i>
                  </span>
                  Wind Speed:
                  <span>
                    {windSpeed.toFixed(1)} {windUnit}
                  </span>
                </p>

                <p>
                  <span>
                    <i className="fa-solid fa-gauge-high"></i>
                  </span>
                  Pressure:
                  <span>{weather.main.pressure} hPa</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MAP SECTION */}

        <div className="map-section">
          <div className="map-title">
            <h2>Weather Map</h2>

            <p>Explore weather conditions around the world</p>
          </div>

          {/* MAP LAYER OPTIONS */}

          <div className="map-layers">
            <label>
              <input
                type="radio"
                name="mapLayer"
                value="standard"
                checked={mapLayer === "standard"}
                onChange={() => setMapLayer("standard")}
              />

              <span>Standard</span>
            </label>

            <label>
              <input
                type="radio"
                name="mapLayer"
                value="satellite"
                checked={mapLayer === "satellite"}
                onChange={() => setMapLayer("satellite")}
              />

              <span>Satellite</span>
            </label>
          </div>

          {/* LEAFLET MAP */}

          <div className="leaflet-map">
            <MapContainer
              center={
                weather
                  ? [weather.coord.lat, weather.coord.lon]
                  : [6.5244, 7.5105]
              }
              zoom={6}
              scrollWheelZoom={true}
              zoomControl={false}
              style={{
                height: "100%",
                width: "100%",
              }}
            >
              {/* STANDARD AND SATELLITE TILES */}

              {mapLayer === "standard" ? (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              ) : (
                <TileLayer
                  attribution="Tiles &copy; Esri"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              )}

              {/* CURRENT SELECTED CITY */}

              {weather && (
                <>
                  <ChangeMap weather={weather} />

                  <Marker
                    position={[weather.coord.lat, weather.coord.lon]}
                    icon={weatherIcon}
                  >
                    <Popup>
                      <div className="weather-popup">
                        <h3>
                          {weather.name}, {fullCountry}
                        </h3>

                        <img
                          src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                          alt="Weather icon"
                        />

                        <h2>
                          {Math.round(temperature)}°{unit}
                        </h2>

                        <p>{weather.weather[0].description}</p>

                        <p>Humidity: {weather.main.humidity}%</p>
                      </div>
                    </Popup>
                  </Marker>
                </>
              )}

              {/* POPULAR CITY MARKERS */}

              {cities.map((city) => (
                <Marker
                  key={city.id}
                  position={[city.coord.lat, city.coord.lon]}
                  icon={weatherIcon}
                  eventHandlers={{
                    click: () => selectCity(city),
                  }}
                >
                  <Popup>
                    <div className="weather-popup">
                      <h3>
                        {city.name}, {getCountryName(city.sys.country)}
                      </h3>

                      <img
                        src={`https://openweathermap.org/img/wn/${city.weather[0].icon}@2x.png`}
                        alt="Weather icon"
                      />

                      <h2>
                        {Math.round(convertTemperature(city.main.temp, unit))}°
                        {unit}
                      </h2>

                      <p>{city.weather[0].description}</p>

                      <p>Humidity: {city.main.humidity}%</p>

                      <button onClick={() => selectCity(city)}>
                        View weather
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* MAP BUTTONS */}

              <MapControls
                onLocate={getMyLocation}
                locateLoading={locateLoading}
              />
            </MapContainer>
          </div>
        </div>

        {/* POPULAR CITIES */}

        <div className="quick-cities">
          <div className="quick-city-heading">
            <div>
              <h3>Popular Cities</h3>

              <p>Check weather conditions in different cities</p>
            </div>
          </div>

          <div className="popular">
            {citiesLoading ? (
              <div className="city-loading">
                <i className="fa-solid fa-spinner fa-spin"></i>
                Loading popular cities...
              </div>
            ) : cities.length > 0 ? (
              cities.map((city) => (
                <button
                  className={`city ${
                    selectedCity.toLowerCase() === city.name.toLowerCase()
                      ? "selected-city"
                      : ""
                  }`}
                  key={city.id}
                  onClick={() => selectCity(city)}
                >
                  <p className="city-name">
                    {city.name}, {getCountryName(city.sys.country)}
                  </p>

                  <div className="city-temp-icon-descript">
                    <img
                      className="city-icon"
                      src={`https://openweathermap.org/img/wn/${city.weather[0].icon}@2x.png`}
                      alt="Weather"
                    />

                    <div className="city-temp-descript">
                      <p>
                        {Math.round(convertTemperature(city.main.temp, unit))}°
                        {unit}
                      </p>

                      <p>{city.weather[0].description}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <p>Unable to load popular cities.</p>
            )}
          </div>
        </div>

        {/* WEATHER LEGEND */}

        <div className="weather-legend">
          <div>
            <span>☀️</span>
            Sunny
          </div>

          <div>
            <span>🌤️</span>
            Partly Cloudy
          </div>

          <div>
            <span>☁️</span>
            Cloudy
          </div>

          <div>
            <span>🌧️</span>
            Rain
          </div>

          <div>
            <span>⛈️</span>
            Thunderstorm
          </div>

          <div>
            <span>❄️</span>
            Snow
          </div>
        </div>
      </div>
    </div>
  );
}
