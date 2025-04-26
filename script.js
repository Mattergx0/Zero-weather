const apiKey = "51449fa3b241b52737fe2b3626795957";
let unit = "metric";
let isCelsius = true;
let currentLat, currentLon;

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

function loadMap(lat, lon) {
  const mapElement = document.getElementById('map');
  if (!mapElement) {
    console.error('Kaartelement niet gevonden');
    return;
  }
  try {
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
    console.log('Kaart succesvol geladen voor lat:', lat, 'lon:', lon);
  } catch (error) {
    console.error('Fout bij het laden van de kaart:', error);
    alert('Fout bij het laden van de regenkaart. Probeer het opnieuw.');
  }
}

function getWeather(lat, lon, city = null) {
  showLoading();
  const url = city
    ? `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}&lang=nl`
    : `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}&lang=nl`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.status === 401 ? 'Ongeldige API-sleutel' : 'Locatie niet gevonden');
      }
      return response.json();
    })
    .then(data => {
      if (!data.name || !data.sys || !data.main) {
        throw new Error('Onvolledige weergegevens ontvangen');
      }
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
      console.log('Weergegevens succesvol geladen voor:', location);
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
      if (!response.ok) {
        throw new Error(response.status === 401 ? 'Ongeldige API-sleutel' : 'Voorspelling niet beschikbaar');
      }
      return response.json();
    })
    .then(data => {
      const hourlyData = data.list.slice(0, 12);
      const hourlyForecast = document.getElementById('hourly-forecast');
      if (!hourlyForecast) {
        console.error('Uurlijkse voorspelling element niet gevonden');
        return;
      }
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
      console.log('Uurlijkse voorspelling geladen voor:', lat, lon);
    })
    .catch(error => {
      console.error('Fout bij het ophalen van uurlijkse voorspelling:', error.message);
      alert(`Fout bij het ophalen van de uurlijkse voorspelling: ${error.message}`);
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
  // Registreer service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker geregistreerd:', reg))
      .catch(err => console.error('Service Worker registratie mislukt:', err));
  }

  // Haal locatie op
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        currentLat = latitude;
        currentLon = longitude;
        getWeather(latitude, longitude);
        console.log('Geolocatie succesvol:', latitude, longitude);
      },
      error => {
        currentLat = 52.3676;
        currentLon = 4.9041;
        getWeather(currentLat, currentLon, 'Amsterdam');
        console.warn('Geolocatie mislukt, fallback naar Amsterdam:', error.message);
        alert('Locatie kan niet worden bepaald. Standaardlocatie: Amsterdam.');
      }
    );
  } else {
    currentLat = 52.3676;
    currentLon = 4.9041;
    getWeather(currentLat, currentLon, 'Amsterdam');
    console.warn('Geolocatie niet ondersteund, fallback naar Amsterdam');
    alert('Geolocatie wordt niet ondersteund. Standaardlocatie: Amsterdam.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');
  const unitToggle = document.getElementById('unit-toggle');

  if (searchBtn && searchInput && unitToggle) {
    searchBtn.addEventListener('click', searchWeather);
    searchInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') searchWeather();
    });
    unitToggle.addEventListener('click', toggleUnit);
    init();
  } else {
    console.error('Een of meer UI-elementen niet gevonden');
    alert('Fout: Kan de app niet initialiseren. Controleer de pagina-opbouw.');
  }
});
