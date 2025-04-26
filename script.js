const apiKey = "51449fa3b241b52737fe2b3626795957";
let unit = localStorage.getItem('unit') || "metric";
let isCelsius = unit === "metric";
let currentLat, currentLon;
let map, precipitationLayer, temperatureLayer, windLayer;
let settings = {
  defaultLocation: localStorage.getItem('defaultLocation') || "",
  theme: localStorage.getItem('theme') || "blue",
  showTips: localStorage.getItem('showTips') !== "false"
};

function applySettings() {
  document.body.className = document.body.className.replace(/theme-\w+/, `theme-${settings.theme}`);
  document.querySelector('meta[name="theme-color"]').setAttribute('content', settings.theme === 'blue' ? '#007bff' : settings.theme === 'green' ? '#10b981' : '#8b5cf6');
  unit = localStorage.getItem('unit') || "metric";
  isCelsius = unit === "metric";
  if (document.getElementById('unit-toggle')) {
    document.getElementById('unit-toggle').textContent = isCelsius ? "°C/°F" : "°F/°C";
  }
  if (document.getElementById('weather-tip')) {
    document.getElementById('weather-tip').style.display = settings.showTips ? 'block' : 'none';
  }
}

function showLoading() {
  const loading = document.getElementById('loading');
  const weatherIcon = document.getElementById('weather-icon');
  if (loading && weatherIcon) {
    loading.classList.remove('hidden');
    weatherIcon.classList.add('hidden');
  }
}

function hideLoading() {
  const loading = document.getElementById('loading');
  const weatherIcon = document.getElementById('weather-icon');
  if (loading && weatherIcon) {
    loading.classList.add('hidden');
    weatherIcon.classList.remove('hidden');
  }
}

