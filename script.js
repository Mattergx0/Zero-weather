const apiKey = "51449fa3b241b52737fe2b3626795957";
let unit = "metric";
let isCelsius = true;
let currentLat, currentLon;

function showLoading() {
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('weather-icon').classList.add('hidden');
}

function hideLoading() {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('weather-icon').classList.remove('hidden');
}

function loadMap(lat, lon) {
  const map = L.map('map', {
    zoomControl: true,
    attributionControl: true,
    gestureHandling: true
  }).setView([lat, lon], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);
  L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
    maxZoom: 19,
    opacity: 0.6
  }).addTo(map);
}

function getWeather(lat, lon, city = null) {
  showLoading();
  const url = city
    ? `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}&lang=nl`
    : `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}&lang=nl`;

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('Locatie niet gevonden');
      return response.json();
    })
    .then(data => {
      const location = `${data.name}, ${data.sys.country}`;
      const temperature = Math.round(data.main.temp);
      const description = data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
      const humidity = `Luchtvochtigheid: ${data.main.humidity}%`;
      const windSpeed = `Wind: ${data.wind.speed} ${unit === "metric" ? "m/s" : "mph"}`;
      const pressure = `Druk: ${data.main.pressure} hPa`;
      const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
      const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
      const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

      document.getElementById('location').textContent = location;
      document.getElementById('temperature').textContent = `${temperature}${isCelsius ? '°C' : '°F'}`;
      document.getElementById('description').textContent = description;
      document.getElementById('humidity').textContent = humidity;
      document.getElementById('wind').textContent = windSpeed;
      document.getElementById('pressure').textContent = pressure;
      document.getElementById('sunrise-sunset').textContent = `Zonsopgang/Zonsondergang: ${sunrise}/${sunset}`;
      document.getElementById('weather-icon').src = icon;

      currentLat = data.coord.lat;
      currentLon = data.coord.lon;
      loadMap(currentLat, currentLon);
      getHourlyForecast(currentLat, currentLon);
      hideLoading();
    })
    .catch(error => {
      hideLoading();
      alert(`Fout bij het ophalen van het weer: ${error.message}`);
    });
}

function getHourlyForecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}&lang=nl`)
    .then(response => {
      if (!response.ok) throw new Error('Voorspelling niet beschikbaar');
      return response.json();
    })
    .then(data => {
      const hourlyData = data.list.slice(0, 12);
      const hourlyForecast = document.getElementById('hourly-forecast');
      hourlyForecast.innerHTML = '';

      hourlyData.forEach(hour => {
        const hourDiv = document.createElement('div');
        hourDiv.classList.add('hour', 'snap-center');
        hourDiv.innerHTML = `
          <p class="font-semibold text-xs">${new Date(hour.dt * 1000).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</p>
          <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="Weer icoon" class="w-8">
          <p class="text-xs">${Math.round(hour.main.temp)}${isCelsius ? '°C' : '°F'}</p>
          <p class="text-xs">${hour.weather[0].description.charAt(0).toUpperCase() + hour.weather[0].description.slice(1)}</p>
        `;
        hourlyForecast.appendChild(hourDiv);
      });
    })
    .catch(error => {
      console.error('Fout bij het ophalen van de uurlijkse voorspellingen:', error);
    });
}

function toggleUnit() {
  isCelsius = !isCelsius;
  unit = isCelsius ? "metric" : "imperial";
  document.getElementById('unit-toggle').textContent = isCelsius ? "°C/°F" : "°F/°C";
  if (currentLat && currentLon) {
    getWeather(currentLat, currentLon);
  } else {
    alert('Selecteer eerst een locatie!');
  }
}

function searchWeather() {
  const city = document.getElementById('search-input').value.trim();
  if (city) {
    getWeather(null, null, city);
  } else {
    alert('Voer een geldige locatie in!');
  }
}

function init() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        currentLat = latitude;
        currentLon = longitude;
        getWeather(latitude, longitude);
      },
      error => {
        currentLat = 52.3676;
        currentLon = 4.9041;
        getWeather(currentLat, currentLon, 'Amsterdam');
        alert('Locatie kan niet worden bepaald. Standaardlocatie: Amsterdam.');
      }
    );
  } else {
    currentLat = 52.3676;
    currentLon = 4.9041;
    getWeather(currentLat, currentLon, 'Amsterdam');
    alert('Geolocatie wordt niet ondersteund. Standaardlocatie: Amsterdam.');
  }
}

document.getElementById('search-btn').addEventListener('click', searchWeather);
document.getElementById('search-input').addEventListener('keypress', e => {
  if (e.key === 'Enter') searchWeather();
});
document.getElementById('unit-toggle').addEventListener('click', toggleUnit);

document.addEventListener('DOMContentLoaded', () => {
  init();
});

// Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('zero-weather-cache-v2').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/script.js',
        '/manifest.json',
        '/icon-180.png',
        '/icon-192.png',
        '/icon-512.png',
        '/icon-maskable.png'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
