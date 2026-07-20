import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type AppColors } from '@/lib/colors';

export type ThemePreference = 'light' | 'dark' | 'auto';

type ThemeContextType = {
  colors: AppColors;
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  colors: darkColors,
  preference: 'auto',
  setPreference: () => {},
  isDark: true,
});

const THEME_KEY = 'chiafit_theme_preference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('auto');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((val) => {
      if (val === 'light' || val === 'dark' || val === 'auto') {
        setPreferenceState(val);
      }
    });
  }, []);

  const setPreference = async (pref: ThemePreference) => {
    setPreferenceState(pref);
    await AsyncStorage.setItem(THEME_KEY, pref);
  };

  const isDark = preference === 'auto'
    ? systemScheme === 'dark'
    : preference === 'dark';

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, preference, setPreference, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
