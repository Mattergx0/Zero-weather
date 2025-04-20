const apiKey = '6efb9bc81d3e98b4397d97a5294cb407';
const city = 'Amsterdam'; // Verander dit naar de gewenste stad of gebruik een invoerveld voor dynamisch zoeken
const apiUrl = `https://api.openweathermap.org/data/2.5/forecast/daily?q=${city}&cnt=10&appid=${apiKey}&units=metric&lang=nl`;

async function getWeatherForecast() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.cod !== "200") {
            throw new Error("Fout bij het ophalen van de weerdata.");
        }

        const forecastContainer = document.getElementById("forecastContainer");

        data.list.forEach(day => {
            const forecastItem = document.createElement("div");
            forecastItem.classList.add("daily-item");

            const date = new Date(day.dt * 1000);
            const dayName = date.toLocaleDateString('nl-NL', { weekday: 'long' });
            const maxTemp = day.temp.max;
            const minTemp = day.temp.min;
            const icon = day.weather[0].icon; // Het icoon voor het weer

            forecastItem.innerHTML = `
                <div class="day-name">${dayName}</div>
                <div class="day-icon">
                    <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Weer icoon">
                </div>
                <div class="day-temp">
                    <div class="max-temp">${maxTemp}°C</div>
                    <div class="min-temp">${minTemp}°C</div>
                </div>
            `;

            forecastContainer.appendChild(forecastItem);
        });
    } catch (error) {
        console.error("Error:", error);
    }
}

document.addEventListener("DOMContentLoaded", getWeatherForecast);
