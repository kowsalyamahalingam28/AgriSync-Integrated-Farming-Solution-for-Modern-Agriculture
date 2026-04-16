import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CloudSun, Droplets, Wind, Thermometer, Gauge, MapPin, Search, AlertTriangle, Loader2, Sprout, Bug, Sun, CloudRain, Umbrella, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import weatherImg from "@/assets/weather-station.jpg";

interface WeatherData {
  city: string;
  lat: number;
  lon: number;
  temp: number;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  pressure: number;
  uvIndex: number;
  rainfall: number;
  hourlyRain: number[];
  hourlyTemp: number[];
  daily: { dateStr: string; maxTemp: number; minTemp: number; rain: number; et0: number; weatherCode: number }[];
  weatherCode: number;
}

const WMO_ICONS: Record<number, string> = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️", 45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌧️", 61: "🌧️", 63: "🌧️", 65: "🌧️",
  71: "🌨️", 73: "🌨️", 75: "🌨️", 80: "🌧️", 81: "🌧️", 82: "🌧️",
  95: "⛈️", 96: "⛈️", 99: "⛈️",
};

const WMO_DESC: Record<number, { en: string; ta: string }> = {
  0: { en: "Clear Sky", ta: "தெளிவான வானம்" },
  1: { en: "Mainly Clear", ta: "பெரும்பாலும் தெளிவு" },
  2: { en: "Partly Cloudy", ta: "ஓரளவு மேகமூட்டம்" },
  3: { en: "Overcast", ta: "மேகமூட்டம்" },
  45: { en: "Foggy", ta: "மூடுபனி" },
  51: { en: "Light Drizzle", ta: "லேசான தூறல்" },
  61: { en: "Light Rain", ta: "லேசான மழை" },
  63: { en: "Moderate Rain", ta: "மிதமான மழை" },
  65: { en: "Heavy Rain", ta: "கனமழை" },
  80: { en: "Rain Showers", ta: "மழை பொழிவு" },
  95: { en: "Thunderstorm", ta: "இடியுடன் கூடிய மழை" },
};

function humidex(temp: number, humidity: number): number {
  const dew = temp - ((100 - humidity) / 5);
  const e = 6.11 * Math.exp(5417.7530 * (1/273.16 - 1/(273.15 + dew)));
  return Math.round(temp + (5/9) * (e - 10));
}

function hargreavesET0(tmax: number, tmin: number, lat: number, dayOfYear: number): number {
  const dr = 1 + 0.033 * Math.cos(2 * Math.PI * dayOfYear / 365);
  const delta = 0.409 * Math.sin(2 * Math.PI * dayOfYear / 365 - 1.39);
  const phi = lat * Math.PI / 180;
  const ws = Math.acos(-Math.tan(phi) * Math.tan(delta));
  const Ra = (24 * 60 / Math.PI) * 0.0820 * dr * (ws * Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.sin(ws));
  return Math.max(0, 0.0023 * (((tmax + tmin) / 2) + 17.8) * Math.sqrt(Math.max(0, tmax - tmin)) * Ra);
}

function pestRisk(temp: number, humidity: number): { name: string; nameTa: string; risk: string; color: string; advice: string; adviceTa: string }[] {
  const risks = [];
  if (temp > 25 && humidity > 80) risks.push({ name: "Fungal Blight", nameTa: "பூஞ்சை நோய்", risk: "High", color: "bg-destructive/15 text-destructive border-destructive/30", advice: "Apply Mancozeb 2.5g/L immediately", adviceTa: "உடனடியாக Mancozeb 2.5g/L தெளிக்கவும்" });
  if (temp > 30 && humidity > 70) risks.push({ name: "Brown Plant Hopper", nameTa: "பழுப்பு தத்துப்பூச்சி", risk: "Medium", color: "bg-secondary/15 text-secondary border-secondary/30", advice: "Monitor paddy fields, use light traps", adviceTa: "நெல் வயல்களை கண்காணிக்கவும், ஒளி பொறிகள் பயன்படுத்தவும்" });
  if (temp > 35 && humidity < 50) risks.push({ name: "Spider Mite", nameTa: "சிலந்தி பூச்சி", risk: "Medium", color: "bg-secondary/15 text-secondary border-secondary/30", advice: "Spray Dicofol 2ml/L on affected crops", adviceTa: "பாதிக்கப்பட்ட பயிர்களில் Dicofol 2ml/L தெளிக்கவும்" });
  if (temp > 28 && humidity > 60) risks.push({ name: "Stem Borer", nameTa: "தண்டு துளைப்பான்", risk: "Low", color: "bg-primary/15 text-primary border-primary/30", advice: "Install pheromone traps in paddy fields", adviceTa: "நெல் வயல்களில் பெரோமோன் பொறிகள் நிறுவவும்" });
  if (risks.length === 0) risks.push({ name: "General", nameTa: "பொது", risk: "Low", color: "bg-primary/15 text-primary border-primary/30", advice: "Conditions normal. Continue regular monitoring.", adviceTa: "நிலைமை இயல்பானது. வழக்கமான கண்காணிப்பை தொடரவும்." });
  return risks;
}

