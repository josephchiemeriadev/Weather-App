import { Link } from "react-router-dom";
import { useState } from "react";
import "./Setting.css";
import Logo from "../assets/logo.png";
import WeatherLocation from "./WeatherLocation";
import translation from "../translation";
export default function Setting() {
  const [unit, setUnit] = useState(() => localStorage.getItem("unit") || "C");
  const [windUnit, setWindUnit] = useState(
    () => localStorage.getItem("windUnit") || "m/s",
  );
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [language, setLanguage] = useState(
    () => localStorage.getItem("language") || "en",
  );
  const [showMenu, setShowMenu] = useState(false);
  function saveChanges() {
    localStorage.setItem("unit", unit);
    localStorage.setItem("windUnit", windUnit);
    localStorage.setItem("theme", theme);
    localStorage.setItem("language", language);
    alert("Saved successfully");
    window.dispatchEvent(new Event("settingChanged"));
  }

  function resetChanges() {
    setUnit("C");
    setWindUnit("m/s");
    setTheme("light");
    setLanguage("en");

    localStorage.removeItem("unit");
    localStorage.removeItem("windUnit");
    localStorage.removeItem("theme");
    localStorage.removeItem("language");
    alert("Reset successfully");
    window.dispatchEvent(new Event("settingChanged"));
  }

  const t = translation[language];

  function showMenus() {
    setShowMenu(true);
  }

  function hideMenus() {
    setShowMenu(false);
  }
  return (
    <div className="setting-main">
      <div className="setting-header">
        <div className="setting-top">
          <div className="setting-menu" onClick={showMenus}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div
            className="setting-overlay"
            style={
              window.innerWidth <= 600
                ? {
                    visibility: showMenu ? "visible" : "hidden",
                  }
                : {}
            }
            onClick={hideMenus}
          ></div>
          <div className="setting-logos">
            <img src={Logo} className="setting-logo-icon" />
            <div className="setting-logo">
              Sky<span>Cast</span>
            </div>
          </div>
          <div className="setting-search-icon">
            <i className="fa-solid fa-magnifying-glass"></i>
          </div>
          <div className="setting-input-box">
            <div className="setting-arrow-icon">
              <i className="fa-solid fa-arrow-left"></i>
            </div>
            <input
              type="text"
              placeholder="Search for city"
              className="setting-input"
            />

            <div className="setting-clear-icon">
              <i className="fa-solid fa-xmark"></i>
            </div>
          </div>

          <div
            className="setting-nav"
            style={
              window.innerWidth <= 600
                ? {
                    transform: showMenu ? "translateX(0)" : "translateX(-100%)",
                  }
                : {}
            }
          >
            <div className="setting-home-icon">
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
                <Link to="/setting" className="active">
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          <div className="sun-icon">
            <WeatherLocation />
          </div>
        </div>
      </div>
      <div className="setting-main-page">
        <div className="topic">
          <h2>
            <span>
              <i className="fa-solid fa-gear"></i>
            </span>
            Settings
          </h2>
          <p>Customize your weather experience</p>
        </div>

        <div className="setting-box">
          <div className="selection">
            <div className="select">
              <div className="box">
                <div className="icon">
                  <i className="fa-solid fa-temperature-half"></i>
                </div>
                <div className="box-text">
                  <h4>Temperature Unit</h4>
                  <p>Choose your temperature unit</p>
                </div>
              </div>

              <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="C">°C</option>
                <option value="F">°F</option>
              </select>
            </div>

            <div className="select">
              <div className="box">
                <div className="icon">
                  <i className="fa-solid fa-wind"></i>
                </div>
                <div className="box-text">
                  <h4>Wind Speed Unit</h4>
                  <p>Choose your wind unit</p>
                </div>
              </div>

              <select
                value={windUnit}
                onChange={(e) => setWindUnit(e.target.value)}
              >
                <option value="m/s">m/s</option>
                <option value="km/h">km/h</option>
              </select>
            </div>

            <div className="select">
              <div className="box">
                <div className="icon">
                  <i className="fa-solid fa-palette"></i>
                </div>
                <div className="box-text">
                  <h4>Theme</h4>
                  <p>Choose your app theme</p>
                </div>
              </div>

              <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="select">
              <div className="box">
                <div className="icon">
                  <i className="fa-solid fa-globe"></i>
                </div>
                <div className="box-text">
                  <h4>Language</h4>
                  <p>Choose your language</p>
                </div>
              </div>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
          </div>

          <div className="about">
            <div className="detail">
              <div className="detail-icon">
                <i className="fa-solid fa-info"></i>
              </div>
              <div className="detail-text">
                <h4>About SkyCast</h4>
                <p id="text">
                  SkyCast provides accurate and up-to-date weather info to help
                  you plan your day better.
                </p>
              </div>
            </div>
            <div className="version">
              <p>App Version 1.0.0</p>
            </div>
          </div>

          <div className="buttons">
            <button onClick={resetChanges}>
              <span>
                <i className="fa-solid fa-rotate-left"></i>
              </span>
              Reset to Default
            </button>

            <button onClick={saveChanges}>
              <span>
                <i className="fa-solid fa-floppy-disk"></i>
              </span>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
