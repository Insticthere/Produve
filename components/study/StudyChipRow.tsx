import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useAppTheme } from '@/lib/theme';

type StudyChipRowProps = {
  values: string[];
  selected: string;
  onSelect: (value: string) => void;
  allLabel?: string;
};

export default function StudyChipRow({ values, selected, onSelect, allLabel = 'All' }: StudyChipRowProps) {
  const { palette } = useAppTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row gap-2">
        {values.map((value) => {
          const isActive = value === selected;
          const label = value === 'all' ? allLabel : value;
          return (
            <Pressable
              key={value}
              onPress={() => onSelect(value)}
              className="rounded-full px-3 py-1.5"
              style={{
                borderWidth: 1,
                borderColor: isActive ? `${palette.primary}aa` : palette.border,
                backgroundColor: isActive ? palette.primarySoft : palette.surface,
              }}
            >
              <Text className="font-mono text-[10px] uppercase" style={{ color: isActive ? palette.primary : palette.textSecondary }}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
