// src/services/api.js
//
// Local-data API service. Replaces all network calls to balldontlie.io
// with reads from JSON files in src/data/.
// Component code calls the same function names. Each returns a Promise so
// existing async/await and .then() patterns keep working unchanged.

// ---- NBA data imports ----
import nbaTeamsData from '../data/nba_teams.json';
import nbaPlayersData from '../data/nba_players.json';
import nbaStandingsData from '../data/nba_standings.json';
import nbaGamesData from '../data/nba_games.json';
import nbaPlayerStatsData from '../data/nba_player_stats.json';

// ---- NFL data imports ----
import nflTeamsData from '../data/nfl_teams.json';
import nflPlayersData from '../data/nfl_players.json';
import nflStandingsData from '../data/nfl_standings.json';
import nflGamesData from '../data/nfl_games.json';
import nflLeadersData from '../data/nfl_leaders.json';
import nflInjuriesData from '../data/nfl_injuries.json';
import nflPlayerStatsData from '../data/nfl_player_stats.json';

// Tiny helper: resolve in `delay` ms so loading states still feel real
// instead of flashing instantly.
const fakeDelay = (data, delay = 200) =>
  new Promise(resolve => setTimeout(() => resolve(data), delay));

// =====================================================================
// NBA
// =====================================================================

export const getNbaTeams = () => fakeDelay(nbaTeamsData);
export const getNbaStandings = (_season) => fakeDelay(nbaStandingsData);
export const getNbaGames = (_startDate) => fakeDelay(nbaGamesData);

export const getNbaTeamRoster = (teamId) => {
  const roster = nbaPlayersData.data.filter(p => p.team?.id === teamId);
  return fakeDelay({ data: roster });
};

export const searchNbaPlayers = (searchTerm) => {
  if (!searchTerm || searchTerm.length < 3) {
    return fakeDelay({ data: [] });
  }
  const term = searchTerm.toLowerCase();
  const results = nbaPlayersData.data.filter(p =>
    p.first_name.toLowerCase().includes(term) ||
    p.last_name.toLowerCase().includes(term)
  );
  return fakeDelay({ data: results });
};

export const getNbaPlayerStats = (playerId) => {
  const stats = nbaPlayerStatsData.data[String(playerId)];
  if (stats) return fakeDelay({ data: [stats] });
  // Fallback so any player still has stats to show
  return fakeDelay({
    data: [{
      min: '28', pts: 14, ast: 4, reb: 5, stl: 1, blk: 0,
      turnover: 2, fgm: 5, fga: 12, fg_pct: 0.417,
      fg3m: 1, fg3a: 4, fg3_pct: 0.250,
      ftm: 3, fta: 4, ft_pct: 0.750,
      oreb: 1, dreb: 4, pf: 2, games_played: 65
    }]
  });
};

const NBA_INJURIES = [
  { id: 1, player: { id: 88, first_name: "Anthony", last_name: "Davis" }, team: { full_name: "Dallas Mavericks" }, status: "Day-to-Day", description: "Lower back tightness", date: "2026-05-04T00:00:00.000Z" },
  { id: 2, player: { id: 165, first_name: "Jimmy", last_name: "Butler" }, team: { full_name: "Golden State Warriors" }, status: "Probable", description: "Right ankle soreness", date: "2026-05-05T00:00:00.000Z" },
  { id: 3, player: { id: 478, first_name: "Zion", last_name: "Williamson" }, team: { full_name: "New Orleans Pelicans" }, status: "Out", description: "Hamstring strain", date: "2026-05-02T00:00:00.000Z" },
  { id: 4, player: { id: 270, first_name: "Kawhi", last_name: "Leonard" }, team: { full_name: "LA Clippers" }, status: "Questionable", description: "Knee management", date: "2026-05-06T00:00:00.000Z" },
  { id: 5, player: { id: 313, first_name: "Ja", last_name: "Morant" }, team: { full_name: "Memphis Grizzlies" }, status: "Out", description: "Shoulder labrum surgery", date: "2026-04-22T00:00:00.000Z" },
  { id: 6, player: { id: 36, first_name: "Bradley", last_name: "Beal" }, team: { full_name: "Phoenix Suns" }, status: "Day-to-Day", description: "Back spasms", date: "2026-05-05T00:00:00.000Z" },
  { id: 7, player: { id: 366, first_name: "Kristaps", last_name: "Porzingis" }, team: { full_name: "Boston Celtics" }, status: "Out", description: "Calf strain", date: "2026-05-03T00:00:00.000Z" },
  { id: 8, player: { id: 350, first_name: "Julius", last_name: "Randle" }, team: { full_name: "Minnesota Timberwolves" }, status: "Probable", description: "Groin tightness", date: "2026-05-06T00:00:00.000Z" }
];
export const getNbaInjuries = () => fakeDelay({ data: NBA_INJURIES });

