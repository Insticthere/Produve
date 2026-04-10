import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DefaultTheme, DarkTheme, type Theme as NavigationTheme } from '@react-navigation/native';
import { Platform } from 'react-native';

const THEME_STORAGE_KEY = 'produve:theme:v1';
const VALID_THEME_IDS: AppThemeId[] = ['current', 'midnight', 'arctic', 'emerald', 'sunset', 'custom'];

export type AppThemeId = 'current' | 'midnight' | 'arctic' | 'emerald' | 'sunset' | 'custom';

export type AppPalette = {
  id: AppThemeId;
  label: string;
  dark: boolean;
  primary: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderStrong: string;
  danger: string;
  success: string;
  primarySoft: string;
  overlay: string;
  modalBackground: string;
};

const BASE_CUSTOM_THEME: AppPalette = {
  id: 'custom',
  label: 'Custom',
  dark: true,
  primary: '#6fb7ff',
  background: '#101418',
  surface: 'rgba(22,28,35,0.86)',
  surfaceAlt: 'rgba(32,40,50,0.9)',
  textPrimary: '#f0f6ff',
  textSecondary: '#a9b6c6',
  textTertiary: '#7f8da0',
  border: 'rgba(162,186,212,0.2)',
  borderStrong: 'rgba(162,186,212,0.32)',
  danger: '#ff7b76',
  success: '#4de0a9',
  primarySoft: 'rgba(111,183,255,0.18)',
  overlay: 'rgba(8,12,18,0.68)',
  modalBackground: 'rgba(25,33,42,0.92)',
};

const THEMES: Record<Exclude<AppThemeId, 'custom'>, AppPalette> = {
  current: {
    id: 'current',
    label: 'Current Blue',
    dark: true,
    primary: '#70b1ff',
    background: '#0e0e0e',
    surface: 'rgba(19,19,19,0.78)',
    surfaceAlt: 'rgba(25,25,25,0.84)',
    textPrimary: '#f0f0f0',
    textSecondary: '#a1a4a5',
    textTertiary: '#6f767a',
    border: 'rgba(214,235,253,0.19)',
    borderStrong: 'rgba(214,235,253,0.28)',
    danger: '#ff716c',
    success: '#01fc97',
    primarySoft: 'rgba(78,164,255,0.18)',
    overlay: 'rgba(0,0,0,0.72)',
    modalBackground: 'rgba(19,19,19,0.88)',
  },
  midnight: {
    id: 'midnight',
    label: 'Midnight Black',
    dark: true,
    primary: '#9ac8ff',
    background: '#050505',
    surface: 'rgba(10,10,10,0.88)',
    surfaceAlt: 'rgba(16,16,16,0.9)',
    textPrimary: '#f7f8f8',
    textSecondary: '#b0b5b8',
    textTertiary: '#72787d',
    border: 'rgba(189,209,226,0.16)',
    borderStrong: 'rgba(189,209,226,0.3)',
    danger: '#ff7b76',
    success: '#52f3b2',
    primarySoft: 'rgba(154,200,255,0.16)',
    overlay: 'rgba(0,0,0,0.8)',
    modalBackground: 'rgba(9,9,9,0.92)',
  },
  arctic: {
    id: 'arctic',
    label: 'Arctic White',
    dark: false,
    primary: '#0b6cff',
    background: '#f4f7fb',
    surface: 'rgba(255,255,255,0.9)',
    surfaceAlt: 'rgba(248,251,255,0.96)',
    textPrimary: '#0d1520',
    textSecondary: '#3f5468',
    textTertiary: '#708295',
    border: 'rgba(11,54,103,0.16)',
    borderStrong: 'rgba(11,54,103,0.26)',
    danger: '#d64545',
    success: '#0f9a68',
    primarySoft: 'rgba(11,108,255,0.12)',
    overlay: 'rgba(19,29,40,0.45)',
    modalBackground: 'rgba(253,254,255,0.96)',
  },
  emerald: {
    id: 'emerald',
    label: 'Emerald Nebula',
    dark: true,
    primary: '#2ce6b6',
    background: '#06110f',
    surface: 'rgba(11,24,21,0.86)',
    surfaceAlt: 'rgba(14,31,27,0.9)',
    textPrimary: '#ecfffa',
    textSecondary: '#9dbfb5',
    textTertiary: '#67867e',
    border: 'rgba(173,240,220,0.18)',
    borderStrong: 'rgba(173,240,220,0.3)',
    danger: '#ff7f87',
    success: '#5ef2c8',
    primarySoft: 'rgba(44,230,182,0.18)',
    overlay: 'rgba(2,15,12,0.72)',
    modalBackground: 'rgba(10,24,21,0.9)',
  },
  sunset: {
    id: 'sunset',
    label: 'Sunset Glass',
    dark: true,
    primary: '#ffad5e',
    background: '#140c0a',
    surface: 'rgba(29,18,14,0.84)',
    surfaceAlt: 'rgba(37,23,18,0.9)',
    textPrimary: '#fff4ec',
    textSecondary: '#d0b9a9',
    textTertiary: '#9f8575',
    border: 'rgba(255,206,170,0.2)',
    borderStrong: 'rgba(255,206,170,0.32)',
    danger: '#ff7e76',
    success: '#7ee4bf',
    primarySoft: 'rgba(255,173,94,0.18)',
    overlay: 'rgba(10,5,4,0.72)',
    modalBackground: 'rgba(34,20,15,0.9)',
  },
};

