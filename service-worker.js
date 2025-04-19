const API_BASE = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API = "https://api.open-meteo.com/v1/forecast";
let map;

async function getWeather() {
  const city = document.getElementById("location").value;
  if (!city) return alert("Voer een stad in!");

  document.getElementById("loading").style.display = "flex";

  try {
    const geoRes = await fetch(`${API_BASE}?name=${city}&count=1&language=nl&format=json`);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      alert("Stad niet gevonden!");
      document.getElementById("loading").style.display = "none";
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    const weatherRes = await fetch(`${WEATHER_API}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,wind_speed_10m,relative_humidity_2m,apparent_temperature&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`);
    const weatherData = await weatherRes.json();

    // Update UI
    document.getElementById("cityName").textContent = `${name}, ${country}`;
    document.getElementById("currentDate").textContent = new Date().toLocaleDateString("nl-NL", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    document.getElementById("temperature").textContent = `${weatherData.current.temperature_2m}°C`;
    document.getElementById("weatherDescription").textContent = translateWeatherCode(weatherData.current.weathercode);
    document.getElementById("humidity").textContent = weatherData.current.relative_humidity_2m;
    document.getElementById("windSpeed").textContent = weatherData.current.wind_speed_10m;
    document.getElementById("feelsLike").textContent = weatherData.current.apparent_temperature;

    updateDailyForecast(weatherData.daily);

    // Map
    if (!map) {
      map = L.map('map').setView([latitude, longitude], 8);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18
      }).addTo(map);
    } else {
      map.setView([latitude, longitude], 8);
    }

    L.marker([latitude, longitude]).addTo(map)
      .bindPopup(`${name}, ${country}`)
      .openPopup();

  } catch (error) {
    console.error("Fout bij ophalen weergegevens:", error);
    alert("Er is iets misgegaan.");
  }

  document.getElementById("loading").style.display = "none";
}

// Vertaal weathercode naar beschrijving
function translateWeatherCode(code) {
  const codes = {
    0: "Helder",
    1: "Overwegend helder",
    2: "Gedeeltelijk bewolkt",
    3: "Bewolkt",
    45: "Mist",
    48: "Rijp",
    51: "Lichte motregen",
    61: "Lichte regen",
    71: "Lichte sneeuw",
    95: "Onweer",
    99: "Zware onweersbuien"
  };
  return codes[code] || "Onbekend";
}

// Update 10-daagse voorspelling
function updateDailyForecast(daily) {
  const container = document.getElementById("dailyForecast");
  container.innerHTML = "";
  for (let i = 0; i < daily.time.length; i++) {
    const day = daily.time[i];
    const maxTemp = daily.temperature_2m_max[i];
    const minTemp = daily.temperature_2m_min[i];
    const weatherCode = daily.weathercode[i];

    const dayDiv = document.createElement("div");
    dayDiv.classList.add("daily-forecast-item");
    dayDiv.innerHTML = `
      <h4>${new Date(day).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}</h4>
      <p>${maxTemp}° / ${minTemp}°</p>
      <p>${translateWeatherCode(weatherCode)}</p>
    `;
    container.appendChild(dayDiv);
  }
}