// Leaders synthesized from player_stats so order is consistent with stats data
export const getNbaLeaders = () => {
  const leaders = Object.entries(nbaPlayerStatsData.data)
    .map(([playerId, stats]) => {
      const player = nbaPlayersData.data.find(p => p.id === parseInt(playerId));
      if (!player) return null;
      return {
        player: { id: player.id, first_name: player.first_name, last_name: player.last_name },
        team: player.team,
        value: stats.pts,
        category: 'Points Per Game'
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.value - a.value);
  return fakeDelay({ data: leaders });
};

export const getNbaBettingOdds = () => {
  const games = nbaGamesData.data
    .filter(g => g.status === 'Scheduled')
    .map(g => ({
      id: g.id,
      home_team: g.home_team,
      visitor_team: g.visitor_team,
      date: g.date,
      time: g.time,
      ...g.betting
    }));
  return fakeDelay({ data: games });
};

// Box score for a game — synthesize player rows from each team's roster
export const getNbaGameBoxScore = (gameId) => {
  const game = nbaGamesData.data.find(g => g.id === gameId);
  if (!game) return fakeDelay({ data: [] });

  const homeRoster = nbaPlayersData.data.filter(p => p.team?.id === game.home_team.id).slice(0, 8);
  const visitorRoster = nbaPlayersData.data.filter(p => p.team?.id === game.visitor_team.id).slice(0, 8);

  const buildStat = (player, team, idx) => {
    const baseStats = nbaPlayerStatsData.data[String(player.id)] || {
      min: '24', pts: 10, ast: 3, reb: 4, stl: 1, blk: 0,
      turnover: 1, fgm: 4, fga: 9, fg3m: 1, fg3a: 3,
      ftm: 1, fta: 1, pf: 2
    };
    return {
      id: `${gameId}-${player.id}`,
      player: { id: player.id, first_name: player.first_name, last_name: player.last_name },
      team: { id: team.id, full_name: team.full_name },
      ...baseStats,
      plus_minus: idx === 0 ? 12 : idx === 1 ? 8 : idx === 2 ? -2 : 0
    };
  };

  const data = [
    ...homeRoster.map((p, i) => buildStat(p, game.home_team, i)),
    ...visitorRoster.map((p, i) => buildStat(p, game.visitor_team, i))
  ];
  return fakeDelay({ data });
};

// =====================================================================
// NFL
// =====================================================================

export const getNflTeams = () => fakeDelay(nflTeamsData);
export const getNflStandings = (_season) => fakeDelay(nflStandingsData);
export const getNflGames = (_season) => fakeDelay(nflGamesData);

export const getNflTeamRoster = (teamId) => {
  const roster = nflPlayersData.data.filter(p => p.team?.id === teamId);
  return fakeDelay({ data: roster });
};

export const searchNflPlayers = (searchTerm) => {
  if (!searchTerm || searchTerm.length < 3) {
    return fakeDelay({ data: [] });
  }
  const term = searchTerm.toLowerCase();
  const results = nflPlayersData.data.filter(p =>
    p.first_name.toLowerCase().includes(term) ||
    p.last_name.toLowerCase().includes(term)
  );
  return fakeDelay({ data: results });
};

export const getNflPlayer = (playerId) => {
  const player = nflPlayersData.data.find(p => p.id === parseInt(playerId));
  return fakeDelay({ data: player });
};

export const getNflPlayerStats = (playerId, _season) => {
  const stats = nflPlayerStatsData.data[String(playerId)];
  if (stats) return fakeDelay({ data: [stats] });
  return fakeDelay({
    data: [{
      season: 2024, games_played: 16,
      total_tackles: 35, solo_tackles: 24, defensive_sacks: 4.0,
      defensive_interceptions: 0, fumbles_forced: 1
    }]
  });
};

export const getNflInjuries = () => fakeDelay(nflInjuriesData);
export const getNflLeaders = (_season) => fakeDelay(nflLeadersData);
export const getNflGameBoxScore = (_gameId) => fakeDelay({ data: [] });
