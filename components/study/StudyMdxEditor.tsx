import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useAppTheme } from '@/lib/theme';

type StudyMdxEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function StudyMdxEditor(props: StudyMdxEditorProps) {
  const { value, onChange } = props;
  const { palette } = useAppTheme();
  const add = (snippet: string) => onChange(`${value}${value.trim().length ? '\n' : ''}${snippet}`);

  return (
    <View>
      <View className="mt-2 flex-row flex-wrap gap-2">
        {[
          ['H2', '## Heading'],
          ['Bold', '**bold**'],
          ['Italic', '_italic_'],
          ['List', '- item'],
          ['Todo', '- [ ] task'],
          ['Code', '```ts\nconst x = 1;\n```'],
          ['Table', '| A | B |\n| --- | --- |\n| 1 | 2 |'],
          ['Math', '$E = mc^2$'],
          ['Link', '[title](https://example.com)'],
        ].map(([label, snippet]) => (
          <Pressable key={label} onPress={() => add(snippet)} className="rounded-full border px-3 py-1" style={{ borderColor: palette.border }}>
            <Text className="font-mono text-[10px]" style={{ color: palette.textSecondary }}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Write markdown + math..."
        placeholderTextColor={palette.textTertiary}
        multiline
        className="mt-2 rounded-[12px] border px-4 py-2"
        style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary, minHeight: 140, textAlignVertical: 'top' }}
      />
    </View>
  );
}
