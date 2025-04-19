const API_BASE = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API = "https://api.open-meteo.com/v1/forecast";
let map;

// Functie om suggesties te tonen
document.getElementById('location').addEventListener('input', async function () {
  const query = this.value;
  if (query.length < 2) return;

  const response = await fetch(`${API_BASE}?name=${query}&count=5&language=nl&format=json`);
  const data = await response.json();

  const datalist = document.getElementById('suggestions');
  datalist.innerHTML = '';

  if (data.results) {
    data.results.forEach(loc => {
      const option = document.createElement('option');
      option.value = loc.name;
      datalist.appendChild(option);
    });
  }
});

// Functie om weerdata op te halen voor een stad
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
    const day = new Date(daily.time[i]).toLocaleDateString("nl-NL", { weekday: "short" });
    const icon = translateWeatherCode(daily.weathercode[i]);
    const max = daily.temperature_2m_max[i];
    const min = daily.temperature_2m_min[i];

    container.innerHTML += `
      <div class="daily-item">
        <div class="day-name">${day}</div>
        <div class="day-icon">${icon}</div>
        <div class="day-temp">
          <div class="max-temp">${max}°</div>
          <div class="min-temp">${min}°</div>
        </div>
      </div>
    `;
  }
}

// Geolocatie om automatisch de locatie te vinden
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(async function (position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Gebruik de locatie om het weer op te halen
    const geoRes = await fetch(`${API_BASE}?latitude=${lat}&longitude=${lon}&count=1&language=nl&format=json`);
    const geoData = await geoRes.json();
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

  }, function () {
    alert("Locatie kan niet worden bepaald.");
  });
} else {
  alert("Geolocatie wordt niet ondersteund door je browser.");
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker geregistreerd met scope:', registration.scope);
      })
      .catch((error) => {
        console.log('Service Worker registratie mislukt:', error);
      });
  });
}
