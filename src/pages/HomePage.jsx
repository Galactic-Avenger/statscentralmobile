import React from 'react'
import { Link } from 'react-router-dom'
import './HomePage.css'

/**
 * Home — hero + sport tiles + feature cards.
 *
 * Imagery: free Unsplash sports photography served direct from their CDN.
 * Each sport tile gets a unique background image with a dark gradient overlay
 * so text remains readable. Inline `style` is used for the URLs so we don't
 * have to manage local image assets — keeps the repo lightweight for the demo.
 */

// Per-sport background images. Local first (in /images/), with Unsplash CDN
// as a fallback if the local files aren't available (e.g., during early dev
// before downloading them). For Capacitor/iOS we want the local versions
// so the app works offline.
const heroImg = '/images/hero.jpg';
const sportImg = {
  nba: '/images/nba.jpg',
  nfl: '/images/nfl.jpg',
  mlb: '/images/mlb.jpg',
  epl: '/images/epl.jpg',
};

const SportTile = ({ to, sport, label, sub }) => (
  <Link
    to={to}
    className={`sport-button ${sport}`}
    style={{ backgroundImage: `url(${sportImg[sport]})` }}
  >
    <div className="button-content">
      <h2>{label}</h2>
      <p>{sub}</p>
    </div>
  </Link>
);

const HomePage = () => {
  return (
    <div className="home-container">
      {/* ---- Hero ---- */}
      <section
        className="home-hero"
        style={{ backgroundImage: `url(${heroImg})` }}
      >
        <div className="home-hero-overlay">
          <span className="home-hero-eyebrow">Stats Central</span>
          <h1 className="home-hero-title">Every game.<br/>Every stat.</h1>
          <p className="home-hero-sub">
            Live scores, standings, player stats, injuries, and odds — all in one place.
          </p>
        </div>
      </section>

      {/* ---- Sport tiles ---- */}
      <section className="home-section">
        <h2 className="section-title">Pick your sport</h2>
        <div className="sports-buttons">
          <SportTile to="/nba" sport="nba" label="NBA" sub="Basketball" />
          <SportTile to="/nfl" sport="nfl" label="NFL" sub="Football" />
          <SportTile to="/mlb" sport="mlb" label="MLB" sub="Baseball" />
          <SportTile to="/epl" sport="epl" label="EPL" sub="Soccer" />
        </div>
      </section>

      {/* ---- Feature cards ---- */}
      <section className="features-section">
        <h2 className="section-title">What's inside</h2>
        <div className="features-grid">
          <div className="feature">
            <span className="feature-icon">📊</span>
            <h3>Player Stats</h3>
            <p>Game-by-game numbers for every star — points, yards, sacks, and more.</p>
          </div>
          <div className="feature">
            <span className="feature-icon">🏆</span>
            <h3>Standings</h3>
            <p>Live conference and division standings updated through the season.</p>
          </div>
          <div className="feature">
            <span className="feature-icon">🩹</span>
            <h3>Injuries</h3>
            <p>Latest injury reports so you know who's in and who's out.</p>
          </div>
          <div className="feature">
            <span className="feature-icon">💰</span>
            <h3>Odds</h3>
            <p>Spreads, moneylines, and totals for every upcoming matchup.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
