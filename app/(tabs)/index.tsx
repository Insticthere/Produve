import React from 'react';
import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PageScroll from '@/components/ui/PageScroll';

const INSIGHTS = [
  { id: '1', label: 'Focus Streak', value: '18 days', icon: 'flash' as const, tone: 'blue' },
  { id: '2', label: 'Completed Today', value: '7 tasks', icon: 'checkmark-done' as const, tone: 'green' },
  { id: '3', label: 'High Priority', value: '2 left', icon: 'flame' as const, tone: 'red' },
];

const UPCOMING = [
  { id: 'u1', title: 'Sprint Architecture Review', time: '14:00', priority: 'High' },
  { id: 'u2', title: 'Design QA Walkthrough', time: '17:30', priority: 'Medium' },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="min-h-0 flex-1 bg-[#0e0e0e]">
      <PageScroll>
        <View className="mb-8 flex-row items-center justify-between">
          <View>
            <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-[#70b1ff]">Produve</Text>
            <Text className="mt-1 font-display text-[46px] leading-[48px] text-void-text-primary">Focus</Text>
          </View>
          <View
            className="h-10 w-10 items-center justify-center rounded-full bg-[rgba(19,19,19,0.78)]"
            style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.22)' }}
          >
            <Ionicons name="person-outline" size={18} color="#f0f0f0" />
          </View>
        </View>

        <View className="mb-8 gap-3">
          {INSIGHTS.map((card) => (
            <View
              key={card.id}
              className="rounded-[16px] bg-[rgba(19,19,19,0.78)] px-4 py-4"
              style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.19)' }}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="font-mono text-[10px] uppercase tracking-[1.1px] text-void-text-tertiary">
                    {card.label}
                  </Text>
                  <Text className="mt-1 font-section text-[22px] text-void-text-primary">{card.value}</Text>
                </View>
                <View
                  className="h-9 w-9 items-center justify-center rounded-full"
                  style={{
                    backgroundColor:
                      card.tone === 'red'
                        ? 'rgba(255, 32, 71, 0.2)'
                        : card.tone === 'green'
                        ? 'rgba(34, 255, 153, 0.18)'
                        : 'rgba(0, 117, 255, 0.26)',
                  }}
                >
                  <Ionicons
                    name={card.icon}
                    size={16}
                    color={card.tone === 'red' ? '#ff716c' : card.tone === 'green' ? '#01fc97' : '#70b1ff'}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        <View
          className="mb-8 rounded-[18px] bg-[rgba(19,19,19,0.78)] p-5"
          style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.22)' }}
        >
          <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-void-text-secondary">Now In Focus</Text>
          <Text className="mt-2 font-section text-[22px] leading-7 text-void-text-primary">Architectural Lighting Study</Text>
          <Text className="mt-2 max-w-[310px] font-body text-[14px] leading-[21px] text-void-text-secondary">
            Finalize mapping and transitions for the central atrium before tonight&apos;s review window.
          </Text>
          <View className="mt-4 flex-row gap-2">
            <Pressable onPress={() => router.push('/timer')} className="rounded-full bg-[#4ea4ff] px-4 py-2.5">
              <Text className="font-body text-[13px] text-[#001b32]">Open Timer</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/Todo')}
              className="rounded-full px-4 py-2.5"
              style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.24)' }}
            >
              <Text className="font-body text-[13px] text-void-text-primary">Open Tasks</Text>
            </Pressable>
          </View>
        </View>

        <View
          className="mb-8 rounded-[18px] bg-[rgba(19,19,19,0.78)] p-5"
          style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.22)' }}
        >
          <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-void-text-secondary">Quick Navigate</Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            <Pressable onPress={() => router.push('/planner')} className="rounded-full bg-[#4ea4ff22] px-3 py-2">
              <Text className="font-mono text-[10px] text-[#70b1ff]">Planner</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/study')} className="rounded-full bg-[#01fc9722] px-3 py-2">
              <Text className="font-mono text-[10px] text-[#01fc97]">Study Lab</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/groups')} className="rounded-full bg-[#ff716c22] px-3 py-2">
              <Text className="font-mono text-[10px] text-[#ff716c]">Groups</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/profile')} className="rounded-full bg-[#ffffff14] px-3 py-2">
              <Text className="font-mono text-[10px] text-white">Profile</Text>
            </Pressable>
          </View>
        </View>

        <View className="gap-3">
          <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-void-text-secondary">Upcoming</Text>
          {UPCOMING.map((item) => (
            <View
              key={item.id}
              className="rounded-[14px] bg-[rgba(19,19,19,0.78)] px-4 py-3"
              style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.16)' }}
            >
              <View className="flex-row items-center justify-between">
                <Text className="font-body text-[14px] text-void-text-primary">{item.title}</Text>
                <Text className="font-mono text-[11px] text-[#70b1ff]">{item.time}</Text>
              </View>
              <Text className="mt-1 font-mono text-[10px] uppercase tracking-[1px] text-void-text-tertiary">
                {item.priority} Priority
              </Text>
            </View>
          ))}
        </View>
      </PageScroll>
    </SafeAreaView>
  );
}


