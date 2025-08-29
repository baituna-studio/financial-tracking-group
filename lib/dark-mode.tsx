'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface DarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(
  undefined
);

// Constants for localStorage
const DARK_MODE_KEY = 'financial-app-dark-mode';
const DARK_MODE_PREFERENCE_KEY = 'financial-app-dark-mode-preference';

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    try {
      // Check localStorage for saved preference first
      const savedPreference = localStorage.getItem(DARK_MODE_PREFERENCE_KEY);

      if (savedPreference !== null) {
        // User has explicitly set a preference
        const isDark = savedPreference === 'true';
        setIsDarkMode(isDark);
        console.log('Dark mode loaded from localStorage:', isDark);
      } else {
        // Check system preference if no saved preference
        const systemPrefersDark = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches;
        setIsDarkMode(systemPrefersDark);
        console.log(
          'Dark mode loaded from system preference:',
          systemPrefersDark
        );
      }
    } catch (error) {
      console.error('Error loading dark mode preference:', error);
      // Fallback to system preference
      const systemPrefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      setIsDarkMode(systemPrefersDark);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Apply dark mode to document and save to localStorage
  useEffect(() => {
    if (!isInitialized) return;

    try {
      // Apply dark mode to document
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        // Add data attribute for additional styling
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        // Add data attribute for additional styling
        document.documentElement.setAttribute('data-theme', 'light');
      }

      // Save to localStorage
      localStorage.setItem(DARK_MODE_KEY, isDarkMode.toString());
      localStorage.setItem(DARK_MODE_PREFERENCE_KEY, isDarkMode.toString());

      console.log('Dark mode applied and saved to localStorage:', isDarkMode);
    } catch (error) {
      console.error('Error applying dark mode:', error);
    }
  }, [isDarkMode, isInitialized]);

  // Listen for system preference changes
  useEffect(() => {
    if (!isInitialized) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't set a preference
      const hasUserPreference =
        localStorage.getItem(DARK_MODE_PREFERENCE_KEY) !== null;

      if (!hasUserPreference) {
        setIsDarkMode(e.matches);
        console.log(
          'System preference changed, updating dark mode:',
          e.matches
        );
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isInitialized]);

  const toggleDarkMode = () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);

      // Save user preference
      localStorage.setItem(DARK_MODE_PREFERENCE_KEY, newMode.toString());
      console.log('Dark mode toggled to:', newMode);
    } catch (error) {
      console.error('Error toggling dark mode:', error);
    }
  };

  const setDarkMode = (dark: boolean) => {
    try {
      setIsDarkMode(dark);

      // Save user preference
      localStorage.setItem(DARK_MODE_PREFERENCE_KEY, dark.toString());
      console.log('Dark mode set to:', dark);
    } catch (error) {
      console.error('Error setting dark mode:', error);
    }
  };

  // Don't render until initialized to prevent flash
  if (!isInitialized) {
    return null;
  }

  return (
    <DarkModeContext.Provider
      value={{ isDarkMode, toggleDarkMode, setDarkMode }}
    >
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
}

// Utility functions for external use
export const darkModeUtils = {
  // Get current dark mode state from localStorage
  getDarkModeFromStorage: (): boolean | null => {
    try {
      const saved = localStorage.getItem(DARK_MODE_KEY);
      return saved !== null ? saved === 'true' : null;
    } catch (error) {
      console.error('Error reading dark mode from localStorage:', error);
      return null;
    }
  },

  // Check if user has set a preference
  hasUserPreference: (): boolean => {
    try {
      return localStorage.getItem(DARK_MODE_PREFERENCE_KEY) !== null;
    } catch (error) {
      console.error('Error checking user preference:', error);
      return false;
    }
  },

  // Clear user preference (fallback to system)
  clearUserPreference: (): void => {
    try {
      localStorage.removeItem(DARK_MODE_PREFERENCE_KEY);
      console.log('User preference cleared');
    } catch (error) {
      console.error('Error clearing user preference:', error);
    }
  },

  // Get system preference
  getSystemPreference: (): boolean => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  },
};
