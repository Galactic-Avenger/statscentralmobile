/**
 * BallDontLie API Service
 * 
 * This file contains functions to interact with the BallDontLie API
 * API Documentation: https://docs.balldontlie.io
 */

// Updated according to the official documentation
const BASE_URL = 'https://api.balldontlie.io/v1';
const API_KEY = 'eec8a44a-cba9-4226-8711-462860cdad89';

// Headers for API requests
const headers = {
  'Authorization': API_KEY
};

// Get all NBA players (paginated)
export const getPlayers = async (page = 1, perPage = 100, search = '') => {
  try {
    let url = `${BASE_URL}/players?page=${page}&per_page=${perPage}`;
    if (search) {
      url += `&search=${search}`;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching players:', error);
    throw error;
  }
};

// Get a specific player by ID
export const getPlayerById = async (playerId) => {
  try {
    const response = await fetch(`${BASE_URL}/players/${playerId}`, { headers });
    return await response.json();
  } catch (error) {
    console.error(`Error fetching player with ID ${playerId}:`, error);
    throw error;
  }
};

// Get all NBA teams
export const getTeams = async () => {
  try {
    const response = await fetch(`${BASE_URL}/teams`, { headers });
    return await response.json();
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

// Get a specific team by ID
export const getTeamById = async (teamId) => {
  try {
    const response = await fetch(`${BASE_URL}/teams/${teamId}`, { headers });
    return await response.json();
  } catch (error) {
    console.error(`Error fetching team with ID ${teamId}:`, error);
    throw error;
  }
};

// Get games (with filtering options)
export const getGames = async (params = {}) => {
  try {
    // Convert params object to URL query string
    const queryParams = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    const url = `${BASE_URL}/games?${queryParams}`;
    const response = await fetch(url, { headers });
    return await response.json();
  } catch (error) {
    console.error('Error fetching games:', error);
    throw error;
  }
};

// Get a specific game by ID
export const getGameById = async (gameId) => {
  try {
    const response = await fetch(`${BASE_URL}/games/${gameId}`, { headers });
    return await response.json();
  } catch (error) {
    console.error(`Error fetching game with ID ${gameId}:`, error);
    throw error;
  }
};

// Get player season averages
export const getPlayerSeasonAverages = async (playerId, season = 2023) => {
  try {
    const response = await fetch(`${BASE_URL}/season_averages?player_ids[]=${playerId}&season=${season}`, { headers });
    return await response.json();
  } catch (error) {
    console.error(`Error fetching season averages for player ${playerId}:`, error);
    throw error;
  }
};

// Get player stats for specific games
export const getPlayerStats = async (params = {}) => {
  try {
    // Convert params object to URL query string
    const queryParams = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    const url = `${BASE_URL}/stats?${queryParams}`;
    const response = await fetch(url, { headers });
    return await response.json();
  } catch (error) {
    console.error('Error fetching player stats:', error);
    throw error;
  }
};

// Get team standings
export const getTeamStandings = async (season = 2023) => {
  try {
    const response = await fetch(`${BASE_URL}/standings?season=${season}`, { headers });
    return await response.json();
  } catch (error) {
    console.error(`Error fetching standings for season ${season}:`, error);
    throw error;
  }
};

// Get box scores for a specific game
export const getBoxScores = async (gameId) => {
  try {
    const response = await fetch(`${BASE_URL}/stats?game_ids[]=${gameId}&per_page=100`, { headers });
    return await response.json();
  } catch (error) {
    console.error(`Error fetching box scores for game ${gameId}:`, error);
    throw error;
  }
};

// NEW: Get betting odds for upcoming games
export const getBettingOdds = async (params = {}) => {
  try {
    // First, get upcoming games
    const today = new Date();
    const defaultParams = {
      start_date: today.toISOString().split('T')[0],
      per_page: 25
    };
    
    // Merge default params with any provided params
    const mergedParams = { ...defaultParams, ...params };
    
    // Convert params object to URL query string
    const queryParams = Object.entries(mergedParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    // Get upcoming games first
    const gamesUrl = `${BASE_URL}/games?${queryParams}`;
    const gamesResponse = await fetch(gamesUrl, { headers });
    
    if (!gamesResponse.ok) {
      throw new Error(`API request failed with status ${gamesResponse.status}`);
    }
    
    const gamesData = await gamesResponse.json();
    const upcomingGames = gamesData.data || [];
    
    // If no upcoming games, return empty array
    if (upcomingGames.length === 0) {
      return { data: [] };
    }
    
    // Extract game IDs for the betting odds endpoint
    const gameIds = upcomingGames.map(game => game.id);
    
    // Now fetch betting odds for these games
    const oddsQueryParams = gameIds.map(id => `game_ids[]=${id}`).join('&');
    const oddsUrl = `${BASE_URL}/betting_odds?${oddsQueryParams}`;
    
    const oddsResponse = await fetch(oddsUrl, { headers });
    
    if (!oddsResponse.ok) {
      throw new Error(`API request failed with status ${oddsResponse.status}`);
    }
    
    const oddsData = await oddsResponse.json();
    
    // Combine game data with odds data
    const gamesWithOdds = upcomingGames.map(game => {
      // Find odds data for this game
      const gameOdds = oddsData.data.find(odds => odds.game_id === game.id);
      
      if (gameOdds) {
        // If we have odds data, add it to the game object
        return {
          ...game,
          betting: {
            home_odds: gameOdds.home_team_odds,
            visitor_odds: gameOdds.visitor_team_odds,
            over_under: gameOdds.over_under,
            spread: gameOdds.spread,
            home_spread_odds: gameOdds.home_team_spread_odds,
            visitor_spread_odds: gameOdds.visitor_team_spread_odds,
            updated_at: gameOdds.updated_at
          }
        };
      } else {
        // If no odds data is available, return game without odds
        return game;
      }
    });
    
    return { data: gamesWithOdds };
  } catch (error) {
    console.error('Error fetching betting odds:', error);
    throw error;
  }
};

export default {
  getPlayers,
  getPlayerById,
  getTeams,
  getTeamById,
  getGames,
  getGameById,
  getPlayerSeasonAverages,
  getPlayerStats,
  getTeamStandings,
  getBoxScores,
  getBettingOdds // Added the new function
};