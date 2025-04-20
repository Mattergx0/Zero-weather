const apiKey = "6efb9bc81d3e98b4397d97a5294cb407";
const defaultCity = "Amsterdam";

document.addEventListener("DOMContentLoaded", () => {
  getForecast(defaultCity);
});

async function getForecast(city) {
  const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
  const geoData = await geoRes.json();
  const { lat, lon } = geoData[0];

  const res = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=metric&appid=${apiKey}&lang=nl`);
  const data = await res.json();

  const forecastContainer = document.getElementById("forecastContainer");
  forecastContainer.innerHTML = "";

  data.daily.slice(0, 7).forEach(day => {
    const date = new Date(day.dt * 1000).toLocaleDateString('nl-NL', { weekday: 'long' });
    const max = Math.round(day.temp.max);
    const min = Math.round(day.temp.min);
    forecastContainer.innerHTML += `
      <div class="daily-item">
        <strong>${date}</strong>
        <p>${day.weather[0].description}</p>
        <p>🌡️ Max: ${max}°C, Min: ${min}°C</p>
      </div>
    `;
  });
}
