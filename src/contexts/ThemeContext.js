"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Crear el contexto
const ThemeContext = createContext(null);

// Temas disponibles
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

export const THEME_LABELS = {
  [THEMES.LIGHT]: 'Claro',
  [THEMES.DARK]: 'Oscuro',
  [THEMES.SYSTEM]: 'Sistema'
};

// Hook para usar el contexto
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe ser usado dentro de ThemeProvider");
  }
  return context;
};

// Provider del contexto
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(THEMES.SYSTEM);
  const [resolvedTheme, setResolvedTheme] = useState(THEMES.LIGHT);

  // Función para detectar preferencia del sistema
  const getSystemTheme = () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? THEMES.DARK 
        : THEMES.LIGHT;
    }
    return THEMES.LIGHT;
  };

  // Función para resolver el tema actual
  const resolveTheme = (currentTheme) => {
    if (currentTheme === THEMES.SYSTEM) {
      return getSystemTheme();
    }
    return currentTheme;
  };

  // Cargar tema desde localStorage al inicializar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
        setTheme(savedTheme);
      }
    }
  }, []);

  // Actualizar el tema resuelto cuando cambie el tema o la preferencia del sistema
  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);

    // Aplicar el tema al documento
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', resolved);
      document.documentElement.className = resolved === THEMES.DARK ? 'dark' : '';
    }

    // Escuchar cambios en la preferencia del sistema si el tema es 'system'
    if (theme === THEMES.SYSTEM) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleSystemThemeChange = (e) => {
        const newResolvedTheme = e.matches ? THEMES.DARK : THEMES.LIGHT;
        setResolvedTheme(newResolvedTheme);
        document.documentElement.setAttribute('data-theme', newResolvedTheme);
        document.documentElement.className = newResolvedTheme === THEMES.DARK ? 'dark' : '';
      };

      mediaQuery.addEventListener('change', handleSystemThemeChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      };
    }
  }, [theme]);

  // Función para cambiar el tema
  const changeTheme = (newTheme) => {
    if (Object.values(THEMES).includes(newTheme)) {
      setTheme(newTheme);
      
      // Guardar en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newTheme);
      }
    }
  };

  // Función para alternar entre claro y oscuro
  const toggleTheme = () => {
    const currentResolved = resolveTheme(theme);
    const newTheme = currentResolved === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    changeTheme(newTheme);
  };

  const value = {
    theme,           // Tema seleccionado por el usuario
    resolvedTheme,   // Tema realmente aplicado
    changeTheme,
    toggleTheme,
    isDark: resolvedTheme === THEMES.DARK,
    isLight: resolvedTheme === THEMES.LIGHT,
    isSystem: theme === THEMES.SYSTEM
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
