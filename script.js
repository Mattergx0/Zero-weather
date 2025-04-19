const API_BASE = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API = "https://api.open-meteo.com/v1/forecast";
let map;

// Functie om locatie automatisch te verkrijgen en het weer te tonen
function getCurrentLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      try {
        const weatherRes = await fetch(`${WEATHER_API}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,wind_speed_10m,relative_humidity_2m,apparent_temperature&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`);
        const weatherData = await weatherRes.json();
        
        const cityName = "Je locatie";
        const country = "Onbekend";
        updateUI(weatherData, cityName, country, latitude, longitude);
      } catch (error) {
        alert("Er is een fout opgetreden bij het ophalen van het weer.");
      }
    });
  } else {
    alert("Geolocatie wordt niet ondersteund door deze browser.");
  }
}

// Functie om weerdata op te halen van de zoekopdracht
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

    updateUI(weatherData, name, country, latitude, longitude);

  } catch (error) {
    console.error("Fout bij ophalen weergegevens:", error);
    alert("Er is iets misgegaan.");
  }

  document.getElementById("loading").style.display = "none";
}

// Functie om de UI bij te werken
function updateUI(weatherData, cityName, country, latitude, longitude) {
  document.getElementById("cityName").textContent = `${cityName}, ${country}`;
  document.getElementById("currentDate").textContent = new Date().toLocaleDateString();

  // Vul de weergegevens in
  document.getElementById("temperature").textContent = `${weatherData.current.temperature_2m}°C`;
  document.getElementById("weatherDescription").textContent = weatherData.current.weathercode;
  document.getElementById("humidity").textContent = weatherData.current.relative_humidity_2m;
  document.getElementById("windSpeed").textContent = weatherData.current.wind_speed_10m;
  document.getElementById("feelsLike").textContent = weatherData.current.apparent_temperature;

  // Uurlijkse en dagelijkse voorspellingen kunnen hier worden toegevoegd
  const hourlyForecast = weatherData.hourly;
  const dailyForecast = weatherData.daily;

  // Update hourly forecast
  const hourlyContainer = document.getElementById("hourlyForecast");
  hourlyForecast.forEach((hour) => {
    const hourDiv = document.createElement("div");
    hourDiv.textContent = `${hour.time}: ${hour.temperature_2m}°C`;
    hourlyContainer.appendChild(hourDiv);
  });

  // Update daily forecast
  const dailyContainer = document.getElementById("dailyForecast");
  dailyForecast.forEach((day) => {
    const dayDiv = document.createElement("div");
    dayDiv.textContent = `${day.date}: Max: ${day.temperature_2m_max}°C, Min: ${day.temperature_2m_min}°C`;
    dailyContainer.appendChild(dayDiv);
  });
}

// Stemfunctionaliteit toevoegen
if (annyang) {
  const commands = {
    'hoe is het weer vandaag': () => getCurrentLocationWeather(),
    'wat is het weer in *city': (city) => {
      document.getElementById("location").value = city;
      getWeather();
    }
  };
  annyang.addCommands(commands);
  annyang.start();
}

document.getElementById("voiceButton").addEventListener("click", () => {
  if (annyang) {
    annyang.start();
  } else {
    alert("Spraakherkenning is niet ondersteund.");
  }
});
