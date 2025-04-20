const apiKey = "6efb9bc81d3e98b4397d97a5294cb407";

document.addEventListener("DOMContentLoaded", () => {
  getWeather("Amsterdam");

  const form = document.getElementById("searchForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const city = document.getElementById("searchInput").value.trim();
      if (city) getWeather(city);
    });
  }
});

async function getWeather(city) {
  try {
    showLoading(true);

    const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
    const geoData = await geoRes.json();
    const { lat, lon, name, country } = geoData[0];

    const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=nl`);
    const weatherData = await weatherRes.json();

    document.getElementById("cityName").textContent = `${name}, ${country}`;
    document.getElementById("temperature").textContent = `${Math.round(weatherData.main.temp)}°C`;
    document.getElementById("weatherDescription").textContent = weatherData.weather[0].description;

    // Icons?
    const iconId = weatherData.weather[0].icon;
    document.getElementById("weatherIcon").innerHTML = `<img src="https://openweathermap.org/img/wn/${iconId}@2x.png" alt="icon">`;

    document.getElementById("humidity").textContent = `${weatherData.main.humidity}%`;
    document.getElementById("windSpeed").textContent = `${weatherData.wind.speed} m/s`;
    document.getElementById("pressure").textContent = `${weatherData.main.pressure} hPa`;
  } catch (err) {
    alert("Weerdata ophalen mislukt.");
  } finally {
    showLoading(false);
  }
}

function showLoading(show) {
  const loader = document.querySelector(".loading");
  if (loader) loader.style.display = show ? "flex" : "none";
}
