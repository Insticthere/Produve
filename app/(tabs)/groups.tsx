import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, SafeAreaView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PageScroll from '@/components/ui/PageScroll';
import { useAppTheme } from '@/lib/theme';

const LEADERBOARD = [
  { id: '1', name: 'Nitin', focusMins: 210, streak: 8 },
  { id: '2', name: 'Aisha', focusMins: 195, streak: 11 },
  { id: '3', name: 'Rohan', focusMins: 176, streak: 6 },
];

const CHALLENGES = [
  { id: 'c1', title: 'No-Distraction Sprint', members: 5, reward: '50 XP', desc: '45-minute no-tab-switch challenge.' },
  { id: 'c2', title: '100 Questions Run', members: 7, reward: 'Badge', desc: 'Solve 100 mixed questions as a group.' },
];

export default function GroupsScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [inviteHandle, setInviteHandle] = useState('');
  const [roomCode, setRoomCode] = useState('NIGHT-OPS-07');
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 360, useNativeDriver: true }).start();
  }, [fade]);

  const selectedChallenge = CHALLENGES.find((c) => c.id === selectedChallengeId) ?? null;

  return (
    <SafeAreaView style={{ flex: 1, minHeight: 0, backgroundColor: palette.background }}>
      <Animated.View style={{ opacity: fade, flex: 1, minHeight: 0 }}>
        <PageScroll>
          <View className="mb-8">
            <Text className="font-mono text-[10px] uppercase tracking-[1.2px]" style={{ color: palette.primary }}>Produve</Text>
            <Text className="mt-1 font-display text-[46px] leading-[48px]" style={{ color: palette.textPrimary }}>Groups</Text>
            <Text className="mt-2 font-body text-[14px]" style={{ color: palette.textSecondary }}>
              Compete live in focus sessions with your study crew.
            </Text>
          </View>

          <View className="mb-8 rounded-[18px] p-5" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
            <Text className="font-mono text-[10px] uppercase tracking-[1.2px]" style={{ color: palette.textSecondary }}>Live Group Timer</Text>
            <Text className="mt-2 font-display text-[52px] leading-[56px]" style={{ color: palette.textPrimary }}>24:15</Text>
            <Text className="mt-1 font-body text-[13px]" style={{ color: palette.textSecondary }}>Room: {roomCode} | 6 active members</Text>
            <View className="mt-4 flex-row gap-2">
              <Pressable onPress={() => router.push('/timer')} className="rounded-full px-4 py-2.5" style={{ backgroundColor: palette.primary }}>
                <Text className="font-body text-[13px]" style={{ color: palette.dark ? '#001b32' : '#ffffff' }}>Open Timer</Text>
              </Pressable>
              <Pressable onPress={() => setShowInviteModal(true)} className="rounded-full px-4 py-2.5" style={{ borderWidth: 1, borderColor: palette.borderStrong }}>
                <Text className="font-body text-[13px]" style={{ color: palette.textPrimary }}>Invite</Text>
              </Pressable>
            </View>
          </View>

          <View className="mb-8 rounded-[18px] p-5" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
            <Text className="font-mono text-[10px] uppercase tracking-[1.2px]" style={{ color: palette.textSecondary }}>Today Leaderboard</Text>
            <View className="mt-4 gap-3">
              {LEADERBOARD.map((p, idx) => (
                <View key={p.id} className="flex-row items-center justify-between rounded-[14px] px-3 py-3" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surfaceAlt }}>
                  <View className="flex-row items-center gap-3">
                    <View className="h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: idx === 0 ? palette.primarySoft : palette.surface }}>
                      <Text className="font-mono text-[11px]" style={{ color: palette.textPrimary }}>{idx + 1}</Text>
                    </View>
                    <View>
                      <Text className="font-body text-[14px]" style={{ color: palette.textPrimary }}>{p.name}</Text>
                      <Text className="font-mono text-[10px]" style={{ color: palette.textTertiary }}>{p.streak} day streak</Text>
                    </View>
                  </View>
                  <Text className="font-section text-[16px]" style={{ color: palette.primary }}>{p.focusMins}m</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="rounded-[18px] p-5" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
            <Text className="font-mono text-[10px] uppercase tracking-[1.2px]" style={{ color: palette.textSecondary }}>Challenges</Text>
            <View className="mt-4 gap-3">
              {CHALLENGES.map((c) => (
                <Pressable key={c.id} onPress={() => { setSelectedChallengeId(c.id); setShowChallengeModal(true); }} className="rounded-[14px] p-3" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surfaceAlt }}>
                  <View className="flex-row items-center justify-between">
                    <Text className="font-body text-[14px]" style={{ color: palette.textPrimary }}>{c.title}</Text>
                    <Ionicons name="trophy-outline" size={14} color={palette.primary} />
                  </View>
                  <Text className="mt-1 font-mono text-[10px]" style={{ color: palette.textTertiary }}>
                    {c.members} members | Reward: {c.reward}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </PageScroll>
      </Animated.View>

      <Modal visible={showInviteModal} transparent animationType="fade" onRequestClose={() => setShowInviteModal(false)}>
        <View className="flex-1 items-center justify-center p-5" style={{ backgroundColor: palette.overlay }}>
          <Pressable className="absolute inset-0" onPress={() => setShowInviteModal(false)} />
          <View className="w-full max-w-[500px] rounded-[20px] p-5" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.modalBackground }}>
            <Text className="font-mono text-[10px] uppercase" style={{ color: palette.primary }}>Invite Member</Text>
            <TextInput value={inviteHandle} onChangeText={setInviteHandle} placeholder="@username" placeholderTextColor={palette.textTertiary} className="mt-3 rounded-full border px-4 py-2.5" style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }} />
            <TextInput value={roomCode} onChangeText={setRoomCode} placeholder="Room code" placeholderTextColor={palette.textTertiary} className="mt-2 rounded-full border px-4 py-2.5" style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }} />
            <Pressable onPress={() => setShowInviteModal(false)} className="mt-4 self-start rounded-full px-4 py-2.5" style={{ backgroundColor: palette.primary }}>
              <Text className="font-body text-[12px]" style={{ color: palette.dark ? '#001b32' : '#ffffff' }}>Send Invite</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showChallengeModal} transparent animationType="fade" onRequestClose={() => setShowChallengeModal(false)}>
        <View className="flex-1 items-center justify-center p-5" style={{ backgroundColor: palette.overlay }}>
          <Pressable className="absolute inset-0" onPress={() => setShowChallengeModal(false)} />
          {selectedChallenge ? (
            <View className="w-full max-w-[500px] rounded-[20px] p-5" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.modalBackground }}>
              <Text className="font-mono text-[10px] uppercase" style={{ color: palette.primary }}>Challenge</Text>
              <Text className="mt-1 font-section text-[24px]" style={{ color: palette.textPrimary }}>{selectedChallenge.title}</Text>
              <Text className="mt-2 font-body text-[13px]" style={{ color: palette.textSecondary }}>{selectedChallenge.desc}</Text>
              <Text className="mt-2 font-mono text-[10px]" style={{ color: palette.textTertiary }}>
                Members: {selectedChallenge.members} | Reward: {selectedChallenge.reward}
              </Text>
              <View className="mt-4 flex-row gap-2">
                <Pressable onPress={() => setShowChallengeModal(false)} className="rounded-full px-4 py-2.5" style={{ backgroundColor: palette.primary }}>
                  <Text className="font-body text-[12px]" style={{ color: palette.dark ? '#001b32' : '#ffffff' }}>Join Challenge</Text>
                </Pressable>
                <Pressable onPress={() => setShowChallengeModal(false)} className="rounded-full px-4 py-2.5" style={{ borderWidth: 1, borderColor: palette.borderStrong }}>
                  <Text className="font-body text-[12px]" style={{ color: palette.textPrimary }}>Maybe Later</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
