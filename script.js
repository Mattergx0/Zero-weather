const apiKey = "9df587fe16e54a6ab6f204233251704"; // Vervang met je eigen API-sleutel van OpenWeatherMap

function getWeather() {
    const location = document.getElementById("location").value;

    if (!location) {
        alert("Voer een stad in!");
        return;
    }

    // Toon laadindicator
    document.getElementById("loading").style.display = "block";
    document.getElementById("weatherInfo").style.display = "none";

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric&lang=nl`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            document.getElementById("loading").style.display = "none";
            
            // Toon de weerinformatie
            document.getElementById("cityName").innerText = data.name;
            document.getElementById("weatherDescription").innerText = data.weather[0].description;
            document.getElementById("temperature").innerText = `${data.main.temp}°C`;
            document.getElementById("humidity").innerText = data.main.humidity;
            document.getElementById("windSpeed").innerText = data.wind.speed;

            document.getElementById("weatherInfo").style.display = "block";
        })
        .catch(error => {
            document.getElementById("loading").style.display = "none";
            alert("Er is een fout opgetreden. Probeer het opnieuw.");
        });
}
