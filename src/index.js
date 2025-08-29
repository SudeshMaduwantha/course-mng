import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import EnhancedApp from './EnhancedApp';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <EnhancedApp />
  </React.StrictMode>
);