import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';

// Global CSS
import './styles.css';
import './home.css';
import './product.css';
import './pickups.css';
import './shop.css';
import './listing.css';
import './cart.css';
import './admin.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
