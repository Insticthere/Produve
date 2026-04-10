import React from 'react';
import { Text, View } from 'react-native';
import { useAppTheme } from '@/lib/theme';

type ScreenIntroProps = {
  title: string;
  description: string;
  brand?: string;
  compact?: boolean;
  className?: string;
};

export default function ScreenIntro({
  title,
  description,
  brand = 'Produve',
  compact = false,
  className,
}: ScreenIntroProps) {
  const { palette } = useAppTheme();

  return (
    <View className={className ?? (compact ? 'mb-5' : 'mb-8')}>
      <Text className="font-mono text-[10px] uppercase tracking-[1.2px]" style={{ color: palette.primary }}>
        {brand}
      </Text>
      <Text
        className={compact ? 'mt-1 font-display text-[40px] leading-[42px]' : 'mt-1 font-display text-[46px] leading-[48px]'}
        style={{ color: palette.textPrimary }}
      >
        {title}
      </Text>
      <Text className={compact ? 'mt-1 font-body text-[13px]' : 'mt-2 font-body text-[14px]'} style={{ color: palette.textSecondary }}>
        {description}
      </Text>
    </View>
  );
}

