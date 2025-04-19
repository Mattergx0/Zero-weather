// KNMI API configuratie
const API_BASE_URL = "https://weerlive.nl/api/";
const API_KEY = "8a11fa30ad"; // Vervang met jouw KNMI API key

// Weer iconen mapping
const weatherIcons = {
    "zonnig": "☀️",
    "zonnig_heldere": "☀️",
    "bewolkt": "☁️",
    "licht bewolkt": "⛅",
    "zwaar bewolkt": "☁️",
    "regen": "🌧️",
    "motregen": "🌧️",
    "buien": "🌦️",
    "sneeuw": "❄️",
    "hagel": "🌨️",
    "onweer": "⛈️",
    "mist": "🌫️",
    "wolk": "☁️"
};

// Laatst opgezochte locaties
let recentLocations = JSON.parse(localStorage.getItem('recentLocations')) || [];

function getWeather(location = null) {
    const searchLocation = location || document.getElementById("location").value.trim();
    
    if (!searchLocation) {
        alert("Voer een locatie in");
        return;
    }

    showLoading(true);

    // Voeg toe aan recente locaties
    if (!recentLocations.includes(searchLocation)) {
        recentLocations.unshift(searchLocation);
        if (recentLocations.length > 5) {
            recentLocations.pop();
        }
        localStorage.setItem('recentLocations', JSON.stringify(recentLocations));
    }

    // KNMI API aanroepen voor huidig weer
    fetch(`${API_BASE_URL}weerlive.php?key=${API_KEY}&locatie=${encodeURIComponent(searchLocation)}`)
        .then(response => response.json())
        .then(data => {
            if (data.liveweer && data.liveweer.length > 0) {
                const weatherData = data.liveweer[0];
                updateCurrentWeather(weatherData);
                updateMap(weatherData);
                
                // KNMI API aanroepen voor 10-daagse voorspelling
                return fetch(`${API_BASE_URL}weer14daagse.php?key=${API_KEY}&locatie=${encodeURIComponent(searchLocation)}`);
            } else {
                throw new Error("Geen data gevonden");
            }
        })
        .then(response => response.json())
        .then(forecastData => {
            if (forecastData.dagverwachting && forecastData.dagverwachting.length > 0) {
                updateForecast(forecastData.dagverwachting);
            }
        })
        .catch(error => {
            console.error("Fout bij ophalen data:", error);
            alert("Kon weerdata niet ophalen. Probeer een andere locatie.");
        })
        .finally(() => showLoading(false));
}

function updateCurrentWeather(data) {
    // Update huidige weer
    document.getElementById("cityName").textContent = data.plaats;
    document.getElementById("temperature").textContent = `${data.temp}°`;
    document.getElementById("weatherDescription").textContent = data.samenv;
    document.getElementById("humidity").textContent = data.lv;
    document.getElementById("windSpeed").textContent = data.windkmh;
    document.getElementById("feelsLike").textContent = data.gtemp;
    
    // Update datum
    const now = new Date();
    document.getElementById("currentDate").textContent = now.toLocaleDateString('nl-NL', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
    });
    
    // Update weericoon
    updateWeatherIcon(data.samenv.toLowerCase());
}

function updateWeatherIcon(weatherDescription) {
    const weatherCanvas = document.getElementById("weatherCanvas");
    const ctx = weatherCanvas.getContext("2d");
    ctx.clearRect(0, 0, weatherCanvas.width, weatherCanvas.height);
    
    // Eenvoudige iconen weergave (kan uitgebreid worden met echte icons)
    const icon = findBestMatchingIcon(weatherDescription);
    ctx.font = "60px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(icon, weatherCanvas.width/2, weatherCanvas.height/2);
}

function findBestMatchingIcon(description) {
    const lowerDesc = description.toLowerCase();
    for (const [key, icon] of Object.entries(weatherIcons)) {
        if (lowerDesc.includes(key)) {
            return icon;
        }
    }
    return "☀️"; // Default icoon
}

function updateForecast(forecastData) {
    const forecastContainer = document.getElementById("dailyForecast");
    forecastContainer.innerHTML = '';
    
    forecastData.slice(0, 10).forEach(day => {
        const dayElement = document.createElement("div");
        dayElement.className = "daily-item";
        
        const date = new Date(day.datum);
        const dayName = date.toLocaleDateString('nl-NL', { weekday: 'short' });
        
        dayElement.innerHTML = `
            <div class="day-name">${dayName}</div>
            <div class="day-icon">${findBestMatchingIcon(day.verw)}</div>
            <div class="day-temp">
                <span class="max-temp">${day.tmax}°</span>
                <span class="min-temp">${day.tmin}°</span>
            </div>
        `;
        
        forecastContainer.appendChild(dayElement);
    });
}

function updateMap(data) {
    if (data.lat && data.lon) {
        const mapElement = document.getElementById("map");
        mapElement.innerHTML = ''; // Clear previous map
        
        const map = L.map('map').setView([data.lat, data.lon], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        L.marker([data.lat, data.lon]).addTo(map)
            .bindPopup(`<b>${data.plaats}</b><br>${data.temp}°C`)
            .openPopup();
    }
}

function showLoading(show) {
    document.getElementById("loading").style.display = show ? "flex" : "none";
}

function getLocation() {
    if (navigator.geolocation) {
        showLoading(true);
        navigator.geolocation.getCurrentPosition(
            position => {
                // Reverse geocoding om plaatsnaam te krijgen
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`)
                    .then(response => response.json())
                    .then(data => {
                        const city = data.address.city || data.address.town || data.address.village;
                        if (city) {
                            document.getElementById("location").value = city;
                            getWeather(city);
                        }
                    })
                    .catch(() => {
                        showLoading(false);
                        alert("Kon locatie niet omzetten naar plaatsnaam");
                    });
            },
            error => {
                showLoading(false);
                console.error("Geolocation error:", error);
                // Default naar Amsterdam als locatie niet beschikbaar is
                document.getElementById("location").value = "Amsterdam";
                getWeather("Amsterdam");
            }
        );
    } else {
        // Browser ondersteunt geen geolocatie
        document.getElementById("location").value = "Amsterdam";
        getWeather("Amsterdam");
    }
}

// Initialisatie
document.addEventListener('DOMContentLoaded', function() {
    // Event listener voor enter toets
    document.getElementById("location").addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            getWeather();
        }
    });
    
    // Toon huidige datum
    const now = new Date();
    document.getElementById("currentDate").textContent = now.toLocaleDateString('nl-NL', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
    });
    
    // Probeer locatie te detecteren bij laden
    getLocation();
    
    // Toon recente locaties in dropdown (optioneel)
    // ...
});
