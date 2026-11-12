import { Link } from "react-router-dom";
import "./Weather.css";
import translation from "../translation";
import Logo from "../assets/logo.png";
import SunRise from "../assets/sunrise.png";
import SunSet from "../assets/sunset.png";
import { useEffect, useState } from "react";
import WeatherLocation from "./WeatherLocation";
export default function Weather() {
  const [input, setInput] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [rise, setRise] = useState("");
  const [set, setSet] = useState("");
  const [date, setDate] = useState(new Date());
  const [unit, setUnit] = useState(() => localStorage.getItem("unit") || "C");
  const [windUnit, setWindUnit] = useState(
    () => localStorage.getItem("windUnit") || "m/s",
  );
  const [language, setLanguage] = useState(
    () => localStorage.getItem("language") || "en",
  );
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [fullCountry, setFullCountry] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    function updateUnits() {
      setUnit(localStorage.getItem("unit") || "C");
    }

    window.addEventListener("settingChanged", updateUnits);
    return () => {
      window.removeEventListener("settingChanged", updateUnits);
    };
  }, []);

  useEffect(() => {
    function updateSpeed() {
      setWindUnit(localStorage.getItem("windUnit") || "m/s");
    }

    window.addEventListener("settingChanged", updateSpeed);
    return () => {
      window.removeEventListener("settingChanged", updateSpeed);
    };
  }, []);

  useEffect(() => {
    function updateTheme() {
      const savedTheme = localStorage.getItem("theme") || "light";

      setTheme(savedTheme);

      document.body.classList.remove("light", "dark");
      document.body.classList.add(savedTheme);
    }

    updateTheme();

    window.addEventListener("settingChanged", updateTheme);

    return () => {
      window.removeEventListener("settingChanged", updateTheme);
    };
  }, []);

  useEffect(() => {
    function updateLangaue() {
      setLanguage(localStorage.getItem("language" || "en"));
    }
    window.addEventListener("settingChanged", updateLangaue);

    return () => {
      window.removeEventListener("settingChanged", updateLangaue);
    };
  }, []);

  const t = translation[language];

  const feelLike = weather
    ? unit === "F"
      ? (weather.main.feels_like * 9) / 5 + 32
      : weather.main.feels_like
    : 0;

  const temperature = weather
    ? unit === "F"
      ? (weather.main.temp * 9) / 5 + 32
      : weather.main.temp
    : 0;

  const windSpeed = weather
    ? windUnit === "km/h"
      ? weather.wind.speed * 3.6
      : weather.wind.speed
    : 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  function addInput(e) {
    if (e.key === "Enter") {
      if (input.trim() === "") {
        alert("Enter City");
        return;
      }
      getWeather(input);
      getForecast(input);
      setInput("");
      hideInputBox();
    }
  }

  async function handleLocation({ lat, lon }) {
    await Promise.all([
      getWeatherByCoord(lat, lon),
      getForcastByCoord(lat, lon),
    ]);
  }

  async function getWeatherByCoord(lat, lon) {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_APP_ID}&units=metric`,
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch weather");
      }

      setWeather(data);
      let sunRise = new Date((data.sys.sunrise + data.timezone) * 1000);
      const riseTime = sunRise.toLocaleTimeString("en", {
        timeZone: "UTC",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      setRise(riseTime);

      let sunSet = new Date((data.sys.sunset + data.timezone) * 1000);
      const setTime = sunSet.toLocaleTimeString("en", {
        timeZone: "UTC",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      setSet(setTime);
    } catch (error) {
      console.log(error.message);
    }
  }

  async function getForcastByCoord(lat, lon) {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_APP_ID}&units=metric`,
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch weather");
      }

      setForecast(data);

      let dailyForecast = [];
      let lastDate = "";

      for (let i = 0; i < data.list.length; i++) {
        let dayForecast = data.list[i];
        const date = new Date(dayForecast.dt * 1000);
        const dateStringe = date.toDateString();
        if (dateStringe !== lastDate) {
          dailyForecast.push({
            day: date.toLocaleDateString("en-US", {
              weekday: "short",
            }),
            temperature: Math.round(dayForecast.main.temp),
            icon: dayForecast.weather[0].icon,
          });
          lastDate = dateStringe;

          if (dailyForecast.length === 5) {
            break;
          }
        }
      }

      let hourForecast = data.list.slice(0, 6);

      setHourlyForecast(hourForecast);
      setForecast(dailyForecast);
    } catch (error) {
      console.log(error.message);
    }
  }

  async function getWeather(input) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?units=metric&appid=${import.meta.env.VITE_APP_ID}&q=${encodeURIComponent(input)}&lang=${language}`;
      console.log(import.meta.env.VITE_APP_ID);
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch weather");
      }
      console.log(data);
      setWeather(data);

      let sunRise = new Date((data.sys.sunrise + data.timezone) * 1000);
      const riseTime = sunRise.toLocaleTimeString("en", {
        timeZone: "UTC",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      setRise(riseTime);

      let sunSet = new Date((data.sys.sunset + data.timezone) * 1000);
      const setTime = sunSet.toLocaleTimeString("en", {
        timeZone: "UTC",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      const countryNames = new Intl.DisplayNames(["en"], {
        type: "region",
      });

      const fullNames = countryNames.of(data.sys.country);

      setFullCountry(fullNames);

      setSet(setTime);
    } catch (error) {
      alert(error.message);
    }
  }

  async function getForecast(input) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=${import.meta.env.VITE_APP_ID}&q=${encodeURIComponent(input)}&lang=${language}`;
    const res = await fetch(forecastUrl);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch weather");
    }
    console.log(data);

    let dailyForecast = [];
    let lastDate = "";

    for (let i = 0; i < data.list.length; i++) {
      let dayForecast = data.list[i];
      const date = new Date(dayForecast.dt * 1000);
      const dateStringe = date.toDateString();
      if (dateStringe !== lastDate) {
        dailyForecast.push({
          day: date.toLocaleDateString("en-US", {
            weekday: "short",
          }),

          temperature: Math.round(dayForecast.main.temp),

          icon: dayForecast.weather[0].icon,
        });
        lastDate = dateStringe;

        if (dailyForecast.length === 5) {
          break;
        }
      }
    }

    let hourForecast = data.list.slice(0, 6);

    setHourlyForecast(hourForecast);
    setForecast(dailyForecast);
  }

  function showInputBox() {
    setShowSearch(true);
  }

  function hideInputBox() {
    setShowSearch(false);
  }

  function showMenus() {
    setShowMenu(true);
  }

  function hideMenus() {
    setShowMenu(false);
  }

  useEffect(() => {
    getWeather("Enugu");
    getForecast("Enugu");
  }, []);
  return (
    <div className={`weather-main ${theme}`}>
      <div className="weather-header">
        <div className="weather-top">
          <div className="weather-menu" onClick={showMenus}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div
            className="weather-overlay"
            style={
              window.innerWidth <= 600
                ? {
                    visibility: showMenu ? "visible" : "hidden",
                  }
                : {}
            }
            onClick={hideMenus}
          ></div>
          <div className="weather-logos">
            <img src={Logo} className="weather-logo-icon" />
            <div className="weather-logo">
              Sky<span>Cast</span>
            </div>
          </div>
          <div className="weather-search-icon" onClick={showInputBox}>
            <i className="fa-solid fa-magnifying-glass"></i>
          </div>
          <div
            className="weather-input-box"
            style={
              window.innerWidth <= 600
                ? {
                    transform: showSearch
                      ? "translateY(0)"
                      : "translateY(-100%)",
                  }
                : {}
            }
          >
            <div className="weather-arrow-icon" onClick={hideInputBox}>
              <i className="fa-solid fa-arrow-left"></i>
            </div>
            <input
              type="text"
              value={input}
              placeholder="Search for city"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={addInput}
              className="weather-input"
            />

            <div
              className="weather-clear-icon"
              style={{ visibility: input ? "visible" : "hidden" }}
            >
              <i
                className="fa-solid fa-xmark"
                onClick={(e) => setInput("")}
              ></i>
            </div>
          </div>

          <div
            className="weather-nav"
            style={
              window.innerWidth <= 600
                ? {
                    transform: showMenu ? "translateX(0)" : "translateX(-100%)",
                  }
                : {}
            }
          >
            <div className="weather-home-icon">
              <Link to="/">
                <i className="fa-solid fa-house"></i>
              </Link>
            </div>

            <ul>
              <li>
                <Link to="/" className="active">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/forecast">Forecast</Link>
              </li>

              <li>
                <Link to="/setting">Settings</Link>
              </li>
            </ul>
          </div>

          <div className="sun-icon">
            <WeatherLocation onLocationFound={handleLocation} />
          </div>
        </div>
      </div>
      {weather && (
        <div className="weather-main-page">
          <div className="first-second">
            <div className="first">
              <div className="place">
                <p className="location">
                  {weather.name}, {fullCountry}
                </p>
                <div className="date-time">
                  <p>
                    {date.toLocaleDateString("en", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    /{" "}
                  </p>
                  <p>
                    {date.toLocaleTimeString("en", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>

              <div className="icon-temp">
                <img
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  className="real-icon"
                />

                <div className="temp-other">
                  <p className="temp">
                    {Math.round(temperature)}
                    <sup>°{unit}</sup>
                  </p>
                  <p className="nowrap">{weather.weather[0].description}</p>
                  <p className="nowrap">
                    {t.feelsLike} {""}
                    <span>
                      {Math.round(feelLike)}°{unit}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="second">
              <div className="sun-rise-set">
                <div className="weather-rise-box">
                  <img src={SunRise} className="weather-rise-icon" />
                  <div className="weather-sun-rise">
                    <p>{t.sunrise}</p>
                    <p>{rise}</p>
                  </div>
                </div>

                <div className="weather-set-box">
                  <img src={SunSet} className="weather-set-icon" />
                  <div className="weather-sun-set">
                    <p>{t.sunset}</p>
                    <p>{set}</p>
                  </div>
                </div>
              </div>

              <div className="card-info">
                <div className="card">
                  <div className="cards">
                    <i className="fa-solid fa-droplet"></i>
                    <p className="nowrap">{t.humidity}</p>
                  </div>
                  <p>{Math.round(weather.main.humidity)}%</p>
                </div>

                <div className="card">
                  <div className="cards">
                    <i className="fa-solid fa-wind"></i>
                    <p className="nowrap">{t.windSpeed}</p>
                  </div>
                  <p>
                    {Math.round(windSpeed)} {windUnit}
                  </p>
                </div>

                <div className="card">
                  <div className="cards">
                    <i className="fa-solid fa-temperature-half"></i>
                    <p className="nowrap">{t.feelsLike}</p>
                  </div>
                  <p>
                    {Math.round(feelLike)}°{unit}
                  </p>
                </div>

                <div className="card">
                  <div className="cards">
                    <i className="fa-solid fa-gauge-high"></i>
                    <p className="nowrap">{t.pressure}</p>
                  </div>
                  <p>{weather.main.pressure} hPa</p>
                </div>
              </div>
            </div>
          </div>

          <div className="weather-forecast">
            <div className="weather-daily-forecast">
              <h3>{t.dailyForecast}</h3>
              <div className="weather-dailys">
                {forecast.map((item, index) => (
                  <div className="weather-daily" key={index}>
                    <p>{item.day}</p>
                    <img
                      src={`https://openweathermap.org/img/wn/${item.icon}.png`}
                      className="weather-day-icon"
                    />
                    <p>
                      {Math.round(
                        unit === "F"
                          ? (item.temperature * 9) / 5 + 32
                          : item.temperature,
                      )}
                      °{unit}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="weather-hourly-forecast">
              <h3>{t.hourlyForecast}</h3>
              <div className="weather-hourlys">
                {hourlyForecast.map((item) => (
                  <div className="weather-hourly" key={item.dt}>
                    <p>
                      {new Date(item.dt * 1000).toLocaleTimeString("en", {
                        hour: "numeric",
                        hour12: true,
                      })}
                    </p>
                    <img
                      src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                      className="weather-hour-icon"
                    />
                    <p>
                      {Math.round(
                        unit === "F"
                          ? (item.main.temp * 9) / 5 + 32
                          : item.main.temp,
                      )}
                      °{unit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
