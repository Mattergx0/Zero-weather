const apiKey = '6efb9bc81d3e98b4397d97a5294cb407';
const city = 'Amsterdam'; // Je kunt dit ook dynamisch maken
const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=nl`;

async function getWeatherData() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.cod !== "200") {
            throw new Error("Fout bij het ophalen van de weerdata.");
        }

        const map = L.map('map').setView([52.3676, 4.9041], 12);  // Amsterdam als startlocatie

        // Voeg OpenStreetMap tiles toe
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Regen controle (bijvoorbeeld: als er regen is, toon dit op de kaart)
        if (data.weather[0].main === 'Rain') {
            L.marker([52.3676, 4.9041]).addTo(map)
                .bindPopup("Het regent momenteel in de regio!")
                .openPopup();
        }

        // Voeg andere markers of info toe zoals temperatuur, etc.
        L.marker([52.3676, 4.9041]).addTo(map)
            .bindPopup(`Huidige temperatuur: ${data.main.temp}°C`)
            .openPopup();

    } catch (error) {
        console.error("Error:", error);
    }
}

document.addEventListener("DOMContentLoaded", getWeatherData);
