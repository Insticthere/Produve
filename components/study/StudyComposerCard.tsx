import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { type ResourceAttachmentType } from '@/lib/app-state';
import { useAppTheme } from '@/lib/theme';
import StudyPreview from '@/components/study/StudyPreview';
import StudyMdxEditor from '@/components/study/StudyMdxEditor';

type StudyComposerCardProps = {
  mode: 'guide' | 'thread';
  title: string;
  meta: string;
  body: string;
  attachments: { type: ResourceAttachmentType; name: string; meta: string }[];
  onModeChange: (mode: 'guide' | 'thread') => void;
  onTitleChange: (value: string) => void;
  onMetaChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onAddAttachment: (type: ResourceAttachmentType) => void;
  onSubmit: () => void;
};

export default function StudyComposerCard({
  mode,
  title,
  meta,
  body,
  attachments,
  onModeChange,
  onTitleChange,
  onMetaChange,
  onBodyChange,
  onAddAttachment,
  onSubmit,
}: StudyComposerCardProps) {
  const { palette } = useAppTheme();
  return (
    <View className="mt-4 rounded-[14px] p-3" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
      <View className="mb-2 flex-row gap-2">
        <Pressable onPress={() => onModeChange('guide')} className="rounded-full px-3 py-1.5" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: mode === 'guide' ? palette.primarySoft : 'transparent' }}>
          <Text className="font-mono text-[10px]" style={{ color: mode === 'guide' ? palette.primary : palette.textSecondary }}>Guide</Text>
        </Pressable>
        <Pressable onPress={() => onModeChange('thread')} className="rounded-full px-3 py-1.5" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: mode === 'thread' ? palette.primarySoft : 'transparent' }}>
          <Text className="font-mono text-[10px]" style={{ color: mode === 'thread' ? palette.primary : palette.textSecondary }}>Thread</Text>
        </Pressable>
      </View>

      <Text className="font-mono text-[10px] uppercase" style={{ color: palette.textSecondary }}>
        {mode === 'guide' ? 'Guide Composer' : 'Thread Composer'} (MDX + math text)
      </Text>

      <TextInput
        value={title}
        onChangeText={onTitleChange}
        placeholder={mode === 'guide' ? 'Guide title' : 'Thread title'}
        placeholderTextColor={palette.textTertiary}
        className="mt-2 rounded-full border px-4 py-2"
        style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }}
      />
      <TextInput
        value={meta}
        onChangeText={onMetaChange}
        placeholder={mode === 'guide' ? 'Summary' : 'tags comma separated'}
        placeholderTextColor={palette.textTertiary}
        className="mt-2 rounded-full border px-4 py-2"
        style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }}
      />
      <StudyMdxEditor value={body} onChange={onBodyChange} />
      <View className="mt-2 flex-row gap-2">
        {(['image', 'pdf', 'doc', 'link'] as const).map((type) => (
          <Pressable key={type} onPress={() => onAddAttachment(type)} className="rounded-full border px-3 py-1" style={{ borderColor: palette.border }}>
            <Text className="font-mono text-[10px]" style={{ color: palette.textSecondary }}>+{type}</Text>
          </Pressable>
        ))}
      </View>
      {attachments.length > 0 && (
        <Text className="mt-1 font-mono text-[10px]" style={{ color: palette.textTertiary }}>
          {attachments.length} attachment(s) ready
        </Text>
      )}

      <StudyPreview body={body} />

      <Pressable onPress={onSubmit} className="mt-2 self-start rounded-full px-3 py-1.5" style={{ backgroundColor: palette.primary }}>
        <Text className="font-body text-[12px]" style={{ color: palette.dark ? '#001b32' : '#fff' }}>
          {mode === 'guide' ? 'Publish Guide' : 'Post Thread'}
        </Text>
      </Pressable>
    </View>
  );
}
