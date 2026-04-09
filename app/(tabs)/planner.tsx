import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import clsx from 'clsx';
import PageScroll from '@/components/ui/PageScroll';
import { useAppTheme } from '@/lib/theme';

const START_HOUR = 6;
const END_HOUR = 22;
const SLOT_MINUTES = 15;
const SLOT_HEIGHT = 20;
const TOTAL_SLOTS = ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES;
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type PlannerBlockData = {
  id: string;
  title: string;
  startSlot: number;
  durationSlots: number;
  color: string;
  day: number;
  category: 'focus' | 'revision' | 'practice' | 'break';
  done: boolean;
};

const INITIAL_BLOCKS: PlannerBlockData[] = [
  { id: 'p1', title: 'Deep Work', startSlot: 8, durationSlots: 6, color: '#4ea4ff', day: 0, category: 'focus', done: false },
  { id: 'p2', title: 'Revision Set', startSlot: 24, durationSlots: 4, color: '#01fc97', day: 0, category: 'revision', done: false },
  { id: 'p3', title: 'Mock Questions', startSlot: 34, durationSlots: 6, color: '#ff716c', day: 0, category: 'practice', done: false },
  { id: 'p4', title: 'Break Walk', startSlot: 18, durationSlots: 2, color: '#ffb46e', day: 1, category: 'break', done: true },
  { id: 'p5', title: 'Group Focus', startSlot: 28, durationSlots: 5, color: '#4ea4ff', day: 2, category: 'focus', done: false },
  { id: 'p6', title: 'Question Redo', startSlot: 30, durationSlots: 5, color: '#ff716c', day: 3, category: 'practice', done: false },
];

