import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('urban_eye_theme');
      if (saved === 'slate') return 'slate';
      return 'white'; // Clean Pure White by default
    } catch {
      return 'white';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    // Always remove deprecated dark class
    root.classList.remove('dark');
    
    if (theme === 'slate') {
      root.classList.remove('theme-white');
      root.classList.add('theme-slate');
      try {
        localStorage.setItem('urban_eye_theme', 'slate');
      } catch {}
    } else {
      root.classList.remove('theme-slate');
      root.classList.add('theme-white');
      try {
        localStorage.setItem('urban_eye_theme', 'white');
      } catch {}
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'white' ? 'slate' : 'white'));
  };

  const isSlateMode = theme === 'slate';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isSlateMode, isDarkMode: false }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
