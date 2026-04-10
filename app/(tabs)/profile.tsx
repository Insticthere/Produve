import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, SafeAreaView, Switch, Text, TextInput, View } from 'react-native';
import PageScroll from '@/components/ui/PageScroll';
import { useAppTheme } from '@/lib/theme';

export default function ProfileScreen() {
  const { palette, themeId, setThemeId, allThemes, customPalette, updateCustomPalette, resetCustomPalette } = useAppTheme();
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
    <SafeAreaView style={{ flex: 1, minHeight: 0, backgroundColor: palette.background }}>
      <Animated.View style={{ opacity: fade, flex: 1, minHeight: 0 }}>
        <PageScroll>
          <View className="mb-8 flex-row items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: palette.surfaceAlt, borderWidth: 1, borderColor: palette.borderStrong }}>
              <Text className="font-section text-[24px]" style={{ color: palette.primary }}>N</Text>
            </View>
            <View>
              <Text className="font-mono text-[10px] uppercase tracking-[1.2px]" style={{ color: palette.primary }}>Produve</Text>
              <Text className="mt-1 font-display text-[40px] leading-[42px]" style={{ color: palette.textPrimary }}>Nitin</Text>
              <Text className="font-body text-[13px]" style={{ color: palette.textSecondary }}>Consistency over intensity.</Text>
            </View>
          </View>

          <View className="mb-8 gap-3">
            <View className="rounded-[16px] p-4" style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
              <Text className="font-mono text-[10px] uppercase" style={{ color: palette.textTertiary }}>Today Focus</Text>
              <Text className="mt-1 font-section text-[22px]" style={{ color: palette.textPrimary }}>3h 40m</Text>
            </View>
            <View className="rounded-[16px] p-4" style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
              <Text className="font-mono text-[10px] uppercase" style={{ color: palette.textTertiary }}>Current Streak</Text>
              <Text className="mt-1 font-section text-[22px]" style={{ color: palette.success }}>18 days</Text>
            </View>
            <View className="rounded-[16px] p-4" style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
              <Text className="font-mono text-[10px] uppercase" style={{ color: palette.textTertiary }}>Weekly Goal</Text>
              <Text className="mt-1 font-section text-[22px]" style={{ color: palette.primary }}>29/35 hours</Text>
            </View>
          </View>

          <View className="mb-8 rounded-[18px] p-5" style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.borderStrong }}>
            <Text className="font-mono text-[10px] uppercase tracking-[1.2px]" style={{ color: palette.textSecondary }}>Theme</Text>
            <View className="mt-4 flex-row flex-wrap gap-2">
              {allThemes.map((theme) => {
                const active = theme.id === themeId;
                return (
                  <Pressable
                    key={theme.id}
                    onPress={() => setThemeId(theme.id)}
                    className="rounded-full px-3 py-2"
                    style={{
                      borderWidth: 1,
                      borderColor: active ? theme.primary : palette.border,
                      backgroundColor: active ? theme.primarySoft : palette.surfaceAlt,
                    }}
                  >
                    <Text className="font-mono text-[11px] uppercase" style={{ color: active ? theme.primary : palette.textSecondary }}>
                      {theme.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View className="mt-4 gap-2">
              <Text className="font-mono text-[10px] uppercase tracking-[1.2px]" style={{ color: palette.textTertiary }}>Custom Theme Builder</Text>
              <View className="flex-row gap-2">
                <TextInput
                  value={customPalette.primary}
                  onChangeText={(value) => updateCustomPalette({ primary: value })}
                  placeholder="#70b1ff"
                  placeholderTextColor={palette.textTertiary}
                  className="flex-1 rounded-full border px-4 py-2.5"
                  style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }}
                />
                <TextInput
                  value={customPalette.background}
                  onChangeText={(value) => updateCustomPalette({ background: value })}
                  placeholder="#101418"
                  placeholderTextColor={palette.textTertiary}
                  className="flex-1 rounded-full border px-4 py-2.5"
                  style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }}
                />
              </View>
              <View className="flex-row gap-2">
                <TextInput
                  value={customPalette.surfaceAlt}
                  onChangeText={(value) => updateCustomPalette({ surfaceAlt: value })}
                  placeholder="rgba(...)"
                  placeholderTextColor={palette.textTertiary}
                  className="flex-1 rounded-full border px-4 py-2.5"
                  style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }}
                />
                <TextInput
                  value={customPalette.textPrimary}
                  onChangeText={(value) => updateCustomPalette({ textPrimary: value })}
                  placeholder="#f0f0f0"
                  placeholderTextColor={palette.textTertiary}
                  className="flex-1 rounded-full border px-4 py-2.5"
                  style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }}
                />
              </View>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setThemeId('custom')}
                  className="rounded-full px-4 py-2"
                  style={{ backgroundColor: palette.primary }}
                >
                  <Text className="font-body text-[12px]" style={{ color: palette.dark ? '#001b32' : '#ffffff' }}>
                    Apply Custom
                  </Text>
                </Pressable>
                <Pressable
                  onPress={resetCustomPalette}
                  className="rounded-full border px-4 py-2"
                  style={{ borderColor: palette.borderStrong }}
                >
                  <Text className="font-body text-[12px]" style={{ color: palette.textPrimary }}>
                    Reset
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View className="mb-8 rounded-[18px] p-5" style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.borderStrong }}>
            <Text className="font-mono text-[10px] uppercase tracking-[1.2px]" style={{ color: palette.textSecondary }}>Preferences</Text>
            <View className="mt-4 gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="font-body text-[14px]" style={{ color: palette.textPrimary }}>Focus Reminders</Text>
                <Switch value={focusReminders} onValueChange={setFocusReminders} />
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="font-body text-[14px]" style={{ color: palette.textPrimary }}>Auto Start Breaks</Text>
                <Switch value={autoStartBreaks} onValueChange={setAutoStartBreaks} />
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="font-body text-[14px]" style={{ color: palette.textPrimary }}>Visible In Group Leaderboard</Text>
                <Switch value={groupVisibility} onValueChange={setGroupVisibility} />
              </View>
            </View>
          </View>

          <View className="rounded-[18px] p-5" style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.borderStrong }}>
            <Text className="font-mono text-[10px] uppercase tracking-[1.2px]" style={{ color: palette.textSecondary }}>Goals</Text>
            <View className="mt-4 gap-3">
              <View className="rounded-[14px] p-3" style={{ backgroundColor: palette.surfaceAlt, borderWidth: 1, borderColor: palette.border }}>
                <Text className="font-body text-[14px]" style={{ color: palette.textPrimary }}>{goalOne}</Text>
                <Text className="mt-1 font-mono text-[10px]" style={{ color: palette.textTertiary }}>142 / 200</Text>
              </View>
              <View className="rounded-[14px] p-3" style={{ backgroundColor: palette.surfaceAlt, borderWidth: 1, borderColor: palette.border }}>
                <Text className="font-body text-[14px]" style={{ color: palette.textPrimary }}>{goalTwo}</Text>
                <Text className="mt-1 font-mono text-[10px]" style={{ color: palette.textTertiary }}>2 / 3</Text>
              </View>
            </View>
            <Pressable onPress={() => setShowGoalsModal(true)} className="mt-4 self-start rounded-full px-4 py-2.5" style={{ backgroundColor: palette.primary }}>
              <Text className="font-body text-[13px]" style={{ color: palette.dark ? '#001b32' : '#ffffff' }}>Edit Goals</Text>
            </Pressable>
          </View>
        </PageScroll>
      </Animated.View>

      <Modal visible={showGoalsModal} transparent animationType="fade" onRequestClose={() => setShowGoalsModal(false)}>
        <View className="flex-1 items-center justify-center p-5" style={{ backgroundColor: palette.overlay }}>
          <Pressable className="absolute inset-0" onPress={() => setShowGoalsModal(false)} />
          <View className="w-full max-w-[500px] rounded-[20px] p-5" style={{ backgroundColor: palette.modalBackground, borderWidth: 1, borderColor: palette.borderStrong }}>
            <Text className="font-mono text-[10px] uppercase" style={{ color: palette.primary }}>Edit Goals</Text>
            <TextInput value={goalOne} onChangeText={setGoalOne} placeholderTextColor={palette.textTertiary} className="mt-3 rounded-[14px] border px-4 py-3" style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }} />
            <TextInput value={goalTwo} onChangeText={setGoalTwo} placeholderTextColor={palette.textTertiary} className="mt-2 rounded-[14px] border px-4 py-3" style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }} />
            <Pressable onPress={() => setShowGoalsModal(false)} className="mt-4 self-start rounded-full px-4 py-2.5" style={{ backgroundColor: palette.primary }}>
              <Text className="font-body text-[12px]" style={{ color: palette.dark ? '#001b32' : '#ffffff' }}>Save Goals</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
