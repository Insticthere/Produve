import React, { useMemo, useRef, useState } from 'react';
import { Animated, Modal, PanResponder, Pressable, SafeAreaView, ScrollView, Text, TextInput, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import PageScroll from '@/components/ui/PageScroll';
import ScreenIntro from '@/components/ui/ScreenIntro';
import { useAppTheme } from '@/lib/theme';
import { type PlannerBlock, type PlannerCategory, useAppState } from '@/lib/app-state';
import PlannerMobileScreen from '@/components/screens/PlannerScreen.mobile';

const START_HOUR = 6;
const END_HOUR = 22;
const SLOT_MINUTES = 15;
const SLOT_HEIGHT = 20;
const TOTAL_SLOTS = ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES;
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toClock(slot: number) {
  const totalMinutes = START_HOUR * 60 + slot * SLOT_MINUTES;
  const h = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const m = (totalMinutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function toWeekdayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

function PlannerEventBlock({ block, onDrop, onOpen }: { block: PlannerBlock; onDrop: (id: string, deltaSlots: number) => void; onOpen: (b: PlannerBlock) => void; }) {
  const { palette } = useAppTheme();
  const panY = useRef(new Animated.Value(0)).current;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event([null, { dy: panY }], { useNativeDriver: false }),
        onPanResponderRelease: (_, gesture) => {
          panY.stopAnimation((value: number) => {
            const deltaSlots = Math.round(value / SLOT_HEIGHT);
            onDrop(block.id, deltaSlots);
            panY.setValue(0);
          });
          if (Math.abs(gesture.dy) < 4) onOpen(block);
        },
      }),
    [block, onDrop, onOpen, panY]
  );

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={{
        position: 'absolute',
        left: 86,
        right: 12,
        top: block.startSlot * SLOT_HEIGHT,
        height: block.durationSlots * SLOT_HEIGHT - 4,
        transform: [{ translateY: panY }],
      }}
    >
      <View className={clsx('h-full rounded-[12px] px-3 py-2', block.done ? 'opacity-60' : '')} style={{ borderWidth: 1, borderColor: `${block.color}aa`, backgroundColor: `${block.color}22` }}>
        <Text className="font-body text-[13px]" style={{ color: palette.textPrimary }}>{block.title}</Text>
        <Text className="mt-1 font-mono text-[10px]" style={{ color: palette.textSecondary }}>{toClock(block.startSlot)} - {toClock(block.startSlot + block.durationSlots)}</Text>
      </View>
    </Animated.View>
  );
}

