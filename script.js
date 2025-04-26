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
          <p class="font-semibold text-xs">${new Date(hour.dt * 1000).toLocaleTimeString('nl-NL', { hour:_LINES

**Changes from Previous**:
- Fixed service worker registration by moving it to a separate block with proper `self` context.
- Added error logging for service worker caching to aid debugging.
- Ensured map initializes only after DOM is loaded to prevent `null` errors.
- Simplified hourly forecast icon URL to `@2x` for consistency.

#### 4. `style.css`
Optimized for cross-platform responsiveness and touch interactions.

<xaiArtifact artifact_id="88de1b94-2101-43f3-9768-e5b3a3be1e30" artifact_version_id="ea9231b6-1b69-4f7f-873a-53c4bc836e34" title="style.css" contentType="text/css">
/* System font for cross-platform consistency */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overscroll-behavior-y: none; /* Prevent pull-to-refresh on Android */
}

/* Safe area handling for iOS and Android */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  body {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
}

/* Map styling */
#map {
  height: 100%;
  border-radius: 12px;
}

/* Hourly forecast card */
.hour {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 8px;
  text-align: center;
  min-width: 70px;
  transition: transform 0.3s ease;
  touch-action: pan-x;
}

/* Hover effect only for non-touch devices */
@media (hover: hover) {
  .hour:hover {
    transform: scale(1.05);
  }
}

/* Touch-friendly buttons and inputs */
button, input {
  -webkit-appearance: none;
  appearance: none;
  touch-action: manipulation;
  min-height: 44px; /* Minimum tap target size */
  min-width: 44px;
}

/* Scroll snapping for hourly forecast */
#hourly-forecast {
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
}

/* Custom scrollbar */
#hourly-forecast::-webkit-scrollbar {
  height: 5px;
}

#hourly-forecast::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

#hourly-forecast::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

/* Weather info animation */
.weather-info {
  animation: fadeIn 0.5s ease-in;
}

/* Fade-in animation */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Hide weather icon during loading */
#loading:not(.hidden) ~ .flex #weather-icon {
  display: none;
}

/* Media query for larger screens */
@media (min-width: 640px) {
  .hour {
    min-width: 80px;
    padding: 12px;
  }
  #search-input {
    width: 9rem;
  }
  .text-lg {
    font-size: 1.25rem;
  }
  .text-xl {
    font-size: 1.5rem;
  }
}
