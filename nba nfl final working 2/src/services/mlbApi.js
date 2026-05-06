/**
 * MLB BallDontLie API Service
 * 
 * This file contains functions to interact with the MLB BallDontLie API
 * API Documentation: https://mlb.balldontlie.io/#mlb-api
 */

// Base URL for the MLB API
const BASE_URL = 'https://api.balldontlie.io/mlb/v1';
const API_KEY = 'eec8a44a-cba9-4226-8711-462860cdad89';

// Headers for API requests
const headers = {
  'Authorization': API_KEY
};

/**
 * Get all MLB players (paginated)
 * @param {string|null} cursor - Pagination cursor
 * @param {number} perPage - Number of results per page
 * @param {string} search - Optional search term
 * @returns {Promise<Object>} - Promise resolving to player data
 */
export const getPlayers = async (cursor = null, perPage = 25, search = '') => {
  try {
    let url = `${BASE_URL}/players?per_page=${perPage}`;
    
    if (cursor) {
      url += `&cursor=${cursor}`;
    }
    
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
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

/**
 * Get active MLB players
 * @param {string|null} cursor - Pagination cursor
 * @param {number} perPage - Number of results per page
 * @param {string} search - Optional search term
 * @returns {Promise<Object>} - Promise resolving to active player data
 */
export const getActivePlayers = async (cursor = null, perPage = 25, search = '') => {
  try {
    let url = `${BASE_URL}/players/active?per_page=${perPage}`;
    
    if (cursor) {
      url += `&cursor=${cursor}`;
    }
    
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching active players:', error);
    throw error;
  }
};

/**
 * Get a specific player by ID
 * @param {number} playerId - Player ID
 * @returns {Promise<Object>} - Promise resolving to player data
 */
export const getPlayerById = async (playerId) => {
  try {
    const response = await fetch(`${BASE_URL}/players/${playerId}`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching player with ID ${playerId}:`, error);
    throw error;
  }
};

/**
 * Get all MLB teams
 * @param {string|null} division - Optional division filter
 * @param {string|null} league - Optional league filter
 * @returns {Promise<Object>} - Promise resolving to team data
 */
export const getTeams = async (division = null, league = null) => {
  try {
    let url = `${BASE_URL}/teams`;
    const params = [];
    
    if (division) {
      params.push(`division=${encodeURIComponent(division)}`);
    }
    
    if (league) {
      params.push(`league=${encodeURIComponent(league)}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    const response = await fetch(url, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

/**
 * Get a specific team by ID
 * @param {number} teamId - Team ID
 * @returns {Promise<Object>} - Promise resolving to team data
 */
export const getTeamById = async (teamId) => {
  try {
    const response = await fetch(`${BASE_URL}/teams/${teamId}`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching team with ID ${teamId}:`, error);
    throw error;
  }
};

/**
 * Get games with filtering options
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} - Promise resolving to games data
 */
export const getGames = async (params = {}) => {
  try {
    const queryParams = [];
    
    // Handle cursor pagination
    if (params.cursor) {
      queryParams.push(`cursor=${params.cursor}`);
    }
    
    if (params.per_page) {
      queryParams.push(`per_page=${params.per_page}`);
    }
    
    // Handle dates array
    if (params.dates && Array.isArray(params.dates)) {
      params.dates.forEach(date => {
        queryParams.push(`dates[]=${date}`);
      });
    }
    
    // Handle seasons array
    if (params.seasons && Array.isArray(params.seasons)) {
      params.seasons.forEach(season => {
        queryParams.push(`seasons[]=${season}`);
      });
    }
    
    // Handle team_ids array
    if (params.team_ids && Array.isArray(params.team_ids)) {
      params.team_ids.forEach(teamId => {
        queryParams.push(`team_ids[]=${teamId}`);
      });
    }
    
    // Handle postseason flag
    if (params.postseason !== undefined) {
      queryParams.push(`postseason=${params.postseason ? 'true' : 'false'}`);
    }
    
    const url = `${BASE_URL}/games${queryParams.length > 0 ? `?${queryParams.join('&')}` : ''}`;
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching games:', error);
    throw error;
  }
};

/**
 * Get a specific game by ID
 * @param {number} gameId - Game ID
 * @returns {Promise<Object>} - Promise resolving to game data
 */
export const getGameById = async (gameId) => {
  try {
    const response = await fetch(`${BASE_URL}/games/${gameId}`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching game with ID ${gameId}:`, error);
    throw error;
  }
};

/**
 * Get player injuries
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} - Promise resolving to injury data
 */
export const getPlayerInjuries = async (params = {}) => {
  try {
    const queryParams = [];
    
    // Handle cursor pagination
    if (params.cursor) {
      queryParams.push(`cursor=${params.cursor}`);
    }
    
    if (params.per_page) {
      queryParams.push(`per_page=${params.per_page}`);
    }
    
    // Handle team_ids array
    if (params.team_ids && Array.isArray(params.team_ids)) {
      params.team_ids.forEach(teamId => {
        queryParams.push(`team_ids[]=${teamId}`);
      });
    }
    
    // Handle player_ids array
    if (params.player_ids && Array.isArray(params.player_ids)) {
      params.player_ids.forEach(playerId => {
        queryParams.push(`player_ids[]=${playerId}`);
      });
    }
    
    const url = `${BASE_URL}/player_injuries${queryParams.length > 0 ? `?${queryParams.join('&')}` : ''}`;
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching player injuries:', error);
    throw error;
  }
};

/**
 * Get player stats for specific games
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} - Promise resolving to player stats data
 */
export const getPlayerStats = async (params = {}) => {
  try {
    const queryParams = [];
    
    // Handle cursor pagination
    if (params.cursor) {
      queryParams.push(`cursor=${params.cursor}`);
    }
    
    if (params.per_page) {
      queryParams.push(`per_page=${params.per_page}`);
    }
    
    // Handle player_ids array
    if (params.player_ids && Array.isArray(params.player_ids)) {
      params.player_ids.forEach(playerId => {
        queryParams.push(`player_ids[]=${playerId}`);
      });
    }
    
    // Handle game_ids array
    if (params.game_ids && Array.isArray(params.game_ids)) {
      params.game_ids.forEach(gameId => {
        queryParams.push(`game_ids[]=${gameId}`);
      });
    }
    
    // Handle seasons array
    if (params.seasons && Array.isArray(params.seasons)) {
      params.seasons.forEach(season => {
        queryParams.push(`seasons[]=${season}`);
      });
    }
    
    const url = `${BASE_URL}/stats${queryParams.length > 0 ? `?${queryParams.join('&')}` : ''}`;
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching player stats:', error);
    throw error;
  }
};

/**
 * Get player season stats
 * @param {number} season - Season year
 * @param {number|null} playerId - Optional player ID filter
 * @param {number|null} teamId - Optional team ID filter
 * @param {boolean} postseason - Flag for postseason stats
 * @returns {Promise<Object>} - Promise resolving to season stats data
 */
export const getPlayerSeasonStats = async (season, playerId = null, teamId = null, postseason = false) => {
  try {
    const queryParams = [`season=${season}`];
    
    if (playerId) {
      queryParams.push(`player_ids[]=${playerId}`);
    }
    
    if (teamId) {
      queryParams.push(`team_id=${teamId}`);
    }
    
    if (postseason) {
      queryParams.push(`postseason=${postseason}`);
    }
    
    const url = `${BASE_URL}/season_stats?${queryParams.join('&')}`;
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching player season stats:', error);
    throw error;
  }
};

/**
 * Get team standings
 * @param {number} season - Season year
 * @returns {Promise<Object>} - Promise resolving to team standings data
 */
export const getTeamStandings = async (season = 2024) => {
  try {
    const response = await fetch(`${BASE_URL}/standings?season=${season}`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching team standings for season ${season}:`, error);
    throw error;
  }
};

/**
 * Get team season stats
 * @param {number} season - Season year
 * @param {number|null} teamId - Optional team ID filter
 * @param {boolean} postseason - Flag for postseason stats
 * @returns {Promise<Object>} - Promise resolving to team season stats data
 */
export const getTeamSeasonStats = async (season, teamId = null, postseason = false) => {
  try {
    const queryParams = [`season=${season}`];
    
    if (teamId) {
      queryParams.push(`team_id=${teamId}`);
    }
    
    if (postseason) {
      queryParams.push(`postseason=${postseason}`);
    }
    
    const url = `${BASE_URL}/teams/season_stats?${queryParams.join('&')}`;
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching team season stats:', error);
    throw error;
  }
};

/**
 * Get box scores for a specific game
 * @param {number} gameId - Game ID
 * @returns {Promise<Object>} - Promise resolving to box score data
 */
export const getBoxScores = async (gameId) => {
  try {
    const response = await fetch(`${BASE_URL}/stats?game_ids[]=${gameId}&per_page=100`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching box scores for game ${gameId}:`, error);
    throw error;
  }
};

// Default export with all API functions
export default {
  getPlayers,
  getActivePlayers,
  getPlayerById,
  getTeams,
  getTeamById,
  getGames,
  getGameById,
  getPlayerStats,
  getPlayerSeasonStats,
  getPlayerInjuries,
  getTeamStandings,
  getTeamSeasonStats,
  getBoxScores
};