// WeatherAPI configuratie
const API_BASE_URL = "https://api.weatherapi.com/v1/";
const API_KEY = "9df587fe16e54a6ab6f204233251704"; // Vervang dit met jouw eigen API key van weatherapi.com

// Weer iconen mapping (optioneel, we gebruiken de icoon-URL van WeatherAPI)
const weatherIcons = {
    "Sunny": "☀️",
    "Cloudy": "☁️",
    "Rain": "🌧️",
    "Snow": "❄️",
    "Thunderstorm": "⛈️",
    "Fog": "🌫️"
};

function getWeather() {
    const location = document.getElementById("location").value.trim();

    if (!location) {
        alert("Voer een locatie in");
        return;
    }

    showLoading(true);

    // WeatherAPI aanroep
    fetch(`${API_BASE_URL}current.json?key=${API_KEY}&q=${encodeURIComponent(location)}&lang=nl`)
        .then(response => response.json())
        .then(data => {
            if (data && data.location && data.current) {
                updateCurrentWeather(data);
                updateMap(data);
            } else {
                throw new Error("Geen data gevonden");
            }
        })
        .catch(error => {
            console.error("Fout bij ophalen data:", error);
            alert("Kon weerdata niet ophalen. Probeer een andere locatie.");
        })
        .finally(() => showLoading(false));
}

function updateCurrentWeather(data) {
    const location = data.location;
    const current = data.current;

    document.getElementById("cityName").textContent = location.name;
    document.getElementById("temperature").textContent = `${current.temp_c}°`;
    document.getElementById("weatherDescription").textContent = current.condition.text;
    document.getElementById("humidity").textContent = current.humidity + "%";
    document.getElementById("windSpeed").textContent = current.wind_kph + " km/h";
    document.getElementById("feelsLike").textContent = current.feelslike_c + "°";

    // Datum
    const now = new Date(location.localtime);
    document.getElementById("currentDate").textContent = now.toLocaleDateString('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    // Simpele icoon tonen
    const weatherCanvas = document.getElementById("weatherCanvas");
    const ctx = weatherCanvas.getContext("2d");
    const icon = new Image();
    icon.src = "https:" + current.condition.icon;
    icon.onload = () => {
        ctx.clearRect(0, 0, weatherCanvas.width, weatherCanvas.height);
        ctx.drawImage(icon, 10, 10, 64, 64); // voorbeeldpositie
    };
}

function updateMap(data) {
    const lat = data.location.lat;
    const lon = data.location.lon;

    const map = L.map('map').setView([lat, lon], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    L.marker([lat, lon]).addTo(map)
        .bindPopup(`<b>${data.location.name}</b><br>${data.current.temp_c}°C`)
        .openPopup();
}

function showLoading(show) {
    document.getElementById("loading").style.display = show ? "flex" : "none";
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("location").addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            getWeather();
        }
    });

    const now = new Date();
    document.getElementById("currentDate").textContent = now.toLocaleDateString('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
});
