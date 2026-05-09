import React, { useState, useEffect, useRef } from 'react'
import './NBAPage.css'
import GameDetails from '../components/GameDetails'
import BettingOdds from '../components/BettingOdds'
import {
  getNbaTeams,
  getNbaStandings,
  getNbaGames,
  getNbaTeamRoster,
  searchNbaPlayers,
  getNbaPlayerStats,
  getNbaInjuries,
  getNbaLeaders,
  getNbaBettingOdds
} from '../services/api'

function NBAPage() {
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

  const [standings, setStandings] = useState([])
  const [gameStats, setGameStats] = useState([])
  const [games, setGames] = useState([])
  const [injuries, setInjuries] = useState([])
  const [leaders, setLeaders] = useState([])
  const [bettingOdds, setBettingOdds] = useState([])
  const [selectedGame, setSelectedGame] = useState(null)

  // Ref to hold the search debounce timer so we cancel earlier
  // pending searches when the user keeps typing.
  const searchDebounceRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const teamsData = await getNbaTeams()
        setTeams(teamsData.data || [])
        setPlayers([])
      } catch (err) {
        console.error("Error fetching initial data:", err)
        setError(err.message || 'Failed to load data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  function fetchStandings() {
    setLoadingDetails(true)
    getNbaStandings(2024)
      .then(data => setStandings(data.data || []))
      .catch(err => console.error('Failed to load standings:', err))
      .finally(() => setLoadingDetails(false))
  }

  function fetchBettingOdds() {
    setLoadingDetails(true)
    getNbaBettingOdds()
      .then(data => setBettingOdds(data.data || []))
      .catch(err => console.error('Failed to load betting odds:', err))
      .finally(() => setLoadingDetails(false))
  }

  function fetchPlayerStats(playerId) {
    setLoadingDetails(true)
    getNbaPlayerStats(playerId)
      .then(data => {
        if (data.data && data.data.length > 0) {
          setPlayerStats(data.data[0])
          const player = players.find(p => p.id === playerId)
          if (player) {
            setSelectedPlayer(player)
          } else {
            // Player isn't in the current visible list (e.g. came from injuries/leaders)
            // Use a minimal placeholder so the stats screen still renders.
            setSelectedPlayer({ id: playerId, first_name: '', last_name: '' })
          }
        }
      })
      .catch(err => console.error('Failed to load player stats:', err))
      .finally(() => setLoadingDetails(false))
  }

  function fetchInjuries() {
    setLoadingDetails(true)
    getNbaInjuries()
      .then(data => setInjuries(data.data || []))
      .catch(err => console.error('Failed to load injuries:', err))
      .finally(() => setLoadingDetails(false))
  }

  function fetchLeaders() {
    setLoadingDetails(true)
    getNbaLeaders()
      .then(data => setLeaders(data.data || []))
      .catch(err => console.error('Failed to load leaders:', err))
      .finally(() => setLoadingDetails(false))
  }

  function fetchGames() {
    setLoadingDetails(true)
    getNbaGames()
      .then(data => setGames(data.data || []))
      .catch(err => console.error('Failed to load games:', err))
      .finally(() => setLoadingDetails(false))
  }

  function fetchTeamRoster(teamId) {
    setLoadingDetails(true)
    getNbaTeamRoster(teamId)
      .then(data => {
        setTeamRoster(data.data || [])
        setPlayers(data.data || [])
        setSelectedTeam(teams.find(team => team.id === teamId))
        setActiveTab('players')
      })
      .catch(err => console.error('Failed to load team roster:', err))
      .finally(() => setLoadingDetails(false))
  }

  // Handler for when a game is clicked to view game details
  const handleGameClick = (game) => {
    setSelectedGame(game);
  }

  // Handler to close the game details modal
  const handleCloseGameDetails = () => {
    setSelectedGame(null);
  }

  function handleSearchChange(e) {
    const value = e.target.value
    setSearchTerm(value)

    // Reset selections whenever the search term changes
    setSelectedPlayer(null)
    setPlayerStats(null)
    setSelectedTeam(null)
    setTeamRoster([])

    // Cancel any in-flight pending search
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }

    if (value.length >= 3) {
      // Wait 300ms after the user stops typing before searching.
      // This is the fix for the 429 (Too Many Requests) errors that
      // happened when every keystroke fired a new request.
      searchDebounceRef.current = setTimeout(() => {
        searchPlayers(value)
      }, 300)
    } else if (value.length === 0) {
      setPlayers([])
    }
  }

  function searchPlayers(query) {
    setLoadingDetails(true)
    searchNbaPlayers(query)
      .then(data => setPlayers(data.data || []))
      .catch(err => console.error('Error searching players:', err))
      .finally(() => setLoadingDetails(false))
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

  // Format games behind value for display
  const formatGamesBehind = (gamesBehind) => {
    if (gamesBehind === null || gamesBehind === undefined) return '0.0';
    return Number(gamesBehind).toFixed(1);
  }

  return (
    <div className="nba-container">
      <div className="nba-header">
        <h1>NBA Statistics</h1>
        <p>Explore comprehensive NBA player and team statistics</p>
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
            <div className="stat-item">
              <span className="stat-label">PPG</span>
              <span className="stat-value">{playerStats.pts || '0.0'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">RPG</span>
              <span className="stat-value">{playerStats.reb || '0.0'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">APG</span>
              <span className="stat-value">{playerStats.ast || '0.0'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">FG%</span>
              <span className="stat-value">{(playerStats.fg_pct * 100).toFixed(1) || '0.0'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">3P%</span>
              <span className="stat-value">{(playerStats.fg3_pct * 100).toFixed(1) || '0.0'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">FT%</span>
              <span className="stat-value">{(playerStats.ft_pct * 100).toFixed(1) || '0.0'}</span>
            </div>
          </div>
          <div className="advanced-stats">
            <h3>Advanced Stats</h3>
            <table className="stats-table">
              <thead>
                <tr>
                  <th>GP</th>
                  <th>MPG</th>
                  <th>STL</th>
                  <th>BLK</th>
                  <th>TO</th>
                  <th>PF</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{playerStats.games_played || '0'}</td>
                  <td>{playerStats.min || '0.0'}</td>
                  <td>{playerStats.stl || '0.0'}</td>
                  <td>{playerStats.blk || '0.0'}</td>
                  <td>{playerStats.turnover || '0.0'}</td>
                  <td>{playerStats.pf || '0.0'}</td>
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
            onClick={() => setActiveTab('games')}
          >
            Games
          </button>
          <button 
            className={activeTab === 'standings' ? 'tab-button active' : 'tab-button'}
            onClick={() => {
              setActiveTab('standings')
              fetchStandings()
            }}
          >
            Standings
          </button>
          <button 
            className={activeTab === 'injuries' ? 'tab-button active' : 'tab-button'}
            onClick={() => {
              setActiveTab('injuries')
              fetchInjuries()
            }}
          >
            Injuries
          </button>
          <button 
            className={activeTab === 'leaders' ? 'tab-button active' : 'tab-button'}
            onClick={() => {
              setActiveTab('leaders')
              fetchLeaders()
            }}
          >
            Leaders
          </button>
          {/* NEW: Betting Odds Tab */}
          <button 
            className={activeTab === 'odds' ? 'tab-button active' : 'tab-button'}
            onClick={() => {
              setActiveTab('odds')
              fetchBettingOdds()
            }}
          >
            Betting Odds
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
                      
                      {/* Height - multiple possible formats */}
                      <p><span>Height:</span> {
                        player.height ? 
                          player.height : 
                          (player.height_feet ? 
                            `${player.height_feet}'${player.height_inches || 0}"` : 
                            'N/A')
                      }</p>
                      
                      {/* Weight - multiple possible formats */}
                      <p><span>Weight:</span> {
                        player.weight ? 
                          `${player.weight} lbs` : 
                          (player.weight_pounds ? 
                            `${player.weight_pounds} lbs` : 
                            'N/A')
                      }</p>
                      
                      {player.jersey_number && <p><span>Jersey #:</span> {player.jersey_number}</p>}
                      {player.college && <p><span>College:</span> {player.college}</p>}
                      {player.country && <p><span>Country:</span> {player.country}</p>}
                      {player.draft_year && (
                        <p>
                          <span>Draft:</span> {player.draft_year}, 
                          {player.draft_round ? ` Round ${player.draft_round},` : ''} 
                          {player.draft_number ? ` Pick ${player.draft_number}` : ''}
                        </p>
                      )}
                    </div>
                    <button 
                      className="view-stats-btn"
                      onClick={() => fetchPlayerStats(player.id)}
                      style={{
                        backgroundColor: "var(--color-nba)",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "0.6rem 1rem",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        width: "100%",
                        marginTop: "0.5rem"
                      }}
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
                  <h3>NBA Players Search</h3>
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
                      <p><span>City:</span> {team.city}</p>
                    </div>
                    <button 
                      className="view-roster-btn"
                      onClick={() => fetchTeamRoster(team.id)}
                      style={{
                        backgroundColor: "var(--color-nba)",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "0.6rem 1rem",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        width: "100%",
                        marginTop: "0.5rem"
                      }}
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
              <h3>NBA Games</h3>
              {games.length === 0 && (
                <div className="placeholder-message">
                  <p>Click to load recent NBA games</p>
                  <button 
                    className="view-stats-btn"
                    onClick={fetchGames}
                    style={{
                      backgroundColor: "var(--color-nba)",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "0.6rem 1rem",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      marginTop: "0.5rem"
                    }}
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
                          <span className="team-name">{game.home_team.full_name}</span>
                          <span className="team-score">{game.home_team_score}</span>
                        </div>
                        <div className="vs">vs</div>
                        <div className="team visitor">
                          <span className="team-name">{game.visitor_team.full_name}</span>
                          <span className="team-score">{game.visitor_team_score}</span>
                        </div>
                      </div>
                      <button 
                        className="view-stats-btn"
                        onClick={() => handleGameClick(game)}
                        style={{
                          backgroundColor: "var(--color-nba)",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          padding: "0.6rem 1rem",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          width: "100%",
                          marginTop: "0.5rem"
                        }}
                      >
                        Game Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'standings' && (
  <div className="standings-container">
    <h3>NBA Team Standings</h3>
    {standings.length === 0 && (
      <div className="placeholder-message">
        <p>Click to load NBA team standings</p>
        <button 
          className="view-stats-btn"
          onClick={fetchStandings}
        >
          Load Standings
        </button>
      </div>
    )}
    {standings.length > 0 && (
      <div className="standings-tables" style={{ display: 'flex', flexDirection: 'column', maxWidth: '1100px', margin: '0 auto', gap: '30px' }}>
        {/* Make both tables have the same structure and column count */}
        <div className="conference-standings">
          <h4 style={{ textAlign: 'center', marginBottom: '15px', color: 'var(--color-nba)', fontSize: '1.3rem' }}>Eastern Conference</h4>
          <table className="standings-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ backgroundColor: 'var(--color-nba)', color: 'white', padding: '10px', width: '60px', textAlign: 'center' }}>Rank</th>
                <th style={{ backgroundColor: 'var(--color-nba)', color: 'white', padding: '10px', width: '220px', textAlign: 'left' }}>Team</th>
                <th style={{ backgroundColor: 'var(--color-nba)', color: 'white', padding: '10px', width: '60px', textAlign: 'center' }}>W</th>
                <th style={{ backgroundColor: 'var(--color-nba)', color: 'white', padding: '10px', width: '60px', textAlign: 'center' }}>L</th>
                <th style={{ backgroundColor: 'var(--color-nba)', color: 'white', padding: '10px', width: '80px', textAlign: 'center' }}>Win%</th>
                <th style={{ backgroundColor: 'var(--color-nba)', color: 'white', padding: '10px', width: '60px', textAlign: 'center' }}>GB</th>
              </tr>
            </thead>
            <tbody>
              {standings
                .filter(team => team.team.conference === 'East')
                .sort((a, b) => b.win_percentage - a.win_percentage)
                .map((standing, index) => (
                  <tr key={standing.team.id} style={{ backgroundColor: index % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-elevated)' }}>
                    <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid var(--color-border)' }}>{index + 1}</td>
                    <td style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid var(--color-border)', fontWeight: '500' }}>{standing.team.full_name}</td>
                    <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid var(--color-border)' }}>{standing.wins}</td>
                    <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid var(--color-border)' }}>{standing.losses}</td>
                    <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid var(--color-border)' }}>
                      {((standing.wins / (standing.wins + standing.losses)) * 100).toFixed(1)}%
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid var(--color-border)' }}>{formatGamesBehind(standing.games_behind)}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
                
        <div className="conference-standings">
          <h4 style={{ textAlign: 'center', marginBottom: '15px', color: 'var(--color-nba)', fontSize: '1.3rem' }}>Western Conference</h4>
          <table className="standings-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ backgroundColor: 'var(--color-nba)', color: 'white', padding: '10px', width: '60px', textAlign: 'center' }}>Rank</th>
                <th style={{ backgroundColor: 'var(--color-nba)', color: 'white', padding: '10px', width: '220px', textAlign: 'left' }}>Team</th>
                <th style={{ backgroundColor: 'var(--color-nba)', color: 'white', padding: '10px', width: '60px', textAlign: 'center' }}>W</th>
                <th style={{ backgroundColor: 'var(--color-nba)', color: 'white', padding: '10px', width: '60px', textAlign: 'center' }}>L</th>
                <th style={{ backgroundColor: 'var(--color-nba)', color: 'white', padding: '10px', width: '80px', textAlign: 'center' }}>Win%</th>
                <th style={{ backgroundColor: 'var(--color-nba)', color: 'white', padding: '10px', width: '60px', textAlign: 'center' }}>GB</th>
              </tr>
            </thead>
            <tbody>
              {standings
                .filter(team => team.team.conference === 'West')
                .sort((a, b) => b.win_percentage - a.win_percentage)
                .map((standing, index) => (
                  <tr key={standing.team.id} style={{ backgroundColor: index % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-elevated)' }}>
                    <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid var(--color-border)' }}>{index + 1}</td>
                    <td style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid var(--color-border)', fontWeight: '500' }}>{standing.team.full_name}</td>
                    <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid var(--color-border)' }}>{standing.wins}</td>
                    <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid var(--color-border)' }}>{standing.losses}</td>
                    <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid var(--color-border)' }}>
                      {((standing.wins / (standing.wins + standing.losses)) * 100).toFixed(1)}%
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid var(--color-border)' }}>{formatGamesBehind(standing.games_behind)}</td>
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

          {activeTab === 'injuries' && (
            <div className="injuries-container">
              <h3>NBA Player Injuries</h3>
              {injuries.length === 0 && (
                <div className="placeholder-message">
                  <p>Click to load NBA player injuries</p>
                  <button 
                    className="view-stats-btn"
                    onClick={fetchInjuries}
                    style={{
                      backgroundColor: "var(--color-nba)",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "0.6rem 1rem",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      marginTop: "0.5rem"
                    }}
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
                      <p><span>Team:</span> {injury.team.full_name}</p>
                      <p><span>Status:</span> <span className="injury-status">{injury.status}</span></p>
                      <p><span>Description:</span> {injury.description || 'No details available'}</p>
                      <p><span>Date:</span> {new Date(injury.date).toLocaleDateString()}</p>
                      {injury.player.id && (
                        <button 
                          className="view-stats-btn"
                          onClick={() => injury.player.id && fetchPlayerStats(injury.player.id)}
                          style={{
                            backgroundColor: "var(--color-nba)",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            padding: "0.5rem 1rem",
                            marginTop: "10px",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            width: "100%"
                          }}
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

          {activeTab === 'leaders' && (
  <div className="leaders-container">
    <h3>NBA Statistical Leaders</h3>
    {leaders.length === 0 && (
      <div className="placeholder-message">
        <p>Click to load NBA statistical leaders</p>
        <button 
          className="view-stats-btn"
          onClick={fetchLeaders}
          style={{
            backgroundColor: "var(--color-nba)",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "0.6rem 1rem",
            cursor: "pointer",
            fontSize: "0.9rem",
            marginTop: "0.5rem"
          }}
        >
          Load Leaders
        </button>
      </div>
    )}
    {leaders.length > 0 && (
      <div className="leaders-section">
        <h4 style={{ 
          color: 'var(--color-text)', 
          marginBottom: '1.5rem', 
          textAlign: 'center',
          fontSize: '1.2rem',
          marginTop: '2rem'
        }}>Points Per Game Leaders</h4>
        <div className="leaders-list" style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem" 
        }}>
          {leaders.map((leader, index) => (
            <div key={`leader-${index}`} className="leader-card" style={{
              display: "flex",
              backgroundColor: 'var(--color-surface)',
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
              padding: "1.5rem",
              position: "relative",
              overflow: "hidden",
              alignItems: "center",
              height: "auto",
              minHeight: "180px",
              marginBottom: "15px"
            }}>
              <div className="leader-rank" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                backgroundColor: "var(--color-nba)",
                color: "white",
                borderRadius: "50%",
                fontWeight: "bold",
                marginRight: "1rem",
                fontSize: "1.2rem"
              }}>{index + 1}</div>
              <div className="leader-info" style={{ flex: 1 }}>
                <h4 style={{ 
                  fontSize: "1.2rem", 
                  marginBottom: "0.5rem",
                  color: "#333"
                }}>{leader.player.first_name} {leader.player.last_name}</h4>
                <p style={{ marginBottom: "0.3rem" }}><span style={{ fontWeight: "bold" }}>Team:</span> {leader.team.full_name}</p>
                <p style={{ marginBottom: "0.8rem" }}><span style={{ fontWeight: "bold" }}>PPG:</span> <strong>{leader.value}</strong></p>
                <button 
                  className="view-stats-btn"
                  onClick={() => leader.player.id && fetchPlayerStats(leader.player.id)}
                  style={{
                    backgroundColor: "var(--color-nba)",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    width: "100%",
                    display: "block",
                    marginTop: "auto"
                  }}
                >
                  Full Stats
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}

          {/* Betting Odds Section */}
          {activeTab === 'odds' && (
            <BettingOdds 
              bettingOdds={bettingOdds} 
              loading={loadingDetails} 
              fetchBettingOdds={fetchBettingOdds} 
            />
          )}
        </div>
      )}

      {/* Render GameDetails component when a game is selected */}
      {selectedGame && (
        <GameDetails 
          game={selectedGame}
          onClose={handleCloseGameDetails}
        />
      )}
    </div>
  )
}

export default NBAPage