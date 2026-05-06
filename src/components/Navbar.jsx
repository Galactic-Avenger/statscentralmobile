import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path
  }

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">Stats Central</span>
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          <div className={menuOpen ? 'hamburger open' : 'hamburger'}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <ul className={menuOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link 
              to="/" 
              className={isActive('/') ? 'nav-link active' : 'nav-link'}
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/nba" 
              className={isActive('/nba') ? 'nav-link active' : 'nav-link'}
              onClick={() => setMenuOpen(false)}
            >
              NBA
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/nfl" 
              className={isActive('/nfl') ? 'nav-link active' : 'nav-link'}
              onClick={() => setMenuOpen(false)}
            >
              NFL
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/mlb" 
              className={isActive('/mlb') ? 'nav-link active' : 'nav-link'}
              onClick={() => setMenuOpen(false)}
            >
              MLB
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/epl" 
              className={isActive('/epl') ? 'nav-link active' : 'nav-link'}
              onClick={() => setMenuOpen(false)}
            >
              EPL
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar