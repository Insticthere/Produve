import React from 'react';
import { Text, View } from 'react-native';
import { useAppTheme } from '@/lib/theme';

export default function AppFooter() {
  const { palette } = useAppTheme();
  const year = new Date().getFullYear();

  return (
    <View
      className="rounded-[14px] px-4 py-2"
      style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface }}
    >
      <Text className="text-center font-mono text-[10px] uppercase tracking-[1.1px]" style={{ color: palette.textTertiary }}>
        Produve | Deep Work OS
      </Text>
      <Text className="mt-1 text-center font-body text-[12px]" style={{ color: palette.textSecondary }}>
        {year} Produve. UI Prototype.
      </Text>
    </View>
  );
}
