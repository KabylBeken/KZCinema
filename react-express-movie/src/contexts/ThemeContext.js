import React, { createContext, useContext, useState, useEffect } from 'react';

// Определение тем
export const themes = {
  light: {
    name: 'light',
    background: '#f0f2f5',
    foreground: '#333',
    primary: '#3a86ff',
    secondary: '#6c5ce7',
    success: '#2ecc71',
    danger: '#e74c3c',
    warning: '#f39c12',
    card: {
      background: '#ffffff',
      shadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
    },
    navbar: {
      background: '#212529',
      text: '#ffffff'
    },
    footer: {
      background: '#f8f9fa',
      text: '#6c757d'
    }
  },
  dark: {
    name: 'dark',
    background: '#18191a',
    foreground: '#e4e6eb',
    primary: '#58a6ff',
    secondary: '#a29bfe',
    success: '#4ade80',
    danger: '#f87171',
    warning: '#facc15',
    card: {
      background: '#242526',
      shadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
    },
    navbar: {
      background: '#121212',
      text: '#e4e6eb'
    },
    footer: {
      background: '#242526',
      text: '#b0b3b8'
    }
  }
};

// Создаем контекст темы
const ThemeContext = createContext();

// Хук для использования темы в компонентах
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Проверяем сохраненную тему в localStorage или используем системные настройки
    const getInitialTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme) {
            return savedTheme;
        }
        
        // Проверяем предпочтения системы
        const prefersDark = window.matchMedia && 
                            window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        return prefersDark ? 'dark' : 'light';
    };
    
    const [theme, setTheme] = useState(getInitialTheme);
    
    // Функция для переключения темы
    const toggleTheme = () => {
        setTheme(prevTheme => {
            const newTheme = prevTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            return newTheme;
        });
    };
    
    // Применяем класс темы к body при изменении темы
    useEffect(() => {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${theme}-theme`);
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    // Предоставляем значения контекста
    const value = {
        theme,
        isDarkTheme: theme === 'dark',
        toggleTheme
    };
    
    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext; 