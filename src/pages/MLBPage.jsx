import React, { useState, useEffect } from 'react'
import './MLBPage.css'
import GameDetails from '../components/GameDetails'
import api from '../services/mlbApi' // Import the MLB API service

function MLBPage() {
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
  
  // Additional state for MLB-specific features
  const [standings, setStandings] = useState([])
  const [games, setGames] = useState([])
  const [injuries, setInjuries] = useState([])
  const [selectedGame, setSelectedGame] = useState(null)
  const [boxScore, setBoxScore] = useState([])
  const [currentSeason, setCurrentSeason] = useState(2024)
  const [pagination, setPagination] = useState({
    cursor: null,
    hasMore: true
  })

  // Constants for API
  const baseUrl = 'https://api.balldontlie.io/mlb/v1'
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
        
        // Don't load any players initially - they'll be loaded on search or team selection
        setPlayers([])
      } catch (error) {
        console.error("Error fetching initial data:", error)
        setError(error.message || 'Failed to load data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Function to fetch active players (with pagination)
  const fetchActivePlayers = async (cursor = null) => {
    setLoadingDetails(true)
    try {
      let url = `${baseUrl}/players/active?per_page=25`
      
      if (cursor) {
        url += `&cursor=${cursor}`
      }
      
      const response = await fetch(url, { headers })
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }
      
      const data = await response.json()
      
      // Update the players and pagination state
      if (cursor) {
        // Append to existing players if loading more
        setPlayers(prevPlayers => [...prevPlayers, ...(data.data || [])])
      } else {
        // Replace players if this is the initial load
        setPlayers(data.data || [])
      }
      
      setPagination({
        cursor: data.meta?.next_cursor || null,
        hasMore: !!data.meta?.next_cursor
      })
      
    } catch (error) {
      console.error("Error fetching active players:", error)
      setError('Failed to load active players. Please try again.')
    } finally {
      setLoadingDetails(false)
    }
  }

  // Function to fetch team standings
  const fetchStandings = async () => {
    setLoadingDetails(true)
    try {
      const response = await fetch(`${baseUrl}/standings?season=${currentSeason}`, {
        headers
      })
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }
      
      const data = await response.json()
      setStandings(data.data || [])
    } catch (error) {
      console.error("Error fetching standings:", error)
      setError('Failed to load standings. Please try again.')
    } finally {
      setLoadingDetails(false)
    }
  }

  // Function to fetch games (with date range)
  const fetchGames = async () => {
    setLoadingDetails(true)
    try {
      // Default to fetching recent games
      const today = new Date()
      const oneWeekAgo = new Date(today)
      oneWeekAgo.setDate(today.getDate() - 7)
      
      const startDate = oneWeekAgo.toISOString().split('T')[0]
      const endDate = today.toISOString().split('T')[0]
      
      const params = {
        dates: [startDate, endDate],
        per_page: 25
      }
      
      // Convert params for URL
      const queryParams = []
      
      params.dates.forEach(date => {
        queryParams.push(`dates[]=${date}`)
      })
      
      queryParams.push(`per_page=${params.per_page}`)
      
      const url = `${baseUrl}/games?${queryParams.join('&')}`
      const response = await fetch(url, { headers })
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }
      
      const data = await response.json()
      setGames(data.data || [])
    } catch (error) {
      console.error("Error fetching games:", error)
      setError('Failed to load games. Please try again.')
    } finally {
      setLoadingDetails(false)
    }
  }

  // Function to fetch player injuries
  const fetchInjuries = async () => {
    setLoadingDetails(true)
    try {
      const response = await fetch(`${baseUrl}/player_injuries?per_page=25`, {
        headers
      })
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }
      
      const data = await response.json()
      setInjuries(data.data || [])
    } catch (error) {
      console.error("Error fetching injuries:", error)
      setError('Failed to load player injuries. Please try again.')
    } finally {
      setLoadingDetails(false)
    }
  }

  // Function to fetch player stats
  const fetchPlayerStats = async (playerId) => {
    setLoadingDetails(true)
    try {
      // First get the player details
      const playerResponse = await fetch(`${baseUrl}/players/${playerId}`, {
        headers
      })
      
      if (!playerResponse.ok) {
        throw new Error(`API request failed with status ${playerResponse.status}`)
      }
      
      const playerData = await playerResponse.json()
      
      // Then get the season stats
      const statsResponse = await fetch(`${baseUrl}/season_stats?player_ids[]=${playerId}&season=${currentSeason}`, {
        headers
      })
      
      if (!statsResponse.ok) {
        throw new Error(`API request failed with status ${statsResponse.status}`)
      }
      
      const statsData = await statsResponse.json()
      
      // Set the player and stats data
      setSelectedPlayer(playerData)
      
      if (statsData.data && statsData.data.length > 0) {
        setPlayerStats(statsData.data[0])
      } else {
        // If no stats for current season, try previous season
        const prevYearResponse = await fetch(`${baseUrl}/season_stats?player_ids[]=${playerId}&season=${currentSeason - 1}`, {
          headers
        })
        
        if (!prevYearResponse.ok) {
          throw new Error(`API request failed with status ${prevYearResponse.status}`)
        }
        
        const prevYearData = await prevYearResponse.json()
        
        if (prevYearData.data && prevYearData.data.length > 0) {
          setPlayerStats(prevYearData.data[0])
        } else {
          throw new Error("No statistics available for this player")
        }
      }
    } catch (error) {
      console.error("Error fetching player stats:", error)
      setError('Failed to load player statistics. The player might not have recent stats available.')
    } finally {
      setLoadingDetails(false)
    }
  }

  // Function to fetch team roster
  const fetchTeamRoster = async (teamId) => {
    setLoadingDetails(true)
    try {
      const response = await fetch(`${baseUrl}/players?team_ids[]=${teamId}&per_page=100`, {
        headers
      })
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }
      
      const data = await response.json()
      
      // Set the team roster and selected team
      setTeamRoster(data.data || [])
      setSelectedTeam(teams.find(team => team.id === teamId))
      setActiveTab('players')
    } catch (error) {
      console.error("Error fetching team roster:", error)
      setError('Failed to load team roster. Please try again.')
    } finally {
      setLoadingDetails(false)
    }
  }

  // Function to fetch box score for a game
  const fetchBoxScore = async (gameId) => {
    setLoadingDetails(true)
    try {
      const response = await fetch(`${baseUrl}/stats?game_ids[]=${gameId}&per_page=100`, {
        headers
      })
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }
      
      const data = await response.json()
      setBoxScore(data.data || [])
    } catch (error) {
      console.error("Error fetching box score:", error)
      setError('Failed to load box score data. Please try again.')
    } finally {
      setLoadingDetails(false)
    }
  }

  // Handler for when a game is clicked to view game details
  const handleGameClick = async (game) => {
    setSelectedGame(game)
    await fetchBoxScore(game.id)
  }

  // Handler to close the game details modal
  const handleCloseGameDetails = () => {
    setSelectedGame(null)
    setBoxScore([])
  }

  // Handler for search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    
    // Clear player selection when search changes
    setSelectedPlayer(null)
    setPlayerStats(null)
    setSelectedTeam(null)
    setTeamRoster([])
    
    // Only fetch players if search term is at least 3 characters
    if (value.length >= 3) {
      searchPlayers(value)
    } else if (value.length === 0) {
      // Clear players list if search field is emptied
      setPlayers([])
    }
  }
  
  // Function to search for players
  const searchPlayers = async (query) => {
    setLoadingDetails(true)
    try {
      const response = await fetch(`${baseUrl}/players?search=${encodeURIComponent(query)}&per_page=25`, {
        headers
      })
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }
      
      const data = await response.json()
      setPlayers(data.data || [])
      
      // Reset pagination since this is a new search
      setPagination({
        cursor: data.meta?.next_cursor || null,
        hasMore: !!data.meta?.next_cursor
      })
    } catch (error) {
      console.error("Error searching players:", error)
      // Don't show an error message for search to avoid annoying the user
    } finally {
      setLoadingDetails(false)
    }
  }

  // Function to load more players (pagination)
  const loadMorePlayers = () => {
    if (pagination.hasMore && !loadingDetails) {
      if (searchTerm.length >= 3) {
        // If we're searching, we need to load more search results
        searchPlayers(searchTerm)
      } else {
        // Otherwise load more active players
        fetchActivePlayers(pagination.cursor)
      }
    }
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
    if (!team.display_name) return false
    
    return team.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Display players to show (either filtered list or team roster)
  const playersToShow = selectedTeam ? teamRoster : filteredPlayers

  // Format player position for display
  const formatPosition = (position) => {
    if (!position) return 'N/A'
    
    // Map of position abbreviations to full names
    const positionMap = {
      'P': 'Pitcher',
      'C': 'Catcher',
      '1B': 'First Base',
      '2B': 'Second Base',
      '3B': 'Third Base',
      'SS': 'Shortstop',
      'LF': 'Left Field',
      'CF': 'Center Field',
      'RF': 'Right Field',
      'OF': 'Outfield',
      'DH': 'Designated Hitter',
      'UT': 'Utility'
    }
    
    return positionMap[position] || position
  }

  // Format player height for display
  const formatHeight = (feet, inches) => {
    if (!feet || !inches) return 'N/A'
    return `${feet}'${inches}"`
  }

  // Format player weight for display
  const formatWeight = (weight) => {
    if (!weight) return 'N/A'
    return `${weight} lbs`
  }

  // Format batting and throwing stats
  const formatBatThrow = (hand) => {
    if (!hand) return 'N/A'
    
    const handMap = {
      'R': 'Right',
      'L': 'Left',
      'S': 'Switch'
    }
    
    return handMap[hand] || hand
  }

  return (
    <div className="mlb-container">
      <div className="mlb-header">
        <h1>MLB Statistics</h1>
        <p>Explore comprehensive MLB player and team statistics</p>
      </div>

      {selectedTeam && (
        <div className="selected-team-banner">
          <h2>{selectedTeam.display_name} Roster</h2>
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
          
          {/* Player info section */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ flex: '1', minWidth: '250px' }}>
                <h3 style={{ marginBottom: '1rem' }}>Player Info</h3>
                <p><strong>Team:</strong> {selectedPlayer.team?.display_name || 'N/A'}</p>
                <p><strong>Position:</strong> {formatPosition(selectedPlayer.position)}</p>
                <p><strong>Height:</strong> {formatHeight(selectedPlayer.height_feet, selectedPlayer.height_inches)}</p>
                <p><strong>Weight:</strong> {formatWeight(selectedPlayer.weight_pounds)}</p>
                <p><strong>Bats:</strong> {formatBatThrow(selectedPlayer.bats)}</p>
                <p><strong>Throws:</strong> {formatBatThrow(selectedPlayer.throws)}</p>
                {selectedPlayer.jersey_number && <p><strong>Jersey #:</strong> {selectedPlayer.jersey_number}</p>}
                {selectedPlayer.birthdate && <p><strong>Born:</strong> {new Date(selectedPlayer.birthdate).toLocaleDateString()}</p>}
                {selectedPlayer.birthplace && <p><strong>Birthplace:</strong> {selectedPlayer.birthplace}</p>}
                {selectedPlayer.college && <p><strong>College:</strong> {selectedPlayer.college}</p>}
                {selectedPlayer.draft_year && <p><strong>Draft:</strong> {selectedPlayer.draft_year}, Round {selectedPlayer.draft_round || 'N/A'}, Pick {selectedPlayer.draft_pick || 'N/A'}</p>}
              </div>
              
              <div style={{ flex: '2', minWidth: '300px' }}>
                <h3 style={{ marginBottom: '1rem' }}>Season Stats ({playerStats.season})</h3>
                {/* Different stats display based on player position */}
                {playerStats.is_pitcher ? (
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-label">ERA</span>
                      <span className="stat-value">{playerStats.era || '0.00'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Wins</span>
                      <span className="stat-value">{playerStats.wins || '0'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Losses</span>
                      <span className="stat-value">{playerStats.losses || '0'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">IP</span>
                      <span className="stat-value">{playerStats.ip || '0.0'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">SO</span>
                      <span className="stat-value">{playerStats.k_pitched || '0'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">WHIP</span>
                      <span className="stat-value">{playerStats.whip || '0.00'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-label">AVG</span>
                      <span className="stat-value">{playerStats.avg || '.000'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">HR</span>
                      <span className="stat-value">{playerStats.hr || '0'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">RBI</span>
                      <span className="stat-value">{playerStats.rbi || '0'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">OBP</span>
                      <span className="stat-value">{playerStats.obp || '.000'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">SLG</span>
                      <span className="stat-value">{playerStats.slg || '.000'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">OPS</span>
                      <span className="stat-value">{playerStats.ops || '.000'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Detailed stats section */}
          <div className="advanced-stats">
            <h3>Detailed Statistics</h3>
            {playerStats.is_pitcher ? (
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>G</th>
                    <th>GS</th>
                    <th>IP</th>
                    <th>H</th>
                    <th>R</th>
                    <th>ER</th>
                    <th>BB</th>
                    <th>K</th>
                    <th>HR</th>
                    <th>ERA</th>
                    <th>WHIP</th>
                    <th>W</th>
                    <th>L</th>
                    <th>SV</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{playerStats.games_pitched || '0'}</td>
                    <td>{playerStats.games_started || '0'}</td>
                    <td>{playerStats.ip || '0.0'}</td>
                    <td>{playerStats.h_allowed || '0'}</td>
                    <td>{playerStats.r_allowed || '0'}</td>
                    <td>{playerStats.er || '0'}</td>
                    <td>{playerStats.bb_allowed || '0'}</td>
                    <td>{playerStats.k_pitched || '0'}</td>
                    <td>{playerStats.hr_allowed || '0'}</td>
                    <td>{playerStats.era || '0.00'}</td>
                    <td>{playerStats.whip || '0.00'}</td>
                    <td>{playerStats.wins || '0'}</td>
                    <td>{playerStats.losses || '0'}</td>
                    <td>{playerStats.saves || '0'}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>G</th>
                    <th>AB</th>
                    <th>R</th>
                    <th>H</th>
                    <th>2B</th>
                    <th>3B</th>
                    <th>HR</th>
                    <th>RBI</th>
                    <th>SB</th>
                    <th>BB</th>
                    <th>K</th>
                    <th>AVG</th>
                    <th>OBP</th>
                    <th>SLG</th>
                    <th>OPS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{playerStats.games || '0'}</td>
                    <td>{playerStats.ab || '0'}</td>
                    <td>{playerStats.r || '0'}</td>
                    <td>{playerStats.h || '0'}</td>
                    <td>{playerStats.doubles || '0'}</td>
                    <td>{playerStats.triples || '0'}</td>
                    <td>{playerStats.hr || '0'}</td>
                    <td>{playerStats.rbi || '0'}</td>
                    <td>{playerStats.sb || '0'}</td>
                    <td>{playerStats.bb || '0'}</td>
                    <td>{playerStats.k || '0'}</td>
                    <td>{playerStats.avg || '.000'}</td>
                    <td>{playerStats.obp || '.000'}</td>
                    <td>{playerStats.slg || '.000'}</td>
                    <td>{playerStats.ops || '.000'}</td>
                  </tr>
                </tbody>
              </table>
            )}
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
              if (games.length === 0) {
                fetchGames()
              }
            }}
          >
            Games
          </button>
          <button 
            className={activeTab === 'standings' ? 'tab-button active' : 'tab-button'}
            onClick={() => {
              setActiveTab('standings')
              if (standings.length === 0) {
                fetchStandings()
              }
            }}
          >
            Standings
          </button>
          <button 
            className={activeTab === 'injuries' ? 'tab-button active' : 'tab-button'}
            onClick={() => {
              setActiveTab('injuries')
              if (injuries.length === 0) {
                fetchInjuries()
              }
            }}
          >
            Injuries
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
          {/* Players Tab */}
          {activeTab === 'players' && !selectedPlayer && (
            <div className="players-grid">
              {playersToShow.length === 0 && !searchTerm && (
                <div className="placeholder-message">
                  <h3>MLB Players</h3>
                  <p>Enter a player's name in the search box above to find players, or</p>
                  <button 
                    className="view-stats-btn"
                    onClick={() => fetchActivePlayers()}
                  >
                    Load Active Players
                  </button>
                </div>
              )}
              
              {playersToShow.length === 0 && searchTerm.length >= 3 && (
                <div className="no-results">
                  <p>No players found matching "{searchTerm}"</p>
                </div>
              )}
              
              {searchTerm.length > 0 && searchTerm.length < 3 && (
                <div className="placeholder-message">
                  <p>Please enter at least 3 characters to search for players</p>
                </div>
              )}
              
              {playersToShow.map(player => (
                <div key={player.id} className="player-card">
                  <h3>{player.first_name} {player.last_name}</h3>
                  <div className="player-info">
                    <p><span>Team:</span> {player.team?.display_name || 'N/A'}</p>
                    <p><span>Position:</span> {formatPosition(player.position)}</p>
                    <p><span>Bats:</span> {formatBatThrow(player.bats)}</p>
                    <p><span>Throws:</span> {formatBatThrow(player.throws)}</p>
                    {player.height_feet && (
                      <p><span>Height:</span> {formatHeight(player.height_feet, player.height_inches)}</p>
                    )}
                    {player.weight_pounds && (
                      <p><span>Weight:</span> {formatWeight(player.weight_pounds)}</p>
                    )}
                    {player.jersey_number && <p><span>Jersey #:</span> {player.jersey_number}</p>}
                  </div>
                  <button 
                    className="view-stats-btn"
                    onClick={() => fetchPlayerStats(player.id)}
                  >
                    View Performance Stats
                  </button>
                </div>
              ))}
              
              {/* Load More button for pagination */}
              {playersToShow.length > 0 && pagination.hasMore && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', margin: '2rem 0' }}>
                  <button 
                    className="view-stats-btn"
                    onClick={loadMorePlayers}
                    disabled={loadingDetails}
                    style={{ width: 'auto', display: 'inline-block' }}
                  >
                    {loadingDetails ? 'Loading...' : 'Load More Players'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Teams Tab */}
          {activeTab === 'teams' && (
            <div className="teams-grid">
              {filteredTeams.length > 0 ? (
                filteredTeams.map(team => (
                  <div key={team.id} className="team-card">
                    <h3>{team.display_name}</h3>
                    <div className="team-info">
                      <p><span>Abbreviation:</span> {team.abbreviation}</p>
                      <p><span>League:</span> {team.league}</p>
                      <p><span>Division:</span> {team.division}</p>
                      <p><span>City:</span> {team.city}</p>
                      {team.stadium && <p><span>Stadium:</span> {team.stadium}</p>}
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

          {/* Games Tab */}
          {activeTab === 'games' && (
            <div className="games-container">
              <h3>MLB Games</h3>
              {games.length === 0 && (
                <div className="placeholder-message">
                  <p>Click to load recent MLB games</p>
                  <button 
                    className="view-stats-btn"
                    onClick={fetchGames}
                  >
                    Load Games
                  </button>
                </div>
              )}
              {games.length > 0 && (
                <div className="games-list">
                  {games.map(game => (
                    <div key={game.id} className="game-card">
                      <div className="game-header">
                        <span>{new Date(game.date).toLocaleDateString()}</span>
                        {game.status && <span className="game-status">{game.status}</span>}
                      </div>
                      <div className="game-teams">
                        <div className="team home">
                          <span className="team-name">{game.home_team.display_name}</span>
                          <span className="team-score">{game.home_team_score}</span>
                        </div>
                        <div className="vs">vs</div>
                        <div className="team visitor">
                          <span className="team-name">{game.visitor_team.display_name}</span>
                          <span className="team-score">{game.visitor_team_score}</span>
                        </div>
                      </div>
                      <button 
                        className="view-stats-btn"
                        onClick={() => handleGameClick(game)}
                      >
                        Game Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Standings Tab */}
          {activeTab === 'standings' && (
            <div className="standings-container">
              <h3>MLB Team Standings</h3>
              {standings.length === 0 && (
                <div className="placeholder-message">
                  <p>Click to load MLB team standings</p>
                  <button 
                    className="view-stats-btn"
                    onClick={fetchStandings}
                  >
                    Load Standings
                  </button>
                </div>
              )}
              {standings.length > 0 && (
                <div className="standings-tables">
                  {/* American League */}
                  <div className="conference-standings">
                    <h4>American League</h4>
                    
                    {/* AL East */}
                    <h5 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: '#002D72' }}>AL East</h5>
                    <table className="standings-table">
                      <thead>
                        <tr>
                          <th>Team</th>
                          <th>W</th>
                          <th>L</th>
                          <th>PCT</th>
                          <th>GB</th>
                          <th>STRK</th>
                          <th>L10</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings
                          .filter(team => team.team.division === 'East' && team.team.league === 'American')
                          .sort((a, b) => {
                            // First sort by win percentage (descending)
                            const winPctDiff = b.win_percentage - a.win_percentage;
                            if (winPctDiff !== 0) return winPctDiff;
                            
                            // If win percentage is equal, sort by most wins
                            return b.wins - a.wins;
                          })
                          .map((standing, index) => (
                            <tr key={standing.team.id}>
                              <td>{standing.team.display_name}</td>
                              <td>{standing.wins}</td>
                              <td>{standing.losses}</td>
                              <td>{standing.win_percentage.toFixed(3).replace(/^0+/, '')}</td>
                              <td>{standing.games_behind || '-'}</td>
                              <td>{standing.streak || '-'}</td>
                              <td>{standing.last_ten || '-'}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                    
                    {/* AL Central */}
                    <h5 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: '#002D72' }}>AL Central</h5>
                    <table className="standings-table">
                      <thead>
                        <tr>
                          <th>Team</th>
                          <th>W</th>
                          <th>L</th>
                          <th>PCT</th>
                          <th>GB</th>
                          <th>STRK</th>
                          <th>L10</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings
                          .filter(team => team.team.division === 'Central' && team.team.league === 'American')
                          .sort((a, b) => {
                            const winPctDiff = b.win_percentage - a.win_percentage;
                            if (winPctDiff !== 0) return winPctDiff;
                            return b.wins - a.wins;
                          })
                          .map((standing, index) => (
                            <tr key={standing.team.id}>
                              <td>{standing.team.display_name}</td>
                              <td>{standing.wins}</td>
                              <td>{standing.losses}</td>
                              <td>{standing.win_percentage.toFixed(3).replace(/^0+/, '')}</td>
                              <td>{standing.games_behind || '-'}</td>
                              <td>{standing.streak || '-'}</td>
                              <td>{standing.last_ten || '-'}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                    
                    {/* AL West */}
                    <h5 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: '#002D72' }}>AL West</h5>
                    <table className="standings-table">
                      <thead>
                        <tr>
                          <th>Team</th>
                          <th>W</th>
                          <th>L</th>
                          <th>PCT</th>
                          <th>GB</th>
                          <th>STRK</th>
                          <th>L10</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings
                          .filter(team => team.team.division === 'West' && team.team.league === 'American')
                          .sort((a, b) => {
                            const winPctDiff = b.win_percentage - a.win_percentage;
                            if (winPctDiff !== 0) return winPctDiff;
                            return b.wins - a.wins;
                          })
                          .map((standing, index) => (
                            <tr key={standing.team.id}>
                              <td>{standing.team.display_name}</td>
                              <td>{standing.wins}</td>
                              <td>{standing.losses}</td>
                              <td>{standing.win_percentage.toFixed(3).replace(/^0+/, '')}</td>
                              <td>{standing.games_behind || '-'}</td>
                              <td>{standing.streak || '-'}</td>
                              <td>{standing.last_ten || '-'}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                  
                  {/* National League */}
                  <div className="conference-standings">
                    <h4>National League</h4>
                    
                    {/* NL East */}
                    <h5 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: '#002D72' }}>NL East</h5>
                    <table className="standings-table">
                      <thead>
                        <tr>
                          <th>Team</th>
                          <th>W</th>
                          <th>L</th>
                          <th>PCT</th>
                          <th>GB</th>
                          <th>STRK</th>
                          <th>L10</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings
                          .filter(team => team.team.division === 'East' && team.team.league === 'National')
                          .sort((a, b) => {
                            const winPctDiff = b.win_percentage - a.win_percentage;
                            if (winPctDiff !== 0) return winPctDiff;
                            return b.wins - a.wins;
                          })
                          .map((standing, index) => (
                            <tr key={standing.team.id}>
                              <td>{standing.team.display_name}</td>
                              <td>{standing.wins}</td>
                              <td>{standing.losses}</td>
                              <td>{standing.win_percentage.toFixed(3).replace(/^0+/, '')}</td>
                              <td>{standing.games_behind || '-'}</td>
                              <td>{standing.streak || '-'}</td>
                              <td>{standing.last_ten || '-'}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                    
                    {/* NL Central */}
                    <h5 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: '#002D72' }}>NL Central</h5>
                    <table className="standings-table">
                      <thead>
                        <tr>
                          <th>Team</th>
                          <th>W</th>
                          <th>L</th>
                          <th>PCT</th>
                          <th>GB</th>
                          <th>STRK</th>
                          <th>L10</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings
                          .filter(team => team.team.division === 'Central' && team.team.league === 'National')
                          .sort((a, b) => {
                            const winPctDiff = b.win_percentage - a.win_percentage;
                            if (winPctDiff !== 0) return winPctDiff;
                            return b.wins - a.wins;
                          })
                          .map((standing, index) => (
                            <tr key={standing.team.id}>
                              <td>{standing.team.display_name}</td>
                              <td>{standing.wins}</td>
                              <td>{standing.losses}</td>
                              <td>{standing.win_percentage.toFixed(3).replace(/^0+/, '')}</td>
                              <td>{standing.games_behind || '-'}</td>
                              <td>{standing.streak || '-'}</td>
                              <td>{standing.last_ten || '-'}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                    
                    {/* NL West */}
                    <h5 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: '#002D72' }}>NL West</h5>
                    <table className="standings-table">
                      <thead>
                        <tr>
                          <th>Team</th>
                          <th>W</th>
                          <th>L</th>
                          <th>PCT</th>
                          <th>GB</th>
                          <th>STRK</th>
                          <th>L10</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings
                          .filter(team => team.team.division === 'West' && team.team.league === 'National')
                          .sort((a, b) => {
                            const winPctDiff = b.win_percentage - a.win_percentage;
                            if (winPctDiff !== 0) return winPctDiff;
                            return b.wins - a.wins;
                          })
                          .map((standing, index) => (
                            <tr key={standing.team.id}>
                              <td>{standing.team.display_name}</td>
                              <td>{standing.wins}</td>
                              <td>{standing.losses}</td>
                              <td>{standing.win_percentage.toFixed(3).replace(/^0+/, '')}</td>
                              <td>{standing.games_behind || '-'}</td>
                              <td>{standing.streak || '-'}</td>
                              <td>{standing.last_ten || '-'}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Injuries Tab */}
          {activeTab === 'injuries' && (
            <div className="injuries-container">
              <h3>MLB Player Injuries</h3>
              {injuries.length === 0 && (
                <div className="placeholder-message">
                  <p>Click to load MLB player injuries</p>
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
                    <div key={injury.id} className="injury-card">
                      <h4>{injury.player.first_name} {injury.player.last_name}</h4>
                      <p><span>Team:</span> {injury.team.display_name}</p>
                      <p><span>Status:</span> <span className="injury-status">{injury.status}</span></p>
                      <p><span>Description:</span> {injury.description || 'No details available'}</p>
                      {injury.updated_at && (
                        <p><span>Updated:</span> {new Date(injury.updated_at).toLocaleDateString()}</p>
                      )}
                      {injury.expected_return && (
                        <p><span>Expected Return:</span> {injury.expected_return}</p>
                      )}
                      {injury.player.id && (
                        <button 
                          className="view-stats-btn"
                          onClick={() => fetchPlayerStats(injury.player.id)}
                        >
                          Player Stats
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Game Details Modal */}
      {selectedGame && (
        <GameDetails 
          game={selectedGame}
          onClose={handleCloseGameDetails}
          boxScore={boxScore}
        />
      )}
    </div>
  )
}

export default MLBPage