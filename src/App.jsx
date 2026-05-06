// In your App.jsx file
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import NBAPage from './pages/NBAPage'
import NFLPage from './pages/NFLPage'
import { MLBPage, EPLPage } from './pages/SportPages' // Import the Coming Soon pages
import Navbar from './components/Navbar'
import './App.css'

function App() {
  try {
    return (
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <div className="content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/nba" element={<NBAPage />} />
              <Route path="/nfl" element={<NFLPage />} />
              <Route path="/mlb" element={<MLBPage />} /> {/* Use the Coming Soon version */}
              <Route path="/epl" element={<EPLPage />} /> {/* Use the Coming Soon version */}
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    )
  } catch (error) {
    console.error("App rendering error:", error);
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial' }}>
        <h1>Something went wrong</h1>
        <p>There was an error loading the application. Please check the console for details.</p>
      </div>
    );
  }
}

export default App