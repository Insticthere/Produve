import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, SafeAreaView, Switch, Text, TextInput, View } from 'react-native';
import PageScroll from '@/components/ui/PageScroll';

export default function ProfileScreen() {
  const [focusReminders, setFocusReminders] = useState(true);
  const [autoStartBreaks, setAutoStartBreaks] = useState(false);
  const [groupVisibility, setGroupVisibility] = useState(true);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [goalOne, setGoalOne] = useState('Complete 200 questions this week');
  const [goalTwo, setGoalTwo] = useState('Read 3 chapters of current book');
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 360, useNativeDriver: true }).start();
  }, [fade]);

  return (
    <SafeAreaView className="min-h-0 flex-1 bg-[#0e0e0e]">
      <Animated.View style={{ opacity: fade }} className="min-h-0 flex-1">
        <PageScroll>
          <View className="mb-8 flex-row items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-[#1a222a]" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.24)' }}>
              <Text className="font-section text-[24px] text-[#70b1ff]">N</Text>
            </View>
            <View>
              <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-[#70b1ff]">Produve</Text>
              <Text className="mt-1 font-display text-[40px] leading-[42px] text-white">Nitin</Text>
              <Text className="font-body text-[13px] text-void-text-secondary">Consistency over intensity.</Text>
            </View>
          </View>

          <View className="mb-8 gap-3">
            <View className="rounded-[16px] bg-[rgba(19,19,19,0.78)] p-4" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.19)' }}>
              <Text className="font-mono text-[10px] uppercase text-void-text-tertiary">Today Focus</Text>
              <Text className="mt-1 font-section text-[22px] text-white">3h 40m</Text>
            </View>
            <View className="rounded-[16px] bg-[rgba(19,19,19,0.78)] p-4" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.19)' }}>
              <Text className="font-mono text-[10px] uppercase text-void-text-tertiary">Current Streak</Text>
              <Text className="mt-1 font-section text-[22px] text-[#01fc97]">18 days</Text>
            </View>
            <View className="rounded-[16px] bg-[rgba(19,19,19,0.78)] p-4" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.19)' }}>
              <Text className="font-mono text-[10px] uppercase text-void-text-tertiary">Weekly Goal</Text>
              <Text className="mt-1 font-section text-[22px] text-[#70b1ff]">29/35 hours</Text>
            </View>
          </View>

          <View className="mb-8 rounded-[18px] bg-[rgba(19,19,19,0.78)] p-5" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.22)' }}>
            <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-void-text-secondary">Preferences</Text>
            <View className="mt-4 gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="font-body text-[14px] text-white">Focus Reminders</Text>
                <Switch value={focusReminders} onValueChange={setFocusReminders} />
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="font-body text-[14px] text-white">Auto Start Breaks</Text>
                <Switch value={autoStartBreaks} onValueChange={setAutoStartBreaks} />
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="font-body text-[14px] text-white">Visible In Group Leaderboard</Text>
                <Switch value={groupVisibility} onValueChange={setGroupVisibility} />
              </View>
            </View>
          </View>

          <View className="rounded-[18px] bg-[rgba(19,19,19,0.78)] p-5" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.22)' }}>
            <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-void-text-secondary">Goals</Text>
            <View className="mt-4 gap-3">
              <View className="rounded-[14px] bg-[rgba(23,26,29,0.72)] p-3" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.12)' }}>
                <Text className="font-body text-[14px] text-white">{goalOne}</Text>
                <Text className="mt-1 font-mono text-[10px] text-void-text-tertiary">142 / 200</Text>
              </View>
              <View className="rounded-[14px] bg-[rgba(23,26,29,0.72)] p-3" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.12)' }}>
                <Text className="font-body text-[14px] text-white">{goalTwo}</Text>
                <Text className="mt-1 font-mono text-[10px] text-void-text-tertiary">2 / 3</Text>
              </View>
            </View>
            <Pressable onPress={() => setShowGoalsModal(true)} className="mt-4 self-start rounded-full bg-[#4ea4ff] px-4 py-2.5">
              <Text className="font-body text-[13px] text-[#001b32]">Edit Goals</Text>
            </Pressable>
          </View>
        </PageScroll>
      </Animated.View>

      <Modal visible={showGoalsModal} transparent animationType="fade" onRequestClose={() => setShowGoalsModal(false)}>
        <View className="flex-1 items-center justify-center bg-black/70 p-5">
          <Pressable className="absolute inset-0" onPress={() => setShowGoalsModal(false)} />
          <View className="w-full max-w-[500px] rounded-[20px] bg-[rgba(19,19,19,0.78)] p-5" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.22)' }}>
            <Text className="font-mono text-[10px] uppercase text-[#70b1ff]">Edit Goals</Text>
            <TextInput value={goalOne} onChangeText={setGoalOne} placeholderTextColor="#6f767a" className="mt-3 rounded-[14px] border border-white/20 bg-[#0f1113] px-4 py-3 text-white" />
            <TextInput value={goalTwo} onChangeText={setGoalTwo} placeholderTextColor="#6f767a" className="mt-2 rounded-[14px] border border-white/20 bg-[#0f1113] px-4 py-3 text-white" />
            <Pressable onPress={() => setShowGoalsModal(false)} className="mt-4 self-start rounded-full bg-[#4ea4ff] px-4 py-2.5">
              <Text className="font-body text-[12px] text-[#001b32]">Save Goals</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}




