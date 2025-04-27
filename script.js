const apiKey = "51449fa3b241b52737fe2b3626795957";
let currentLat, currentLon;
const maxHistory = 5;
let lastWeatherData = null;

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
  if (!mapElement) return;
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
  } catch (error) {
    console.error('Fout bij het laden van de kaart:', error);
    alert('Fout bij het laden van de regenkaart.');
  }
}

function setWeatherBackground(weatherCode) {
  const body = document.body;
  const weatherInfo = document.querySelector('.weather-info');
  body.classList.remove('bg-gradient-to-br', 'from-blue-500', 'to-blue-200', 'from-amber-300', 'to-orange-100', 'from-gray-600', 'to-blue-400', 'from-blue-200', 'to-gray-100', 'from-gray-500', 'to-gray-300');
  
  if (weatherCode.includes('01') || weatherCode.includes('02')) {
    body.classList.add('bg-gradient-to-br', 'from-amber-300', 'to-orange-100');
    weatherInfo.classList.add('text-black');
    weatherInfo.classList.remove('text-white');
  } else if (weatherCode.includes('09') || weatherCode.includes('10') || weatherCode.includes('11')) {
    body.classList.add('bg-gradient-to-br', 'from-gray-600', 'to-blue-400');
    weatherInfo.classList.add('text-white');
    weatherInfo.classList.remove('text-black');
  } else if (weatherCode.includes('13')) {
    body.classList.add('bg-gradient-to-br', 'from-blue-200', 'to-gray-100');
    weatherInfo.classList.add('text-black');
    weatherInfo.classList.remove('text-white');
  } else if (weatherCode.includes('03') || weatherCode.includes('04')) {
    body.classList.add('bg-gradient-to-br', 'from-gray-500', 'to-gray-300');
    weatherInfo.classList.add('text-white');
    weatherInfo.classList.remove('text-black');
  } else {
    body.classList.add('bg-gradient-to-br', 'from-blue-500', 'to-blue-200');
    weatherInfo.classList.add('text-white');
    weatherInfo.classList.remove('text-black');
  }
}

function getWeatherTip(data) {
  const temp = data.main.temp;
  const weatherCode = data.weather[0].icon;
  const windSpeed = data.wind.speed;

  if (weatherCode.includes('09') || weatherCode.includes('10')) return "Neem een paraplu mee, buien verwacht!";
  if (weatherCode.includes('01d')) return "Perfect voor een wandeling, vergeet je zonnebril niet!";
  if (weatherCode.includes('01n')) return "Heldere nacht, ideaal om sterren te kijken!";
  if (weatherCode.includes('13')) return "Pas op voor gladheid, sneeuw mogelijk!";
  if (temp < 5) return "Kleed je warm aan, het wordt fris vandaag!";
  if (windSpeed > 7) return "Harde wind vandaag, ideaal voor vliegeren!";
  if (temp > 25) return "Zomers weer, blijf gehydrateerd!";
  return "Gewoon een mooie dag, geniet ervan!";
}

function getActivityTip(data, city) {
  const weatherCode = data.weather[0].icon;
  const temp = data.main.temp;
  const cityLower = city.toLowerCase();

  if (cityLower.includes('amsterdam')) {
    if (weatherCode.includes('01') || temp > 20) return "Perfect voor een fietstocht langs de Amstel!";
    if (weatherCode.includes('09') || weatherCode.includes('10')) return "Bezoek het Rijksmuseum, ideaal voor een regenachtige dag!";
    return "Ontdek de grachten met een rondvaart!";
  }
  if (cityLower.includes('rotterdam')) {
    if (weatherCode.includes('01') || temp > 20) return "Geniet van een wandeling over de Erasmusbrug!";
    if (weatherCode.includes('09') || weatherCode.includes('10')) return "Bezoek het Erasmus MC, ideaal voor een regenachtige dag!";
    return "Verken de Markthal voor een unieke ervaring!";
  }
  if (cityLower.includes('utrecht')) {
    if (weatherCode.includes('01') || temp > 20) return "Fiets langs de Oudegracht voor een zonnige dag!";
    if (weatherCode.includes('09') || weatherCode.includes('10')) return "Ontdek het Centraal Museum, perfect voor regen!";
    return "Bezoek de Domtoren voor een historische ervaring!";
  }
  if (weatherCode.includes('01') || temp > 20) return "Tijd voor een picknick in het park!";
  if (weatherCode.includes('09') || weatherCode.includes('10')) return "Blijf binnen en geniet van een filmavond!";
  return "Verken een lokale markt voor wat gezelligheid!";
}

function getWeatherQuote(data) {
  const weatherCode = data.weather[0].icon;
  if (weatherCode.includes('01')) return "De zon schijnt, laat je dag stralen!";
  if (weatherCode.includes('09') || weatherCode.includes('10')) return "Laat de regen je niet stoppen!";
  if (weatherCode.includes('13')) return "Sneeuw maakt alles magisch!";
  if (weatherCode.includes('03') || weatherCode.includes('04')) return "Bewolkt, maar jouw humeur kan schitteren!";
  return "Elk weer is een nieuw avontuur!";
}

function saveLocation(city) {
  let history = JSON.parse(localStorage.getItem('locationHistory')) || [];
  history = history.filter(loc => loc.toLowerCase() !== city.toLowerCase());
  history.unshift(city);
  if (history.length > maxHistory) history.pop();
  localStorage.setItem('locationHistory', JSON.stringify(history));
}

function saveFavorite(city) {
  let favorites = JSON.parse(localStorage.getItem('favoriteLocations')) || [];
  if (!favorites.includes(city)) {
    favorites.push(city);
    localStorage.setItem('favoriteLocations', JSON.stringify(favorites));
    alert(`${city} toegevoegd aan favorieten!`);
  } else {
    alert(`${city} is al een favoriet!`);
  }
}

function showLocationSuggestions(input) {
  const suggestionsDiv = document.getElementById('location-suggestions');
  if (!suggestionsDiv) return;

  const history = JSON.parse(localStorage.getItem('locationHistory')) || [];
  const favorites = JSON.parse(localStorage.getItem('favoriteLocations')) || [];
  const popularCities = ['Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag', 'Groningen'];
  let suggestions = [];

  if (!input.trim()) {
    suggestions = [...new Set([...favorites, ...history, ...popularCities])];
  } else {
    suggestions = [...history, ...favorites, ...popularCities].filter(city => 
      city.toLowerCase().includes(input.toLowerCase())
    );
  }

  suggestionsDiv.innerHTML = '';
  suggestions.slice(0, 5).forEach(city => {
    const suggestion = document.createElement('div');
    suggestion.classList.add('suggestion-item', 'p-2', 'hover:bg-gray-200', 'cursor-pointer', 'text-sm');
    suggestion.textContent = city + (favorites.includes(city) ? ' ⭐' : '');
    suggestion.addEventListener('click', () => {
      document.getElementById('search-input').value = city;
      suggestionsDiv.classList.add('hidden');
      getWeather(null, null, city);
    });
    suggestionsDiv.appendChild(suggestion);
  });
  suggestionsDiv.classList.remove('hidden');
}

function setupNotifications(city, data) {
  if (!("Notification" in window)) {
    alert("Pushmeldingen worden niet ondersteund door je browser.");
    return;
  }

  const toggle = document.getElementById('notifications-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    if (Notification.permission === "granted") {
      toggleNotifications(city, data);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          toggleNotifications(city, data);
        }
      });
    }
  });
}

function toggleNotifications(city, data) {
  const toggle = document.getElementById('notifications-toggle');
  const isEnabled = toggle.classList.toggle('bg-green-600');
  toggle.classList.toggle('bg-blue-600');
  toggle.textContent = isEnabled ? '🔔 Aan' : '🔔 Uit';

  if (isEnabled) {
    checkExtremeWeather(city, data);
  }
}

function checkExtremeWeather(city, data) {
  if (data.weather[0].main.toLowerCase().includes('rain') && data.rain && data.rain['1h'] > 5) {
    new Notification(`Zware regen in ${city}!`, {
      body: `Neem een paraplu mee, ${data.rain['1h']} mm regen verwacht.`,
      icon: 'icon.png'
    });
  }
  if (data.main.temp > 30) {
    new Notification(`Hittegolf in ${city}!`, {
      body: `Blijf gehydrateerd, temperatuur: ${Math.round(data.main.temp)}°C.`,
      icon: 'icon.png'
    });
  }
}

function drawWeatherTrend(data) {
  const ctx = document.getElementById('weather-trend').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.daily.slice(0, 5).map(day => new Date(day.dt * 1000).toLocaleDateString('nl-NL', { weekday: 'short' })),
      datasets: [{
        label: 'Temperatuur (°C)',
        data: data.daily.slice(0, 5).map(day => Math.round(day.temp.day)),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: false },
        x: { ticks: { font: { size: 12 } } }
      },
      plugins: {
        legend: { display: false },
        title: { display: true, text: '5-Daagse Temperatuurtrend', font: { size: 14 } }
      }
    }
  });
}

