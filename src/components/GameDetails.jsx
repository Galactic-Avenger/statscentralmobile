import React, { useState, useEffect } from 'react';
import './GameDetails.css';
import { getNbaGameBoxScore } from '../services/api';

const GameDetails = ({ game, onClose }) => {
  const [boxScore, setBoxScore] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!game) return;

    setLoading(true);
    setError(null);

    getNbaGameBoxScore(game.id)
      .then(data => {
        setBoxScore(data.data || []);
      })
      .catch(err => {
        console.error(`Error fetching box score for game ${game.id}:`, err);
        setError('Failed to load game statistics.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [game]);

  if (!game) return null;

  // Group player stats by team
  const homeTeamStats = boxScore.filter(stat => stat.team.id === game.home_team.id);
  const visitorTeamStats = boxScore.filter(stat => stat.team.id === game.visitor_team.id);

  // Helper function to format minutes played
  const formatMinutes = (min) => {
    if (!min) return '0:00';
    // If it's already in mm:ss format, return as is
    if (min.includes(':')) return min;
    
    // If it's a number, convert to mm:ss
    const minutes = Math.floor(parseFloat(min));
    const seconds = Math.round((parseFloat(min) - minutes) * 60);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  return (
    <div className="game-details-overlay">
      <div className="game-details-container">
        <div className="game-details-header">
          <h2>Game Details</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="game-info">
          <div className="game-date">
            {new Date(game.date).toLocaleDateString()} 
            {game.status && <span className="game-status">{game.status}</span>}
          </div>
          
          <div className="game-teams-score">
            <div className="team home">
              <div className="team-name">{game.home_team.full_name}</div>
              <div className="team-score">{game.home_team_score}</div>
            </div>
            <div className="score-divider">-</div>
            <div className="team visitor">
              <div className="team-name">{game.visitor_team.full_name}</div>
              <div className="team-score">{game.visitor_team_score}</div>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading game statistics...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
          </div>
        ) : (
          <div className="box-score-container">
            <div className="team-box-score">
              <h3>{game.home_team.full_name}</h3>
              <div className="box-score-table-wrapper">
                <table className="box-score-table">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Min</th>
                      <th>PTS</th>
                      <th>REB</th>
                      <th>AST</th>
                      <th>STL</th>
                      <th>BLK</th>
                      <th>FG</th>
                      <th>3PT</th>
                      <th>FT</th>
                      <th>TO</th>
                      <th>PF</th>
                      <th>+/-</th>
                    </tr>
                  </thead>
                  <tbody>
                    {homeTeamStats.length > 0 ? (
                      homeTeamStats.map(stat => (
                        <tr key={stat.id}>
                          <td className="player-name">{stat.player.first_name.charAt(0)}. {stat.player.last_name}</td>
                          <td>{formatMinutes(stat.min)}</td>
                          <td>{stat.pts || 0}</td>
                          <td>{stat.reb || 0}</td>
                          <td>{stat.ast || 0}</td>
                          <td>{stat.stl || 0}</td>
                          <td>{stat.blk || 0}</td>
                          <td>{`${stat.fgm || 0}-${stat.fga || 0}`}</td>
                          <td>{`${stat.fg3m || 0}-${stat.fg3a || 0}`}</td>
                          <td>{`${stat.ftm || 0}-${stat.fta || 0}`}</td>
                          <td>{stat.turnover || 0}</td>
                          <td>{stat.pf || 0}</td>
                          <td>{stat.plus_minus || 0}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="13" className="no-data">No player statistics available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="team-box-score">
              <h3>{game.visitor_team.full_name}</h3>
              <div className="box-score-table-wrapper">
                <table className="box-score-table">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Min</th>
                      <th>PTS</th>
                      <th>REB</th>
                      <th>AST</th>
                      <th>STL</th>
                      <th>BLK</th>
                      <th>FG</th>
                      <th>3PT</th>
                      <th>FT</th>
                      <th>TO</th>
                      <th>PF</th>
                      <th>+/-</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitorTeamStats.length > 0 ? (
                      visitorTeamStats.map(stat => (
                        <tr key={stat.id}>
                          <td className="player-name">{stat.player.first_name.charAt(0)}. {stat.player.last_name}</td>
                          <td>{formatMinutes(stat.min)}</td>
                          <td>{stat.pts || 0}</td>
                          <td>{stat.reb || 0}</td>
                          <td>{stat.ast || 0}</td>
                          <td>{stat.stl || 0}</td>
                          <td>{stat.blk || 0}</td>
                          <td>{`${stat.fgm || 0}-${stat.fga || 0}`}</td>
                          <td>{`${stat.fg3m || 0}-${stat.fg3a || 0}`}</td>
                          <td>{`${stat.ftm || 0}-${stat.fta || 0}`}</td>
                          <td>{stat.turnover || 0}</td>
                          <td>{stat.pf || 0}</td>
                          <td>{stat.plus_minus || 0}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="13" className="no-data">No player statistics available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDetails;