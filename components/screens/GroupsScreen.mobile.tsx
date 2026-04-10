import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import PageScroll from '@/components/ui/PageScroll';
import ScreenIntro from '@/components/ui/ScreenIntro';
import { useAppTheme } from '@/lib/theme';
import { useAppState } from '@/lib/app-state';

const CURRENT_USER_ID = 'u1';

export default function GroupsMobileScreen() {
  const { palette } = useAppTheme();
  const { group, setGroup, todos } = useAppState();
  const [tab, setTab] = useState<'chat' | 'polls' | 'goals'>('chat');
  const [messageDraft, setMessageDraft] = useState('');

  const todayGoals = useMemo(() => todos.filter((t) => t.status !== 'completed').slice(0, 6), [todos]);
  const memberById = (id: string) => group.members.find((m) => m.id === id)?.name ?? 'Member';

  const sendMessage = () => {
    if (!messageDraft.trim()) return;
    setGroup((prev) => ({
      ...prev,
      chat: [
        ...prev.chat,
        {
          id: `m-${Date.now()}`,
          userId: CURRENT_USER_ID,
          text: messageDraft.trim(),
          createdAt: new Date().toTimeString().slice(0, 5),
          attachments: [],
        },
      ],
    }));
    setMessageDraft('');
  };

  return (
    <SafeAreaView className="min-h-0 flex-1" style={{ backgroundColor: palette.background }}>
      <PageScroll>
        <ScreenIntro title="Groups" description="Mobile workspace for squad focus and quick updates." compact />

        <View className="mt-4 rounded-[14px] p-3" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
          <Text className="font-mono text-[10px] uppercase" style={{ color: palette.textSecondary }}>Live Group Timer</Text>
          <Text className="mt-1 font-display text-[36px]" style={{ color: palette.textPrimary }}>24:15</Text>
          <Text className="font-body text-[12px]" style={{ color: palette.textSecondary }}>Room {group.roomCode} | {group.members.length} active</Text>
        </View>

        <View className="mt-3 flex-row rounded-full p-1" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface }}>
          {(['chat', 'polls', 'goals'] as const).map((value) => (
            <Pressable key={value} onPress={() => setTab(value)} className="flex-1 items-center rounded-full py-2" style={{ backgroundColor: tab === value ? palette.primarySoft : 'transparent' }}>
              <Text className="font-mono text-[10px] uppercase" style={{ color: tab === value ? palette.primary : palette.textSecondary }}>{value}</Text>
            </Pressable>
          ))}
        </View>

        {tab === 'chat' && (
          <View className="mt-4 rounded-[14px] p-3" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
            <View className="gap-2">
              {group.chat.slice(-12).map((msg) => (
                <View key={msg.id} className="rounded-[10px] p-2" style={{ backgroundColor: palette.surfaceAlt }}>
                  <View className="flex-row items-center justify-between">
                    <Text className="font-body text-[12px]" style={{ color: palette.textPrimary }}>{memberById(msg.userId)}</Text>
                    <Text className="font-mono text-[10px]" style={{ color: palette.textTertiary }}>{msg.createdAt}</Text>
                  </View>
                  <Text className="mt-1 font-body text-[12px]" style={{ color: palette.textSecondary }}>{msg.text}</Text>
                </View>
              ))}
            </View>

            <TextInput value={messageDraft} onChangeText={setMessageDraft} placeholder="Send message..." placeholderTextColor={palette.textTertiary} className="mt-3 rounded-[12px] border px-3 py-2.5" style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }} />
            <Pressable onPress={sendMessage} className="mt-2 self-end rounded-full px-4 py-2" style={{ backgroundColor: palette.primary }}>
              <Text className="font-body text-[12px]" style={{ color: palette.dark ? '#001b32' : '#fff' }}>Send</Text>
            </Pressable>
          </View>
        )}

        {tab === 'polls' && (
          <View className="mt-4 rounded-[14px] p-3" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
            {group.polls.length ? (
              <View className="gap-3">
                {group.polls.map((poll) => (
                  <View key={poll.id} className="rounded-[10px] p-2" style={{ backgroundColor: palette.surfaceAlt }}>
                    <Text className="font-body text-[13px]" style={{ color: palette.textPrimary }}>{poll.question}</Text>
                    <Text className="mt-1 font-mono text-[10px]" style={{ color: palette.textTertiary }}>{poll.mode} | {poll.options.length} options</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="font-body text-[12px]" style={{ color: palette.textTertiary }}>No polls yet.</Text>
            )}
          </View>
        )}

        {tab === 'goals' && (
          <View className="mt-4 rounded-[14px] p-3" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {todayGoals.map((goal) => (
                  <View key={goal.id} className="w-[220px] rounded-[10px] p-2" style={{ backgroundColor: palette.surfaceAlt }}>
                    <Text className="font-body text-[12px]" style={{ color: palette.textPrimary }}>{goal.title}</Text>
                    <Text className="mt-1 font-mono text-[10px]" style={{ color: palette.textTertiary }}>{goal.subject ?? 'General'} | {goal.priority}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </PageScroll>
    </SafeAreaView>
  );
}
