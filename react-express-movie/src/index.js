import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './contexts/ThemeContext';
import App from './App';
import './index.css';
import './css/theme.css';

const divRoot = document.getElementById('root');
const root = ReactDOM.createRoot(divRoot);

root.render(
  <ThemeProvider>
    <App /> 
  </ThemeProvider>
);
