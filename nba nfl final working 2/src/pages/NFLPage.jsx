import React, { useState, useEffect } from 'react'
import './NFLPage.css'
import GameDetails from '../components/GameDetails'

function NFLPage() {
  const [players, setPlayers] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [activeTab, setActiveTab] = useState('players')
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState(null)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [playerStats, setPlayerStats] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [teamRoster, setTeamRoster] = useState([])
  
  // Season selector state
  const currentYear = new Date().getFullYear()
  const [selectedStandingsSeason, setSelectedStandingsSeason] = useState(currentYear)
  const [selectedLeadersSeason, setSelectedLeadersSeason] = useState(currentYear)
  const [selectedGamesSeason, setSelectedGamesSeason] = useState(currentYear)
  const [selectedGame, setSelectedGame] = useState(null)
  const [boxScore, setBoxScore] = useState([])

  // Object to store data for different seasons
  const [standingsData, setStandingsData] = useState({})
  const [leadersData, setLeadersData] = useState({})
  const [gamesData, setGamesData] = useState({})
  
  // Available seasons for selection (last 5 years)
  const availableSeasons = Array.from({length: 5}, (_, i) => currentYear - i)
  
  // Premium endpoint state
  const [standings, setStandings] = useState([])
  const [games, setGames] = useState([])
  const [injuries, setInjuries] = useState([])
  const [leaders, setLeaders] = useState([])

  // API Configuration
  const baseUrl = 'https://api.balldontlie.io/nfl/v1'
  const apiKey = 'eec8a44a-cba9-4226-8711-462860cdad89'
  
  const headers = {
    'Authorization': apiKey
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch teams
        const teamsResponse = await fetch(`${baseUrl}/teams`, {
          headers
        })
        
        if (!teamsResponse.ok) {
          throw new Error(`API request failed with status ${teamsResponse.status}`)
        }
        
        const teamsData = await teamsResponse.json()
        setTeams(teamsData.data || [])
        
        // Don't load any players initially - they'll be loaded on search
        setPlayers([])
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setError(error.message || 'Failed to load data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Fetch team standings for a specific season
  function fetchStandings(season = currentYear) {
    setLoadingDetails(true)
    
    // Check if we already have data for this season
    if (standingsData[season]) {
      setStandings(standingsData[season])
      setLoadingDetails(false)
      return
    }
    
    fetch(`${baseUrl}/standings?season=${season}`, {
      headers
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }
      return response.json()
    })
    .then(data => {
      const seasonData = data.data || []
      
      // Store the data for this season
      setStandingsData(prev => ({
        ...prev,
        [season]: seasonData
      }))
      
      setStandings(seasonData)
    })
    .catch(error => {
      console.error(`Error fetching standings for season ${season}:`, error)
      alert(`Failed to load standings for ${season} season. Please try again.`)
    })
    .finally(() => {
      setLoadingDetails(false)
    })
  }

  // Handle standings season change
  function handleStandingsSeasonChange(e) {
    const newSeason = parseInt(e.target.value)
    setSelectedStandingsSeason(newSeason)
    fetchStandings(newSeason)
  }

  // Fetch statistical leaders for a specific season
  function fetchLeaders(season = currentYear) {
    setLoadingDetails(true)
    
    // Check if we already have data for this season
    if (leadersData[season]) {
      setLeaders(leadersData[season])
      setLoadingDetails(false)
      return
    }
    
    // We'll fetch season stats and sort them to get the leaders
    fetch(`${baseUrl}/season_stats?season=${season}`, {
      headers
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }
      return response.json()
    })
    .then(data => {
      // Process and extract top players in various categories
      const statsList = data.data || [];
      
      // Sort by passing yards
      const passingLeaders = statsList
        .filter(player => player.passing_yards && player.passing_yards > 0)
        .sort((a, b) => b.passing_yards - a.passing_yards)
        .slice(0, 10)
        .map(player => ({
          player: player.player,
          category: 'Passing Yards',
          value: player.passing_yards,
          season: season
        }));
      
      // Sort by rushing yards
      const rushingLeaders = statsList
        .filter(player => player.rushing_yards && player.rushing_yards > 0)
        .sort((a, b) => b.rushing_yards - a.rushing_yards)
        .slice(0, 10)
        .map(player => ({
          player: player.player,
          category: 'Rushing Yards',
          value: player.rushing_yards,
          season: season
        }));
      
      // Sort by receiving yards
      const receivingLeaders = statsList
        .filter(player => player.receiving_yards && player.receiving_yards > 0)
        .sort((a, b) => b.receiving_yards - a.receiving_yards)
        .slice(0, 10)
        .map(player => ({
          player: player.player,
          category: 'Receiving Yards',
          value: player.receiving_yards,
          season: season
        }));
      
      // Combine all leaders
      const seasonLeaders = [...passingLeaders, ...rushingLeaders, ...receivingLeaders];
      
      // Store the data for this season
      setLeadersData(prev => ({
        ...prev,
        [season]: seasonLeaders
      }))
      
      setLeaders(seasonLeaders)
    })
    .catch(error => {
      console.error(`Error fetching leaders for season ${season}:`, error);
      alert(`Failed to load statistical leaders for ${season} season. Please try again.`)
    })
    .finally(() => {
      setLoadingDetails(false)
    })
  }

  // Handle leaders season change
  function handleLeadersSeasonChange(e) {
    const newSeason = parseInt(e.target.value)
    setSelectedLeadersSeason(newSeason)
    fetchLeaders(newSeason)
  }

  // Fetch player injuries
  function fetchInjuries() {
    setLoadingDetails(true)
    
    fetch(`${baseUrl}/player_injuries`, {
      headers
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }
      return response.json()
    })
    .then(data => {
      setInjuries(data.data || [])
    })
    .catch(error => {
      console.error("Error fetching injuries:", error);
      alert('Failed to load player injuries. Please try again.')
    })
    .finally(() => {
      setLoadingDetails(false)
    })
  }

  // Fetch games for a specific season
  function fetchGames(season = currentYear) {
    setLoadingDetails(true)
    
    // Check if we already have data for this season
    if (gamesData[season]) {
      setGames(gamesData[season])
      setLoadingDetails(false)
      return
    }
    
    fetch(`${baseUrl}/games?seasons[]=${season}`, {
      headers
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }
      return response.json()
    })
    .then(data => {
      const seasonGames = data.data || [];
      
      // Store the data for this season
      setGamesData(prev => ({
        ...prev,
        [season]: seasonGames
      }))
      
      setGames(seasonGames)
    })
    .catch(error => {
      console.error(`Error fetching games for season ${season}:`, error);
      alert(`Failed to load games for ${season} season. Please try again.`)
    })
    .finally(() => {
      setLoadingDetails(false)
    })
  }

  // Handle games season change
  function handleGamesSeasonChange(e) {
    const newSeason = parseInt(e.target.value)
    setSelectedGamesSeason(newSeason)
    fetchGames(newSeason)
  }

  function fetchTeamRoster(teamId) {
    setLoadingDetails(true)
    fetch(`${baseUrl}/players?team_ids[]=${teamId}&per_page=100`, {
      headers
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }
      return response.json()
    })
    .then(data => {
      console.log(`Retrieved ${data.data?.length || 0} players for team ID ${teamId}`);
      
      // Set as both teamRoster and general players so they can be accessed in both contexts
      setTeamRoster(data.data || [])
      setPlayers(data.data || [])
      
      setSelectedTeam(teams.find(team => team.id === teamId))
      setActiveTab('players')
    })
    .catch(error => {
      console.error("Error fetching team roster:", error);
      alert('Failed to load team roster. Please try again.')
    })
    .finally(() => {
      setLoadingDetails(false)
    })
  }

  function fetchPlayerStats(playerId) {
    setLoadingDetails(true)
    const currentYear = new Date().getFullYear();
    
    // First, get the player details
    fetch(`${baseUrl}/players/${playerId}`, {
      headers
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }
      return response.json()
    })
    .then(playerData => {
      setSelectedPlayer(playerData.data)
      
      // Then get their season stats
      return fetch(`${baseUrl}/season_stats?player_ids[]=${playerId}&season=${currentYear}`, {
        headers
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }
      return response.json()
    })
    .then(statsData => {
      if (statsData.data && statsData.data.length > 0) {
        setPlayerStats(statsData.data[0])
      } else {
        // If no current season stats, try the previous season
        return fetch(`${baseUrl}/season_stats?player_ids[]=${playerId}&season=${currentYear - 1}`, {
          headers
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`)
          }
          return response.json()
        })
        .then(prevStatsData => {
          if (prevStatsData.data && prevStatsData.data.length > 0) {
            setPlayerStats(prevStatsData.data[0])
          } else {
            throw new Error("No statistics available for this player")
          }
        })
      }
    })
    .catch(error => {
      console.error("Error fetching player stats:", error);
      alert('Failed to load player statistics. The player might not have recent stats available.')
    })
    .finally(() => {
      setLoadingDetails(false)
    })
  }

  function handleSearchChange(e) {
    const value = e.target.value;
    setSearchTerm(value)
    
    // Clear player selection when search changes
    setSelectedPlayer(null)
    setPlayerStats(null)
    setSelectedTeam(null)
    setTeamRoster([])
    
    // Only fetch players if search term is at least 3 characters
    if (value.length >= 3) {
      searchPlayers(value);
    } else if (value.length === 0) {
      // Clear players list if search field is emptied
      setPlayers([]);
    }
  }
  
  function searchPlayers(query) {
    setLoadingDetails(true);
    
    fetch(`${baseUrl}/players?search=${encodeURIComponent(query)}&per_page=100`, {
      headers
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(`Search for "${query}" returned ${data.data?.length || 0} players`);
      setPlayers(data.data || []);
    })
    .catch(error => {
      console.error("Error searching players:", error);
      // Don't show an alert for search errors to avoid annoying the user
    })
    .finally(() => {
      setLoadingDetails(false);
    });
  }

  // Filter players based on search term
  const filteredPlayers = players.filter(player => {
    if (!player) return false
    if (!player.first_name || !player.last_name) return false
    
    const fullName = `${player.first_name} ${player.last_name}`.toLowerCase()
    return fullName.includes(searchTerm.toLowerCase())
  })

  // Filter teams based on search term
  const filteredTeams = teams.filter(team => {
    if (!team) return false
    if (!team.full_name) return false
    
    return team.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Display players to show (either filtered list or team roster)
  const playersToShow = selectedTeam ? teamRoster : filteredPlayers

  // Format records for display
  const formatRecord = (wins, losses, ties) => {
    if (ties > 0) {
      return `${wins}-${losses}-${ties}`;
    }
    return `${wins}-${losses}`;
  };

  // Season selector component
  const SeasonSelector = ({ value, onChange, label }) => (
    <div className="season-selector">
      <label htmlFor="season-select">{label || 'Select Season:'}</label>
      <select 
        id="season-select" 
        value={value} 
        onChange={onChange}
        className="season-select"
      >
        {availableSeasons.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="nfl-container">
      <div className="nfl-header">
        <h1>NFL Statistics</h1>
        <p>Explore comprehensive NFL player and team statistics</p>
      </div>

      {selectedTeam && (
        <div className="selected-team-banner">
          <h2>{selectedTeam.full_name} Roster</h2>
          <button className="back-button" onClick={() => {
            setSelectedTeam(null)
            setTeamRoster([])
          }}>
            Back to All Teams
          </button>
        </div>
      )}

      {selectedPlayer && playerStats && (
        <div className="selected-player-stats">
          <h2>{selectedPlayer.first_name} {selectedPlayer.last_name} Statistics</h2>
          <button className="back-button" onClick={() => {
            setSelectedPlayer(null)
            setPlayerStats(null)
            setActiveTab('players')
          }}>
            Back to Players
          </button>
          
          <div className="stats-grid">
            {/* Display different stats based on player position */}
            {selectedPlayer.position_abbreviation === 'QB' && (
              <>
                <div className="stat-item">
                  <span className="stat-label">Passing Yards</span>
                  <span className="stat-value">{playerStats.passing_yards || '0'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Completions</span>
                  <span className="stat-value">{playerStats.passing_completions || '0'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Attempts</span>
                  <span className="stat-value">{playerStats.passing_attempts || '0'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Passing TDs</span>
                  <span className="stat-value">{playerStats.passing_touchdowns || '0'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">INTs</span>
                  <span className="stat-value">{playerStats.passing_interceptions || '0'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">QB Rating</span>
                  <span className="stat-value">{playerStats.qbr?.toFixed(1) || '0.0'}</span>
                </div>
              </>
            )}
            
            {selectedPlayer.position_abbreviation === 'RB' && (
              <>
                <div className="stat-item">
                  <span className="stat-label">Rushing Yards</span>
                  <span className="stat-value">{playerStats.rushing_yards || '0'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Rushing Attempts</span>
                  <span className="stat-value">{playerStats.rushing_attempts || '0'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Yards/Attempt</span>
                  <span className="stat-value">{playerStats.yards_per_rush_attempt?.toFixed(1) || '0.0'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Rushing TDs</span>
                  <span className="stat-value">{playerStats.rushing_touchdowns || '0'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Receptions</span>
                  <span className="stat-value">{playerStats.receptions || '0'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Receiving Yards</span>
                  <span className="stat-value">{playerStats.receiving_yards || '0'}</span>
                </div>
              </>
            )}
            
            {(selectedPlayer.position_abbreviation === 'WR' || selectedPlayer.position_abbreviation === 'TE') && (
              <>
                <div className="stat-item">
                  <span className="stat-label">Receptions</span>
                  <span className="stat-value">{playerStats.receptions || '0'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Targets</span>
                  <span className="stat-value">{playerStats.receiving_targets || '0'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Receiving Yards</span>
                  <span className="stat-value">{playerStats.receiving_yards || '0'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Yards/Rec</span>
                  <span className="stat-value">{playerStats.yards_per_reception?.toFixed(1) || '0.0'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Receiving TDs</span>
                  <span className="stat-value">{playerStats.receiving_touchdowns || '0'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Rec Yards/Game</span>
                  <span className="stat-value">{playerStats.receiving_yards_per_game?.toFixed(1) || '0.0'}</span>
                </div>
              </>
            )}
            
            {/* Default stats for other positions */}
            {(!['QB', 'RB', 'WR', 'TE'].includes(selectedPlayer.position_abbreviation)) && (
              <>
                <div className="stat-item">
                  <span className="stat-label">Games Played</span>
                  <span className="stat-value">{playerStats.games_played || '0'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Tackles</span>
                  <span className="stat-value">{playerStats.total_tackles || '0'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Solo Tackles</span>
                  <span className="stat-value">{playerStats.solo_tackles || '0'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Sacks</span>
                  <span className="stat-value">{playerStats.defensive_sacks || '0'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Interceptions</span>
                  <span className="stat-value">{playerStats.defensive_interceptions || '0'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Fumbles Forced</span>
                  <span className="stat-value">{playerStats.fumbles_forced || '0'}</span>
                </div>
              </>
            )}
          </div>
          
          <div className="advanced-stats">
            <h3>Additional Stats</h3>
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Games</th>
                  <th>Fumbles</th>
                  <th>Fumbles Lost</th>
                  <th>1st Downs</th>
                  <th>Season</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{playerStats.games_played || '0'}</td>
                  <td>{(playerStats.rushing_fumbles || 0) + (playerStats.receiving_fumbles || 0)}</td>
                  <td>{(playerStats.rushing_fumbles_lost || 0) + (playerStats.receiving_fumbles_lost || 0)}</td>
                  <td>{(playerStats.rushing_first_downs || 0) + (playerStats.receiving_first_downs || 0)}</td>
                  <td>{playerStats.season || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!selectedPlayer && !selectedTeam && (
        <div className="search-container">
          <input
            type="text"
            placeholder="Search players or teams..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      )}

      {!selectedPlayer && (
        <div className="tabs">
          <button 
            className={activeTab === 'players' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('players')}
          >
            Players
          </button>
          <button 
            className={activeTab === 'teams' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('teams')}
          >
            Teams
          </button>
          <button 
            className={activeTab === 'games' ? 'tab-button active' : 'tab-button'}
            onClick={() => {
              setActiveTab('games')
              if (games.length === 0) fetchGames(selectedGamesSeason)
            }}
          >
            Games
          </button>
          <button 
            className={activeTab === 'standings' ? 'tab-button active' : 'tab-button'}
            onClick={() => {
              setActiveTab('standings')
              if (standings.length === 0) fetchStandings(selectedStandingsSeason)
            }}
          >
            Standings
          </button>
          <button 
            className={activeTab === 'injuries' ? 'tab-button active' : 'tab-button'}
            onClick={() => {
              setActiveTab('injuries')
              if (injuries.length === 0) fetchInjuries()
            }}
          >
            Injuries
          </button>
          <button 
            className={activeTab === 'leaders' ? 'tab-button active' : 'tab-button'}
            onClick={() => {
              setActiveTab('leaders')
              if (leaders.length === 0) fetchLeaders(selectedLeadersSeason)
            }}
          >
            Leaders
          </button>
        </div>
      )}

      {loading || loadingDetails ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : (
        <div className="content-container">
          {activeTab === 'players' && !selectedPlayer && (
            <div className="players-grid">
              {loadingDetails ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Searching players...</p>
                </div>
              ) : playersToShow.length > 0 ? (
                playersToShow.map(player => (
                  <div key={player.id} className="player-card">
                    <h3>{player.first_name} {player.last_name}</h3>
                    <div className="player-info">
                      <p><span>Team:</span> {player.team?.full_name || 'N/A'}</p>
                      <p><span>Position:</span> {player.position || 'N/A'}</p>
                      <p><span>Position Code:</span> {player.position_abbreviation || 'N/A'}</p>
                      <p><span>Height:</span> {player.height || 'N/A'}</p>
                      <p><span>Weight:</span> {player.weight || 'N/A'}</p>
                      {player.jersey_number && <p><span>Jersey #:</span> {player.jersey_number}</p>}
                      {player.college && <p><span>College:</span> {player.college}</p>}
                      {player.experience && <p><span>Experience:</span> {player.experience}</p>}
                      {player.age && <p><span>Age:</span> {player.age}</p>}
                    </div>
                    <button 
                      className="view-stats-btn"
                      onClick={() => fetchPlayerStats(player.id)}
                    >
                      View Performance Stats
                    </button>
                  </div>
                ))
              ) : searchTerm.length >= 3 ? (
                <div className="no-results">
                  <p>No players found matching "{searchTerm}"</p>
                </div>
              ) : searchTerm.length > 0 ? (
                <div className="placeholder-message">
                  <p>Please enter at least 3 characters to search for players</p>
                </div>
              ) : (
                <div className="placeholder-message">
                  <h3>NFL Players Search</h3>
                  <p>Enter a player's name in the search box above to find players.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="teams-grid">
              {filteredTeams.length > 0 ? (
                filteredTeams.map(team => (
                  <div key={team.id} className="team-card">
                    <h3>{team.full_name}</h3>
                    <div className="team-info">
                      <p><span>Abbreviation:</span> {team.abbreviation}</p>
                      <p><span>Conference:</span> {team.conference}</p>
                      <p><span>Division:</span> {team.division}</p>
                      <p><span>Location:</span> {team.location}</p>
                    </div>
                    <button 
                      className="view-roster-btn"
                      onClick={() => fetchTeamRoster(team.id)}
                    >
                      View Team Roster
                    </button>
                  </div>
                ))
              ) : searchTerm ? (
                <div className="no-results">
                  <p>No teams found matching "{searchTerm}"</p>
                </div>
              ) : (
                <div className="no-results">
                  <p>No team data available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'games' && (
            <div className="games-container">
              <h3>NFL Games</h3>
              
              {/* Season selector for games */}
              <SeasonSelector 
                value={selectedGamesSeason} 
                onChange={handleGamesSeasonChange} 
                label={`Season: `}
              />
              
              {games.length === 0 && (
                <div className="placeholder-message">
                  <p>Click to load NFL games for {selectedGamesSeason} season</p>
                  <button 
                    className="view-stats-btn"
                    onClick={() => fetchGames(selectedGamesSeason)}
                  >
                    Load Games
                  </button>
                </div>
              )}
              {games.length > 0 && (
                <>
                  <h4 className="season-title">{selectedGamesSeason} NFL Season Games</h4>
                  <div className="games-list">
                    {games.map(game => {
                      // Format the date and get week info
                      const gameDate = new Date(game.date);
                      const formattedDate = gameDate.toLocaleDateString();
                      const week = game.week || 1;
                      
                      // Extract or generate time
                      let gameTime = game.time || '1:00 PM ET';
                      // If we have a game start time in a format like "19:30:00", convert it to a more readable format
                      if (gameTime && gameTime.includes(':')) {
                        const timeParts = gameTime.split(':');
                        let hours = parseInt(timeParts[0]);
                        const minutes = timeParts[1];
                        const ampm = hours >= 12 ? 'PM' : 'AM';
                        hours = hours % 12;
                        hours = hours ? hours : 12; // If hour is 0, make it 12
                        gameTime = `${hours}:${minutes} ${ampm} ET`;
                      }
                      
                      // Determine if the game is completed
                      const isCompleted = game.status === 'Final' || game.status === 'Completed';
                      
                      return (
                        <div key={game.id} className="game-card">
                          <div className="game-header">
                            <span>{formattedDate}</span>
                            {isCompleted ? (
                              <span className="game-status">Final</span>
                            ) : (
                              <span className="game-time">{gameTime}</span>
                            )}
                          </div>
                          <div className="game-teams">
                            <div className="team">
                              <div className="team-name">{game.home_team.full_name}</div>
                              {isCompleted && <div className="team-score">{game.home_team_score || 0}</div>}
                            </div>
                            <div className="vs">vs</div>
                            <div className="team">
                              <div className="team-name">{game.visitor_team.full_name}</div>
                              {isCompleted && <div className="team-score">{game.visitor_team_score || 0}</div>}
                            </div>
                          </div>
                          <div className="game-venue">
                            {game.venue || 'TBD'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'standings' && (
            <div className="standings-container">
              <h3>NFL Team Standings</h3>
              
              {/* Season selector for standings */}
              <SeasonSelector 
                value={selectedStandingsSeason} 
                onChange={handleStandingsSeasonChange} 
                label={`Season: `}
              />
              
              {standings.length === 0 && (
                <div className="placeholder-message">
                  <p>Click to load NFL team standings for {selectedStandingsSeason} season</p>
                  <button 
                    className="view-stats-btn"
                    onClick={() => fetchStandings(selectedStandingsSeason)}
                  >
                    Load Standings
                  </button>
                </div>
              )}
              {standings.length > 0 && (
                <div className="standings-wrapper">
                  <div className="standings-title">
                    <h4>NFL {selectedStandingsSeason} Season Standings</h4>
                  </div>
                  
                  {/* AFC Conference */}
                  <div className="conference-container">
                    <h4 className="conference-title">AFC</h4>
                    
                    {['NORTH', 'SOUTH', 'EAST', 'WEST'].map(division => (
                      <div key={`afc-${division}`} className="division-standings">
                        <h5 className="division-title">AFC {division}</h5>
                        <div className="division-table-wrapper">
                          <table className="standings-table">
                            <thead>
                              <tr>
                                <th>Team</th>
                                <th>W</th>
                                <th>L</th>
                                <th>T</th>
                                <th>PCT</th>
                                <th>PF</th>
                                <th>PA</th>
                                <th>HOME</th>
                                <th>AWAY</th>
                              </tr>
                            </thead>
                            <tbody>
                              {standings
                                .filter(team => team.team.conference === 'AFC' && team.team.division === division)
                                .sort((a, b) => {
                                  // Sort by win percentage first
                                  if (b.win_streak !== a.win_streak) {
                                    return b.win_streak - a.win_streak;
                                  }
                                  // Then by head-to-head (not available in this data)
                                  // Then by win percentage in division games
                                  return b.division_record.localeCompare(a.division_record);
                                })
                                .map(standing => (
                                  <tr key={standing.team.id}>
                                    <td>{standing.team.full_name}</td>
                                    <td>{standing.wins}</td>
                                    <td>{standing.losses}</td>
                                    <td>{standing.ties || 0}</td>
                                    <td>{((standing.wins / (standing.wins + standing.losses + (standing.ties || 0))) * 100).toFixed(1)}%</td>
                                    <td>{standing.points_for}</td>
                                    <td>{standing.points_against}</td>
                                    <td>{standing.home_record}</td>
                                    <td>{standing.road_record}</td>
                                  </tr>
                                ))
                              }
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* NFC Conference */}
                  <div className="conference-container">
                    <h4 className="conference-title">NFC</h4>
                    
                    {['NORTH', 'SOUTH', 'EAST', 'WEST'].map(division => (
                      <div key={`nfc-${division}`} className="division-standings">
                        <h5 className="division-title">NFC {division}</h5>
                        <div className="division-table-wrapper">
                          <table className="standings-table">
                            <thead>
                              <tr>
                                <th>Team</th>
                                <th>W</th>
                                <th>L</th>
                                <th>T</th>
                                <th>PCT</th>
                                <th>PF</th>
                                <th>PA</th>
                                <th>HOME</th>
                                <th>AWAY</th>
                              </tr>
                            </thead>
                            <tbody>
                              {standings
                                .filter(team => team.team.conference === 'NFC' && team.team.division === division)
                                .sort((a, b) => {
                                  // Sort by win percentage first
                                  if (b.win_streak !== a.win_streak) {
                                    return b.win_streak - a.win_streak;
                                  }
                                  // Then by head-to-head (not available in this data)
                                  // Then by win percentage in division games
                                  return b.division_record.localeCompare(a.division_record);
                                })
                                .map(standing => (
                                  <tr key={standing.team.id}>
                                    <td>{standing.team.full_name}</td>
                                    <td>{standing.wins}</td>
                                    <td>{standing.losses}</td>
                                    <td>{standing.ties || 0}</td>
                                    <td>{((standing.wins / (standing.wins + standing.losses + (standing.ties || 0))) * 100).toFixed(1)}%</td>
                                    <td>{standing.points_for}</td>
                                    <td>{standing.points_against}</td>
                                    <td>{standing.home_record}</td>
                                    <td>{standing.road_record}</td>
                                  </tr>
                                ))
                              }
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'injuries' && (
            <div className="injuries-container">
              <h3>NFL Player Injuries</h3>
              {injuries.length === 0 && (
                <div className="placeholder-message">
                  <p>Click to load NFL player injuries</p>
                  <button 
                    className="view-stats-btn"
                    onClick={fetchInjuries}
                  >
                    Load Injuries
                  </button>
                </div>
              )}
              {injuries.length > 0 && (
                <div className="injuries-list">
                  {injuries.map(injury => (
                    <div key={injury.player.id} className="injury-card">
                      <h4>{injury.player.first_name} {injury.player.last_name}</h4>
                      <p><span>Team:</span> {injury.player.team.full_name}</p>
                      <p><span>Position:</span> {injury.player.position}</p>
                      <p><span>Status:</span> <span className="injury-status">{injury.status}</span></p>
                      <p><span>Description:</span> {injury.comment || 'No details available'}</p>
                      <p><span>Date:</span> {new Date(injury.date).toLocaleDateString()}</p>
                      <button 
                        className="view-stats-btn"
                        onClick={() => fetchPlayerStats(injury.player.id)}
                      >
                        Player Stats
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'leaders' && (
            <div className="leaders-container">
              <h3>NFL Statistical Leaders</h3>
              
              {/* Season selector for leaders */}
              <SeasonSelector 
                value={selectedLeadersSeason} 
                onChange={handleLeadersSeasonChange} 
                label={`Season: `}
              />
              
              {leaders.length === 0 && (
                <div className="placeholder-message">
                  <p>Click to load NFL statistical leaders for {selectedLeadersSeason} season</p>
                  <button 
                    className="view-stats-btn"
                    onClick={() => fetchLeaders(selectedLeadersSeason)}
                  >
                    Load Leaders
                  </button>
                </div>
              )}
              {leaders.length > 0 && (
                <div className="leaders-section">
                  {/* Passing Leaders */}
                  <h4>Passing Leaders ({selectedLeadersSeason} Season)</h4>
                  <div className="leaders-list">
                    {leaders
                      .filter(leader => leader.category === 'Passing Yards')
                      .slice(0, 10)
                      .map((leader, index) => (
                        <div key={`passing-${leader.player.id}`} className="leader-card">
                          <div className="leader-rank">{index + 1}</div>
                          <div className="leader-info">
                            <h4>{leader.player.first_name} {leader.player.last_name}</h4>
                            <p><span>Passing Yards:</span> <strong>{leader.value}</strong></p>
                            <button 
                              className="view-stats-btn"
                              onClick={() => fetchPlayerStats(leader.player.id)}
                            >
                              Full Stats
                            </button>
                          </div>
                        </div>
                      ))
                    }
                  </div>

                  {/* Rushing Leaders */}
                  <h4>Rushing Leaders ({selectedLeadersSeason} Season)</h4>
                  <div className="leaders-list">
                    {leaders
                      .filter(leader => leader.category === 'Rushing Yards')
                      .slice(0, 10)
                      .map((leader, index) => (
                        <div key={`rushing-${leader.player.id}`} className="leader-card">
                          <div className="leader-rank">{index + 1}</div>
                          <div className="leader-info">
                            <h4>{leader.player.first_name} {leader.player.last_name}</h4>
                            <p><span>Rushing Yards:</span> <strong>{leader.value}</strong></p>
                            <button 
                              className="view-stats-btn"
                              onClick={() => fetchPlayerStats(leader.player.id)}
                            >
                              Full Stats
                            </button>
                          </div>
                        </div>
                      ))
                    }
                  </div>

                  {/* Receiving Leaders */}
                  <h4>Receiving Leaders ({selectedLeadersSeason} Season)</h4>
                  <div className="leaders-list">
                    {leaders
                      .filter(leader => leader.category === 'Receiving Yards')
                      .slice(0, 10)
                      .map((leader, index) => (
                        <div key={`receiving-${leader.player.id}`} className="leader-card">
                          <div className="leader-rank">{index + 1}</div>
                          <div className="leader-info">
                            <h4>{leader.player.first_name} {leader.player.last_name}</h4>
                            <p><span>Receiving Yards:</span> <strong>{leader.value}</strong></p>
                            <button 
                              className="view-stats-btn"
                              onClick={() => fetchPlayerStats(leader.player.id)}
                            >
                              Full Stats
                            </button>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NFLPage