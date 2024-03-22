/**
 * #name react
 * #description react js
 * #icon ./assets/react.svg
 * #version 0.0.0
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const root = document.createElement('div');
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
document.body.appendChild(root);
