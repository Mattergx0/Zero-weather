const apiKey = "8a11fa30ad"; // Jouw API-sleutel van OpenWeatherMap

function getWeather() {
    const location = document.getElementById("location").value;

    if (!location) {
        alert("Voer een stad in!");
        return;
    }

    // Toon laadindicator
    document.getElementById("loading").style.display = "block";
    document.getElementById("weatherInfo").style.display = "none";
    document.getElementById("forecast").style.display = "none";

    // Haal locatiegegevens op via OpenWeatherMap
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric&lang=nl`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=52.379189&lon=4.900931&exclude=hourly,minutely&appid=${apiKey}&units=metric&lang=nl`;

    // Weergegevens
    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            document.getElementById("loading").style.display = "none";

            // Toon de huidige weerinformatie
            document.getElementById("cityName").innerText = data.name;
            document.getElementById("weatherDescription").innerText = data.weather[0].description;
            document.getElementById("temperature").innerText = `${data.main.temp}°C`;
            document.getElementById("humidity").innerText = data.main.humidity;
            document.getElementById("windSpeed").innerText = data.wind.speed;

            document.getElementById("weatherInfo").style.display = "block";

            // Voeg de kaart toe
            const map = L.map('map').setView([data.coord.lat, data.coord.lon], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            L.marker([data.coord.lat, data.coord.lon]).addTo(map)
                .bindPopup(`<b>${data.name}</b>`)
                .openPopup();
        })
        .catch(error => {
            document.getElementById("loading").style.display = "none";
            alert("Er is een fout opgetreden. Probeer het opnieuw.");
        });

    // 7-Dagenvoorspelling
    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            document.getElementById("forecast").style.display = "block";
            const forecastTable = document.querySelector("#forecast table");
            data.daily.forEach((day, index) => {
                if (index < 7) {
                    const row = forecastTable.insertRow();
                    row.insertCell(0).innerText = new Date(day.dt * 1000).toLocaleDateString();
                    row.insertCell(1).innerText = `${day.temp.day}°C`;
                    row.insertCell(2).innerText = day.weather[0].description;
                }
            });
        });
}
