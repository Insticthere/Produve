import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import { showToast } from '@/lib/toast';
import { useAppTheme } from '@/lib/theme';

type ChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
};

type TimelineItem = {
  id: string;
  time: string;
  label: string;
  active?: boolean;
};

export type TaskDetailModalData = {
  id: string;
  priorityLabel: string;
  title: string;
  description: string;
  subject: string;
  chapter: string;
  deadlineDate: string;
  deadlineTime: string;
  checklist: ChecklistItem[];
  timeline: TimelineItem[];
};

type TaskDetailModalProps = {
  visible: boolean;
  onClose: () => void;
  width: number;
  height: number;
  data?: Partial<TaskDetailModalData>;
};

const DEFAULT_DATA: TaskDetailModalData = {
  id: 'TASK-0824',
  priorityLabel: 'High Priority',
  title: 'Architectural Lighting Study',
  description:
    'Finalize the luminosity mapping for the central atrium. Focus on the transition between dusk and full nocturnal state.',
  subject: 'Design Systems',
  chapter: 'Visual Physics',
  deadlineDate: 'Aug 24',
  deadlineTime: '22:00',
  checklist: [
    { id: 'c1', label: 'Verify lumen output per tile', completed: true },
    { id: 'c2', label: 'Adjust frost opacity levels', completed: false },
    { id: 'c3', label: 'Final render validation', completed: false },
  ],
  timeline: [
    { id: 't1', time: '09:00', label: 'Shift Commenced' },
    { id: 't2', time: '14:00', label: 'In-Depth Review', active: true },
    { id: 't3', time: '18:00', label: 'Archive & Log' },
  ],
};

