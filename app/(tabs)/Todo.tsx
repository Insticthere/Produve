import React, { ReactNode, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, SafeAreaView, useWindowDimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import TaskDetailModalDesktop from '@/components/modals/TaskDetailModalDesktop';
import TaskDetailModalMobile from '@/components/modals/TaskDetailModalMobile';
import PageScroll from '@/components/ui/PageScroll';
import ScreenIntro from '@/components/ui/ScreenIntro';
import { useAppTheme } from '@/lib/theme';
import { type TodoItem, useAppState } from '@/lib/app-state';
import TodoMobileScreen from '@/components/screens/TodoScreen.mobile';

type ViewMode = 'list' | 'table' | 'board';

function Badge({ children, variant }: { children: ReactNode; variant: string }) {
  const { palette } = useAppTheme();
  const isSubject = variant === 'subject';
  const isHigh = variant === 'High';

  const borderColor = isSubject ? `${palette.primary}66` : isHigh ? `${palette.danger}66` : `${palette.primary}44`;
  const backgroundColor = isSubject ? `${palette.primary}1f` : isHigh ? `${palette.danger}1f` : palette.primarySoft;
  const color = isSubject ? palette.primary : isHigh ? palette.danger : palette.textSecondary;

  return (
    <View className="rounded-full border px-2 py-0.5" style={{ borderColor, backgroundColor }}>
      <Text className="font-mono text-[10px]" style={{ color }}>
        {children}
      </Text>
    </View>
  );
}

function TaskCard({ task, onOpenDetails }: { task: TodoItem; onOpenDetails: (task: TodoItem) => void }) {
  const { palette } = useAppTheme();
  const [expanded, setExpanded] = useState(false);
  const isCompleted = task.status === 'completed';

  const progress =
    task.subtasks.length > 0
      ? (task.subtasks.filter((st) => st.completed).length / task.subtasks.length) * 100
      : isCompleted
      ? 100
      : 0;

  const cardBg = isCompleted ? palette.surfaceAlt : palette.surface;

  return (
    <View className="relative mb-4 overflow-hidden rounded-[16px] p-5" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: cardBg, opacity: isCompleted ? 0.82 : 1 }}>
      <View className="absolute left-0 top-0 h-[2px]" style={{ width: `${progress}%`, backgroundColor: palette.primary }} />

      <View className="flex-row items-start gap-4">
        <View className="mt-1 h-5 w-5 items-center justify-center rounded-[4px] border" style={{ borderColor: isCompleted ? palette.primary : palette.borderStrong, backgroundColor: isCompleted ? palette.primary : 'transparent' }}>
          {isCompleted && <Ionicons name="checkmark" size={12} color={palette.dark ? '#0e0e0e' : '#ffffff'} />}
        </View>

        <View className="flex-1">
          <Text className={clsx('mb-2 font-section text-[18px] leading-6 tracking-tight', isCompleted && 'line-through')} style={{ color: isCompleted ? palette.textSecondary : palette.textPrimary }}>{task.title}</Text>

          <View className="mb-3 flex-row flex-wrap gap-2">
            {task.subject && <Badge variant="subject">{task.subject}</Badge>}
            <Badge variant={task.priority}>{task.priority} Priority</Badge>
            <Pressable onPress={() => onOpenDetails(task)} className="rounded-full border px-2 py-0.5" style={{ borderColor: palette.borderStrong, backgroundColor: palette.surfaceAlt }}>
              <Text className="font-mono text-[10px]" style={{ color: palette.textSecondary }}>Open Details</Text>
            </Pressable>
          </View>

          <View className="mt-1 flex-row flex-wrap border-t pt-3" style={{ borderTopColor: palette.border }}>
            <View className="mb-2 mr-4">
              <Text className="font-mono text-[10px] uppercase" style={{ color: palette.textTertiary }}>Due</Text>
              <Text className="font-body text-[12px]" style={{ color: palette.textSecondary }}>{task.dueDate.replace('T', ' ')}</Text>
            </View>
          </View>

          {task.subtasks.length > 0 && (
            <View className="mt-2 border-t pt-3" style={{ borderTopColor: palette.border }}>
              <Pressable onPress={() => setExpanded(!expanded)} className="flex-row items-center justify-between">
                <Text className="font-body text-[12px]" style={{ color: palette.textSecondary }}>
                  Subtasks ({task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length})
                </Text>
                <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={palette.textSecondary} />
              </Pressable>

              {expanded && (
                <View className="mt-3 gap-2">
                  {task.subtasks.map((subtask) => (
                    <View key={subtask.id} className="flex-row items-center gap-3">
                      <View className="h-3 w-3 rounded-[2px] border" style={{ borderColor: subtask.completed ? palette.primary : palette.borderStrong, backgroundColor: subtask.completed ? palette.primary : 'transparent' }}>
                        {subtask.completed && <Ionicons name="checkmark" size={8} color={palette.dark ? '#0e0e0e' : '#ffffff'} />}
                      </View>
                      <Text className={clsx('font-body text-[13px]', subtask.completed && 'line-through')} style={{ color: subtask.completed ? palette.textTertiary : palette.textSecondary }}>
                        {subtask.title}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

function TodoTable({ items, onOpenDetails }: { items: TodoItem[]; onOpenDetails: (task: TodoItem) => void }) {
  const { palette } = useAppTheme();

  return (
    <View className="overflow-hidden rounded-[16px]" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface }}>
      <View className="flex-row px-3 py-2" style={{ borderBottomWidth: 1, borderBottomColor: palette.border }}>
        {['Task', 'Subject', 'Priority', 'Status', 'Due', 'Progress'].map((h) => (
          <Text key={h} className="flex-1 font-mono text-[10px] uppercase" style={{ color: palette.textSecondary }}>{h}</Text>
        ))}
      </View>
      {items.map((task) => {
        const done = task.subtasks.filter((st) => st.completed).length;
        const total = task.subtasks.length;
        return (
          <Pressable
            key={task.id}
            onPress={() => onOpenDetails(task)}
            className="flex-row px-3 py-3"
            style={{ borderBottomWidth: 1, borderBottomColor: palette.border }}
          >
            <Text className="flex-1 font-body text-[12px]" style={{ color: palette.textPrimary }}>{task.title}</Text>
            <Text className="flex-1 font-body text-[12px]" style={{ color: palette.textSecondary }}>{task.subject ?? '-'}</Text>
            <Text className="flex-1 font-body text-[12px]" style={{ color: task.priority === 'High' ? palette.danger : palette.textSecondary }}>{task.priority}</Text>
            <Text className="flex-1 font-body text-[12px]" style={{ color: task.status === 'completed' ? palette.success : palette.textSecondary }}>{task.status}</Text>
            <Text className="flex-1 font-mono text-[10px]" style={{ color: palette.textSecondary }}>{task.dueDate.slice(0, 10)}</Text>
            <Text className="flex-1 font-body text-[12px]" style={{ color: palette.textSecondary }}>{total ? `${done}/${total}` : '-'}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function TodoBoard({ items, onOpenDetails }: { items: TodoItem[]; onOpenDetails: (task: TodoItem) => void }) {
  const { palette } = useAppTheme();
  const columns: Array<{ key: TodoItem['status']; label: string }> = [
    { key: 'todo', label: 'Todo' },
    { key: 'doing', label: 'Doing' },
    { key: 'completed', label: 'Done' },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row gap-3">
        {columns.map((col) => {
          const colItems = items.filter((i) => i.status === col.key);
          return (
            <View key={col.key} className="w-[320px] rounded-[16px] p-3" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface }}>
              <Text className="font-mono text-[10px] uppercase" style={{ color: palette.textSecondary }}>{col.label}</Text>
              <View className="mt-2 gap-2">
                {colItems.length ? (
                  colItems.map((task) => (
                    <Pressable key={task.id} onPress={() => onOpenDetails(task)} className="rounded-[12px] p-3" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surfaceAlt }}>
                      <Text className="font-body text-[13px]" style={{ color: palette.textPrimary }}>{task.title}</Text>
                      <View className="mt-1 flex-row flex-wrap gap-2">
                        <Badge variant="subject">{task.subject ?? 'General'}</Badge>
                        <Badge variant={task.priority}>{task.priority}</Badge>
                      </View>
                      <Text className="mt-1 font-mono text-[10px]" style={{ color: palette.textTertiary }}>Due {task.dueDate.slice(0, 10)} | {task.status.toUpperCase()}</Text>
                      <View className="mt-2 h-1.5 rounded-full" style={{ backgroundColor: palette.surface }}>
                        <View
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${task.subtasks.length ? Math.round((task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100) : task.status === 'completed' ? 100 : 0}%`,
                            backgroundColor: palette.primary,
                          }}
                        />
                      </View>
                      <Text className="font-mono text-[10px]" style={{ color: palette.textTertiary }}>
                        Subtasks {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length || 0}
                      </Text>
                    </Pressable>
                  ))
                ) : (
                  <Text className="font-body text-[12px]" style={{ color: palette.textTertiary }}>No tasks</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

export default function TodoScreen() {
  if (Platform.OS !== 'web') {
    return <TodoMobileScreen />;
  }

  const { palette } = useAppTheme();
  const { todos } = useAppState();
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'doing' | 'completed'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TodoItem | null>(null);

  const filteredTasks = useMemo(() => {
    let result = [...todos];
    if (statusFilter !== 'all') result = result.filter((t) => t.status === statusFilter);
    return result.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [todos, statusFilter]);

  const stats = useMemo(() => {
    const pending = todos.filter((t) => t.status !== 'completed').length;
    const urgent = todos.filter((t) => t.priority === 'High' && t.status !== 'completed').length;
    return { pending, urgent };
  }, [todos]);

  const openDetails = (task: TodoItem) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  return (
    <SafeAreaView className="min-h-0 flex-1" style={{ backgroundColor: palette.background }}>
      <PageScroll>
        <ScreenIntro
          title="Tasks"
          description="List, table, and board tracking with richer task cards."
          className="mb-8"
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 flex-row gap-3">
          <View className="mr-3 flex-row items-center rounded-full px-4 py-2" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface }}>
            <View className="mr-3 h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: `${palette.primary}33` }}>
              <Ionicons name="list" size={14} color={palette.primary} />
            </View>
            <Text className="font-body text-[12px]" style={{ color: palette.textSecondary }}>{stats.pending} Pending</Text>
          </View>
          <View className="mr-3 flex-row items-center rounded-full px-4 py-2" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface }}>
            <View className="mr-3 h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: `${palette.danger}33` }}>
              <Ionicons name="flame" size={14} color={palette.danger} />
            </View>
            <Text className="font-body text-[12px]" style={{ color: palette.textSecondary }}>{stats.urgent} Urgent</Text>
          </View>
        </ScrollView>

        <View className="mb-6 flex-row flex-wrap items-center gap-2">
          {(['all', 'todo', 'doing', 'completed'] as const).map((f) => (
            <Pressable key={f} onPress={() => setStatusFilter(f)} className="rounded-full px-3 py-1.5" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: statusFilter === f ? palette.primarySoft : palette.surface }}>
              <Text className="font-mono text-[10px] uppercase" style={{ color: statusFilter === f ? palette.primary : palette.textSecondary }}>{f}</Text>
            </Pressable>
          ))}

          {isDesktop && (
            <View className="ml-auto flex-row gap-2">
              {(['list', 'table', 'board'] as const).map((v) => (
                <Pressable key={v} onPress={() => setViewMode(v)} className="rounded-full px-3 py-1.5" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: viewMode === v ? palette.primarySoft : palette.surface }}>
                  <Text className="font-mono text-[10px] uppercase" style={{ color: viewMode === v ? palette.primary : palette.textSecondary }}>{v}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View className="gap-6">
          {isDesktop && viewMode === 'table' ? (
            <TodoTable items={filteredTasks} onOpenDetails={openDetails} />
          ) : isDesktop && viewMode === 'board' ? (
            <TodoBoard items={filteredTasks} onOpenDetails={openDetails} />
          ) : (
            <View>
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} onOpenDetails={openDetails} />
              ))}
            </View>
          )}
        </View>
      </PageScroll>

      {isDesktop ? (
        <TaskDetailModalDesktop
          visible={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          width={width}
          height={height}
          data={selectedTask ? { id: selectedTask.id, title: selectedTask.title, priorityLabel: `${selectedTask.priority} Priority`, subject: selectedTask.subject ?? 'General', chapter: selectedTask.sectionId ?? 'Section', deadlineDate: selectedTask.dueDate.slice(0, 10), deadlineTime: selectedTask.dueDate.slice(11, 16), checklist: selectedTask.subtasks.map((s) => ({ id: s.id, label: s.title, completed: s.completed })) } : undefined}
        />
      ) : (
        <TaskDetailModalMobile
          visible={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          height={height}
          data={selectedTask ? { id: selectedTask.id, title: selectedTask.title, priorityLabel: `${selectedTask.priority} Priority`, subject: selectedTask.subject ?? 'General', chapter: selectedTask.sectionId ?? 'Section', deadlineDate: selectedTask.dueDate.slice(0, 10), deadlineTime: selectedTask.dueDate.slice(11, 16), checklist: selectedTask.subtasks.map((s) => ({ id: s.id, label: s.title, completed: s.completed })) } : undefined}
        />
      )}
    </SafeAreaView>
  );
}

