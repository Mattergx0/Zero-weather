// Jouw echte OpenWeatherMap API key
const apiKey = '51449fa3b241b52737fe2b3626795957';

// Pagina wisselen
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// Weer ophalen
async function fetchWeather(city = "Amsterdam") {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=nl&appid=${apiKey}`);
        const data = await res.json();
        updateCurrentWeather(data);

        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=nl&appid=${apiKey}`);
        const forecastData = await forecastRes.json();
        updateForecast(forecastData);
    } catch (err) {
        console.error(err);
        alert('Fout bij ophalen weergegevens!');
    }
}

// Huidige weer updaten
function updateCurrentWeather(data) {
    document.getElementById('current-city').innerText = data.name;
    document.getElementById('current-temp').innerText = Math.round(data.main.temp) + "°C";
    document.getElementById('current-desc').innerText = data.weather[0].description;
    document.getElementById('humidity').innerText = data.main.humidity + "%";
    document.getElementById('wind').innerText = Math.round(data.wind.speed * 3.6) + " km/u"; // m/s naar km/u
    document.getElementById('feels-like').innerText = Math.round(data.main.feels_like) + "°C";
    document.getElementById('current-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
}

// Voorspelling updaten
function updateForecast(data) {
    const container = document.getElementById('forecast-container');
    container.innerHTML = '';

    data.list.slice(0, 10).forEach(day => {
        const el = document.createElement('div');
        el.className = 'forecast-day';
        const date = new Date(day.dt_txt);
        el.innerHTML = `
            <strong>${date.toLocaleDateString('nl-NL', { weekday: 'short' })}</strong>
            <br>
            🌡️ ${Math.round(day.main.temp)}°C
            <br>
            ☁️ ${day.weather[0].main}
        `;
        container.appendChild(el);
    });
}

// Stadszoekfunctie
function searchCity() {
    const city = document.getElementById('city-input').value;
    if (city) {
        fetchWeather(city);
    }
}

// Laadscherm verbergen na laden
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
    }, 1000);

    fetchWeather(); // standaard stad laden
});

// Leaflet kaart
let map = L.map('map').setView([52.37, 4.89], 8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);
