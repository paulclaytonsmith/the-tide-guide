import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'

// Add viewport height calculation
const setRealVh = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

// Set the value on initial load
setRealVh();

// Update the height on resize and orientation change
window.addEventListener('resize', setRealVh);
window.addEventListener('orientationchange', setRealVh);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