function initMap(lat, lon) {
  if (map) map.remove();
  map = L.map('map', {
    zoomControl: true,
    attributionControl: true,
    gestureHandling: true
  }).setView([lat, lon], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);
  precipitationLayer = L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`, { maxZoom: 19, opacity: 0.6 });
  temperatureLayer = L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`, { maxZoom: 19, opacity: 0.6 });
  windLayer = L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${apiKey}`, { maxZoom: 19, opacity: 0.6 });
  precipitationLayer.addTo(map);
}

function switchMapLayer(layer) {
  const buttons = document.querySelectorAll('#map-layers button');
  buttons.forEach(btn => btn.classList.remove('active'));
  if (layer === 'precipitation') {
    map.removeLayer(temperatureLayer);
    map.removeLayer(windLayer);
    precipitationLayer.addTo(map);
    document.getElementById('layer-precipitation').classList.add('active');
  } else if (layer === 'temperature') {
    map.removeLayer(precipitationLayer);
    map.removeLayer(windLayer);
    temperatureLayer.addTo(map);
    document.getElementById('layer-temperature').classList.add('active');
  } else if (layer === 'wind') {
    map.removeLayer(precipitationLayer);
    map.removeLayer(temperatureLayer);
    windLayer.addTo(map);
    document.getElementById('layer-wind').classList.add('active');
  }
}

function getWeatherTip(data) {
  if (!settings.showTips) return "";
  const temp = data.main.temp;
  const weatherCode = data.weather[0].icon;
  const windSpeed = data.wind.speed;
  if (weatherCode.includes('09') || weatherCode.includes('10')) {
    return "Neem een paraplu mee, buien verwacht!";
  } else if (weatherCode.includes('01d')) {
    return "Perfect voor een wandeling, vergeet je zonnebril niet!";
  } else if (weatherCode.includes('01n')) {
    return "Heldere nacht, ideaal om sterren te kijken!";
  } else if (weatherCode.includes('13')) {
    return "Pas op voor gladheid, sneeuw mogelijk!";
  } else if (temp < 5) {
    return "Kleed je warm aan, het wordt fris vandaag!";
  } else if (windSpeed > 7) {
    return "Harde wind vandaag, ideaal voor vliegeren!";
  } else if (temp > 25) {
    return "Zomers weer, blijf gehydrateerd!";
  } else {
    return "Gewoon een mooie dag, geniet ervan!";
  }
}

function getWeather(lat, lon, city = null) {
  showLoading();
  const url = city
    ? `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}&lang=nl`
    : `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}&lang=nl`;

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error(response.status === 401 ? 'Ongeldige API-sleutel' : 'Locatie niet gevonden');
      return response.json();
    })
    .then(data => {
      if (!data.name || !data.sys || !data.main) throw new Error('Onvolledige weergegevens ontvangen');
      const location = `${data.name}, ${data.sys.country}`;
      const temperature = Math.round(data.main.temp);
      const description = data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
      const humidity = `Luchtvochtigheid: ${data.main.humidity}%`;
      const windSpeed = `Wind: ${data.wind.speed} ${unit === "metric" ? "m/s" : "mph"}`;
      const pressure = `Druk: ${data.main.pressure} hPa`;
      const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
      const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
      const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      const weatherTip = getWeatherTip(data);

      document.getElementById('location').textContent = location;
      document.getElementById('temperature').textContent = `${temperature}${isCelsius ? '°C' : '°F'}`;
      document.getElementById('description').textContent = description;
      document.getElementById('humidity').textContent = humidity;
      document.getElementById('wind').textContent = windSpeed;
      document.getElementById('pressure').textContent = pressure;
      document.getElementById('sunrise-sunset').textContent = `Zonsopgang/Zonsondergang: ${sunrise}/${sunset}`;
      document.getElementById('weather-icon').src = icon;
      document.getElementById('weather-tip').textContent = `Weertip: ${weatherTip}`;
      document.getElementById('weather-tip').style.display = settings.showTips ? 'block' : 'none';

      currentLat = data.coord.lat;
      currentLon = data.coord.lon;
      initMap(currentLat, currentLon);
      getHourlyForecast(currentLat, currentLon);
      getWeeklyForecast(currentLat, currentLon);
      hideLoading();
    })
    .catch(error => {
      hideLoading();
      console.error('Fout bij het ophalen van weergegevens:', error.message);
      alert(`Fout bij het ophalen van het weer: ${error.message}. Controleer de API-sleutel of locatie.`);
    });
}

function getHourlyForecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}&lang=nl`)
    .then(response => {
      if (!response.ok) throw new Error(response.status === 401 ? 'Ongeldige API-sleutel' : 'Voorspelling niet beschikbaar');
      return response.json();
    })
    .then(data => {
      const hourlyData = data.list.slice(0, 12);
      const hourlyForecast = document.getElementById('hourly-forecast');
      if (!hourlyForecast) return;
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
      console.error('Fout bij het ophalen van uurlijkse voorspelling:', error.message);
      alert(`Fout bij het ophalen van de uurlijkse voorspelling: ${error.message}`);
    });
}

function getWeeklyForecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=7&appid=${apiKey}&units=${unit}&lang=nl`)
    .then(response => {
      if (!response.ok) throw new Error(response.status === 401 ? 'Ongeldige API-sleutel' : 'Voorspelling niet beschikbaar');
      return response.json();
    })
    .then(data => {
      const weeklyData = data.list;
      const weeklyForecast = document.getElementById('weekly-forecast');
      if (!weeklyForecast) return;
      weeklyForecast.innerHTML = '';
      weeklyData.forEach(day => {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day', 'bg-white', 'bg-opacity-20', 'rounded-lg', 'p-3', 'text-center');
        dayDiv.innerHTML = `
          <p class="font-semibold text-sm">${new Date(day.dt * 1000).toLocaleDateString('nl-NL', { weekday: 'long' })}</p>
          <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="Weer icoon" class="w-8 mx-auto">
          <p class="text-sm">${Math.round(day.temp.day)}${isCelsius ? '°C' : '°F'}</p>
          <p class="text-sm">${day.weather[0].description.charAt(0).toUpperCase() + day.weather[0].description.slice(1)}</p>
        `;
        weeklyForecast.appendChild(dayDiv);
      });
    })
    .catch(error => {
      console.error('Fout bij het ophalen van weekvoorspelling:', error.message);
      alert(`Fout bij het ophalen van de weekvoorspelling: ${error.message}`);
    });
}

function toggleUnit() {
  isCelsius = !isCelsius;
  unit = isCelsius ? "metric" : "imperial";
  localStorage.setItem('unit', unit);
  const unitToggle = document.getElementById('unit-toggle');
  if (unitToggle) {
    unitToggle.textContent = isCelsius ? "°C/°F" : "°F/°C";
  }
  if (currentLat && currentLon) {
    getWeather(currentLat, currentLon);
  } else {
    alert('Selecteer eerst een locatie!');
  }
}

function searchWeather() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    const city = searchInput.value.trim();
    if (city) {
      getWeather(null, null, city);
    } else {
      alert('Voer een geldige locatie in!');
    }
  }
}

function switchTab(tab) {
  const tabs = document.querySelectorAll('.tab-pane');
  const buttons = document.querySelectorAll('.tab-btn');
  tabs.forEach(t => t.classList.add('hidden'));
  buttons.forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.remove('hidden');
  document.getElementById(`tab-btn-${tab}`).classList.add('active');
}

function togglePanel() {
  const panel = document.getElementById('panel');
  const toggleBtn = document.getElementById('panel-toggle');
  if (panel.classList.contains('translate-y-full')) {
    panel.classList.remove('translate-y-full');
    toggleBtn.querySelector('svg').classList.add('rotate-180');
  } else {
    panel.classList.add('translate-y-full');
    toggleBtn.querySelector('svg').classList.remove('rotate-180');
  }
}

function initSettingsPage() {
  const defaultLocation = document.getElementById('default-location');
  const unitSelect = document.getElementById('unit-select');
  const themeSelect = document.getElementById('theme-select');
  const tipsToggle = document.getElementById('tips-toggle');
  const saveBtn = document.getElementById('save-settings');

  if (defaultLocation && unitSelect && themeSelect && tipsToggle && saveBtn) {
    defaultLocation.value = settings.defaultLocation;
    unitSelect.value = unit;
    themeSelect.value = settings.theme;
    tipsToggle.checked = settings.showTips;

    saveBtn.addEventListener('click', () => {
      settings.defaultLocation = defaultLocation.value.trim();
      settings.unit = unitSelect.value;
      settings.theme = themeSelect.value;
      settings.showTips = tipsToggle.checked;
      localStorage.setItem('defaultLocation', settings.defaultLocation);
      localStorage.setItem('unit', settings.unit);
      localStorage.setItem('theme', settings.theme);
      localStorage.setItem('showTips', settings.showTips);
      applySettings();
      alert('Instellingen opgeslagen!');
      if (settings.defaultLocation) {
        getWeather(null, null, settings.defaultLocation);
      }
    });
  }
}

function init() {
  applySettings();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker geregistreerd:', reg))
      .catch(err => console.error('Service Worker registratie mislukt:', err));
  }

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
        getWeather(currentLat, currentLon, settings.defaultLocation || 'Amsterdam');
        alert('Locatie kan niet worden bepaald. Standaardlocatie: Amsterdam.');
      }
    );
  } else {
    currentLat = 52.3676;
    currentLon = 4.9041;
    getWeather(currentLat, currentLon, settings.defaultLocation || 'Amsterdam');
    alert('Geolocatie wordt niet ondersteund. Standaardlocatie: Amsterdam.');
  }

  if (document.getElementById('panel-toggle')) {
    document.getElementById('panel-toggle').addEventListener('click', togglePanel);
  }
  if (document.querySelectorAll('.tab-btn')) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.id.replace('tab-btn-', '')));
    });
  }
  if (document.getElementById('layer-precipitation')) {
    document.getElementById('layer-precipitation').addEventListener('click', () => switchMapLayer('precipitation'));
    document.getElementById('layer-temperature').addEventListener('click', () => switchMapLayer('temperature'));
    document.getElementById('layer-wind').addEventListener('click', () => switchMapLayer('wind'));
  }

  if (window.location.pathname.includes('settings.html')) {
    initSettingsPage();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');

  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', searchWeather);
    searchInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') searchWeather();
    });
    init();
  }
});
