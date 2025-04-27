function initSettings() {
  const notificationsToggle = document.getElementById('notifications-toggle');
  const temperatureUnit = document.getElementById('temperature-unit');
  const darkModeToggle = document.getElementById('dark-mode-toggle');

  // Laad opgeslagen instellingen
  if (notificationsToggle) {
    notificationsToggle.checked = localStorage.getItem('notificationsEnabled') === 'true';
    notificationsToggle.addEventListener('change', () => {
      localStorage.setItem('notificationsEnabled', notificationsToggle.checked);
      if (notificationsToggle.checked && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    });
  }

  if (temperatureUnit) {
    temperatureUnit.value = localStorage.getItem('temperatureUnit') || 'metric';
    temperatureUnit.addEventListener('change', () => {
      localStorage.setItem('temperatureUnit', temperatureUnit.value);
      alert('Temperatuureenheid gewijzigd. Ga naar Home om de wijziging te zien.');
    });
  }

  if (darkModeToggle) {
    darkModeToggle.checked = localStorage.getItem('darkMode') === 'true';
    if (darkModeToggle.checked) document.body.classList.add('dark-mode');
    darkModeToggle.addEventListener('change', () => {
      localStorage.setItem('darkMode', darkModeToggle.checked);
      document.body.classList.toggle('dark-mode', darkModeToggle.checked);
    });
  }
}

document.addEventListener('DOMContentLoaded', initSettings);
