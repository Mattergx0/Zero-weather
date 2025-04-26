const apiKey = "51449fa3b241b52737fe2b3626795957";

// Laad kaart
function loadMap(lat, lon) {
  const map = L.map('map').setView([lat, lon], 10);

  L.tileLayer('https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=' + apiKey, {
    maxZoom: 19,
    attribution: 'Map data © OpenWeatherMap',
  }).addTo(map);
}

// Weer ophalen
function getWeather(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=nl`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('location').textContent = `${data.name}, ${data.sys.country}`;
      document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
      document.getElementById('description').textContent = data.weather[0].description;
      document.getElementById('humidity').textContent = `Luchtvochtigheid: ${data.main.humidity}%`;
      document.getElementById('wind').textContent = `Wind: ${data.wind.speed} m/s`;
      document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    })
    .catch(error => {
      console.error('Weerdata ophalen mislukt:', error);
    });
}

// Locatie ophalen
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      getWeather(latitude, longitude);
      loadMap(latitude, longitude);
    },
    error => {
      alert('Locatie niet beschikbaar!');
    }
  );
} else {
  alert('Geolocatie wordt niet ondersteund door je browser.');
}
