import React, { useMemo, useState } from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import PageScroll from '@/components/ui/PageScroll';
import ScreenIntro from '@/components/ui/ScreenIntro';
import { type PlannerCategory, useAppState } from '@/lib/app-state';
import { useAppTheme } from '@/lib/theme';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const START_HOUR = 6;
const SLOT_MINUTES = 15;

function toClock(slot: number) {
  const totalMinutes = START_HOUR * 60 + slot * SLOT_MINUTES;
  const h = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const m = (totalMinutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function toWeekdayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

export default function PlannerMobileScreen() {
  const { palette } = useAppTheme();
  const { plannerBlocks, setPlannerBlocks } = useAppState();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState<'all' | PlannerCategory>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<PlannerCategory>('focus');
  const [newStart, setNewStart] = useState('10:00');
  const [newDuration, setNewDuration] = useState('60');

  const selectedDay = useMemo(() => toWeekdayIndex(selectedDate), [selectedDate]);
  const dayBlocks = useMemo(
    () =>
      plannerBlocks
        .filter((b) => b.day === selectedDay && (filter === 'all' || b.category === filter))
        .sort((a, b) => a.startSlot - b.startSlot),
    [plannerBlocks, selectedDay, filter]
  );

  const shiftDay = (delta: number) => {
    setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + delta));
  };

  const addSession = () => {
    if (!newTitle.trim()) return;
    const [hStr, mStr] = newStart.split(':');
    const startSlot = Math.max(0, Math.round((Number(hStr) * 60 + Number(mStr) - START_HOUR * 60) / SLOT_MINUTES));
    const durationSlots = Math.max(1, Math.round(Number(newDuration || '60') / SLOT_MINUTES));
    const color = newCategory === 'focus' ? '#4ea4ff' : newCategory === 'revision' ? '#ffad5e' : newCategory === 'practice' ? '#01fc97' : '#ff716c';

    setPlannerBlocks((prev) => [
      ...prev,
      {
        id: `p-${Date.now()}`,
        title: newTitle.trim(),
        day: selectedDay,
        category: newCategory,
        durationSlots,
        startSlot,
        color,
        done: false,
      },
    ]);
    setNewTitle('');
    setNewStart('10:00');
    setNewDuration('60');
    setShowAddModal(false);
  };

  return (
    <SafeAreaView className="min-h-0 flex-1" style={{ backgroundColor: palette.background }}>
      <PageScroll>
        <ScreenIntro title="Planner" description="Mobile day plan with quick add and category filters." compact />

        <View className="mt-4 rounded-[14px] p-3" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
          <View className="flex-row items-center gap-2">
            <Pressable onPress={() => shiftDay(-1)} className="rounded-full border px-3 py-1.5" style={{ borderColor: palette.border }}>
              <Text className="font-mono text-[10px]" style={{ color: palette.textPrimary }}>Prev</Text>
            </Pressable>
            <Pressable onPress={() => shiftDay(1)} className="rounded-full border px-3 py-1.5" style={{ borderColor: palette.border }}>
              <Text className="font-mono text-[10px]" style={{ color: palette.textPrimary }}>Next</Text>
            </Pressable>
            <View className="flex-1" />
            <Pressable onPress={() => setShowAddModal(true)} className="rounded-full px-3 py-1.5" style={{ backgroundColor: palette.primary }}>
              <Text className="font-body text-[12px]" style={{ color: palette.dark ? '#001b32' : '#fff' }}>Add Session</Text>
            </Pressable>
          </View>
          <Text className="mt-2 font-mono text-[10px]" style={{ color: palette.textSecondary }}>{selectedDate.toDateString()}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
          <View className="flex-row gap-2">
            {DAYS.map((d, idx) => (
              <Pressable key={d} onPress={() => shiftDay(idx - selectedDay)} className="rounded-full px-3 py-1.5" style={{ borderWidth: 1, borderColor: idx === selectedDay ? `${palette.primary}aa` : palette.border, backgroundColor: idx === selectedDay ? palette.primarySoft : palette.surface }}>
                <Text className="font-mono text-[10px] uppercase" style={{ color: idx === selectedDay ? palette.primary : palette.textSecondary }}>{d}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
          <View className="flex-row gap-2">
            {(['all', 'focus', 'revision', 'practice', 'break'] as const).map((f) => (
              <Pressable key={f} onPress={() => setFilter(f)} className="rounded-full px-3 py-1.5" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: filter === f ? palette.primarySoft : palette.surface }}>
                <Text className="font-mono text-[10px] uppercase" style={{ color: filter === f ? palette.primary : palette.textSecondary }}>{f}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View className="mt-4 gap-3">
          {dayBlocks.length ? (
            dayBlocks.map((block) => (
              <View key={block.id} className="rounded-[14px] p-3" style={{ borderWidth: 1, borderColor: `${block.color}77`, backgroundColor: `${block.color}1e` }}>
                <Text className="font-body text-[14px]" style={{ color: palette.textPrimary }}>{block.title}</Text>
                <Text className="mt-1 font-mono text-[10px]" style={{ color: palette.textSecondary }}>{toClock(block.startSlot)} - {toClock(block.startSlot + block.durationSlots)} | {block.category}</Text>
              </View>
            ))
          ) : (
            <View className="rounded-[14px] p-3" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface }}>
              <Text className="font-body text-[13px]" style={{ color: palette.textTertiary }}>No sessions for this day.</Text>
            </View>
          )}
        </View>
      </PageScroll>

      <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={() => setShowAddModal(false)}>
        <View className="flex-1 items-center justify-center p-5" style={{ backgroundColor: palette.overlay }}>
          <Pressable className="absolute inset-0" onPress={() => setShowAddModal(false)} />
          <View className="w-full rounded-[18px] p-4" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.modalBackground, maxWidth: 520 }}>
            <Text className="font-mono text-[10px] uppercase" style={{ color: palette.primary }}>Add Session</Text>
            <TextInput value={newTitle} onChangeText={setNewTitle} placeholder="Session title" placeholderTextColor={palette.textTertiary} className="mt-3 rounded-full border px-4 py-2.5" style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }} />
            <View className="mt-2 flex-row gap-2">
              <TextInput value={newStart} onChangeText={setNewStart} placeholder="HH:MM" placeholderTextColor={palette.textTertiary} className="flex-1 rounded-full border px-4 py-2.5" style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }} />
              <TextInput value={newDuration} onChangeText={setNewDuration} placeholder="Minutes" placeholderTextColor={palette.textTertiary} keyboardType="number-pad" className="flex-1 rounded-full border px-4 py-2.5" style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
              <View className="flex-row gap-2">
                {(['focus', 'revision', 'practice', 'break'] as const).map((c) => (
                  <Pressable key={c} onPress={() => setNewCategory(c)} className="rounded-full px-3 py-1.5" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: newCategory === c ? palette.primarySoft : 'transparent' }}>
                    <Text className="font-mono text-[10px] uppercase" style={{ color: newCategory === c ? palette.primary : palette.textSecondary }}>{c}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            <Pressable onPress={addSession} className="mt-3 self-start rounded-full px-4 py-2" style={{ backgroundColor: palette.primary }}>
              <Text className="font-body text-[12px]" style={{ color: palette.dark ? '#001b32' : '#fff' }}>Create</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
