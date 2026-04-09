import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, SafeAreaView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PageScroll from '@/components/ui/PageScroll';

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
    <SafeAreaView className="min-h-0 flex-1 bg-[#0e0e0e]">
      <Animated.View style={{ opacity: fade }} className="min-h-0 flex-1">
        <PageScroll>
          <View className="mb-8">
            <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-[#70b1ff]">Produve</Text>
            <Text className="mt-1 font-display text-[46px] leading-[48px] text-void-text-primary">Groups</Text>
            <Text className="mt-2 font-body text-[14px] text-void-text-secondary">
              Compete live in focus sessions with your study crew.
            </Text>
          </View>

          <View className="mb-8 rounded-[18px] bg-[rgba(19,19,19,0.78)] p-5" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.22)' }}>
            <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-void-text-secondary">Live Group Timer</Text>
            <Text className="mt-2 font-display text-[52px] leading-[56px] text-white">24:15</Text>
            <Text className="mt-1 font-body text-[13px] text-void-text-secondary">Room: {roomCode} | 6 active members</Text>
            <View className="mt-4 flex-row gap-2">
              <Pressable onPress={() => router.push('/timer')} className="rounded-full bg-[#4ea4ff] px-4 py-2.5">
                <Text className="font-body text-[13px] text-[#001b32]">Open Timer</Text>
              </Pressable>
              <Pressable onPress={() => setShowInviteModal(true)} className="rounded-full border border-white/20 px-4 py-2.5">
                <Text className="font-body text-[13px] text-white">Invite</Text>
              </Pressable>
            </View>
          </View>

          <View className="mb-8 rounded-[18px] bg-[rgba(19,19,19,0.78)] p-5" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.22)' }}>
            <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-void-text-secondary">Today Leaderboard</Text>
            <View className="mt-4 gap-3">
              {LEADERBOARD.map((p, idx) => (
                <View
                  key={p.id}
                  className="flex-row items-center justify-between rounded-[14px] bg-[rgba(23,26,29,0.72)] px-3 py-3"
                  style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.12)' }}
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className="h-7 w-7 items-center justify-center rounded-full"
                      style={{ backgroundColor: idx === 0 ? 'rgba(78,164,255,0.25)' : 'rgba(214,235,253,0.14)' }}
                    >
                      <Text className="font-mono text-[11px] text-white">{idx + 1}</Text>
                    </View>
                    <View>
                      <Text className="font-body text-[14px] text-white">{p.name}</Text>
                      <Text className="font-mono text-[10px] text-void-text-tertiary">{p.streak} day streak</Text>
                    </View>
                  </View>
                  <Text className="font-section text-[16px] text-[#70b1ff]">{p.focusMins}m</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="rounded-[18px] bg-[rgba(19,19,19,0.78)] p-5" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.22)' }}>
            <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-void-text-secondary">Challenges</Text>
            <View className="mt-4 gap-3">
              {CHALLENGES.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => {
                    setSelectedChallengeId(c.id);
                    setShowChallengeModal(true);
                  }}
                  className="rounded-[14px] bg-[rgba(23,26,29,0.72)] p-3"
                  style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.12)' }}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="font-body text-[14px] text-white">{c.title}</Text>
                    <Ionicons name="trophy-outline" size={14} color="#70b1ff" />
                  </View>
                  <Text className="mt-1 font-mono text-[10px] text-void-text-tertiary">
                    {c.members} members | Reward: {c.reward}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </PageScroll>
      </Animated.View>

      <Modal visible={showInviteModal} transparent animationType="fade" onRequestClose={() => setShowInviteModal(false)}>
        <View className="flex-1 items-center justify-center bg-black/70 p-5">
          <Pressable className="absolute inset-0" onPress={() => setShowInviteModal(false)} />
          <View className="w-full max-w-[500px] rounded-[20px] bg-[rgba(19,19,19,0.78)] p-5" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.22)' }}>
            <Text className="font-mono text-[10px] uppercase text-[#70b1ff]">Invite Member</Text>
            <TextInput
              value={inviteHandle}
              onChangeText={setInviteHandle}
              placeholder="@username"
              placeholderTextColor="#6f767a"
              className="mt-3 rounded-full border border-white/20 bg-[#0f1113] px-4 py-2.5 text-white"
            />
            <TextInput
              value={roomCode}
              onChangeText={setRoomCode}
              placeholder="Room code"
              placeholderTextColor="#6f767a"
              className="mt-2 rounded-full border border-white/20 bg-[#0f1113] px-4 py-2.5 text-white"
            />
            <Pressable onPress={() => setShowInviteModal(false)} className="mt-4 self-start rounded-full bg-[#4ea4ff] px-4 py-2.5">
              <Text className="font-body text-[12px] text-[#001b32]">Send Invite</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showChallengeModal} transparent animationType="fade" onRequestClose={() => setShowChallengeModal(false)}>
        <View className="flex-1 items-center justify-center bg-black/70 p-5">
          <Pressable className="absolute inset-0" onPress={() => setShowChallengeModal(false)} />
          {selectedChallenge ? (
            <View className="w-full max-w-[500px] rounded-[20px] bg-[rgba(19,19,19,0.78)] p-5" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.22)' }}>
              <Text className="font-mono text-[10px] uppercase text-[#70b1ff]">Challenge</Text>
              <Text className="mt-1 font-section text-[24px] text-white">{selectedChallenge.title}</Text>
              <Text className="mt-2 font-body text-[13px] text-void-text-secondary">{selectedChallenge.desc}</Text>
              <Text className="mt-2 font-mono text-[10px] text-void-text-tertiary">
                Members: {selectedChallenge.members} | Reward: {selectedChallenge.reward}
              </Text>
              <View className="mt-4 flex-row gap-2">
                <Pressable onPress={() => setShowChallengeModal(false)} className="rounded-full bg-[#4ea4ff] px-4 py-2.5">
                  <Text className="font-body text-[12px] text-[#001b32]">Join Challenge</Text>
                </Pressable>
                <Pressable onPress={() => setShowChallengeModal(false)} className="rounded-full border border-white/20 px-4 py-2.5">
                  <Text className="font-body text-[12px] text-white">Maybe Later</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}



