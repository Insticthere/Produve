import React from 'react';
import { Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useAppTheme } from '@/lib/theme';

type StudyPreviewProps = {
  body: string;
};

export default function StudyPreview({ body }: StudyPreviewProps) {
  const { palette } = useAppTheme();
  const equations = body.match(/\$[^$]+\$/g) ?? [];

  return (
    <View className="mt-2 rounded-[12px] p-3" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface }}>
      <Markdown
        style={{
          body: { color: palette.textSecondary, fontSize: 13 },
          heading1: { color: palette.textPrimary },
          heading2: { color: palette.textPrimary },
          link: { color: palette.primary },
        }}
      >
        {body || 'Preview...'}
      </Markdown>
      {equations.length > 0 && (
        <Text className="font-mono text-[10px]" style={{ color: palette.primary }}>
          {equations.join(' • ')}
        </Text>
      )}
    </View>
  );
}
