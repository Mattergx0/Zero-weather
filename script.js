const apiKey = "51449fa3b241b52737fe2b3626795957";

// Functie voor het laden van de regenkaart
function loadMap(lat, lon) {
  const map = L.map('map').setView([lat, lon], 10);
  
  L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
    maxZoom: 19,
    attribution: 'Map data &copy; OpenWeatherMap',
  }).addTo(map);
}

// Weer informatie ophalen
function getWeather(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=nl`)
    .then(response => response.json())
    .then(data => {
      const location = `${data.name}, ${data.sys.country}`;
      const temperature = Math.round(data.main.temp);
      const description = data.weather[0].description;
      const humidity = `Luchtvochtigheid: ${data.main.humidity}%`;
      const windSpeed = `Wind: ${data.wind.speed} m/s`;
      const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

      document.getElementById('location').textContent = location;
      document.getElementById('temperature').textContent = `${temperature}°C`;
      document.getElementById('description').textContent = description;
      document.getElementById('humidity').textContent = humidity;
      document.getElementById('wind').textContent = windSpeed;
      document.getElementById('weather-icon').src = icon;

      loadMap(lat, lon); // Laad de regenkaart
    })
    .catch(error => {
      console.error('Er is een fout opgetreden bij het ophalen van het weer:', error);
    });
}

// Uurlijkse voorspellingen ophalen
function getHourlyForecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,daily,alerts&appid=${apiKey}&units=metric&lang=nl`)
    .then(response => response.json())
    .then(data => {
      const hourlyData = data.hourly.slice(0, 12);
      const hourlyForecast = document.getElementById('hourly-forecast');
      hourlyForecast.innerHTML = '';

      hourlyData.forEach(hour => {
        const hourDiv = document.createElement('div');
        hourDiv.classList.add('hour');
        hourDiv.innerHTML = `
          <p>${new Date(hour.dt * 1000).getHours()}:00</p>
          <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="Weer icoon">
          <p>${Math.round(hour.temp)}°C</p>
        `;
        hourlyForecast.appendChild(hourDiv);
      });
    })
    .catch(error => {
      console.error('Er is een fout opgetreden bij het ophalen van de uurlijkse voorspellingen:', error);
    });
}

// Functie om de locatie op te halen
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
