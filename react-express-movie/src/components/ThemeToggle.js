import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    
    return (
        <button 
            onClick={toggleTheme}
            className="btn theme-toggle-btn"
            aria-label={theme === 'light' ? 'Включить темную тему' : 'Включить светлую тему'}
            title={theme === 'light' ? 'Включить темную тему' : 'Включить светлую тему'}
        >
            {theme === 'light' ? (
                <i className="fas fa-moon theme-toggle-icon"></i>
            ) : (
                <i className="fas fa-sun theme-toggle-icon"></i>
            )}
        </button>
    );
};

export default ThemeToggle; 