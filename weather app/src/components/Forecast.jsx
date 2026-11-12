import { Link } from "react-router-dom";
import translation from "../translation";
import Logo from "../assets/logo.png";
import Line from "../assets/line.png";
import SunRise from "../assets/sunrise.png";
import SunSet from "../assets/sunset.png";
import WeatherLocation from "./WeatherLocation";
import "./Forecast.css";
import NewMoon from "../assets/moons/new-moon.png";
import WaxingCrescent from "../assets/moons/waxing-crescent.png";
import FirstQuarter from "../assets/moons/first-quarter.png";
import WaxingGibbous from "../assets/moons/waxing-gibbous.png";
import FullMoon from "../assets/moons/full-moon.png";
import WaningGibbous from "../assets/moons/waning-gibbous.png";
import ThirdQuarter from "../assets/moons/third-quarter.png";
import WaningCrescent from "../assets/moons/waning-crescent.png";
import { useEffect, useState } from "react";

export default function Forecast() {
  const [unit, setUnit] = useState(() => localStorage.getItem("unit") || "C");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [language, setLanguage] = useState(
    () => localStorage.getItem("language") || "en",
  );
  const [input, setInput] = useState("");
  const [weather, setWeather] = useState(null);
  const [dailyForecast, setDailyForecast] = useState([]);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [rise, setRise] = useState("");
  const [set, setSet] = useState("");
  const [fullCountry, setFullCountry] = useState("");
  const [moon, setMoon] = useState("");
  const [moonImage, setMoonImage] = useState("");
  const [air, setAir] = useState("");
  const [aqi, setAqi] = useState("");
  const [aqiCircle, setAqiCircle] = useState("");
  const [component, setComponent] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  function addInput(e) {
    if (e.key === "Enter") {
      if (!input) {
        alert("Enter city");
        return;
      }
      getWeather(input);
      getForecast(input);

      setInput("");
    }
  }

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

  async function getWeather(input) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?units=metric&appid=${import.meta.env.VITE_APP_ID}&q=${encodeURIComponent(input)}&lang=${language}`;
      console.log(import.meta.env.VITE_APP_ID);
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch weather");
      }

      const countryNames = new Intl.DisplayNames(["en"], {
        type: "region",
      });

      const fullNames = countryNames.of(data.sys.country);

      console.log(data);
      setFullCountry(fullNames);
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
      getMoon(data.coord.lat, data.coord.lon);
      getAir(data.coord.lat, data.coord.lon);
    } catch (error) {
      alert(error.message);
    }
  }

  async function getForecast(input) {
    try {
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=${import.meta.env.VITE_APP_ID}&q=${encodeURIComponent(input)}&lang=${language}`;
      const res = await fetch(forecastUrl);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch weather");
      }
      console.log(data);

      let dailyForecasts = [];
      let lastDate = "";

      for (let i = 0; i < data.list.length; i++) {
        let dayForecast = data.list[i];
        const date = new Date(dayForecast.dt * 1000);
        let dateStringe = date.toDateString();
        if (dateStringe !== lastDate) {
          dailyForecasts.push({
            day: date.toLocaleDateString("en", {
              weekday: "short",
            }),
            temperature: Math.round(dayForecast.main.temp),
            icon: dayForecast.weather[0].icon,
            description: dayForecast.weather[0].description,
            pop: Math.max(dayForecast.pop),
          });

          lastDate = dateStringe;

          if (dailyForecasts.length === 5) {
            break;
          }
        }
      }

      let hourForecast = data.list.slice(0, 8);

      setHourlyForecast(hourForecast);
      setDailyForecast(dailyForecasts);
    } catch (error) {
      alert(error.message);
    }
  }

  async function getMoon(lat, lon) {
    const moonUrl = `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lon}`;

    const res = await fetch(moonUrl);
    const data = await res.json();

    console.log(data);
    setMoon(data.results);
    getMoonImage(data.results.moon_phase);
  }

  function getMoonImage(phase) {
    if (phase === "New Moon") {
      setMoonImage(NewMoon);
    } else if (phase === "Waxing Crescent") {
      setMoonImage(WaxingCrescent);
    } else if (phase === "First Quarter") {
      setMoonImage(FirstQuarter);
    } else if (phase === "Waxing Gibbous") {
      setMoonImage(WaxingGibbous);
    } else if (phase === "Full Moon") {
      setMoonImage(FullMoon);
    } else if (phase === "Waning Gibbous") {
      setMoonImage(WaningGibbous);
    } else if (phase === "Last Quarter") {
      setMoonImage(ThirdQuarter);
    } else if (phase === "Waning Crescent") {
      setMoonImage(WaningCrescent);
    }
  }

  async function getAir(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_APP_ID}&lang=${language}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log(data);
    setAir(data.list[0].main.aqi);
    getAqi(data.list[0].main.aqi);
    getAirCircle(data.list[0].main.aqi);
    setComponent(data.list[0].components);
    getPollutantQuality(data.list[0].components);
  }

  function getAqi(aqi) {
    if (aqi === 1) {
      setAqi(t.good);
    } else if (aqi === 2) {
      setAqi(t.fair);
    } else if (aqi === 3) {
      setAqi(t.moderate);
    } else if (aqi === 4) {
      setAqi(t.poor);
    } else if (aqi === 5) {
      setAqi(t.veryPoor);
    }
  }

  function getAirCircle(aqi) {
    if (aqi === 1) {
      setAqiCircle(360);
    } else if (aqi === 2) {
      setAqiCircle(270);
    } else if (aqi === 3) {
      setAqiCircle(180);
    } else if (aqi === 4) {
      setAqiCircle(90);
    } else if (aqi === 5) {
      setAqiCircle(0);
    }
  }

  function getPollutantQuality(name, value) {
    const limits = {
      co: [4000, 8000, 20000, 30000],
      no2: [10, 25, 60, 100],
      o3: [60, 100, 120, 160],
      so2: [20, 40, 125, 190],
      pm2_5: [5, 15, 50, 90],
      pm10: [15, 45, 120, 195],
    };

    const threshold = limits[name];

    if (value == null || !threshold) return "--";

    if (value <= threshold[0]) {
      return t.good;
    } else if (value <= threshold[1]) {
      return t.fair;
    } else if (value <= threshold[2]) {
      return t.moderate;
    } else if (value <= threshold[3]) {
      return t.poor;
    } else {
      return t.veryPoor;
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
      getMoon(data.coord.lat, data.coord.lon);
      getAir(data.coord.lat, data.coord.lon);
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

      let dailyForecasts = [];
      let lastDate = "";

      for (let i = 0; i < data.list.length; i++) {
        let dayForecast = data.list[i];
        const date = new Date(dayForecast.dt * 1000);
        let dateStringe = date.toDateString();
        if (dateStringe !== lastDate) {
          dailyForecasts.push({
            day: date.toLocaleDateString("en", {
              weekday: "short",
            }),
            temperature: Math.round(dayForecast.main.temp),
            icon: dayForecast.weather[0].icon,
            description: dayForecast.weather[0].description,
            pop: Math.max(dayForecast.pop),
          });

          lastDate = dateStringe;

          if (dailyForecasts.length === 5) {
            break;
          }
        }
      }

      let hourForecast = data.list.slice(0, 8);

      setHourlyForecast(hourForecast);
      setDailyForecast(dailyForecasts);
    } catch (error) {
      console.log(error.message);
    }
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
    <div className={`forecast-main ${theme}`}>
      <div className="forecast-header">
        <div className="forecast-top">
          <div className="forecast-menu" onClick={showMenus}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div
            className="forecast-overlay"
            style={
              window.innerWidth <= 600
                ? {
                    visibility: showMenu ? "visible" : "hidden",
                  }
                : {}
            }
            onClick={hideMenus}
          ></div>
          <div className="forecast-logos">
            <img src={Logo} className="forecast-logo-image" />
            <div className="forecast-logo">
              Sky<span>Cast</span>
            </div>
          </div>

          <div className="forecast-search-icon" onClick={showInputBox}>
            <i className="fa-solid fa-magnifying-glass"></i>
          </div>

          <div
            className="forecast-input-box"
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
            <div className="forecast-arrow-icon" onClick={hideInputBox}>
              <i className="fa-solid fa-arrow-left"></i>
            </div>
            <input
              type="text"
              value={input}
              placeholder="Search for city"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={addInput}
              className="forecast-input"
            />
            <div
              className="forecast-clear-icon"
              style={{ visibility: input ? "visible" : "hidden" }}
            >
              <i
                className="fa-solid fa-xmark"
                onClick={(e) => setInput("")}
              ></i>
            </div>
          </div>

          <div
            className="forecast-nav"
            style={
              window.innerWidth <= 600
                ? {
                    transform: showMenu ? "translateX(0)" : "translateX(-100%)",
                  }
                : {}
            }
          >
            <div className="forecast-home-icon">
              <Link to="/">
                <i className="fa-solid fa-house"></i>
              </Link>
            </div>

            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/forecast" className="active">
                  Forecast
                </Link>
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

      <div className="forecast-main-pages">
        <div className="added">
          {weather && (
            <div className="place">
              <h3>
                {weather.name}, {fullCountry}
              </h3>
              <p>{t.weatherOutlook}</p>
            </div>
          )}
          <div className="forecast-forecasts">
            <div className="forecast-daily-forecast">
              <h3>{t.dailyForecast}</h3>
              <div className="forecast-dailys-box">
                {dailyForecast.map((item, index) => (
                  <div className="forecast-daily-box" key={index}>
                    <p>{item.day}</p>
                    <img
                      src={`https://openweathermap.org/img/wn/${item.icon}.png`}
                      className="forecast-day-icon"
                    />
                    <p>{item.description}</p>
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

            <div className="join">
              <div className="forecast-hourly-forecast">
                <h3>{t.hourlyForecast}</h3>
                <div className="forecast-hourlys-box">
                  {hourlyForecast.map((item) => (
                    <div className="forecast-hourly-box" key={item.dt}>
                      <p>
                        {new Date(item.dt * 1000).toLocaleTimeString("en", {
                          hour: "numeric",
                          hour12: true,
                        })}
                      </p>
                      <img
                        src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                        className="forecast-hour-icon"
                      />
                      <p>
                        {" "}
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

              <div className="sun-moon-air-box">
                <div className="sun-moon-box">
                  <h3>{t.sunAndMoon}</h3>
                  <div className="rise-line-set">
                    <div className="forecast-rise-box">
                      <p>{t.sunrise}</p>
                      <img src={SunRise} className="forecast-rise-image" />
                      <p>{rise}</p>
                    </div>

                    <div className="line-box">
                      <img src={Line} className="line-image" />
                    </div>

                    <div className="forecast-set-box">
                      <p>{t.sunset}</p>
                      <img src={SunSet} className="forecast-set-image" />
                      <p>{set}</p>
                    </div>
                  </div>

                  <div className="moon-box">
                    <img src={moonImage} className="moon-image" />

                    <div className="name-phase">
                      <p>{moon?.moon_phase}</p>
                      <p>
                        {t.illumination}:{" "}
                        <span>{Math.round(moon?.moon_illumination)}%</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="air-box">
                  <h3>{t.airQuality}</h3>

                  <div className="air-quality-particles">
                    <div
                      className="big-circle"
                      style={{
                        background: `conic-gradient(#7ce832 0deg ${aqiCircle}deg, #3189d5 ${aqiCircle}deg 360deg`,
                      }}
                    >
                      <div className="small-circle">
                        <p className="status">{air}</p>
                        <p className="quality">{aqi}</p>
                      </div>
                    </div>

                    <div className="particles">
                      <div className="particles1 part">
                        <p>PM2.5</p>
                        <p>{Math.round(component?.pm2_5)}</p>
                        <p>{getPollutantQuality("pm2_5", component.pm2_5)}</p>
                      </div>
                      <div className="particles2 part">
                        <p>PM10</p>
                        <p>{Math.round(component?.pm10)}</p>
                        <p>{getPollutantQuality("pm10", component.pm10)}</p>
                      </div>
                      <div className="particles3 part">
                        <p>
                          O<sub>3</sub>
                        </p>
                        <p>{Math.round(component?.o3)}</p>
                        <p>{getPollutantQuality("o3", component.o3)}</p>
                      </div>
                      <div className="particles4 part">
                        <p>
                          NO<sub>2</sub>
                        </p>
                        <p>{Math.round(component?.no2)}</p>
                        <p>{getPollutantQuality("no2", component.no2)}</p>
                      </div>

                      <div className="particles2 part">
                        <p>
                          SO<sub>2</sub>
                        </p>
                        <p>{Math.round(component?.so2)}</p>
                        <p>{getPollutantQuality("so2", component.so2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pricipitation-box">
                <h3>{t.precipitationOverview}</h3>
                <p>{t.chanceOfRain}</p>
                <div className="charts">
                  {dailyForecast.map((item, index) => (
                    <div className="bar-chart" key={index}>
                      <p>{Math.round(item.pop * 100)}%</p>
                      <div
                        className="bar"
                        style={{ height: `${item.pop * 100}px` }}
                      ></div>
                      <p className="dayName">{item.day}</p>
                    </div>
                  ))}
                </div>
                <p className="long-line"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
