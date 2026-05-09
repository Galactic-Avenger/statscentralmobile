import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import NBAPage from './pages/NBAPage'
import NFLPage from './pages/NFLPage'
import { MLBPage, EPLPage } from './pages/SportPages'
import BottomNav from './components/BottomNav'
import './App.css'

/**
 * Slim, sticky brand bar at the top of every screen.
 * No menu — primary navigation lives in the BottomNav now.
 */
const TopBar = () => (
  <header className="top-bar">
    <span className="top-bar-brand">Stats Central</span>
  </header>
)

function App() {
  try {
    return (
      <BrowserRouter>
        <div className="app">
          <TopBar />
          <main className="content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/nba" element={<NBAPage />} />
              <Route path="/nfl" element={<NFLPage />} />
              <Route path="/mlb" element={<MLBPage />} />
              <Route path="/epl" element={<EPLPage />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </BrowserRouter>
    )
  } catch (error) {
    console.error("App rendering error:", error);
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>Something went wrong</h1>
        <p>There was an error loading the application. Please check the console for details.</p>
      </div>
    );
  }
}

export default App
