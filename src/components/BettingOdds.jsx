import React from 'react';
import './BettingOdds.css';

const BettingOdds = ({ bettingOdds, loading, fetchBettingOdds }) => {
  // Helper function to format odds (American odds format)
  const formatOdds = (odds) => {
    if (!odds) return 'N/A';
    return odds > 0 ? `+${odds}` : odds;
  };

  return (
    <div className="betting-odds-container">
      <h3>NBA Betting Odds</h3>
      {bettingOdds.length === 0 && (
        <div className="placeholder-message">
          <p>Click to load NBA betting odds for upcoming games</p>
          <button 
            className="view-stats-btn"
            onClick={fetchBettingOdds}
            style={{
              backgroundColor: "#17408B",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "0.6rem 1rem",
              cursor: "pointer",
              fontSize: "0.9rem",
              marginTop: "0.5rem"
            }}
          >
            Load Betting Odds
          </button>
        </div>
      )}
      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading betting odds...</p>
        </div>
      )}
      {bettingOdds.length > 0 && (
        <div className="odds-grid">
          <div className="odds-header">
            <h4>Upcoming Games Odds</h4>
            <p className="odds-disclaimer">
              <small>*For informational purposes only. Please gamble responsibly.</small>
            </p>
          </div>
          <table className="odds-table">
            <thead>
              <tr>
                <th>Game</th>
                <th>Moneyline</th>
                <th>Spread</th>
                <th>Total</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {bettingOdds
                // Skip any game that has no betting block to prevent crashes
                .filter(game => game && game.betting)
                .map(game => {
                  const b = game.betting;
                  return (
                <tr key={`odds-${game.id}`}>
                  <td className="game-matchup">
                    <div className="matchup-date">{new Date(game.date).toLocaleDateString()}</div>
                    <div className="matchup-teams">
                      <div className="team-row">
                        <span className="team-name">{game.home_team.full_name}</span>
                        <span className="home-badge">H</span>
                      </div>
                      <div className="team-row">
                        <span className="team-name">{game.visitor_team.full_name}</span>
                        <span className="away-badge">A</span>
                      </div>
                    </div>
                  </td>
                  <td className="moneyline-odds">
                    <div className="odds-row">
                      <span className={b.home_odds > 0 ? "positive-odds" : "negative-odds"}>
                        {formatOdds(b.home_odds)}
                      </span>
                    </div>
                    <div className="odds-row">
                      <span className={b.visitor_odds > 0 ? "positive-odds" : "negative-odds"}>
                        {formatOdds(b.visitor_odds)}
                      </span>
                    </div>
                  </td>
                  <td className="spread-odds">
                    <div className="odds-row">
                      <span className="spread-value">
                        {b.spread > 0 ? `+${b.spread}` : b.spread}
                      </span>
                      <span className={b.home_spread_odds > 0 ? "positive-odds" : "negative-odds"}>
                        ({formatOdds(b.home_spread_odds)})
                      </span>
                    </div>
                    <div className="odds-row">
                      <span className="spread-value">
                        {b.spread > 0 ? `-${b.spread}` : `+${Math.abs(b.spread)}`}
                      </span>
                      <span className={b.visitor_spread_odds > 0 ? "positive-odds" : "negative-odds"}>
                        ({formatOdds(b.visitor_spread_odds)})
                      </span>
                    </div>
                  </td>
                  <td className="total-odds">
                    <div className="odds-row">
                      <span className="total-label">O {b.over_under}</span>
                      <span className="odds-value">(-110)</span>
                    </div>
                    <div className="odds-row">
                      <span className="total-label">U {b.over_under}</span>
                      <span className="odds-value">(-110)</span>
                    </div>
                  </td>
                  <td className="odds-update">
                    {b.updated_at ?
                      new Date(b.updated_at).toLocaleString() :
                      'N/A'
                    }
                  </td>
                </tr>
                  );
                })}
            </tbody>
          </table>
          <div className="odds-footer">
            <p>
              <strong>Understanding Betting Odds:</strong>
            </p>
            <ul>
              <li><strong>Moneyline:</strong> Straight up bet on which team will win. +150 means a $100 bet would win $150, -150 means you need to bet $150 to win $100.</li>
              <li><strong>Spread:</strong> The point spread is a handicap given to the underdog. A -5.5 spread means the favorite must win by more than 5.5 points.</li>
              <li><strong>Total (Over/Under):</strong> Bet on whether the combined score will be over or under the listed number.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default BettingOdds;