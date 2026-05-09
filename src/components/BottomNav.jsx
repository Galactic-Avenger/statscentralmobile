import React from 'react'
import { NavLink } from 'react-router-dom'
import './BottomNav.css'

/**
 * Bottom tab bar is an iOS style navigation.
 * Replaces the old hamburger menu. Five tabs: Home, NBA, NFL, MLB, EPL.
 * Each tab has a sport emoji icon, label, and an active state accent
 * matching the sport's color (NBA orange, NFL green, MLB red, EPL purple).
 */
const TABS = [
  { to: '/',    label: 'Home', icon: '🏠', activeClass: 'is-home' },
  { to: '/nba', label: 'NBA',  icon: '🏀', activeClass: 'is-nba'  },
  { to: '/nfl', label: 'NFL',  icon: '🏈', activeClass: 'is-nfl'  },
  { to: '/mlb', label: 'MLB',  icon: '⚾', activeClass: 'is-mlb'  },
  { to: '/epl', label: 'EPL',  icon: '⚽', activeClass: 'is-epl'  },
]

const BottomNav = () => {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Primary">
      <ul className="bottom-nav-list">
        {TABS.map(tab => (
          <li key={tab.to} className="bottom-nav-item">
            <NavLink
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `bottom-nav-link ${tab.activeClass} ${isActive ? 'is-active' : ''}`
              }
            >
              <span className="bottom-nav-icon" aria-hidden="true">{tab.icon}</span>
              <span className="bottom-nav-label">{tab.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default BottomNav
