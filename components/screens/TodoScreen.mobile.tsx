import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import PageScroll from '@/components/ui/PageScroll';
import ScreenIntro from '@/components/ui/ScreenIntro';
import TaskDetailModalMobile from '@/components/modals/TaskDetailModalMobile';
import { useAppTheme } from '@/lib/theme';
import { type TodoItem, useAppState } from '@/lib/app-state';

export default function TodoMobileScreen() {
  const { palette } = useAppTheme();
  const { todos } = useAppState();
  const { height } = useWindowDimensions();
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'doing' | 'completed'>('all');
  const [selectedTask, setSelectedTask] = useState<TodoItem | null>(null);

  const filtered = useMemo(() => {
    const list = statusFilter === 'all' ? todos : todos.filter((t) => t.status === statusFilter);
    return [...list].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [todos, statusFilter]);

  return (
    <SafeAreaView className="min-h-0 flex-1" style={{ backgroundColor: palette.background }}>
      <PageScroll>
        <ScreenIntro title="Tasks" description="Compact mobile list with status filters." compact />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
          <View className="flex-row gap-2">
            {(['all', 'todo', 'doing', 'completed'] as const).map((status) => (
              <Pressable key={status} onPress={() => setStatusFilter(status)} className="rounded-full px-3 py-1.5" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: statusFilter === status ? palette.primarySoft : palette.surface }}>
                <Text className="font-mono text-[10px] uppercase" style={{ color: statusFilter === status ? palette.primary : palette.textSecondary }}>{status}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View className="mt-4 gap-3">
          {filtered.map((task) => (
            <Pressable key={task.id} onPress={() => setSelectedTask(task)} className="rounded-[14px] p-4" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface }}>
              <Text className="font-body text-[14px]" style={{ color: palette.textPrimary }}>{task.title}</Text>
              <Text className="mt-1 font-mono text-[10px]" style={{ color: palette.textTertiary }}>{task.subject ?? 'General'} | {task.priority} | {task.status}</Text>
              <Text className="mt-1 font-mono text-[10px]" style={{ color: palette.textTertiary }}>
                Due {task.dueDate.slice(0, 10)} | Subtasks {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length || 0}
              </Text>
            </Pressable>
          ))}
        </View>
      </PageScroll>

      <TaskDetailModalMobile
        visible={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        height={height}
        data={selectedTask ? { id: selectedTask.id, title: selectedTask.title, priorityLabel: `${selectedTask.priority} Priority`, subject: selectedTask.subject ?? 'General', chapter: selectedTask.sectionId ?? 'Section', deadlineDate: selectedTask.dueDate.slice(0, 10), deadlineTime: selectedTask.dueDate.slice(11, 16), checklist: selectedTask.subtasks.map((s) => ({ id: s.id, label: s.title, completed: s.completed })) } : undefined}
      />
    </SafeAreaView>
  );
}