export default function PlannerScreen() {
  if (Platform.OS !== 'web') {
    return <PlannerMobileScreen />;
  }

  const { palette } = useAppTheme();
  const { plannerBlocks, setPlannerBlocks } = useAppState();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week'>('day');
  const [filter, setFilter] = useState<'all' | PlannerCategory>('all');
  const [controlsOpen, setControlsOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<PlannerBlock | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<PlannerCategory>('focus');
  const [newStart, setNewStart] = useState('10:00');
  const [newDuration, setNewDuration] = useState('60');

  const selectedDay = useMemo(() => toWeekdayIndex(selectedDate), [selectedDate]);
  const labels = useMemo(() => Array.from({ length: TOTAL_SLOTS + 1 }, (_, i) => toClock(i)), []);

  const dayBlocks = useMemo(
    () => plannerBlocks.filter((b) => b.day === selectedDay && (filter === 'all' || b.category === filter)),
    [plannerBlocks, selectedDay, filter]
  );

  const weekSummary = useMemo(() => WEEK_DAYS.map((label, idx) => ({ label, items: plannerBlocks.filter((b) => b.day === idx && (filter === 'all' || b.category === filter)) })), [plannerBlocks, filter]);

  const handleDrop = (id: string, deltaSlots: number) => {
    setPlannerBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const maxStart = TOTAL_SLOTS - b.durationSlots;
        const nextStart = Math.max(0, Math.min(maxStart, b.startSlot + deltaSlots));
        return { ...b, startSlot: nextStart };
      })
    );
  };

  const toggleDone = (id: string) => setPlannerBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, done: !b.done } : b)));

  const shiftDay = (delta: number) => {
    setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + delta));
  };

  const addSession = () => {
    if (!newTitle.trim()) return;
    const [hStr, mStr] = newStart.split(':');
    const h = Number(hStr);
    const m = Number(mStr);
    const startSlot = Math.max(0, Math.min(TOTAL_SLOTS - 1, Math.round((h * 60 + m - START_HOUR * 60) / SLOT_MINUTES)));
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
        <ScreenIntro title="Planner" description="15-minute planning grid with quick controls." className="mb-5" />

        <View className="mb-5 rounded-[16px] p-3" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
          <View className="flex-row items-center gap-2">
            <Pressable onPress={() => shiftDay(-1)} className="rounded-full px-3 py-1.5" style={{ borderWidth: 1, borderColor: palette.border }}>
              <Text className="font-mono text-[10px]" style={{ color: palette.textPrimary }}>Prev</Text>
            </Pressable>
            <Pressable onPress={() => shiftDay(1)} className="rounded-full px-3 py-1.5" style={{ borderWidth: 1, borderColor: palette.border }}>
              <Text className="font-mono text-[10px]" style={{ color: palette.textPrimary }}>Next</Text>
            </Pressable>
            <View className="flex-1" />
            <Pressable onPress={() => setShowAddModal(true)} className="rounded-full px-4 py-2" style={{ backgroundColor: palette.primary }}>
              <Text className="font-body text-[12px]" style={{ color: palette.dark ? '#001b32' : '#ffffff' }}>Add Session</Text>
            </Pressable>
            <Pressable onPress={() => setControlsOpen((v) => !v)} className="rounded-full px-2 py-2" style={{ borderWidth: 1, borderColor: palette.border }}>
              <Ionicons name={controlsOpen ? 'chevron-up' : 'chevron-down'} size={14} color={palette.textSecondary} />
            </Pressable>
          </View>

          <Text className="mt-2 font-mono text-[10px]" style={{ color: palette.textSecondary }}>{selectedDate.toDateString()}</Text>

          {controlsOpen && (
            <View className="mt-3 gap-3">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {WEEK_DAYS.map((d, idx) => (
                    <Pressable key={d} onPress={() => shiftDay(idx - selectedDay)} className="rounded-full px-3 py-1.5" style={{ borderWidth: 1, borderColor: idx === selectedDay ? `${palette.primary}aa` : palette.border, backgroundColor: idx === selectedDay ? palette.primarySoft : palette.surfaceAlt }}>
                      <Text className="font-mono text-[10px] uppercase" style={{ color: idx === selectedDay ? palette.primary : palette.textSecondary }}>{d}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>

              <View className="flex-row gap-2">
                {(['day', 'week'] as const).map((m) => (
                  <Pressable key={m} onPress={() => setView(m)} className="rounded-full px-3 py-1.5" style={{ backgroundColor: view === m ? palette.primary : palette.surfaceAlt }}>
                    <Text className="font-mono text-[10px] uppercase" style={{ color: view === m ? (palette.dark ? '#001b32' : '#ffffff') : palette.textSecondary }}>{m} View</Text>
                  </Pressable>
                ))}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {(['all', 'focus', 'revision', 'practice', 'break'] as const).map((f) => (
                      <Pressable key={f} onPress={() => setFilter(f)} className="rounded-full px-3 py-1.5" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: filter === f ? palette.primarySoft : 'transparent' }}>
                        <Text className="font-mono text-[10px] uppercase" style={{ color: filter === f ? palette.primary : palette.textSecondary }}>{f}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>
          )}
        </View>

        {view === 'day' ? (
          <View className="rounded-[18px] p-3" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface }}>
            <View style={{ height: TOTAL_SLOTS * SLOT_HEIGHT + 8, position: 'relative' }}>
              {labels.map((label, i) => (
                <View key={label + i} style={{ position: 'absolute', left: 0, right: 0, top: i * SLOT_HEIGHT, height: SLOT_HEIGHT }}>
                  {i % 4 === 0 ? (
                    <Text className="absolute left-2 top-0 font-mono text-[10px]" style={{ color: palette.textTertiary }}>{label}</Text>
                  ) : null}
                  <View
                    style={{
                      position: 'absolute',
                      left: 74,
                      right: 6,
                      top: SLOT_HEIGHT / 2,
                      height: 1,
                      backgroundColor: i % 4 === 0 ? `${palette.borderStrong}` : i % 2 === 0 ? `${palette.border}55` : 'transparent',
                    }}
                  />
                </View>
              ))}
              {dayBlocks.map((block) => (
                <PlannerEventBlock key={block.id} block={block} onDrop={handleDrop} onOpen={(b) => { setSelectedBlock(b); setShowBlockModal(true); }} />
              ))}
            </View>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              {weekSummary.map((day, idx) => (
                <View key={day.label} className="w-[260px] rounded-[16px] p-3" style={{ borderWidth: 1, borderColor: idx === selectedDay ? `${palette.primary}99` : palette.border, backgroundColor: palette.surface }}>
                  <Text className="font-mono text-[10px] uppercase" style={{ color: palette.textSecondary }}>{day.label}</Text>
                  <View className="mt-2 gap-2">
                    {day.items.length === 0 ? <Text className="font-body text-[12px]" style={{ color: palette.textTertiary }}>No sessions</Text> : day.items.map((b) => (
                      <Pressable key={b.id} onPress={() => { setSelectedBlock(b); setShowBlockModal(true); }} className="rounded-[12px] p-2" style={{ borderWidth: 1, borderColor: `${b.color}66`, backgroundColor: `${b.color}1f` }}>
                        <Text className="font-body text-[12px]" style={{ color: palette.textPrimary }}>{b.title}</Text>
                        <Text className="mt-1 font-mono text-[10px]" style={{ color: palette.textSecondary }}>{toClock(b.startSlot)} - {b.durationSlots * SLOT_MINUTES}m</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </PageScroll>

      <Modal visible={showBlockModal} transparent animationType="fade" onRequestClose={() => setShowBlockModal(false)}>
        <View className="flex-1 items-center justify-center p-5" style={{ backgroundColor: palette.overlay }}>
          <Pressable className="absolute inset-0" onPress={() => setShowBlockModal(false)} />
          {selectedBlock ? (
            <View className="w-full max-w-[480px] rounded-[20px] p-5" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.modalBackground }}>
              <Text className="font-mono text-[10px] uppercase" style={{ color: palette.primary }}>{WEEK_DAYS[selectedBlock.day]}</Text>
              <Text className="mt-1 font-section text-[24px]" style={{ color: palette.textPrimary }}>{selectedBlock.title}</Text>
              <Text className="mt-1 font-body text-[13px]" style={{ color: palette.textSecondary }}>{toClock(selectedBlock.startSlot)} - {toClock(selectedBlock.startSlot + selectedBlock.durationSlots)} - {selectedBlock.category}</Text>
              <View className="mt-4 flex-row gap-2">
                <Pressable onPress={() => toggleDone(selectedBlock.id)} className="rounded-full px-4 py-2.5" style={{ backgroundColor: palette.primary }}>
                  <Text className="font-body text-[12px]" style={{ color: palette.dark ? '#001b32' : '#ffffff' }}>{selectedBlock.done ? 'Mark Pending' : 'Mark Done'}</Text>
                </Pressable>
                <Pressable onPress={() => { setPlannerBlocks((prev) => prev.filter((b) => b.id !== selectedBlock.id)); setShowBlockModal(false); }} className="rounded-full border px-4 py-2.5" style={{ borderColor: `${palette.danger}66` }}>
                  <Text className="font-body text-[12px]" style={{ color: palette.danger }}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>

      <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={() => setShowAddModal(false)}>
        <View className="flex-1 items-center justify-center p-5" style={{ backgroundColor: palette.overlay }}>
          <Pressable className="absolute inset-0" onPress={() => setShowAddModal(false)} />
          <View className="w-full max-w-[480px] rounded-[20px] p-5" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.modalBackground }}>
            <Text className="font-mono text-[10px] uppercase" style={{ color: palette.primary }}>Add Session</Text>
            <Text className="mt-1 font-section text-[20px]" style={{ color: palette.textPrimary }}>{selectedDate.toDateString()}</Text>
            <View className="mt-4 gap-2">
              <TextInput value={newTitle} onChangeText={setNewTitle} placeholder="Session title" placeholderTextColor={palette.textTertiary} className="rounded-full border px-4 py-2.5" style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }} />
              <View className="flex-row gap-2">
                <TextInput value={newStart} onChangeText={setNewStart} placeholder="Start HH:MM" placeholderTextColor={palette.textTertiary} className="flex-1 rounded-full border px-4 py-2.5" style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }} />
                <TextInput value={newDuration} onChangeText={setNewDuration} placeholder="Duration min" placeholderTextColor={palette.textTertiary} keyboardType="number-pad" className="flex-1 rounded-full border px-4 py-2.5" style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }} />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {(['focus', 'revision', 'practice', 'break'] as const).map((c) => (
                    <Pressable key={c} onPress={() => setNewCategory(c)} className="rounded-full px-3 py-1.5" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: newCategory === c ? palette.primarySoft : 'transparent' }}>
                      <Text className="font-mono text-[10px] uppercase" style={{ color: newCategory === c ? palette.primary : palette.textSecondary }}>{c}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
            <Pressable onPress={addSession} className="mt-4 self-start rounded-full px-4 py-2.5" style={{ backgroundColor: palette.primary }}>
              <Text className="font-body text-[12px]" style={{ color: palette.dark ? '#001b32' : '#ffffff' }}>Create Session</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

