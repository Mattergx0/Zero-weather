const apiKey = '51449fa3b241b52737fe2b3626795957';

// Pagina wisselen
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// Weer ophalen op basis van coördinaten
async function fetchWeatherByCoords(lat, lon) {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=nl&appid=${apiKey}`);
        const data = await res.json();
        updateCurrentWeather(data);

        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=nl&appid=${apiKey}`);
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
    document.getElementById('humidity').innerText = `Luchtvochtigheid: ${data.main.humidity}%`;
    document.getElementById('wind').innerText = `Wind: ${Math.round(data.wind.speed * 3.6)} km/u`;
    document.getElementById('feels-like').innerText = `Voelt als: ${Math.round(data.main.feels_like)}°C`;
    document.getElementById('sunrise').innerText = "🌅 Zonsopgang: " + new Date(data.sys.sunrise * 1000).toLocaleTimeString('nl-NL');
    document.getElementById('sunset').innerText = "🌇 Zonsondergang: " + new Date(data.sys.sunset * 1000).toLocaleTimeString('nl-NL');
    document.getElementById('current-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
}

// Voorspelling updaten
function updateForecast(data) {
    const container = document.getElementById('forecast-container');
    container.innerHTML = '';

    data.list.slice(0, 6).forEach(hour => {
        const el = document.createElement('div');
        el.className = 'forecast-hour';
        const date = new Date(hour.dt_txt);
        el.innerHTML = `
            <strong>${date.getHours()}:00</strong><br>
            🌡️ ${Math.round(hour.main.temp)}°C<br>
            ☁️ ${hour.weather[0].main}
        `;
        container.appendChild(el);
    });
}

// Locatie ophalen
function getLocationAndWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
                initMap(position.coords.latitude, position.coords.longitude);
            },
            error => {
                alert('Locatie niet gevonden, standaard naar Amsterdam.');
                fetchWeatherByCoords(52.37, 4.89);
                initMap(52.37, 4.89);
            }
        );
    } else {
        alert('Geolocatie wordt niet ondersteund door deze browser.');
    }
}

// Laadscherm verbergen na laden
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
    }, 1000);

    getLocationAndWeather();
});

// Leaflet kaart + regen-overlay
function initMap(lat, lon) {
    const map = L.map('map').setView([lat, lon], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // Regenkaart overlay
    L.tileLayer('https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=' + apiKey, {
        attribution: '© OpenWeatherMap',
        opacity: 0.5
    }).addTo(map);
}
