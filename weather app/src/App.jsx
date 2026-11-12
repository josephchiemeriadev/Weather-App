import { BrowserRouter, Routes, Route } from "react-router-dom";
import Forecast from "./components/Forecast";
import Weather from "./components/Weather";
import Setting from "./components/Setting";
import Map from "./components/Map";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Weather />} />
        <Route path="/forecast" element={<Forecast />} />
        <Route path="/setting" element={<Setting />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