function getWeather(lat, lon, city = null) {
  showLoading();
  const url = city
    ? `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=nl`
    : `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=nl`;

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error(response.status === 401 ? 'Ongeldige API-sleutel' : 'Locatie niet gevonden');
      return response.json();
    })
    .then(data => {
      lastWeatherData = data;
      const location = `${data.name}, ${data.sys.country}`;
      const temperature = Math.round(data.main.temp);
      const description = data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
      const humidity = `Luchtvochtigheid: ${data.main.humidity}%`;
      const windSpeed = `Wind: ${data.wind.speed} m/s`;
      const pressure = `Druk: ${data.main.pressure} hPa`;
      const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
      const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
      const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      const weatherTip = getWeatherTip(data);
      const activityTip = getActivityTip(data, data.name);
      const weatherQuote = getWeatherQuote(data);

      document.getElementById('location').textContent = location;
      document.getElementById('temperature').textContent = `${temperature}°C`;
      document.getElementById('description').textContent = description;
      document.getElementById('humidity').textContent = humidity;
      document.getElementById('wind').textContent = windSpeed;
      document.getElementById('pressure').textContent = pressure;
      document.getElementById('sunrise-sunset').textContent = `Zonsopgang/Zonsondergang: ${sunrise}/${sunset}`;
      document.getElementById('weather-icon').src = icon;
      document.getElementById('weather-tip').textContent = `Weertip: ${weatherTip}`;
      document.getElementById('activity-tip').textContent = `Activiteitentip: ${activityTip}`;
      document.getElementById('weather-quote').textContent = `Weerquote: ${weatherQuote}`;

      setWeatherBackground(data.weather[0].icon);
      if (city) saveLocation(city);
      currentLat = data.coord.lat;
      currentLon = data.coord.lon;
      loadMap(currentLat, currentLon);
      getHourlyForecast(currentLat, currentLon);
      getDailyForecast(currentLat, currentLon);
      setupNotifications(data.name, data);
      hideLoading();
    })
    .catch(error => {
      hideLoading();
      if (lastWeatherData) {
        displayOfflineWeather(lastWeatherData);
      } else {
        alert(`Fout bij het ophalen van het weer: ${error.message}.`);
      }
    });
}

function displayOfflineWeather(data) {
  const location = `${data.name}, ${data.sys.country}`;
  document.getElementById('location').textContent = `${location} (Offline)`;
  document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
  document.getElementById('description').textContent = data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
  document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  document.getElementById('weather-tip').textContent = `Weertip: Laatste gegevens geladen (offline).`;
  document.getElementById('activity-tip').textContent = `Activiteitentip: Controleer later voor updates.`;
  setWeatherBackground(data.weather[0].icon);
}

function getHourlyForecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=nl`)
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
          <p class="font-semibold text-xs sm:text-sm">${new Date(hour.dt * 1000).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</p>
          <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="Weer icoon" class="w-8 sm:w-10 weather-animate">
          <p class="text-xs sm:text-sm">${Math.round(hour.main.temp)}°C</p>
          <p class="text-xs sm:text-sm">${hour.weather[0].description.charAt(0).toUpperCase() + hour.weather[0].description.slice(1)}</p>
        `;
        hourlyForecast.appendChild(hourDiv);
      });
    })
    .catch(error => {
      console.error('Fout bij uurlijkse voorspelling:', error);
    });
}

function getDailyForecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${apiKey}&units=metric&lang=nl`)
    .then(response => {
      if (!response.ok) throw new Error('Dagelijkse voorspelling niet beschikbaar');
      return response.json();
    })
    .then(data => {
      drawWeatherTrend(data);
    })
    .catch(error => {
      console.error('Fout bij dagelijkse voorspelling:', error);
    });
}

function searchWeather() {
  const searchInput = document.getElementById('search-input');
  const suggestionsDiv = document.getElementById('location-suggestions');
  if (searchInput && suggestionsDiv) {
    const city = searchInput.value.trim();
    if (city) {
      getWeather(null, null, city);
      suggestionsDiv.classList.add('hidden');
    } else {
      alert('Voer een geldige locatie in!');
    }
  }
}

function init() {
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

  const searchInput = document.getElementById('search-input');
  const suggestionsDiv = document.getElementById('location-suggestions');
  if (searchInput && suggestionsDiv) {
    searchInput.addEventListener('focus', () => showLocationSuggestions(searchInput.value));
    searchInput.addEventListener('input', () => showLocationSuggestions(searchInput.value));
    document.addEventListener('click', e => {
      if (!searchInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
        suggestionsDiv.classList.add('hidden');
      }
    });
  }

  const markFavorite = document.getElementById('mark-favorite');
  if (markFavorite) {
    markFavorite.addEventListener('click', () => {
      const city = document.getElementById('location').textContent.split(',')[0];
      saveFavorite(city);
    });
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