function toClock(slot: number) {
  const totalMinutes = START_HOUR * 60 + slot * SLOT_MINUTES;
  const h = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, '0');
  const m = (totalMinutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function toWeekdayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

function toDateLabel(date: Date) {
  return `${WEEK_DAYS[toWeekdayIndex(date)]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function monthDaysGrid(viewMonth: Date) {
  const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const last = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);
  const lead = toWeekdayIndex(first);
  const total = last.getDate();
  const cells: Array<{ day: number; date: Date } | null> = [];
  for (let i = 0; i < lead; i += 1) cells.push(null);
  for (let d = 1; d <= total; d += 1) {
    cells.push({ day: d, date: new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d) });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function PlannerBlock({
  block,
  onDrop,
  onOpen,
}: {
  block: PlannerBlockData;
  onDrop: (id: string, deltaSlots: number) => void;
  onOpen: (block: PlannerBlockData) => void;
}) {
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
      <View
        className={clsx('h-full rounded-[12px] px-3 py-2', block.done ? 'opacity-60' : '')}
        style={{
          borderWidth: 1,
          borderColor: `${block.color}aa`,
          backgroundColor: `${block.color}22`,
        }}
      >
        <Text className="font-body text-[13px]" style={{ color: palette.textPrimary }}>{block.title}</Text>
        <Text className="mt-1 font-mono text-[10px]" style={{ color: palette.textSecondary }}>
          {toClock(block.startSlot)} - {toClock(block.startSlot + block.durationSlots)}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function PlannerScreen() {
  const { palette } = useAppTheme();
  const [blocks, setBlocks] = useState(INITIAL_BLOCKS);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMonth, setViewMonth] = useState(new Date());
  const [view, setView] = useState<'day' | 'week'>('day');
  const [filter, setFilter] = useState<'all' | PlannerBlockData['category']>('all');
  const [selectedBlock, setSelectedBlock] = useState<PlannerBlockData | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<PlannerBlockData['category']>('focus');
  const [newStart, setNewStart] = useState('10:00');
  const [newDuration, setNewDuration] = useState('60');
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 360, useNativeDriver: true }).start();
  }, [fade]);

  const selectedDay = useMemo(() => toWeekdayIndex(selectedDate), [selectedDate]);
  const labels = useMemo(() => Array.from({ length: TOTAL_SLOTS + 1 }, (_, i) => toClock(i)), []);
  const calendarCells = useMemo(() => monthDaysGrid(viewMonth), [viewMonth]);

  const dayBlocks = useMemo(
    () => blocks.filter((b) => b.day === selectedDay && (filter === 'all' || b.category === filter)),
    [blocks, selectedDay, filter]
  );

  const weekSummary = useMemo(
    () => WEEK_DAYS.map((label, idx) => ({ label, items: blocks.filter((b) => b.day === idx) })),
    [blocks]
  );

  const handleDrop = (id: string, deltaSlots: number) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const maxStart = TOTAL_SLOTS - b.durationSlots;
        const nextStart = Math.max(0, Math.min(maxStart, b.startSlot + deltaSlots));
        return { ...b, startSlot: nextStart };
      })
    );
  };

  const toggleDone = (id: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, done: !b.done } : b)));
  };

  const addSession = () => {
    if (!newTitle.trim()) return;
    const [hStr, mStr] = newStart.split(':');
    const h = Number(hStr);
    const m = Number(mStr);
    const startSlot = Math.max(0, Math.min(TOTAL_SLOTS - 1, Math.round(((h * 60 + m - START_HOUR * 60) / SLOT_MINUTES))));
    const durationSlots = Math.max(1, Math.round(Number(newDuration || '60') / SLOT_MINUTES));
    const color =
      newCategory === 'focus'
        ? '#4ea4ff'
        : newCategory === 'revision'
        ? '#01fc97'
        : newCategory === 'practice'
        ? '#ff716c'
        : '#ffb46e';
    setBlocks((prev) => [
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

  const shiftDay = (delta: number) => {
    setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + delta));
  };

  return (
    <SafeAreaView className="min-h-0 flex-1" style={{ backgroundColor: palette.background }}>
      <Animated.View style={{ opacity: fade }} className="min-h-0 flex-1">
        <PageScroll>
          <View className="mb-6">
            <Text className="font-mono text-[10px] uppercase tracking-[1.2px]" style={{ color: palette.primary }}>Produve</Text>
            <Text className="mt-1 font-display text-[46px] leading-[48px]" style={{ color: palette.textPrimary }}>Planner</Text>
            <Text className="mt-2 font-body text-[14px]" style={{ color: palette.textSecondary }}>
              15-minute planning grid with old-date calendar selection.
            </Text>
          </View>

          <View className="mb-2 flex-row items-center gap-2">
            <Pressable onPress={() => shiftDay(-1)} className="rounded-full border px-3 py-1.5" style={{ borderColor: palette.borderStrong }}>
              <Text className="font-mono text-[10px]" style={{ color: palette.textPrimary }}>Prev Day</Text>
            </Pressable>
            <Pressable onPress={() => shiftDay(1)} className="rounded-full border px-3 py-1.5" style={{ borderColor: palette.borderStrong }}>
              <Text className="font-mono text-[10px]" style={{ color: palette.textPrimary }}>Next Day</Text>
            </Pressable>
            <Pressable onPress={() => setShowCalendarModal(true)} className="rounded-full border px-3 py-1.5" style={{ borderColor: palette.borderStrong }}>
              <Text className="font-mono text-[10px]" style={{ color: palette.textPrimary }}>Calendar</Text>
            </Pressable>
            <Pressable onPress={() => setShowAddModal(true)} className="ml-auto rounded-full px-4 py-2" style={{ backgroundColor: palette.primary }}>
              <Text className="font-body text-[12px]" style={{ color: palette.dark ? '#001b32' : '#ffffff' }}>Add Session</Text>
            </Pressable>
          </View>
          <Text className="mb-4 font-mono text-[10px]" style={{ color: palette.textSecondary }}>{toDateLabel(selectedDate)}</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row gap-2">
              {WEEK_DAYS.map((d, idx) => (
                <Pressable
                  key={d}
                  onPress={() => {
                    const diff = idx - selectedDay;
                    shiftDay(diff);
                  }}
                  className="rounded-full border px-3 py-1.5"
                  style={{ borderColor: selectedDay === idx ? 'rgba(78,164,255,0.65)' : 'rgba(214,235,253,0.2)' }}
                >
                  <Text className="font-mono text-[10px]" style={{ color: selectedDay === idx ? palette.primary : palette.textSecondary }}>
                    {d}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View className="mb-4 flex-row gap-2">
            <Pressable onPress={() => setView('day')} className="rounded-full px-3 py-1.5" style={{ backgroundColor: view === 'day' ? palette.primary : palette.surface }}>
              <Text className="font-mono text-[10px]" style={{ color: view === 'day' ? (palette.dark ? '#001b32' : '#ffffff') : palette.textSecondary }}>Day View</Text>
            </Pressable>
            <Pressable onPress={() => setView('week')} className="rounded-full px-3 py-1.5" style={{ backgroundColor: view === 'week' ? palette.primary : palette.surface }}>
              <Text className="font-mono text-[10px]" style={{ color: view === 'week' ? (palette.dark ? '#001b32' : '#ffffff') : palette.textSecondary }}>Week View</Text>
            </Pressable>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="ml-2">
              <View className="flex-row gap-2">
                {(['all', 'focus', 'revision', 'practice', 'break'] as const).map((f) => (
                  <Pressable key={f} onPress={() => setFilter(f)} className="rounded-full border px-3 py-1.5" style={{ borderColor: palette.border, backgroundColor: filter === f ? palette.primarySoft : 'transparent' }}>
                    <Text className="font-mono text-[10px] uppercase" style={{ color: filter === f ? palette.primary : palette.textSecondary }}>{f}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          {view === 'day' ? (
            <View className="rounded-[18px] p-3" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface }}>
              <View style={{ height: TOTAL_SLOTS * SLOT_HEIGHT + 8, position: 'relative' }}>
                {labels.map((label, i) => (
                  <View key={label + i} style={{ position: 'absolute', left: 0, right: 0, top: i * SLOT_HEIGHT, height: SLOT_HEIGHT }}>
                    <Text className="absolute left-2 top-0 font-mono text-[10px]" style={{ color: palette.textTertiary }}>{label}</Text>
                    <View style={{ position: 'absolute', left: 74, right: 6, top: SLOT_HEIGHT / 2, height: 1, backgroundColor: i % 4 === 0 ? 'rgba(214,235,253,0.18)' : 'rgba(214,235,253,0.08)' }} />
                  </View>
                ))}
                {dayBlocks.map((block) => (
                  <PlannerBlock key={block.id} block={block} onDrop={handleDrop} onOpen={(b) => { setSelectedBlock(b); setShowBlockModal(true); }} />
                ))}
              </View>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3">
                {weekSummary.map((day, idx) => (
                  <View key={day.label} className="w-[240px] rounded-[16px] p-3" style={{ borderWidth: 1, borderColor: idx === selectedDay ? `${palette.primary}80` : palette.border, backgroundColor: palette.surface }}>
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
      </Animated.View>

      <Modal visible={showCalendarModal} transparent animationType="fade" onRequestClose={() => setShowCalendarModal(false)}>
        <View className="flex-1 items-center justify-center p-5" style={{ backgroundColor: palette.overlay }}>
          <Pressable className="absolute inset-0" onPress={() => setShowCalendarModal(false)} />
          <View className="w-full max-w-[520px] rounded-[20px] p-5" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.modalBackground }}>
            <View className="flex-row items-center justify-between">
              <Pressable onPress={() => setViewMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="rounded-full border px-3 py-1.5" style={{ borderColor: palette.borderStrong }}>
                <Text className="font-mono text-[10px]" style={{ color: palette.textPrimary }}>Prev</Text>
              </Pressable>
              <Text className="font-section text-[20px]" style={{ color: palette.textPrimary }}>{MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}</Text>
              <Pressable onPress={() => setViewMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="rounded-full border px-3 py-1.5" style={{ borderColor: palette.borderStrong }}>
                <Text className="font-mono text-[10px]" style={{ color: palette.textPrimary }}>Next</Text>
              </Pressable>
            </View>
            <View className="mt-4 flex-row justify-between">
              {WEEK_DAYS.map((d) => (
                <Text key={d} className="w-[13%] text-center font-mono text-[10px]" style={{ color: palette.textSecondary }}>{d}</Text>
              ))}
            </View>
            <View className="mt-2 flex-row flex-wrap">
              {calendarCells.map((cell, idx) => (
                <View key={`cell-${idx}`} className="w-[14.285%] p-1">
                  {cell ? (
                    <Pressable
                      onPress={() => {
                        setSelectedDate(cell.date);
                        setShowCalendarModal(false);
                      }}
                      className={clsx(
                        'items-center rounded-[10px] py-2',
                        cell.date.toDateString() === selectedDate.toDateString() ? 'bg-[#4ea4ff33]' : 'bg-[rgba(23,26,29,0.72)]'
                      )}
                      style={{ borderWidth: 1, borderColor: cell.date.toDateString() === selectedDate.toDateString() ? 'rgba(78,164,255,0.7)' : 'rgba(214,235,253,0.14)' }}
                    >
                      <Text className="font-mono text-[10px]" style={{ color: cell.date.toDateString() === selectedDate.toDateString() ? palette.primary : palette.textPrimary }}>{cell.day}</Text>
                    </Pressable>
                  ) : (
                    <View className="py-2" />
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showBlockModal} transparent animationType="fade" onRequestClose={() => setShowBlockModal(false)}>
        <View className="flex-1 items-center justify-center p-5" style={{ backgroundColor: palette.overlay }}>
          <Pressable className="absolute inset-0" onPress={() => setShowBlockModal(false)} />
          {selectedBlock ? (
            <View className="w-full max-w-[480px] rounded-[20px] p-5" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.modalBackground }}>
              <Text className="font-mono text-[10px] uppercase" style={{ color: palette.primary }}>{WEEK_DAYS[selectedBlock.day]}</Text>
              <Text className="mt-1 font-section text-[24px]" style={{ color: palette.textPrimary }}>{selectedBlock.title}</Text>
              <Text className="mt-1 font-body text-[13px]" style={{ color: palette.textSecondary }}>{toClock(selectedBlock.startSlot)} - {toClock(selectedBlock.startSlot + selectedBlock.durationSlots)} - {selectedBlock.category}</Text>
              <View className="mt-4 flex-row gap-2">
                <Pressable onPress={() => toggleDone(selectedBlock.id)} className="rounded-full bg-[#4ea4ff] px-4 py-2.5">
                  <Text className="font-body text-[12px] text-[#001b32]">{selectedBlock.done ? 'Mark Pending' : 'Mark Done'}</Text>
                </Pressable>
                <Pressable onPress={() => { setBlocks((prev) => prev.filter((b) => b.id !== selectedBlock.id)); setShowBlockModal(false); }} className="rounded-full border border-[#ff716c55] px-4 py-2.5">
                  <Text className="font-body text-[12px] text-[#ff716c]">Delete</Text>
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
            <Text className="mt-1 font-section text-[20px]" style={{ color: palette.textPrimary }}>{toDateLabel(selectedDate)}</Text>
            <View className="mt-4 gap-2">
              <TextInput value={newTitle} onChangeText={setNewTitle} placeholder="Session title" placeholderTextColor="#6f767a" className="rounded-full border border-white/20 bg-[#0f1113] px-4 py-2.5 text-white" />
              <View className="flex-row gap-2">
                <TextInput value={newStart} onChangeText={setNewStart} placeholder="Start HH:MM" placeholderTextColor="#6f767a" className="flex-1 rounded-full border border-white/20 bg-[#0f1113] px-4 py-2.5 text-white" />
                <TextInput value={newDuration} onChangeText={setNewDuration} placeholder="Duration min" placeholderTextColor="#6f767a" keyboardType="number-pad" className="flex-1 rounded-full border border-white/20 bg-[#0f1113] px-4 py-2.5 text-white" />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {(['focus', 'revision', 'practice', 'break'] as const).map((c) => (
                    <Pressable key={c} onPress={() => setNewCategory(c)} className={clsx('rounded-full border px-3 py-1.5', newCategory === c ? 'bg-[#4ea4ff20]' : '')} style={{ borderColor: 'rgba(214,235,253,0.25)' }}>
                      <Text className="font-mono text-[10px] uppercase" style={{ color: palette.textPrimary }}>{c}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
            <Pressable onPress={addSession} className="mt-4 self-start rounded-full bg-[#4ea4ff] px-4 py-2.5">
              <Text className="font-body text-[12px] text-[#001b32]">Create Session</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}




