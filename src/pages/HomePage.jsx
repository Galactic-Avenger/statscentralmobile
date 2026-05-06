import React from 'react'
import { Link } from 'react-router-dom'
import './HomePage.css'

const HomePage = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Sports Stats Central</h1>
        <p className="intro-text">
          Welcome to the ultimate sports statistics hub, your one-stop destination for comprehensive
          stats across major sports leagues. Explore detailed player stats, team standings, game results,
          and more - all in one place.
        </p>
        
        <div className="sports-buttons">
          <Link to="/nba" className="sport-button nba">
            <div className="button-content">
              <h2>NBA</h2>
              <p>Basketball Stats</p>
            </div>
          </Link>
          
          <Link to="/nfl" className="sport-button nfl">
            <div className="button-content">
              <h2>NFL</h2>
              <p>Football Stats</p>
            </div>
          </Link>
          
          <Link to="/mlb" className="sport-button mlb">
            <div className="button-content">
              <h2>MLB</h2>
              <p>Baseball Stats</p>
            </div>
          </Link>
          
          <Link to="/epl" className="sport-button epl">
            <div className="button-content">
              <h2>EPL</h2>
              <p>Soccer Stats</p>
            </div>
          </Link>
        </div>
        
        <div className="features-section">
          <h2>Premium Features</h2>
          <div className="features-grid">
            <div className="feature">
              <h3>Player Stats</h3>
              <p>Comprehensive statistics for all players</p>
            </div>
            <div className="feature">
              <h3>Team Standings</h3>
              <p>Current and historical league standings</p>
            </div>
            <div className="feature">
              <h3>Game Results</h3>
              <p>Detailed box scores and game summaries</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage