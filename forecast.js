// Dit zou met je weer API kunnen worden geladen
const forecastData = [
    { day: "Maandag", icon: "☀️", temp: { max: 15, min: 5 } },
    { day: "Dinsdag", icon: "🌧️", temp: { max: 13, min: 7 } },
    // Meer dagen...
];

const forecastContainer = document.getElementById("forecastContainer");

forecastData.forEach(day => {
    const forecastItem = document.createElement("div");
    forecastItem.classList.add("daily-item");

    forecastItem.innerHTML = `
        <div class="day-name">${day.day}</div>
        <div class="day-icon">${day.icon}</div>
        <div class="day-temp">
            <div class="max-temp">${day.temp.max}°C</div>
            <div class="min-temp">${day.temp.min}°C</div>
        </div>
    `;

    forecastContainer.appendChild(forecastItem);
});
