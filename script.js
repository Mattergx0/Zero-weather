// KNMI API configuratie
const API_BASE_URL = "https://weerlive.nl/api/";
const API_KEY = "8a11fa30ad"; // Vervang met jouw KNMI API key

// Weer ophalen op basis van locatie
function getWeather() {
    const location = document.getElementById("location").value.trim();

    if (!location) {
        alert("Voer een locatie in");
        return;
    }

    showLoading(true);

    fetch(`${API_BASE_URL}weerlive.php?key=${API_KEY}&locatie=${encodeURIComponent(location)}`)
        .then(response => response.json())
        .then(data => {
            if (data.liveweer && data.liveweer.length > 0) {
                const weatherData = data.liveweer[0];
                updateCurrentWeather(weatherData);
                updateMap(weatherData);
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

// Weerinfo bijwerken
function updateCurrentWeather(data) {
    document.getElementById("cityName").textContent = data.plaats;
    document.getElementById("temperature").textContent = `${data.temp}°`;
    document.getElementById("weatherDescription").textContent = data.samenv;
    document.getElementById("humidity").textContent = data.lv;
    document.getElementById("windSpeed").textContent = data.windkmh;
    document.getElementById("feelsLike").textContent = data.gtemp;

    const now = new Date();
    document.getElementById("currentDate").textContent = now.toLocaleDateString('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    const weatherCanvas = document.getElementById("weatherCanvas");
    const ctx = weatherCanvas.getContext("2d");
    ctx.clearRect(0, 0, weatherCanvas.width, weatherCanvas.height);
    ctx.font = "48px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("☀️", weatherCanvas.width / 2, weatherCanvas.height / 2); // Placeholder
}

// Kaart tonen met Leaflet
function updateMap(data) {
    if (data.lat && data.lon) {
        const map = L.map('map').setView([data.lat, data.lon], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        L.marker([data.lat, data.lon]).addTo(map)
            .bindPopup(`<b>${data.plaats}</b><br>${data.temp}°C`)
            .openPopup();
    }
}

// Laadscherm tonen/verbergen
function showLoading(show) {
    document.getElementById("loading").style.display = show ? "flex" : "none";
}

// Init
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