const WeatherForecast = () => {
  const { t } = useLanguage();
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);

  // Auto-detect GPS on mount
  useEffect(() => {
    if (navigator.geolocation) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          // Reverse geocode to get city name
          try {
            const resp = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=&latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&count=1`);
            let cityName = t("Your Location", "உங்கள் இருப்பிடம்");
            // Try reverse geocoding via nominatim
            try {
              const nominatim = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
              const nomData = await nominatim.json();
              cityName = nomData.address?.city || nomData.address?.town || nomData.address?.village || nomData.address?.county || cityName;
            } catch {}
            await fetchWeather(pos.coords.latitude, pos.coords.longitude, cityName);
          } catch {
            await fetchWeather(pos.coords.latitude, pos.coords.longitude, t("Your Location", "உங்கள் இருப்பிடம்"));
          }
          setGpsLoading(false);
        },
        () => {
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const fetchWeather = async (lat: number, lon: number, cityName: string) => {
    setLoading(true);
    setError("");
    try {
      const resp = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,apparent_temperature,pressure_msl,precipitation,weather_code&hourly=precipitation_probability,temperature_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max,weather_code&timezone=Asia/Kolkata&forecast_days=14`
      );
      const data = await resp.json();
      if (!data.current) throw new Error("No data");

      const hourlyRain = (data.hourly?.precipitation_probability || []).slice(0, 24) as number[];
      const hourlyTemp = (data.hourly?.temperature_2m || []).slice(0, 24) as number[];
      const daily = (data.daily?.time || []).map((d: string, i: number) => {
        const maxT = data.daily.temperature_2m_max[i];
        const minT = data.daily.temperature_2m_min[i];
        const dayOfYear = Math.floor((new Date(d).getTime() - new Date(new Date(d).getFullYear(), 0, 0).getTime()) / 86400000);
        return {
          dateStr: new Date(d).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
          maxTemp: Math.round(maxT),
          minTemp: Math.round(minT),
          rain: Math.round((data.daily.precipitation_sum?.[i] || 0) * 10) / 10,
          et0: Math.round(hargreavesET0(maxT, minT, lat, dayOfYear) * 10) / 10,
          weatherCode: data.daily.weather_code?.[i] || 0,
        };
      });

      setWeather({
        city: cityName,
        lat, lon,
        temp: Math.round(data.current.temperature_2m),
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        feelsLike: Math.round(data.current.apparent_temperature),
        pressure: Math.round(data.current.pressure_msl),
        uvIndex: data.daily?.uv_index_max?.[0] || 0,
        rainfall: data.current.precipitation || 0,
        hourlyRain,
        hourlyTemp,
        daily,
        weatherCode: data.current.weather_code || 0,
      });
    } catch {
      setError(t("Could not fetch weather data", "வானிலை தரவை பெற முடியவில்லை"));
    } finally {
      setLoading(false);
    }
  };

  const searchCity = async () => {
    if (!city.trim()) return;
    setLoading(true);
    try {
      const resp = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
      const data = await resp.json();
      if (data.results?.length) {
        await fetchWeather(data.results[0].latitude, data.results[0].longitude, data.results[0].name);
      } else {
        setError(t("City not found", "நகரம் கிடைக்கவில்லை"));
        setLoading(false);
      }
    } catch {
      setError(t("Search failed", "தேடல் தோல்வி"));
      setLoading(false);
    }
  };

  const useGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          let cityName = t("Your Location", "உங்கள் இருப்பிடம்");
          try {
            const nominatim = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
            const nomData = await nominatim.json();
            cityName = nomData.address?.city || nomData.address?.town || nomData.address?.village || cityName;
          } catch {}
          await fetchWeather(pos.coords.latitude, pos.coords.longitude, cityName);
        } catch {}
        setGpsLoading(false);
      },
      () => {
        setError(t("Location access denied", "இருப்பிட அணுகல் மறுக்கப்பட்டது"));
        setGpsLoading(false);
      }
    );
  };

  const heatIndex = weather ? humidex(weather.temp, weather.humidity) : 0;
  const heatDanger = heatIndex > 45 ? { label: "Extreme Danger", labelTa: "தீவிர ஆபத்து", color: "text-destructive", bg: "bg-destructive/10" } : heatIndex > 40 ? { label: "Dangerous", labelTa: "ஆபத்தானது", color: "text-destructive", bg: "bg-destructive/10" } : heatIndex > 35 ? { label: "Caution", labelTa: "எச்சரிக்கை", color: "text-secondary", bg: "bg-secondary/10" } : { label: "Safe", labelTa: "பாதுகாப்பானது", color: "text-primary", bg: "bg-primary/10" };
  const todayET0 = weather?.daily?.[0]?.et0 || 0;

  // Sowing window analysis
  const sowingWindows = weather?.daily?.slice(0, 12).map((_, i) => {
    if (i > 9) return null;
    const window = weather.daily.slice(i, i + 3);
    if (window.length < 3) return null;
    const avgTemp = window.reduce((s, d) => s + (d.maxTemp + d.minTemp) / 2, 0) / 3;
    const totalRain = window.reduce((s, d) => s + d.rain, 0);
    let score = 0;
    if (avgTemp >= 22 && avgTemp <= 32) score += 40;
    else if (avgTemp >= 18 && avgTemp <= 36) score += 20;
    if (totalRain >= 5 && totalRain <= 30) score += 35;
    else if (totalRain < 5) score += 15;
    score += Math.min(25, 25 - Math.abs(totalRain - 15));
    return { start: weather.daily[i].dateStr, score: Math.max(0, Math.min(100, Math.round(score))), avgTemp: Math.round(avgTemp), totalRain: Math.round(totalRain * 10) / 10 };
  }).filter(Boolean) as { start: string; score: number; avgTemp: number; totalRain: number }[] || [];

  const bestWindow = sowingWindows.length ? sowingWindows.reduce((a, b) => a.score > b.score ? a : b) : null;

  return (
    <div className="min-h-screen font-body">
      <Navbar />
      {/* Hero Banner */}
      <section className="relative pt-16 overflow-hidden">
        <div className="relative h-56 md:h-72">
          <img src={weatherImg} alt="Weather station" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-r from-sky/80 to-primary/70" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-5xl mb-3">
              {weather ? (WMO_ICONS[weather.weatherCode] || "🌤️") : "🌤️"}
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-display font-extrabold text-primary-foreground mb-2">
              {t("Advanced Weather Forecast", "மேம்பட்ட வானிலை முன்னறிவிப்பு")}
            </motion.h1>
            <p className="text-primary-foreground/80 text-sm md:text-base max-w-xl">{t("Real-time GPS weather with heat stress, ET₀, pest risk & AI sowing window analysis", "வெப்ப அழுத்தம், ET₀, பூச்சி ஆபத்து & AI விதைப்பு சாளர பகுப்பாய்வுடன் நிகழ்நேர GPS வானிலை")}</p>
          </div>
        </div>
      </section>

      <div className="px-4 pb-8">
        <div className="container mx-auto max-w-6xl">
          {/* Search Bar */}
          <div className="flex gap-3 mt-8 mb-6 max-w-xl mx-auto">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input type="text" value={city} onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === "Enter" && searchCity()} placeholder={t("Enter city... (e.g., Chennai, Madurai)", "நகரத்தை உள்ளிடவும்...")} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:ring-2 focus:ring-primary/50 transition-all" />
            </div>
            <Button onClick={searchCity} disabled={loading} className="gap-2 rounded-xl">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
            <Button variant="outline" onClick={useGPS} disabled={gpsLoading} className="gap-1 rounded-xl text-xs border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground">
              {gpsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              GPS
            </Button>
          </div>

          {error && <p className="text-center text-destructive text-sm mb-4">{error}</p>}

          {(loading || gpsLoading) && !weather && (
            <div className="text-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">{t("Fetching real-time weather data...", "நிகழ்நேர வானிலை தரவை பெறுகிறது...")}</p>
            </div>
          )}

          {weather && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Main Weather Card */}
              <div className="bg-gradient-to-br from-sky/15 to-primary/10 border border-border rounded-2xl p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <p className="text-muted-foreground font-medium">{weather.city}</p>
                    </div>
                    <div className="text-6xl md:text-7xl font-display font-extrabold text-foreground">{weather.temp}°C</div>
                    <p className="text-sm text-muted-foreground mt-1">{t("Feels like", "உணர்வு")} {weather.feelsLike}°C</p>
                    <p className="text-sm font-medium text-foreground mt-1">
                      {WMO_ICONS[weather.weatherCode] || "🌤️"} {t(WMO_DESC[weather.weatherCode]?.en || "Clear", WMO_DESC[weather.weatherCode]?.ta || "தெளிவு")}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-7xl">{WMO_ICONS[weather.weatherCode] || "☀️"}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Droplets, label: t("Humidity", "ஈரப்பதம்"), value: `${weather.humidity}%`, color: "text-sky" },
                      { icon: Wind, label: t("Wind", "காற்று"), value: `${weather.windSpeed} km/h`, color: "text-primary" },
                      { icon: Gauge, label: t("Pressure", "அழுத்தம்"), value: `${weather.pressure} hPa`, color: "text-gold" },
                      { icon: Sun, label: t("UV Index", "UV குறியீடு"), value: `${weather.uvIndex}`, color: "text-destructive" },
                    ].map(item => (
                      <div key={item.label} className="bg-card/80 border border-border rounded-xl p-3 text-center">
                        <item.icon className={`h-4 w-4 mx-auto mb-1 ${item.color}`} />
                        <p className="text-[10px] text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-bold text-foreground">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <CloudRain className="h-5 w-5 mx-auto mb-1 text-sky" />
                  <p className="text-xs text-muted-foreground">{t("Rainfall", "மழையளவு")}</p>
                  <p className="text-xl font-bold text-foreground">{weather.rainfall} mm</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <Umbrella className="h-5 w-5 mx-auto mb-1 text-sky" />
                  <p className="text-xs text-muted-foreground">{t("Rain Chance", "மழை வாய்ப்பு")}</p>
                  <p className="text-xl font-bold text-foreground">{Math.max(...weather.hourlyRain.slice(0, 12))}%</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <Thermometer className="h-5 w-5 mx-auto mb-1 text-destructive" />
                  <p className="text-xs text-muted-foreground">{t("Today High/Low", "இன்று அதிக/குறை")}</p>
                  <p className="text-xl font-bold text-foreground">{weather.daily[0]?.maxTemp}°/{weather.daily[0]?.minTemp}°</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <Eye className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{t("Coordinates", "ஆயங்கள்")}</p>
                  <p className="text-sm font-bold text-foreground">{weather.lat.toFixed(2)}°N, {weather.lon.toFixed(2)}°E</p>
                </div>
              </div>

              {/* Heat Stress + ET₀ Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className={`border rounded-2xl p-6 ${heatDanger.bg} border-border`}>
                  <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
                    🌡️ {t("Heat Stress Index", "வெப்ப அழுத்த குறியீடு")}
                  </h3>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-5xl font-display font-extrabold">{heatIndex}°</span>
                    <div>
                      <span className={`text-sm font-bold ${heatDanger.color}`}>{t(heatDanger.label, heatDanger.labelTa)}</span>
                      <p className="text-xs text-muted-foreground mt-1">{t("Humidex Formula", "ஹ்யூமிடெக்ஸ் சூத்திரம்")}</p>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (heatIndex / 55) * 100)}%` }} transition={{ duration: 1.5 }}
                      className={`h-3 rounded-full ${heatIndex > 40 ? 'bg-destructive' : heatIndex > 35 ? 'bg-secondary' : 'bg-primary'}`} />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>20°</span><span>30°</span><span>40°</span><span>50°+</span>
                  </div>
                  {heatIndex > 35 && (
                    <p className="text-xs text-destructive mt-3 bg-destructive/10 rounded-lg p-2">{t("⚠️ Avoid prolonged field work. Ensure workers have shade and hydration.", "⚠️ நீண்ட நேர வயல் வேலையைத் தவிர்க்கவும்.")}</p>
                  )}
                </div>

                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
                    💧 {t("ET₀ Irrigation Need", "ET₀ நீர்ப்பாசன தேவை")}
                  </h3>
                  <p className="text-5xl font-display font-extrabold text-sky mb-2">{todayET0} <span className="text-lg text-muted-foreground">L/m²</span></p>
                  <p className="text-xs text-muted-foreground mb-3">{t("Hargreaves formula based on today's temperature range", "இன்றைய வெப்பநிலை வரம்பின் அடிப்படையில் ஹார்கிரீவ்ஸ் சூத்திரம்")}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: t("Rice", "நெல்"), factor: 1.2 },
                      { label: t("Cotton", "பருத்தி"), factor: 0.85 },
                      { label: t("Banana", "வாழை"), factor: 1.1 },
                    ].map(crop => (
                      <div key={crop.label} className="bg-accent/50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-muted-foreground">{crop.label}</p>
                        <p className="text-sm font-bold text-foreground">{(todayET0 * crop.factor).toFixed(1)} L/m²</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 24h Hourly Temperature Chart */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-display font-bold text-lg mb-4">{t("24-Hour Temperature Trend", "24 மணி நேர வெப்பநிலை போக்கு")}</h3>
                <div className="flex items-end gap-0.5 h-32">
                  {weather.hourlyTemp.map((temp, i) => {
                    const minT = Math.min(...weather.hourlyTemp);
                    const maxT = Math.max(...weather.hourlyTemp);
                    const range = maxT - minT || 1;
                    const height = ((temp - minT) / range) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5 h-full">
                        <span className="text-[8px] text-muted-foreground">{Math.round(temp)}°</span>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: i * 0.03, duration: 0.5 }}
                          className={`w-full rounded-t ${temp > 35 ? 'bg-destructive/70' : temp > 30 ? 'bg-secondary/70' : 'bg-primary/50'}`}
                          style={{ minHeight: '4px' }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>12AM</span><span>6AM</span><span>12PM</span><span>6PM</span><span>11PM</span>
                </div>
              </div>

              {/* 24h Rain Chart */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-display font-bold text-lg mb-4">{t("24-Hour Rain Probability", "24 மணி நேர மழை நிகழ்தகவு")}</h3>
                <div className="flex items-end gap-0.5 h-28">
                  {weather.hourlyRain.map((p, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
                      {p > 50 && <span className="text-[8px] text-sky font-bold">{p}%</span>}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${p}%` }}
                        transition={{ delay: i * 0.03, duration: 0.5 }}
                        className={`w-full rounded-t ${p > 60 ? 'bg-sky' : p > 30 ? 'bg-sky/60' : 'bg-sky/30'}`}
                        style={{ minHeight: p > 0 ? '2px' : '0px' }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>12AM</span><span>6AM</span><span>12PM</span><span>6PM</span><span>11PM</span>
                </div>
              </div>

              {/* Pest Risk */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                  <Bug className="h-5 w-5 text-destructive" />
                  {t("Pest & Disease Risk Forecast", "பூச்சி & நோய் ஆபத்து முன்னறிவிப்பு")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pestRisk(weather.temp, weather.humidity).map((r, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className={`flex items-start gap-3 rounded-xl p-4 border ${r.color}`}>
                      <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-bold">{t(r.name, r.nameTa)}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-card font-bold">{r.risk}</span>
                        </div>
                        <p className="text-xs opacity-80">{t(r.advice, r.adviceTa)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 14-day forecast */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-display font-bold text-lg mb-4">{t("14-Day Forecast", "14 நாள் முன்னறிவிப்பு")}</h3>
                <div className="grid grid-cols-7 gap-2">
                  {weather.daily.map((d, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className={`text-center p-2 rounded-xl text-xs border ${i === 0 ? 'bg-primary/10 border-primary/30' : 'bg-accent/30 border-border'}`}>
                      <p className="font-medium text-foreground truncate">{d.dateStr.split(',')[0]}</p>
                      <p className="text-lg my-1">{WMO_ICONS[d.weatherCode] || "🌤️"}</p>
                      <p className="font-bold text-foreground">{d.maxTemp}°/{d.minTemp}°</p>
                      <p className="text-sky">{d.rain > 0 ? `${d.rain}mm` : "-"}</p>
                      <p className="text-[10px] text-muted-foreground">ET₀:{d.et0}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Sowing Window */}
              {sowingWindows.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                    <Sprout className="h-5 w-5 text-primary" />
                    {t("AI Sowing Window Detector", "AI விதைப்பு சாளர கண்டறிதல்")}
                  </h3>
                  <div className="space-y-2">
                    {sowingWindows.slice(0, 5).map((w, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${w === bestWindow ? 'bg-primary/10 border-2 border-primary/30' : 'bg-accent/30'}`}>
                        <div className="w-full">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-foreground">{w.start} (3 days)</span>
                            <span className="text-xs font-bold text-primary">{w.score}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${w.score}%` }} transition={{ duration: 1, delay: i * 0.1 }} className="bg-primary h-2.5 rounded-full" />
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">Avg: {w.avgTemp}°C • Rain: {w.totalRain}mm {w === bestWindow ? `• ${t("⭐ Best Window", "⭐ சிறந்த சாளரம்")}` : ""}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Farming Advisory */}
              <div className="bg-gradient-to-br from-accent/50 to-primary/5 border-2 border-primary/20 rounded-2xl p-6">
                <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">🌾 {t("Today's Farming Advisory", "இன்றைய விவசாய ஆலோசனை")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {weather.humidity > 70 && <div className="flex items-start gap-2 bg-card rounded-xl p-3 border border-border"><AlertTriangle className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" /><p className="text-xs text-muted-foreground">{t("High humidity — monitor for fungal diseases, ensure ventilation in storage.", "அதிக ஈரப்பதம் — பூஞ்சை நோய்களை கண்காணிக்கவும், சேமிப்பில் காற்றோட்டம் உறுதிசெய்யவும்.")}</p></div>}
                  {weather.temp > 33 && <div className="flex items-start gap-2 bg-card rounded-xl p-3 border border-border"><AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" /><p className="text-xs text-muted-foreground">{t("High temperature — irrigate early morning or late evening. Mulch around plants.", "அதிக வெப்பநிலை — அதிகாலை அல்லது மாலையில் நீர் ஊற்றவும்.")}</p></div>}
                  {todayET0 > 5 && <div className="flex items-start gap-2 bg-card rounded-xl p-3 border border-border"><Droplets className="h-4 w-4 text-sky mt-0.5 flex-shrink-0" /><p className="text-xs text-muted-foreground">{t(`High water demand (${todayET0} L/m²). Ensure adequate irrigation today.`, `அதிக நீர் தேவை (${todayET0} L/m²). இன்று போதுமான நீர்ப்பாசனம் உறுதிசெய்யவும்.`)}</p></div>}
                  {weather.windSpeed > 20 && <div className="flex items-start gap-2 bg-card rounded-xl p-3 border border-border"><Wind className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /><p className="text-xs text-muted-foreground">{t("Strong winds — avoid spraying pesticides. Secure poly-house covers.", "வலுவான காற்று — பூச்சிக்கொல்லி தெளிப்பதைத் தவிர்க்கவும்.")}</p></div>}
                  <div className="flex items-start gap-2 bg-card rounded-xl p-3 border border-border"><Sprout className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /><p className="text-xs text-muted-foreground">{t("Check soil moisture before irrigating. Water early morning for best absorption.", "நீர்ப்பாசனத்திற்கு முன் மண் ஈரப்பதத்தை சரிபார்க்கவும்.")}</p></div>
                  <div className="flex items-start gap-2 bg-card rounded-xl p-3 border border-border"><Sun className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" /><p className="text-xs text-muted-foreground">{t("Apply organic mulch to conserve moisture and reduce soil temperature.", "ஈரப்பதத்தைக் காக்க இயற்கை தழைக்கூளம் போடவும்.")}</p></div>
                </div>
              </div>
            </motion.div>
          )}

          {!weather && !loading && !gpsLoading && (
            <div className="text-center text-muted-foreground py-16">
              <CloudSun className="h-20 w-20 mx-auto mb-6 text-muted-foreground/30" />
              <p className="text-lg font-display">{t("Enter a city or use GPS", "நகரத்தை உள்ளிடவும் அல்லது GPS பயன்படுத்தவும்")}</p>
              <p className="text-sm mt-2">{t("Try: Chennai, Madurai, Coimbatore, Thanjavur", "முயற்சிக்கவும்: Chennai, Madurai, Coimbatore, Thanjavur")}</p>
              <div className="flex gap-2 justify-center mt-4 flex-wrap">
                {["Chennai", "Madurai", "Coimbatore", "Thanjavur", "Salem", "Trichy"].map(c => (
                  <Button key={c} variant="outline" size="sm" className="rounded-full text-xs" onClick={() => { setCity(c); setTimeout(() => searchCity(), 100); }}>
                    {c}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WeatherForecast;
