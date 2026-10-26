import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';
export type FontScale = 'normal' | 'large' | 'xlarge';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  simpleMode: boolean;
  toggleSimpleMode: () => void;
  fontScale: FontScale;
  setFontScale: (scale: FontScale) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('makkalsaantru_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    // Default to authentic Indian Government White & Navy Blue Portal Theme
    return 'light';
  });

  const [simpleMode, setSimpleModeState] = useState<boolean>(() => {
    return localStorage.getItem('makkalsaantru_simple_mode') === 'true';
  });

  const [fontScale, setFontScaleState] = useState<FontScale>(() => {
    const saved = localStorage.getItem('makkalsaantru_font_scale');
    return (saved === 'normal' || saved === 'large' || saved === 'xlarge') ? saved : 'normal';
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Apply Theme classes
    if (theme === 'dark') {
      root.classList.add('dark-theme');
      body.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
      body.classList.remove('dark-theme');
    }

    // Apply Simple Mode classes
    if (simpleMode) {
      root.classList.add('simple-mode');
      body.classList.add('simple-mode');
    } else {
      root.classList.remove('simple-mode');
      body.classList.remove('simple-mode');
    }

    // Apply Font Scale classes
    root.classList.remove('font-scale-normal', 'font-scale-large', 'font-scale-xlarge');
    root.classList.add(`font-scale-${fontScale}`);

    localStorage.setItem('makkalsaantru_theme', theme);
    localStorage.setItem('makkalsaantru_simple_mode', simpleMode ? 'true' : 'false');
    localStorage.setItem('makkalsaantru_font_scale', fontScale);
  }, [theme, simpleMode, fontScale]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  const toggleSimpleMode = () => {
    setSimpleModeState((prev) => !prev);
  };

  const setFontScale = (scale: FontScale) => {
    setFontScaleState(scale);
  };

  const increaseFontSize = () => {
    setFontScaleState((prev) => {
      if (prev === 'normal') return 'large';
      if (prev === 'large') return 'xlarge';
      return 'xlarge';
    });
  };

  const decreaseFontSize = () => {
    setFontScaleState((prev) => {
      if (prev === 'xlarge') return 'large';
      if (prev === 'large') return 'normal';
      return 'normal';
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        simpleMode,
        toggleSimpleMode,
        fontScale,
        setFontScale,
        increaseFontSize,
        decreaseFontSize,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