export default function TaskDetailModalDesktop({
  visible,
  onClose,
  width,
  height,
  data,
}: TaskDetailModalProps) {
  const { palette } = useAppTheme();
  const task = { ...DEFAULT_DATA, ...data };
  const [subtaskDraft, setSubtaskDraft] = useState('');
  const [localChecklist, setLocalChecklist] = useState<ChecklistItem[]>(task.checklist);

  useEffect(() => {
    setLocalChecklist(task.checklist);
    setSubtaskDraft('');
  }, [visible, task.id, task.checklist]);

  const completedCount = useMemo(
    () => localChecklist.filter((item) => item.completed).length,
    [localChecklist]
  );

  const handleAddSubtask = () => {
    const title = subtaskDraft.trim();
    if (!title) return;
    setLocalChecklist((prev) => [...prev, { id: `local-${Date.now()}`, label: title, completed: false }]);
    setSubtaskDraft('');
    showToast('Subtask added');
  };

  const toggleSubtask = (id: string) => {
    setLocalChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center p-2" style={{ backgroundColor: palette.overlay }}>
        <Pressable className="absolute inset-0" onPress={onClose} />

        <View
          className="overflow-hidden rounded-[24px]"
          style={{
            width: Math.min(width - 48, 1120),
            maxHeight: height - 80,
            borderWidth: 1,
            borderColor: palette.borderStrong,
            backgroundColor: palette.modalBackground,
            shadowColor: '#000',
            shadowOpacity: 0.35,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 8 },
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: -28,
              right: -28,
              width: 180,
              height: 180,
              borderRadius: 999,
              backgroundColor: palette.primarySoft,
            }}
          />
          <SafeAreaView className="flex-1" style={{ backgroundColor: palette.surface }}>
            <View
              className="h-14 flex-row items-center justify-between px-6"
              style={{
                borderBottomWidth: 1,
                borderBottomColor: palette.border,
                backgroundColor: palette.surfaceAlt,
              }}
            >
              <Text className="font-section text-[20px] tracking-[0.2px]" style={{ color: palette.textPrimary }}>Task Details</Text>
              <Pressable onPress={onClose} className="items-center justify-center px-1 py-1">
                <Ionicons name="close" size={18} color={palette.textPrimary} />
              </Pressable>
            </View>

            <View className="flex-1 flex-row">
              <ScrollView
                className="flex-1"
                style={{ borderRightWidth: 1, borderRightColor: palette.border, backgroundColor: palette.surface }}
                showsVerticalScrollIndicator={false}
              >
                <View className="p-[22px]">
                  <View className="mb-3.5 flex-row items-center gap-3">
                    <Text className="rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.6px]" style={{ borderWidth: 1, borderColor: `${palette.danger}66`, backgroundColor: `${palette.danger}1f`, color: palette.danger }}>
                      {task.priorityLabel}
                    </Text>
                    <Text className="font-mono text-[11px] tracking-[0.8px]" style={{ color: palette.textSecondary }}>{task.id}</Text>
                  </View>

                  <Text className="mb-4 font-display text-[36px] leading-[40px]" style={{ color: palette.textPrimary }}>{task.title}</Text>

                  <Text className="mb-2 font-mono text-[10px] uppercase tracking-[1.2px]" style={{ color: palette.textSecondary }}>
                    Description
                  </Text>
                  <Text className="mb-5 font-body text-[14px] leading-[22px]" style={{ color: palette.textSecondary }}>{task.description}</Text>

                  <View className="mb-6 flex-row gap-5">
                    <View className="flex-1">
                      <Text className="mb-1.5 font-mono text-[10px] uppercase tracking-[1.2px]" style={{ color: palette.textSecondary }}>
                        Subject
                      </Text>
                      <Text className="font-body text-[14px]" style={{ color: palette.textPrimary }}>{task.subject}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="mb-1.5 font-mono text-[10px] uppercase tracking-[1.2px]" style={{ color: palette.textSecondary }}>
                        Chapter
                      </Text>
                      <Text className="font-body text-[14px]" style={{ color: palette.textPrimary }}>{task.chapter}</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-3 pt-1">
                    <Pressable onPress={() => showToast('Task marked complete')} className="rounded-full px-4 py-[11px]" style={{ backgroundColor: palette.primary }}>
                      <Text className="font-body text-[13px]" style={{ color: palette.dark ? '#001b32' : '#ffffff' }}>Mark Complete</Text>
                    </Pressable>
                    <Pressable className="flex-row items-center gap-1.5 rounded-full px-3 py-2" style={{ borderWidth: 1, borderColor: `${palette.danger}55` }}>
                      <Ionicons name="trash-outline" size={14} color={palette.danger} />
                      <Text className="font-body text-[12px]" style={{ color: palette.danger }}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              </ScrollView>

              <ScrollView className="w-[360px] bg-[rgba(25,25,25,0.74)]" showsVerticalScrollIndicator={false}>
                <View className="gap-[18px] p-5">
                  <View
                    className="rounded-[16px] p-4"
                    style={{
                      borderWidth: 1,
                      borderColor: 'rgba(214,235,253,0.24)',
                      backgroundColor: 'rgba(38,38,38,0.74)',
                    }}
                  >
                    <Text className="mb-1.5 font-mono text-[10px] uppercase tracking-[1.2px] text-void-text-secondary">
                      Deadline
                    </Text>
                    <View className="flex-row items-end gap-2">
                      <Text className="font-section text-[28px] text-void-text-primary">{task.deadlineDate}</Text>
                      <Text className="mb-0.5 font-mono text-[18px] text-[#ff716c]">{task.deadlineTime}</Text>
                    </View>
                  </View>

                  <View className="gap-2.5">
                    <View className="flex-row items-center justify-between">
                      <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-void-text-secondary">Subtasks</Text>
                      <Text className="font-mono text-[10px] text-[#70b1ff]">{completedCount}/{localChecklist.length}</Text>
                    </View>

                    <View className="gap-2.5">
                      {localChecklist.map((item) => (
                        <View key={item.id} className="flex-row items-center gap-2.5">
                          <Pressable
                            onPress={() => toggleSubtask(item.id)}
                            className={clsx('h-[18px] w-[18px] items-center justify-center rounded-[5px]', item.completed ? 'bg-[#70b1ff]' : '')}
                            style={{ borderWidth: 1, borderColor: item.completed ? '#70b1ff' : 'rgba(214,235,253,0.35)' }}
                          >
                            {item.completed && <Ionicons name="checkmark" size={12} color="#0e0e0e" />}
                          </Pressable>
                          <Text className="flex-1 font-body text-[13px] text-void-text-primary">{item.label}</Text>
                        </View>
                      ))}
                    </View>

                    <View className="mt-1 flex-row items-center gap-2">
                      <TextInput
                        value={subtaskDraft}
                        onChangeText={setSubtaskDraft}
                        placeholder="Add subtask for testing..."
                        placeholderTextColor="#6f767a"
                        className="flex-1 rounded-full border border-[rgba(214,235,253,0.28)] bg-[#111315] px-4 py-2.5 text-[13px] text-white"
                      />
                      <Pressable onPress={handleAddSubtask} className="h-[38px] items-center justify-center rounded-full bg-[#4ea4ff] px-4">
                        <Text className="font-body text-[12px] text-[#001b32]">Add</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}
