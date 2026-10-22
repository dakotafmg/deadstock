import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';

// Global CSS
import './styles/global.css';
import './site/home/home.css';
import './site/models/product.css';
import './site/pickups/pickups.css';
import './site/shop/shop.css';
import './site/shop/listing.css';
import './site/shop/cart.css';
import './admin/admin.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
