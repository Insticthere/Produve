import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PageScroll from '@/components/ui/PageScroll';
import StudyPreview from '@/components/study/StudyPreview';
import { useAppState } from '@/lib/app-state';
import { useAppTheme } from '@/lib/theme';

const UID = 'u1';

export default function ThreadDetailPage() {
  const { palette } = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { threads, setThreads } = useAppState();
  const [comment, setComment] = useState('');

  const thread = useMemo(() => threads.find((t) => t.id === id), [threads, id]);

  const addComment = () => {
    if (!thread || !comment.trim()) return;
    setThreads((prev) =>
      prev.map((t) =>
        t.id !== thread.id
          ? t
          : {
              ...t,
              comments: t.comments + 1,
              commentItems: [
                ...t.commentItems,
                { id: `tc-${Date.now()}`, userId: UID, text: comment.trim(), createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ') },
              ],
            }
      )
    );
    setComment('');
  };

  if (!thread) {
    return (
      <SafeAreaView className="min-h-0 flex-1" style={{ backgroundColor: palette.background }}>
        <PageScroll>
          <Text className="font-body text-[14px]" style={{ color: palette.textSecondary }}>Thread not found.</Text>
        </PageScroll>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="min-h-0 flex-1" style={{ backgroundColor: palette.background }}>
      <PageScroll>
        <Pressable onPress={() => router.back()} className="self-start rounded-full border px-3 py-1.5" style={{ borderColor: palette.border }}>
          <Text className="font-mono text-[10px]" style={{ color: palette.textSecondary }}>Back</Text>
        </Pressable>
        <Text className="mt-3 font-section text-[28px]" style={{ color: palette.textPrimary }}>{thread.title}</Text>
        <Text className="mt-1 font-mono text-[10px]" style={{ color: palette.textTertiary }}>{thread.exam} • {thread.tags.map((tag) => `#${tag}`).join(' ')}</Text>
        <StudyPreview body={thread.body} />

        <View className="mt-4 rounded-[14px] p-3" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
          <Text className="font-mono text-[10px] uppercase" style={{ color: palette.textSecondary }}>Comments</Text>
          <View className="mt-2 gap-2">
            {thread.commentItems.map((c) => (
              <View key={c.id} className="rounded-[10px] p-2" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surfaceAlt }}>
                <Text className="font-body text-[12px]" style={{ color: palette.textPrimary }}>{c.text}</Text>
                <Text className="mt-1 font-mono text-[10px]" style={{ color: palette.textTertiary }}>{c.userId} • {c.createdAt}</Text>
              </View>
            ))}
          </View>
          <TextInput value={comment} onChangeText={setComment} placeholder="Add comment" placeholderTextColor={palette.textTertiary} className="mt-3 rounded-[12px] border px-3 py-2" style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }} />
          <Pressable onPress={addComment} className="mt-2 self-start rounded-full px-3 py-1.5" style={{ backgroundColor: palette.primary }}>
            <Text className="font-body text-[12px]" style={{ color: palette.dark ? '#001b32' : '#fff' }}>Post Comment</Text>
          </Pressable>
        </View>
      </PageScroll>
    </SafeAreaView>
  );
}
