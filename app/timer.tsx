import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import PageScroll from '@/components/ui/PageScroll';

const MODES = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
} as const;

type Mode = keyof typeof MODES;

const LIVE_LEADERBOARD = [
  { id: '1', name: 'Nitin', focusMins: 42, streak: 8 },
  { id: '2', name: 'Aisha', focusMins: 39, streak: 11 },
  { id: '3', name: 'Rohan', focusMins: 35, streak: 6 },
];

const PREVIOUS_SESSIONS = [
  { id: 's1', date: 'Today', mode: 'Focus', duration: '25m', subject: 'Physics' },
  { id: 's2', date: 'Today', mode: 'Short Break', duration: '5m', subject: 'Recovery' },
  { id: 's3', date: 'Yesterday', mode: 'Focus', duration: '50m', subject: 'Math' },
  { id: 's4', date: 'Yesterday', mode: 'Long Break', duration: '15m', subject: 'Recovery' },
];

export default function TimerScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('focus');
  const [seconds, setSeconds] = useState(MODES.focus);
  const [running, setRunning] = useState(false);
  const [tab, setTab] = useState<'live' | 'history'>('live');
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [customFocus, setCustomFocus] = useState('30');
  const [customBreak, setCustomBreak] = useState('7');

  const pulse = useRef(new Animated.Value(1)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 320, useNativeDriver: true }).start();
  }, [fade]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (!running) {
      pulse.stopAnimation();
      pulse.setValue(1);
      return;
    }
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.035,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [running, pulse]);

  useEffect(() => {
    if (seconds === 0) setRunning(false);
  }, [seconds]);

  const clock = useMemo(() => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, [seconds]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setSeconds(MODES[next]);
    setRunning(false);
  };

  const applyPreset = () => {
    const focusMinutes = Math.max(1, Number(customFocus || '25'));
    const breakMinutes = Math.max(1, Number(customBreak || '5'));
    if (mode === 'focus') setSeconds(focusMinutes * 60);
    if (mode === 'short') setSeconds(breakMinutes * 60);
    if (mode === 'long') setSeconds(Math.round(breakMinutes * 2.5) * 60);
    setRunning(false);
    setShowPresetModal(false);
  };

  return (
    <SafeAreaView className="min-h-0 flex-1 bg-[#0e0e0e]">
      <Animated.View style={{ opacity: fade }} className="min-h-0 flex-1">
        <PageScroll>
          <View className="mb-6 flex-row items-center justify-between">
            <View>
              <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-[#70b1ff]">Produve</Text>
              <Text className="mt-1 font-display text-[46px] leading-[48px] text-white">Timer</Text>
            </View>
            <Pressable onPress={() => router.back()} className="rounded-full border border-white/20 px-4 py-2">
              <Text className="font-body text-[12px] text-white">Back</Text>
            </Pressable>
          </View>

          <View
            className="mb-6 flex-row rounded-full bg-[rgba(19,19,19,0.78)] p-1"
            style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.2)' }}
          >
            <Pressable onPress={() => setTab('live')} className={tab === 'live' ? 'flex-1 rounded-full bg-white/10 py-2 items-center' : 'flex-1 rounded-full py-2 items-center'}>
              <Text className={tab === 'live' ? 'font-mono text-[10px] uppercase text-white' : 'font-mono text-[10px] uppercase text-void-text-secondary'}>
                Live
              </Text>
            </Pressable>
            <Pressable onPress={() => setTab('history')} className={tab === 'history' ? 'flex-1 rounded-full bg-white/10 py-2 items-center' : 'flex-1 rounded-full py-2 items-center'}>
              <Text className={tab === 'history' ? 'font-mono text-[10px] uppercase text-white' : 'font-mono text-[10px] uppercase text-void-text-secondary'}>
                Previous Sessions
              </Text>
            </Pressable>
          </View>

          {tab === 'live' ? (
            <>
              <View className="mb-8 items-center rounded-[20px] bg-[rgba(19,19,19,0.78)] p-6" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.22)' }}>
                <View className="mb-4 flex-row rounded-full bg-[#0f1113] p-1" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.16)' }}>
                  {(['focus', 'short', 'long'] as const).map((m) => (
                    <Pressable key={m} onPress={() => switchMode(m)} className={`rounded-full px-4 py-2 ${mode === m ? 'bg-[#4ea4ff]' : ''}`}>
                      <Text className={`font-mono text-[10px] uppercase ${mode === m ? 'text-[#001b32]' : 'text-void-text-secondary'}`}>
                        {m === 'focus' ? 'Focus' : m === 'short' ? 'Short Break' : 'Long Break'}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Animated.View style={{ transform: [{ scale: pulse }] }}>
                  <View className="items-center rounded-full border border-[rgba(214,235,253,0.2)] px-10 py-8">
                    <Text className="font-display text-[86px] leading-[94px] text-white">{clock}</Text>
                  </View>
                </Animated.View>

                <Text className="mt-3 font-body text-[13px] text-void-text-secondary">
                  {mode === 'focus' ? 'Live room running. Stay deep.' : 'Recover, then return stronger.'}
                </Text>

                <View className="mt-6 flex-row gap-2">
                  <Pressable onPress={() => setRunning((r) => !r)} className="rounded-full bg-[#4ea4ff] px-5 py-2.5">
                    <Text className="font-body text-[13px] text-[#001b32]">{running ? 'Pause' : 'Start'}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setSeconds(MODES[mode]);
                      setRunning(false);
                    }}
                    className="rounded-full border border-white/20 px-5 py-2.5"
                  >
                    <Text className="font-body text-[13px] text-white">Reset</Text>
                  </Pressable>
                  <Pressable onPress={() => setShowPresetModal(true)} className="rounded-full border border-white/20 px-5 py-2.5">
                    <Text className="font-body text-[13px] text-white">Preset</Text>
                  </Pressable>
                </View>
              </View>

              <View className="rounded-[18px] bg-[rgba(19,19,19,0.78)] p-5" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.22)' }}>
                <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-void-text-secondary">Live Leaderboard</Text>
                <View className="mt-4 gap-3">
                  {LIVE_LEADERBOARD.map((p, idx) => (
                    <View key={p.id} className="flex-row items-center justify-between rounded-[14px] bg-[rgba(23,26,29,0.72)] px-3 py-3" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.12)' }}>
                      <View className="flex-row items-center gap-3">
                        <View className="h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: idx === 0 ? 'rgba(78,164,255,0.25)' : 'rgba(214,235,253,0.14)' }}>
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
            </>
          ) : (
            <View className="rounded-[18px] bg-[rgba(19,19,19,0.78)] p-5" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.22)' }}>
              <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-void-text-secondary">Previous Sessions</Text>
              <View className="mt-4 gap-3">
                {PREVIOUS_SESSIONS.map((s) => (
                  <View key={s.id} className="rounded-[14px] bg-[rgba(23,26,29,0.72)] p-3" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.12)' }}>
                    <View className="flex-row items-center justify-between">
                      <Text className="font-body text-[14px] text-white">{s.mode}</Text>
                      <Text className="font-mono text-[10px] text-[#70b1ff]">{s.duration}</Text>
                    </View>
                    <Text className="mt-1 font-mono text-[10px] text-void-text-tertiary">
                      {s.date} | {s.subject}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </PageScroll>
      </Animated.View>

      <Modal visible={showPresetModal} transparent animationType="fade" onRequestClose={() => setShowPresetModal(false)}>
        <View className="flex-1 items-center justify-center bg-black/70 p-5">
          <Pressable className="absolute inset-0" onPress={() => setShowPresetModal(false)} />
          <View className="w-full max-w-[500px] rounded-[20px] bg-[rgba(19,19,19,0.78)] p-5" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.22)' }}>
            <Text className="font-mono text-[10px] uppercase text-[#70b1ff]">Custom Preset</Text>
            <TextInput
              value={customFocus}
              onChangeText={setCustomFocus}
              keyboardType="number-pad"
              placeholder="Focus minutes"
              placeholderTextColor="#6f767a"
              className="mt-3 rounded-full border border-white/20 bg-[#0f1113] px-4 py-2.5 text-white"
            />
            <TextInput
              value={customBreak}
              onChangeText={setCustomBreak}
              keyboardType="number-pad"
              placeholder="Break minutes"
              placeholderTextColor="#6f767a"
              className="mt-2 rounded-full border border-white/20 bg-[#0f1113] px-4 py-2.5 text-white"
            />
            <Pressable onPress={applyPreset} className="mt-4 self-start rounded-full bg-[#4ea4ff] px-4 py-2.5">
              <Text className="font-body text-[12px] text-[#001b32]">Apply</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}




