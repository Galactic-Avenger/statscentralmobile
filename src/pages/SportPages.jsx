import React from 'react'
import './SportPage.css'

// MLB Page Component
export const MLBPage = () => {
  return (
    <div className="sport-page-container mlb">
      <div className="sport-header">
        <h1>MLB Statistics</h1>
        <p>Baseball statistics coming soon</p>
      </div>
      
      <div className="coming-soon">
        <div className="icon">⚾</div>
        <h2>Coming Soon</h2>
        <p>We're working on bringing you comprehensive MLB statistics.</p>
        <p>This section will include player stats, team standings, game results, and more.</p>
        
        <div className="feature-list">
          <h3>Planned Features:</h3>
          <ul>
            <li>Player batting and pitching statistics</li>
            <li>Team rankings and standings</li>
            <li>Game-by-game box scores</li>
            <li>Advanced analytics</li>
            <li>Historical performance data</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// EPL Page Component
export const EPLPage = () => {
  return (
    <div className="sport-page-container epl">
      <div className="sport-header">
        <h1>EPL Statistics</h1>
        <p>Premier League football statistics coming soon</p>
      </div>
      
      <div className="coming-soon">
        <div className="icon">⚽</div>
        <h2>Coming Soon</h2>
        <p>We're working on bringing you comprehensive English Premier League statistics.</p>
        <p>This section will include player stats, team standings, match results, and more.</p>
        
        <div className="feature-list">
          <h3>Planned Features:</h3>
          <ul>
            <li>Player performance metrics</li>
            <li>Team rankings and standings</li>
            <li>Match-by-match statistics</li>
            <li>Advanced analytics</li>
            <li>Historical performance data</li>
          </ul>
        </div>
      </div>
    </div>
  )
}