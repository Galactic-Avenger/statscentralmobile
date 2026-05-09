import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Capacitor: configure native iOS chrome (status bar) on app boot.
// Wrapped in async + try so the web version (no Capacitor runtime) keeps working.
async function configureNativeShell() {
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (!Capacitor.isNativePlatform()) return;

    const { StatusBar, Style } = await import('@capacitor/status-bar');
    // Light content = white text/icons 
    await StatusBar.setStyle({ style: Style.Light });
    // Match our background color so there's no seam between status bar and app
    await StatusBar.setBackgroundColor({ color: '#0a0e16' });
  } catch (err) {
    // Web build (or plugin not installed) — ignore, app still works
    console.debug('Native shell config skipped:', err.message);
  }
}

configureNativeShell();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
