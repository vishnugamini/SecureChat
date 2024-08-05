async function fetchStats() {
    try {
      const response = await fetch('/stats');
      const stats = await response.json();
      document.getElementById('roomsCount').textContent = stats.rooms;
      document.getElementById('textsCount').textContent = stats.texts;
      document.getElementById('usersCount').textContent = stats.users;
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }
  
  fetchStats();
  
  setInterval(fetchStats, 10000);
  