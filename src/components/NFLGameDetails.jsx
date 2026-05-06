import React from 'react';
import './GameDetails.css';

const GameDetails = ({ game, onClose, boxScore = [] }) => {
  if (!game) return null;

  // Group player stats by team 
  const homeTeamStats = boxScore.filter(stat => stat.team?.id === game.home_team.id);
  const visitorTeamStats = boxScore.filter(stat => stat.team?.id === game.visitor_team.id);

  // Format date properly
  const gameDate = new Date(game.date);
  const formattedDate = gameDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Determine game status
  const isCompleted = game.status === 'Final' || game.status === 'Completed';
  const statusDisplay = isCompleted ? 'Final' : game.status || 'Scheduled';

  return (
    <div className="game-details-overlay">
      <div className="game-details-container">
        <div className="game-details-header">
          <h2>Game Details</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="game-info">
          <div className="game-date">
            {formattedDate}
            <span className="game-status">{statusDisplay}</span>
          </div>
          
          <div className="game-teams-score">
            <div className="team home">
              <div className="team-name">{game.home_team.full_name}</div>
              <div className="team-score">{game.home_team_score || 0}</div>
            </div>
            <div className="score-divider">-</div>
            <div className="team visitor">
              <div className="team-name">{game.visitor_team.full_name}</div>
              <div className="team-score">{game.visitor_team_score || 0}</div>
            </div>
          </div>
          
          {game.venue && (
            <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
              <span style={{ fontWeight: 'bold' }}>Venue:</span> {game.venue}
            </div>
          )}
          
          {game.week && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
              <span style={{ fontWeight: 'bold' }}>Week:</span> {game.week}
            </div>
          )}
        </div>
        
        {boxScore.length === 0 ? (
          <div className="no-data" style={{ padding: '3rem', textAlign: 'center' }}>
            <p>No detailed statistics available for this game.</p>
            <p>Game Summary:</p>
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <p><strong>{game.home_team.full_name}:</strong> {game.home_team_score || 0} points</p>
              <p><strong>{game.visitor_team.full_name}:</strong> {game.visitor_team_score || 0} points</p>
              <p><strong>Result:</strong> {game.home_team_score > game.visitor_team_score 
                ? `${game.home_team.full_name} win` 
                : game.visitor_team_score > game.home_team_score
                  ? `${game.visitor_team.full_name} win`
                  : 'Tie'}</p>
            </div>
          </div>
        ) : (
          <div className="box-score-container">
            <h3 style={{ color: '#013369', marginBottom: '1.5rem', textAlign: 'center' }}>Game Statistics</h3>
            
            {/* Visitor Team Box Score */}
            <div className="team-box-score">
              <h3>{game.visitor_team.full_name}</h3>
              <div className="box-score-table-wrapper">
                <table className="box-score-table">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Position</th>
                      <th>Passing Yds</th>
                      <th>Pass TD</th>
                      <th>INT</th>
                      <th>Rush Yds</th>
                      <th>Rush TD</th>
                      <th>Rec</th>
                      <th>Rec Yds</th>
                      <th>Rec TD</th>
                      <th>Tackles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitorTeamStats.length > 0 ? (
                      visitorTeamStats.map(stat => (
                        <tr key={stat.id || `${stat.player.id}-${Math.random()}`}>
                          <td className="player-name">{stat.player.first_name} {stat.player.last_name}</td>
                          <td>{stat.player.position_abbreviation || 'N/A'}</td>
                          <td>{stat.passing_yards || '0'}</td>
                          <td>{stat.passing_touchdowns || '0'}</td>
                          <td>{stat.passing_interceptions || '0'}</td>
                          <td>{stat.rushing_yards || '0'}</td>
                          <td>{stat.rushing_touchdowns || '0'}</td>
                          <td>{stat.receptions || '0'}</td>
                          <td>{stat.receiving_yards || '0'}</td>
                          <td>{stat.receiving_touchdowns || '0'}</td>
                          <td>{(stat.total_tackles || 0) + (stat.solo_tackles || 0)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="11" className="no-data">No detailed statistics available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Home Team Box Score */}
            <div className="team-box-score">
              <h3>{game.home_team.full_name}</h3>
              <div className="box-score-table-wrapper">
                <table className="box-score-table">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Position</th>
                      <th>Passing Yds</th>
                      <th>Pass TD</th>
                      <th>INT</th>
                      <th>Rush Yds</th>
                      <th>Rush TD</th>
                      <th>Rec</th>
                      <th>Rec Yds</th>
                      <th>Rec TD</th>
                      <th>Tackles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {homeTeamStats.length > 0 ? (
                      homeTeamStats.map(stat => (
                        <tr key={stat.id || `${stat.player.id}-${Math.random()}`}>
                          <td className="player-name">{stat.player.first_name} {stat.player.last_name}</td>
                          <td>{stat.player.position_abbreviation || 'N/A'}</td>
                          <td>{stat.passing_yards || '0'}</td>
                          <td>{stat.passing_touchdowns || '0'}</td>
                          <td>{stat.passing_interceptions || '0'}</td>
                          <td>{stat.rushing_yards || '0'}</td>
                          <td>{stat.rushing_touchdowns || '0'}</td>
                          <td>{stat.receptions || '0'}</td>
                          <td>{stat.receiving_yards || '0'}</td>
                          <td>{stat.receiving_touchdowns || '0'}</td>
                          <td>{(stat.total_tackles || 0) + (stat.solo_tackles || 0)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="11" className="no-data">No detailed statistics available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Game Summary */}
            <div style={{ marginTop: '2rem', backgroundColor: '#f8f9fa', padding: '1.5rem', borderRadius: '8px' }}>
              <h3 style={{ color: '#013369', marginBottom: '1rem', textAlign: 'center' }}>Game Summary</h3>
              <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', flexWrap: 'wrap' }}>
                <div style={{ margin: '0 1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>{game.home_team.abbreviation}</h4>
                  <p><strong>Points:</strong> {game.home_team_score || 0}</p>
                  <p><strong>Result:</strong> {game.home_team_score > game.visitor_team_score ? 'WIN' : 
                                                game.home_team_score < game.visitor_team_score ? 'LOSS' : 'TIE'}</p>
                </div>
                <div style={{ margin: '0 1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>{game.visitor_team.abbreviation}</h4>
                  <p><strong>Points:</strong> {game.visitor_team_score || 0}</p>
                  <p><strong>Result:</strong> {game.visitor_team_score > game.home_team_score ? 'WIN' : 
                                               game.visitor_team_score < game.home_team_score ? 'LOSS' : 'TIE'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDetails;