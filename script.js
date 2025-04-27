const apiKey = "51449fa3b241b52737fe2b3626795957";
let unit = "metric";
let isCelsius = true;
let currentLat, currentLon;
const maxHistory = 5;
let widgetCityIndex = 0;

function showLoading() {
  const loading = document.getElementById('loading');
  const weatherIcon = document.getElementById('weather-icon');
  if (loading && weatherIcon) {
    loading.classList.remove('hidden');
    weatherIcon.classList.add('hidden');
  } else {
    console.error('Ladelement of weericoon niet gevonden');
  }
}

function hideLoading() {
  const loading = document.getElementById('loading');
  const weatherIcon = document.getElementById('weather-icon');
  if (loading && weatherIcon) {
    loading.classList.add('hidden');
    weatherIcon.classList.remove('hidden');
  } else {
    console.error('Ladelement of weericoon niet gevonden');
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

function setWeatherBackground(weatherCode) {
  const body = document.body;
  body.classList.remove('bg-gradient-to-br', 'from-blue-500', 'to-blue-200', 'from-amber-300', 'to-orange-100', 'from-gray-600', 'to-blue-400', 'from-blue-200', 'to-gray-100', 'from-gray-500', 'to-gray-300');
  const weatherInfo = document.querySelector('.weather-info');
  
  if (weatherCode.includes('01') || weatherCode.includes('02')) {
    body.classList.add('bg-gradient-to-br', 'from-amber-300', 'to-orange-100'); // Zonnig
    weatherInfo.classList.add('text-black');
    weatherInfo.classList.remove('text-white');
  } else if (weatherCode.includes('09') || weatherCode.includes('10') || weatherCode.includes('11')) {
    body.classList.add('bg-gradient-to-br', 'from-gray-600', 'to-blue-400'); // Regen
    weatherInfo.classList.add('text-white');
    weatherInfo.classList.remove('text-black');
  } else if (weatherCode.includes('13')) {
    body.classList.add('bg-gradient-to-br', 'from-blue-200', 'to-gray-100'); // Sneeuw
    weatherInfo.classList.add('text-black');
    weatherInfo.classList.remove('text-white');
  } else if (weatherCode.includes('03') || weatherCode.includes('04')) {
    body.classList.add('bg-gradient-to-br', 'from-gray-500', 'to-gray-300'); // Bewolkt
    weatherInfo.classList.add('text-white');
    weatherInfo.classList.remove('text-black');
  } else {
    body.classList.add('bg-gradient-to-br', 'from-blue-500', 'to-blue-200'); // Standaard
    weatherInfo.classList.add('text-white');
    weatherInfo.classList.remove('text-black');
  }
}

function getWeatherTip(data) {
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

function getActivityTip(data, city) {
  const weatherCode = data.weather[0].icon;
  const temp = data.main.temp;
  const cityLower = city.toLowerCase();

  if (cityLower.includes('amsterdam')) {
    if (weatherCode.includes('01') || temp > 20) {
      return "Perfect voor een fietstocht langs de Amstel!";
    } else if (weatherCode.includes('09') || weatherCode.includes('10')) {
      return "Bezoek het Rijksmuseum, ideaal voor een regenachtige dag!";
    } else {
      return "Ontdek de grachten met een rondvaart!";
    }
  } else if (cityLower.includes('rotterdam')) {
    if (weatherCode.includes('01') || temp > 20) {
      return "Geniet van een wandeling over de Erasmusbrug!";
    } else if (weatherCode.includes('09') || weatherCode.includes('10')) {
      return "Bezoek het Erasmus MC, ideaal voor een regenachtige dag!";
    } else {
      return "Verken de Markthal voor een unieke ervaring!";
    }
  } else if (cityLower.includes('utrecht')) {
    if (weatherCode.includes('01') || temp > 20) {
      return "Fiets langs de Oudegracht voor een zonnige dag!";
    } else if (weatherCode.includes('09') || weatherCode.includes('10')) {
      return "Ontdek het Centraal Museum, perfect voor regen!";
    } else {
      return "Bezoek de Domtoren voor een historische ervaring!";
    }
  } else {
    if (weatherCode.includes('01') || temp > 20) {
      return "Tijd voor een picknick in het park!";
    } else if (weatherCode.includes('09') || weatherCode.includes('10')) {
      return "Blijf binnen en geniet van een filmavond!";
    } else {
      return "Verken een lokale markt voor wat gezelligheid!";
    }
  }
}

function saveLocation(city) {
  let history = JSON.parse(localStorage.getItem('locationHistory')) || [];
  history = history.filter(loc => loc.toLowerCase() !== city.toLowerCase());
  history.unshift(city);
  if (history.length > maxHistory) {
    history.pop();
  }
  localStorage.setItem('locationHistory', JSON.stringify(history));
}

function showLocationSuggestions() {
  const suggestionsDiv = document.getElementById('location-suggestions');
  const searchInput = document.getElementById('search-input');
  if (!suggestionsDiv || !searchInput) return;

  const history = JSON.parse(localStorage.getItem('locationHistory')) || [];
  if (history.length === 0) {
    suggestionsDiv.classList.add('hidden');
    return;
  }

  suggestionsDiv.innerHTML = '';
  history.forEach(city => {
    const suggestion = document.createElement('div');
    suggestion.classList.add('suggestion-item', 'p-2', 'hover:bg-gray-200', 'cursor-pointer', 'text-sm');
    suggestion.textContent = city;
    suggestion.addEventListener('click', () => {
      searchInput.value = city;
      suggestionsDiv.classList.add('hidden');
      getWeather(null, null, city);
    });
    suggestionsDiv.appendChild(suggestion);
  });
  suggestionsDiv.classList.remove('hidden');
}

function updateWeatherWidget() {
  const history = JSON.parse(localStorage.getItem('locationHistory')) || [];
  const widgetTemp = document.getElementById('widget-temp');
  const widgetIcon = document.getElementById('widget-icon');
  const widget = document.getElementById('weather-widget');

  if (!history.length) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=Utrecht&appid=${apiKey}&units=${unit}&lang=nl`)
      .then(response => response.json())
      .then(data => {
        widgetTemp.textContent = `${Math.round(data.main.temp)}${isCelsius ? '°C' : '°F'}`;
        widgetIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
        widgetIcon.classList.remove('hidden');
        widget.title = `Weer voor Utrecht`;
      })
      .catch(error => {
        console.error('Fout bij widget update:', error);
        widgetTemp.textContent = '-';
        widgetIcon.classList.add('hidden');
      });
    return;
  }

  const city = history[widgetCityIndex % history.length];
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}&lang=nl`)
    .then(response => response.json())
    .then(data => {
      widgetTemp.textContent = `${Math.round(data.main.temp)}${isCelsius ? '°C' : '°F'}`;
      widgetIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
      widgetIcon.classList.remove('hidden');
      widget.title = `Weer voor ${city}`;
    })
    .catch(error => {
      console.error('Fout bij widget update:', error);
      widgetTemp.textContent = '-';
      widgetIcon.classList.add('hidden');
    });
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
      const weatherTip = getWeatherTip(data);
      const activityTip = getActivityTip(data, data.name);

      document.getElementById('location').textContent = location;
      document.getElementById('temperature').textContent = `${temperature}${isCelsius ? '°C' : '°F'}`;
      document.getElementById('description').textContent = description;
      document.getElementById('humidity').textContent = humidity;
      document.getElementById('wind').textContent = windSpeed;
      document.getElementById('pressure').textContent = pressure;
      document.getElementById('sunrise-sunset').textContent = `Zonsopgang/Zonsondergang: ${sunrise}/${sunset}`;
      document.getElementById('weather-icon').src = icon;
      document.getElementById('weather-tip').textContent = `Weertip: ${weatherTip}`;
      document.getElementById('activity-tip').textContent = `Activiteitentip: ${activityTip}`;

      setWeatherBackground(data.weather[0].icon);

      if (city) {
        saveLocation(city);
      }

      currentLat = data.coord.lat;
      currentLon = data.coord.lon;
      loadMap(currentLat, currentLon);
      getHourlyForecast(currentLat, currentLon);
      updateWeatherWidget();
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
          <p class="font-semibold text-xs sm:text-sm">${new Date(hour.dt * 1000).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</p>
          <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="Weer icoon" class="w-8 sm:w-10">
          <p class="text-xs sm:text-sm">${Math.round(hour.main.temp)}${isCelsius ? '°C' : '°F'}</p>
          <p class="text-xs sm:text-sm">${hour.weather[0].description.charAt(0).toUpperCase() + hour.weather[0].description.slice(1)}</p>
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
  const suggestionsDiv = document.getElementById('location-suggestions');
  if (searchInput && suggestionsDiv) {
    const city = searchInput.value.trim();
    if (city) {
      getWeather(null, null, city);
      suggestionsDiv.classList.add('hidden');
    } else {
      alert('Voer een geldige locatie in!');
    }
  } else {
    console.error('Zoekinvoer of suggestiediv niet gevonden');
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

  // Locatiegeschiedenis event listeners
  const searchInput = document.getElementById('search-input');
  const suggestionsDiv = document.getElementById('location-suggestions');
  if (searchInput && suggestionsDiv) {
    searchInput.addEventListener('focus', showLocationSuggestions);
    searchInput.addEventListener('input', () => {
      if (!searchInput.value.trim()) {
        showLocationSuggestions();
      } else {
        suggestionsDiv.classList.add('hidden');
      }
    });
    document.addEventListener('click', e => {
      if (!searchInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
        suggestionsDiv.classList.add('hidden');
      }
    });
  }

  // Widget event listener
  const weatherWidget = document.getElementById('weather-widget');
  if (weatherWidget) {
    weatherWidget.addEventListener('click', () => {
      widgetCityIndex++;
      updateWeatherWidget();
    });
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
