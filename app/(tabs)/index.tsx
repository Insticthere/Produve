import React from 'react';
import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PageScroll from '@/components/ui/PageScroll';
import { useAppTheme } from '@/lib/theme';

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
  const { palette } = useAppTheme();

  return (
    <SafeAreaView style={{ flex: 1, minHeight: 0, backgroundColor: palette.background }}>
      <PageScroll>
        <View className="mb-8 flex-row items-center justify-between">
          <View>
            <Text className="font-mono text-[10px] uppercase tracking-[1.2px]" style={{ color: palette.primary }}>Produve</Text>
            <Text className="mt-1 font-display text-[46px] leading-[48px]" style={{ color: palette.textPrimary }}>Focus</Text>
          </View>
          <View
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}
          >
            <Ionicons name="person-outline" size={18} color={palette.textPrimary} />
          </View>
        </View>

        <View className="mb-8 gap-3">
          {INSIGHTS.map((card) => {
            const toneBg = card.tone === 'red' ? `${palette.danger}33` : card.tone === 'green' ? `${palette.success}33` : `${palette.primary}33`;
            const toneFg = card.tone === 'red' ? palette.danger : card.tone === 'green' ? palette.success : palette.primary;
            return (
              <View key={card.id} className="rounded-[16px] px-4 py-4" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface }}>
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="font-mono text-[10px] uppercase tracking-[1.1px]" style={{ color: palette.textTertiary }}>{card.label}</Text>
                    <Text className="mt-1 font-section text-[22px]" style={{ color: palette.textPrimary }}>{card.value}</Text>
                  </View>
                  <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: toneBg }}>
                    <Ionicons name={card.icon} size={16} color={toneFg} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View className="mb-8 rounded-[18px] p-5" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
          <Text className="font-mono text-[10px] uppercase tracking-[1.2px]" style={{ color: palette.textSecondary }}>Now In Focus</Text>
          <Text className="mt-2 font-section text-[22px] leading-7" style={{ color: palette.textPrimary }}>Architectural Lighting Study</Text>
          <Text className="mt-2 max-w-[310px] font-body text-[14px] leading-[21px]" style={{ color: palette.textSecondary }}>
            Finalize mapping and transitions for the central atrium before tonight&apos;s review window.
          </Text>
          <View className="mt-4 flex-row gap-2">
            <Pressable onPress={() => router.push('/timer')} className="rounded-full px-4 py-2.5" style={{ backgroundColor: palette.primary }}>
              <Text className="font-body text-[13px]" style={{ color: palette.dark ? '#001b32' : '#ffffff' }}>Open Timer</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/Todo')} className="rounded-full px-4 py-2.5" style={{ borderWidth: 1, borderColor: palette.borderStrong }}>
              <Text className="font-body text-[13px]" style={{ color: palette.textPrimary }}>Open Tasks</Text>
            </Pressable>
          </View>
        </View>

        <View className="mb-8 rounded-[18px] p-5" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
          <Text className="font-mono text-[10px] uppercase tracking-[1.2px]" style={{ color: palette.textSecondary }}>Quick Navigate</Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            <Pressable onPress={() => router.push('/planner')} className="rounded-full px-3 py-2" style={{ backgroundColor: palette.primarySoft }}>
              <Text className="font-mono text-[10px]" style={{ color: palette.primary }}>Planner</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/study')} className="rounded-full px-3 py-2" style={{ backgroundColor: `${palette.success}22` }}>
              <Text className="font-mono text-[10px]" style={{ color: palette.success }}>Study Lab</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/groups')} className="rounded-full px-3 py-2" style={{ backgroundColor: `${palette.danger}22` }}>
              <Text className="font-mono text-[10px]" style={{ color: palette.danger }}>Groups</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/profile')} className="rounded-full px-3 py-2" style={{ backgroundColor: palette.surfaceAlt }}>
              <Text className="font-mono text-[10px]" style={{ color: palette.textPrimary }}>Profile</Text>
            </Pressable>
          </View>
        </View>

        <View className="gap-3">
          <Text className="font-mono text-[10px] uppercase tracking-[1.2px]" style={{ color: palette.textSecondary }}>Upcoming</Text>
          {UPCOMING.map((item) => (
            <View key={item.id} className="rounded-[14px] px-4 py-3" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface }}>
              <View className="flex-row items-center justify-between">
                <Text className="font-body text-[14px]" style={{ color: palette.textPrimary }}>{item.title}</Text>
                <Text className="font-mono text-[11px]" style={{ color: palette.primary }}>{item.time}</Text>
              </View>
              <Text className="mt-1 font-mono text-[10px] uppercase tracking-[1px]" style={{ color: palette.textTertiary }}>
                {item.priority} Priority
              </Text>
            </View>
          ))}
        </View>
      </PageScroll>
    </SafeAreaView>
  );
}
