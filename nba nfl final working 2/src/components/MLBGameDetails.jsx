import React from 'react';
import './GameDetails.css';

const MLBGameDetails = ({ game, onClose, boxScore = [] }) => {
  if (!game) return null;

  // Group player stats by team
  const homeTeamStats = boxScore.filter(stat => stat.team.id === game.home_team.id);
  const visitorTeamStats = boxScore.filter(stat => stat.team.id === game.visitor_team.id);

  // Helper function to format innings pitched
  const formatInnings = (innings) => {
    if (!innings) return '0.0';
    return innings;
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
              <div className="team-name">{game.home_team.display_name}</div>
              <div className="team-score">{game.home_team_score}</div>
            </div>
            <div className="score-divider">-</div>
            <div className="team visitor">
              <div className="team-name">{game.visitor_team.display_name}</div>
              <div className="team-score">{game.visitor_team_score}</div>
            </div>
          </div>
          
          {game.venue && (
            <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
              <span style={{ fontWeight: 'bold' }}>Venue:</span> {game.venue}
            </div>
          )}
        </div>
        
        {boxScore.length === 0 ? (
          <div className="no-data" style={{ padding: '3rem', textAlign: 'center' }}>
            <p>No box score data available for this game.</p>
          </div>
        ) : (
          <div className="box-score-container">
            {/* Batting Statistics Section */}
            <h3 style={{ color: '#002D72', marginBottom: '1rem', textAlign: 'center' }}>Batting Statistics</h3>
            
            <div className="team-box-score">
              <h3>{game.visitor_team.display_name}</h3>
              <div className="box-score-table-wrapper">
                <table className="box-score-table">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>AB</th>
                      <th>R</th>
                      <th>H</th>
                      <th>RBI</th>
                      <th>2B</th>
                      <th>3B</th>
                      <th>HR</th>
                      <th>BB</th>
                      <th>SO</th>
                      <th>AVG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitorTeamStats.length > 0 ? (
                      visitorTeamStats.filter(stat => stat.is_pitcher === false).map(stat => (
                        <tr key={stat.id}>
                          <td className="player-name">{stat.player.first_name.charAt(0)}. {stat.player.last_name}</td>
                          <td>{stat.ab || 0}</td>
                          <td>{stat.r || 0}</td>
                          <td>{stat.h || 0}</td>
                          <td>{stat.rbi || 0}</td>
                          <td>{stat.doubles || 0}</td>
                          <td>{stat.triples || 0}</td>
                          <td>{stat.hr || 0}</td>
                          <td>{stat.bb || 0}</td>
                          <td>{stat.k || 0}</td>
                          <td>{stat.avg || '.000'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="11" className="no-data">No batting statistics available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="team-box-score">
              <h3>{game.home_team.display_name}</h3>
              <div className="box-score-table-wrapper">
                <table className="box-score-table">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>AB</th>
                      <th>R</th>
                      <th>H</th>
                      <th>RBI</th>
                      <th>2B</th>
                      <th>3B</th>
                      <th>HR</th>
                      <th>BB</th>
                      <th>SO</th>
                      <th>AVG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {homeTeamStats.length > 0 ? (
                      homeTeamStats.filter(stat => stat.is_pitcher === false).map(stat => (
                        <tr key={stat.id}>
                          <td className="player-name">{stat.player.first_name.charAt(0)}. {stat.player.last_name}</td>
                          <td>{stat.ab || 0}</td>
                          <td>{stat.r || 0}</td>
                          <td>{stat.h || 0}</td>
                          <td>{stat.rbi || 0}</td>
                          <td>{stat.doubles || 0}</td>
                          <td>{stat.triples || 0}</td>
                          <td>{stat.hr || 0}</td>
                          <td>{stat.bb || 0}</td>
                          <td>{stat.k || 0}</td>
                          <td>{stat.avg || '.000'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="11" className="no-data">No batting statistics available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Pitching Statistics Section */}
            <h3 style={{ color: '#002D72', marginTop: '2rem', marginBottom: '1rem', textAlign: 'center' }}>Pitching Statistics</h3>
            
            <div className="team-box-score">
              <h3>{game.visitor_team.display_name} Pitchers</h3>
              <div className="box-score-table-wrapper">
                <table className="box-score-table">
                  <thead>
                    <tr>
                      <th>Pitcher</th>
                      <th>IP</th>
                      <th>H</th>
                      <th>R</th>
                      <th>ER</th>
                      <th>BB</th>
                      <th>K</th>
                      <th>HR</th>
                      <th>ERA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitorTeamStats.length > 0 ? (
                      visitorTeamStats.filter(stat => stat.is_pitcher === true).map(stat => (
                        <tr key={stat.id}>
                          <td className="player-name">{stat.player.first_name.charAt(0)}. {stat.player.last_name}</td>
                          <td>{formatInnings(stat.ip) || '0.0'}</td>
                          <td>{stat.h_allowed || 0}</td>
                          <td>{stat.r_allowed || 0}</td>
                          <td>{stat.er || 0}</td>
                          <td>{stat.bb_allowed || 0}</td>
                          <td>{stat.k_pitched || 0}</td>
                          <td>{stat.hr_allowed || 0}</td>
                          <td>{stat.era || '0.00'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="no-data">No pitching statistics available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="team-box-score">
              <h3>{game.home_team.display_name} Pitchers</h3>
              <div className="box-score-table-wrapper">
                <table className="box-score-table">
                  <thead>
                    <tr>
                      <th>Pitcher</th>
                      <th>IP</th>
                      <th>H</th>
                      <th>R</th>
                      <th>ER</th>
                      <th>BB</th>
                      <th>K</th>
                      <th>HR</th>
                      <th>ERA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {homeTeamStats.length > 0 ? (
                      homeTeamStats.filter(stat => stat.is_pitcher === true).map(stat => (
                        <tr key={stat.id}>
                          <td className="player-name">{stat.player.first_name.charAt(0)}. {stat.player.last_name}</td>
                          <td>{formatInnings(stat.ip) || '0.0'}</td>
                          <td>{stat.h_allowed || 0}</td>
                          <td>{stat.r_allowed || 0}</td>
                          <td>{stat.er || 0}</td>
                          <td>{stat.bb_allowed || 0}</td>
                          <td>{stat.k_pitched || 0}</td>
                          <td>{stat.hr_allowed || 0}</td>
                          <td>{stat.era || '0.00'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="no-data">No pitching statistics available</td>
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

export default MLBGameDetails;