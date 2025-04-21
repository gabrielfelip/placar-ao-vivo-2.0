const gamesContainer = document.getElementById('games');
const leagueFilter = document.getElementById('leagueFilter');
const favoritesContainer = document.getElementById('favorites');
const favoriteLeaguesContainer = document.getElementById('favoriteLeagues');

const jogosAoVivoBtn = document.getElementById('liveBtn');
const favoritosBtn = document.getElementById('favoritesBtn');

let favoriteTeams = [];

function loadLeagues() {
  const options = {
    method: 'GET',
    headers: {
      'x-apisports-key': '7fe863922e8b0c8c3ea04fede9d8da00'
    }
  };

  fetch('https://v3.football.api-sports.io/leagues', options)
    .then(response => response.json())
    .then(data => {
      data.response.forEach(league => {
        const option = document.createElement('option');
        option.value = league.league.id;
        option.textContent = league.league.name;
        leagueFilter.appendChild(option);
      });
    })
    .catch(err => console.error('Erro ao carregar ligas:', err));
}

function loadGames(leagueId = '') {
  const options = {
    method: 'GET',
    headers: {
      'x-apisports-key': '7fe863922e8b0c8c3ea04fede9d8da00'
    }
  };

  let url = 'https://v3.football.api-sports.io/fixtures?live=all';
  if (leagueId) url += `&league=${leagueId}`;

  fetch(url, options)
    .then(response => response.json())
    .then(data => {
      const games = data.response;
      gamesContainer.innerHTML = '';
      favoritesContainer.style.display = 'none';
      gamesContainer.style.display = 'flex';

      if (games.length === 0) {
        gamesContainer.innerHTML = '<p>Sem jogos ao vivo no momento ⚽</p>';
        return;
      }

      games.forEach(game => {
        const home = game.teams.home;
        const away = game.teams.away;
        const goals = game.goals;
        const status = game.fixture.status.short;

        const gameDiv = document.createElement('div');
        gameDiv.className = 'game';

        const statusClass = status === 'LIVE' ? 'live' : status === 'FT' ? 'finished' : 'scheduled';

        gameDiv.innerHTML = `
          <div class="team">
            <img src="${home.logo}" alt="${home.name}" />
            <span>${home.name}</span>
          </div>
          <div class="score">
            ${goals.home} x ${goals.away}
            <div class="status ${statusClass}">${status}</div>
          </div>
          <div class="team">
            <img src="${away.logo}" alt="${away.name}" />
            <span>${away.name}</span>
          </div>
          <button class="favorite-btn">⭐ Favoritar</button>
        `;

        const favoriteBtn = gameDiv.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', () => {
          toggleFavoriteTeam(home.id, home.name, home.logo);
          toggleFavoriteTeam(away.id, away.name, away.logo);
          showNotification('Times adicionados/removidos aos favoritos.');
        });

        gamesContainer.appendChild(gameDiv);
      });
    })
    .catch(err => {
      console.error('Erro ao carregar os jogos:', err);
      gamesContainer.innerHTML = `<p>Erro ao carregar os jogos 😢 - ${err.message}</p>`;
    });
}

function toggleFavoriteTeam(teamId, teamName, teamLogo) {
  const index = favoriteTeams.findIndex(team => team.id === teamId);

  if (index === -1) {
    favoriteTeams.push({ id: teamId, name: teamName, logo: teamLogo });
  } else {
    favoriteTeams.splice(index, 1);
    showNotification(`${teamName} foi removido dos favoritos!`);
  }

  renderFavoriteTeams();
}

function renderFavoriteTeams() {
  favoritesContainer.innerHTML = '';
  favoriteTeams.forEach(team => {
    const div = document.createElement('div');
    div.className = 'team';
    div.innerHTML = `
      <img src="${team.logo}" alt="${team.name}" />
      <span>${team.name}</span>
    `;
    favoritesContainer.appendChild(div);
  });
}

function showFavoriteGames() {
  gamesContainer.style.display = 'none';
  favoritesContainer.style.display = 'flex';
  renderFavoriteTeams();
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

leagueFilter.addEventListener('change', (e) => {
  loadGames(e.target.value);
});

favoritosBtn.addEventListener('click', showFavoriteGames);

jogosAoVivoBtn.addEventListener('click', () => {
  gamesContainer.style.display = 'flex';
  favoritesContainer.style.display = 'none';
  loadGames(leagueFilter.value);
});

window.onload = () => {
  loadLeagues();
  loadGames();
};
