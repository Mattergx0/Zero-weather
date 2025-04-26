const apiKey = "51449fa3b241b52737fe2b3626795957";
let unit = "metric";
let isCelsius = true;

function loadMap(lat, lon) {
  const map = L.map('map').setView([lat, lon], 10);
  L.tileLayer(`https://tile.openstreetmap.org/{z}/{x}/{y}.png`, {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);
  L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
    maxZoom: 19,
    opacity: 0.6
  }).addTo(map);
}

function getWeather(lat, lon, city = null) {
  const url = city 
    ? `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}&lang=nl`
    : `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}&lang=nl`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.cod !== 200[key]) {
        throw new Error(data.message);
      }
      const location = `${data.name}, ${data.sys.country}`;
      const temperature = Math.round(data.main.temp);
      const description = data.weather[0].description;
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

      loadMap(data.coord.lat, data.coord.lon);
    })
    .catch(error => {
      alert(`Fout bij het ophalen van het weer: ${error.message}`);
    });
}

function getHourlyForecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}&lang=nl`)
    .then(response => response.json())
    .then(data => {
      const hourlyData = data.list.slice(0, 12);
      const hourlyForecast = document.getElementById('hourly-forecast');
      hourlyForecast.innerHTML = '';

      hourlyData.forEach(hour => {
        const hourDiv = document.createElement('div');
        hourDiv.classList.add('hour');
        hourDiv.innerHTML = `
          <p class="font-semibold">${new Date(hour.dt * 1000).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</p>
          <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="Weer icoon">
          <p>${Math.round(hour.main.temp)}${isCelsius ? '°C' : '°F'}</p>
          <p class="text-sm">${hour.weather[0].description}</p>
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
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      getWeather(latitude, longitude);
      getHourlyForecast(latitude, longitude);
    });
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

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      getWeather(latitude, longitude);
      getHourlyForecast(latitude, longitude);
    },
    error => {
      alert('Locatie kan niet worden bepaald! Zorg ervoor dat je locatie-instellingen zijn ingeschakeld.');
    }
  );
} else {
  alert('Geolocatie wordt niet ondersteund door deze browser.');
}

document.getElementById('search-btn').addEventListener('click', searchWeather);
document.getElementById('search-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchWeather();
});
document.getElementById('unit-toggle').addEventListener('click', toggleUnit);
