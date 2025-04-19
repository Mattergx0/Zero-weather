const API_BASE = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API = "https://api.open-meteo.com/v1/forecast";
// Functie om weerdata op te halen
async function getWeather() {
  const location = document.getElementById("location").value;
  const loading = document.getElementById("loading");
  const cityName = document.getElementById("cityName");
  const currentDate = document.getElementById("currentDate");
  const temperature = document.getElementById("temperature");
  const weatherDescription = document.getElementById("weatherDescription");
  const humidity = document.getElementById("humidity");
  const windSpeed = document.getElementById("windSpeed");
  const feelsLike = document.getElementById("feelsLike");

  loading.style.display = "block"; // Laat de laadindicator zien

  // Haal weerdata op van een weer API
  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric&lang=nl`);
  const data = await response.json();
  loading.style.display = "none"; // Verberg de laadindicator

  if (data.cod === 200) {
    const weatherData = data.main;
    const weatherDesc = data.weather[0].description;
    const wind = data.wind;
    const name = data.name;
    const date = new Date().toLocaleDateString();

    cityName.textContent = `${name}, ${data.sys.country}`;
    currentDate.textContent = `Datum: ${date}`;
    temperature.textContent = `Temperatuur: ${weatherData.temp}°C`;
    weatherDescription.textContent = `Weer: ${weatherDesc}`;
    humidity.textContent = `Luchtvochtigheid: ${weatherData.humidity}%`;
    windSpeed.textContent = `Wind: ${wind.speed} m/s`;
    feelsLike.textContent = `Voelt als: ${weatherData.feels_like}°C`;

    // Grafieken
    updateCharts(weatherData.temp, weatherData.humidity, wind.speed);

    // Pushmelding
    sendPushNotification(weatherDesc);
  } else {
    alert('Stad niet gevonden!');
  }
}

// Functie om de grafieken bij te werken
function updateCharts(temperature, humidity, windSpeed) {
  const temperatureChart = new Chart(document.getElementById('temperatureChart'), {
    type: 'line',
    data: {
      labels: ['Temperatuur'],
      datasets: [{
        label: 'Temperatuur',
        data: [temperature],
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
        fill: false
      }]
    }
  });

  const humidityChart = new Chart(document.getElementById('humidityChart'), {
    type: 'bar',
    data: {
      labels: ['Luchtvochtigheid'],
      datasets: [{
        label: 'Luchtvochtigheid',
        data: [humidity],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    }
  });

  const windSpeedChart = new Chart(document.getElementById('windSpeedChart'), {
    type: 'line',
    data: {
      labels: ['Wind Snelheid'],
      datasets: [{
        label: 'Wind Snelheid',
        data: [windSpeed],
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
        fill: false
      }]
    }
  });
}

// Functie voor het verzenden van een pushmelding
function sendPushNotification(description) {
  if ('Notification' in window && 'serviceWorker' in navigator) {
    Notification.requestPermission().then(function(permission) {
      if (permission === "granted") {
        navigator.serviceWorker.getRegistration().then(function(registration) {
          registration.showNotification("Weermelding", {
            body: description,
            icon: 'icon.png'
          });
        });
      }
    });
  }
}

