const apiKey = "51449fa3b241b52737fe2b3626795957";

function getWeatherStory(data, city) {
  const weather = data.weather[0].main.toLowerCase();
  if (weather.includes('rain')) return `In regenachtig ${city} dwaal je door de natte straten, met een paraplu in de hand en een glimlach op je gezicht.`;
  if (weather.includes('clear')) return `Onder de stralende zon van ${city} ontdek je een bruisend park, perfect voor een zonnig avontuur!`;
  if (weather.includes('snow')) return `In het besneeuwde ${city} bouw je een sneeuwpop en geniet je van de winterse magie.`;
  if (weather.includes('clouds')) return `Met een bewolkte hemel boven ${city} verken je gezellige cafés en verborgen steegjes.`;
  return `In ${city} brengt het weer je een nieuwe kans om te ontdekken!`;
}

function getActivityRecommendation(activity, data, city) {
  const weather = data.weather[0].main.toLowerCase();
  const temp = data.main.temp;

  if (activity === 'wandelen') {
    if (weather.includes('clear') || temp > 15) return `Perfect weer om te wandelen in ${city}! Probeer een park of rivierpad.`;
    if (weather.includes('rain')) return `Wandelen in ${city}? Neem een regenjas mee en geniet van de frisse lucht!`;
    return `Wandelen in ${city} is altijd fijn, maar kleed je goed aan!`;
  }
  if (activity === 'fietsen') {
    if (weather.includes('clear') || temp > 15) return `Fiets door ${city} en geniet van de zon!`;
    if (weather.includes('rain')) return `Fietsen in ${city}? Misschien een korte rit met een poncho!`;
    return `Fiets door ${city}, maar pas op voor gladde wegen!`;
  }
  if (activity === 'museum') {
    if (weather.includes('rain') || weather.includes('snow')) return `Bezoek een museum in ${city}, perfect voor dit weer!`;
    return `Een museum in ${city} is altijd een goed idee!`;
  }
  if (activity === 'picknick') {
    if (weather.includes('clear') || temp > 20) return `Organiseer een picknick in ${city}, het weer is ideaal!`;
    return `Een picknick in ${city}? Misschien binnen met een deken!`;
  }
  if (activity === 'film') {
    if (weather.includes('rain') || weather.includes('snow')) return `Geniet van een filmavond in ${city}, knus en droog!`;
    return `Een filmavond in ${city} klinkt perfect!`;
  }
}

function loadWeatherGallery(weather) {
  const gallery = document.getElementById('weather-gallery');
  const weatherType = weather.toLowerCase().includes('rain') ? 'rain' : 
                     weather.toLowerCase().includes('clear') ? 'sun' : 
                     weather.toLowerCase().includes('snow') ? 'snow' : 'clouds';
  const images = [
    `https://source.unsplash.com/300x200/?${weatherType}`,
    `https://source.unsplash.com/300x200/?${weatherType},nature`,
    `https://source.unsplash.com/300x200/?${weatherType},city`
  ];

  gallery.innerHTML = '';
  images.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `Weerfoto: ${weatherType}`;
    img.classList.add('rounded-lg', 'shadow-md', 'w-full', 'h-auto');
    gallery.appendChild(img);
  });
}

function initAdventure() {
  const lastWeather = JSON.parse(localStorage.getItem('lastWeatherData'));
  const city = lastWeather ? lastWeather.name : 'Amsterdam';
  const lat = lastWeather ? lastWeather.coord.lat : 52.3676;
  const lon = lastWeather ? lastWeather.coord.lon : 4.9041;

  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=nl`)
    .then(response => {
      if (!response.ok) throw new Error('Weergegevens niet beschikbaar');
      return response.json();
    })
    .then(data => {
      localStorage.setItem('lastWeatherData', JSON.stringify(data));
      document.getElementById('weather-story').textContent = getWeatherStory(data, city);
      loadWeatherGallery(data.weather[0].main);
      
      const activitySelect = document.getElementById('activity-select');
      activitySelect.addEventListener('change', () => {
        const recommendation = getActivityRecommendation(activitySelect.value, data, city);
        document.getElementById('activity-recommendation').textContent = recommendation;
      });
      activitySelect.value = 'wandelen';
      document.getElementById('activity-recommendation').textContent = getActivityRecommendation('wandelen', data, city);
    })
    .catch(error => {
      console.error('Fout bij laden van Weeravontuur:', error);
      if (lastWeather) {
        document.getElementById('weather-story').textContent = getWeatherStory(lastWeather, city);
        loadWeatherGallery(lastWeather.weather[0].main);
      } else {
        document.getElementById('weather-story').textContent = 'Kan geen weerdata laden. Probeer later opnieuw.';
      }
    });
}

document.addEventListener('DOMContentLoaded', initAdventure);