type ThemeStoragePayload = {
  themeId: AppThemeId;
  customPalette: AppPalette;
};

function readStoredTheme(): ThemeStoragePayload | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ThemeStoragePayload>;
    if (!parsed || typeof parsed.themeId !== 'string') return null;
    const themeId = VALID_THEME_IDS.includes(parsed.themeId as AppThemeId) ? (parsed.themeId as AppThemeId) : 'current';
    const safeCustom = typeof parsed.customPalette === 'object' && parsed.customPalette ? parsed.customPalette : BASE_CUSTOM_THEME;
    return {
      themeId,
      customPalette: { ...BASE_CUSTOM_THEME, ...safeCustom, id: 'custom', label: 'Custom' },
    };
  } catch {
    return null;
  }
}

function persistTheme(payload: ThemeStoragePayload) {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // no-op for quota/private mode issues
  }
}

type ThemeContextValue = {
  themeId: AppThemeId;
  setThemeId: (value: AppThemeId) => void;
  palette: AppPalette;
  allThemes: AppPalette[];
  navigationTheme: NavigationTheme;
  customPalette: AppPalette;
  updateCustomPalette: (patch: Partial<Omit<AppPalette, 'id' | 'label'>>) => void;
  resetCustomPalette: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const stored = useMemo(() => readStoredTheme(), []);
  const [themeId, setThemeId] = useState<AppThemeId>(stored?.themeId ?? 'current');
  const [customPalette, setCustomPalette] = useState<AppPalette>(stored?.customPalette ?? BASE_CUSTOM_THEME);

  const palette = themeId === 'custom' ? customPalette : THEMES[themeId as Exclude<AppThemeId, 'custom'>];

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-produve-theme', themeId);
  }, [themeId]);

  useEffect(() => {
    persistTheme({ themeId, customPalette });
  }, [themeId, customPalette]);

  const navigationTheme = useMemo<NavigationTheme>(() => {
    const base = palette.dark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      dark: palette.dark,
      colors: {
        ...base.colors,
        primary: palette.primary,
        background: palette.background,
        card: palette.surfaceAlt,
        text: palette.textPrimary,
        border: palette.border,
        notification: palette.danger,
      },
    };
  }, [palette]);

  const allThemes = useMemo(() => [...Object.values(THEMES), customPalette], [customPalette]);

  const updateCustomPalette = (patch: Partial<Omit<AppPalette, 'id' | 'label'>>) => {
    setCustomPalette((prev) => ({
      ...prev,
      ...patch,
      id: 'custom',
      label: 'Custom',
    }));
    setThemeId('custom');
  };

  const resetCustomPalette = () => {
    setCustomPalette(BASE_CUSTOM_THEME);
    setThemeId('custom');
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeId,
      setThemeId,
      palette,
      allThemes,
      navigationTheme,
      customPalette,
      updateCustomPalette,
      resetCustomPalette,
    }),
    [themeId, palette, allThemes, navigationTheme, customPalette]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used inside AppThemeProvider');
  }
  return ctx;
}
