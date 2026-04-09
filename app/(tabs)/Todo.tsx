import React, { ReactNode, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, SafeAreaView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import TaskDetailModalDesktop from '@/components/modals/TaskDetailModalDesktop';
import TaskDetailModalMobile from '@/components/modals/TaskDetailModalMobile';
import PageScroll from '@/components/ui/PageScroll';
import { useAppTheme } from '@/lib/theme';

type TaskItem = {
  id: string;
  title: string;
  status: 'todo' | 'completed';
  priority: 'High' | 'Medium' | 'Low';
  subject?: string;
  chapter?: string;
  subtopic?: string;
  deadline?: string;
  subtasks: { id: string; title: string; completed: boolean }[];
};

const MOCK_TASKS: TaskItem[] = [
  {
    id: '1',
    title: 'Deep Work Session: UI Architecture',
    status: 'todo',
    priority: 'High',
    subject: 'Design',
    chapter: 'Ch 04',
    subtopic: 'Porting Web to Mobile',
    subtasks: [
      { id: '1-1', title: 'Setup Google Fonts', completed: true },
      { id: '1-2', title: 'Configure NativeWind Theme', completed: true },
      { id: '1-3', title: 'Implement Task Cards', completed: false },
    ],
  },
  {
    id: '2',
    title: 'Review System Logs',
    status: 'completed',
    priority: 'Medium',
    subject: 'DevOps',
    subtasks: [],
  },
  {
    id: '3',
    title: 'Prepare Weekly Sprint Plan',
    status: 'todo',
    priority: 'High',
    subject: 'Management',
    deadline: '2024-04-09T09:00',
    subtasks: [
      { id: '3-1', title: 'Gather team updates', completed: false },
      { id: '3-2', title: 'Define key objectives', completed: false },
    ],
  },
];

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

function TaskCard({
  task,
  onOpenDetails,
}: {
  task: TaskItem;
  onOpenDetails: (task: TaskItem) => void;
}) {
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
  const cardText = isCompleted ? palette.textSecondary : palette.textPrimary;

  return (
    <View
      className="relative mb-4 overflow-hidden rounded-[16px] p-5"
      style={{
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: cardBg,
        opacity: isCompleted ? 0.82 : 1,
      }}
    >
      <View className="absolute left-0 top-0 h-[2px]" style={{ width: `${progress}%`, backgroundColor: palette.primary }} />

      <View className="flex-row items-start gap-4">
        <Pressable
          className="mt-1 h-5 w-5 items-center justify-center rounded-[4px] border"
          style={{
            borderColor: isCompleted ? palette.primary : palette.borderStrong,
            backgroundColor: isCompleted ? palette.primary : 'transparent',
          }}
        >
          {isCompleted && <Ionicons name="checkmark" size={12} color={palette.dark ? '#0e0e0e' : '#ffffff'} />}
        </Pressable>

        <View className="flex-1">
          <Text
            className={clsx('mb-2 font-section text-[18px] leading-6 tracking-tight', isCompleted && 'line-through')}
            style={{ color: cardText }}
          >
            {task.title}
          </Text>

          <View className="mb-3 flex-row flex-wrap gap-2">
            {task.subject && <Badge variant="subject">{task.subject}</Badge>}
            <Badge variant={task.priority}>{task.priority} Priority</Badge>
            <Pressable
              onPress={() => onOpenDetails(task)}
              className="rounded-full border px-2 py-0.5"
              style={{ borderColor: palette.borderStrong, backgroundColor: palette.surfaceAlt }}
            >
              <Text className="font-mono text-[10px]" style={{ color: palette.textSecondary }}>
                Open Details
              </Text>
            </Pressable>
          </View>

          {(task.chapter || task.subtopic || task.deadline) && (
            <View className="mt-1 flex-row flex-wrap border-t pt-3" style={{ borderTopColor: palette.border }}>
              {task.chapter && (
                <View className="mb-2 mr-4">
                  <Text className="font-mono text-[9px] uppercase" style={{ color: palette.textTertiary }}>
                    Chapter
                  </Text>
                  <Text className="font-body text-[12px]" style={{ color: palette.textSecondary }}>
                    {task.chapter}
                  </Text>
                </View>
              )}
              {task.deadline && (
                <View>
                  <Text className="font-mono text-[9px] uppercase" style={{ color: palette.textTertiary }}>
                    Deadline
                  </Text>
                  <Text className="font-mono text-[11px]" style={{ color: palette.danger }}>
                    {task.deadline.replace('T', ' ')}
                  </Text>
                </View>
              )}
            </View>
          )}

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
                      <View
                        className="h-3 w-3 rounded-[2px] border"
                        style={{
                          borderColor: subtask.completed ? palette.primary : palette.borderStrong,
                          backgroundColor: subtask.completed ? palette.primary : 'transparent',
                        }}
                      >
                        {subtask.completed && <Ionicons name="checkmark" size={8} color={palette.dark ? '#0e0e0e' : '#ffffff'} />}
                      </View>
                      <Text
                        className={clsx('font-body text-[13px]', subtask.completed && 'line-through')}
                        style={{ color: subtask.completed ? palette.textTertiary : palette.textSecondary }}
                      >
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

export default function TodoScreen() {
  const { palette } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const [filter, setFilter] = useState('all');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  const stats = useMemo(() => {
    const pending = MOCK_TASKS.filter((t) => t.status !== 'completed').length;
    const urgent = MOCK_TASKS.filter((t) => t.priority === 'High' && t.status !== 'completed').length;
    return { pending, urgent };
  }, []);

  const filteredTasks = useMemo(() => {
    let result = [...MOCK_TASKS];
    if (filter === 'todo') result = result.filter((t) => t.status !== 'completed');
    if (filter === 'completed') result = result.filter((t) => t.status === 'completed');
    return result;
  }, [filter]);

  const handleOpenDetails = (task: TaskItem) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  return (
    <SafeAreaView className="min-h-0 flex-1" style={{ backgroundColor: palette.background }}>
      <PageScroll>
        <View className="mb-10">
          <Text className="mb-1 font-mono text-[10px] uppercase tracking-[1.2px]" style={{ color: palette.primary }}>
            Produve
          </Text>
          <Text className="mb-2 font-display text-[56px] leading-none tracking-tighter" style={{ color: palette.textPrimary }}>
            Overview
          </Text>
          <Text className="max-w-[280px] font-section text-[16px] leading-tight" style={{ color: palette.textSecondary }}>
            Track and manage your deep work sessions in the nocturnal grid.
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 flex-row gap-3">
          <View className="mr-3 flex-row items-center rounded-full px-4 py-2" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface }}>
            <View className="mr-3 h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: `${palette.primary}33` }}>
              <Ionicons name="list" size={14} color={palette.primary} />
            </View>
            <View className="flex-row items-center gap-1">
              <Text className="font-mono text-[14px]" style={{ color: palette.textPrimary }}>{stats.pending}</Text>
              <Text className="font-body text-[12px]" style={{ color: palette.textSecondary }}>Pending</Text>
            </View>
          </View>

          <View className="mr-3 flex-row items-center rounded-full px-4 py-2" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface }}>
            <View className="mr-3 h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: `${palette.danger}33` }}>
              <Ionicons name="flame" size={14} color={palette.danger} />
            </View>
            <View className="flex-row items-center gap-1">
              <Text className="font-mono text-[14px]" style={{ color: palette.textPrimary }}>{stats.urgent}</Text>
              <Text className="font-body text-[12px]" style={{ color: palette.textSecondary }}>Urgent</Text>
            </View>
          </View>
        </ScrollView>

        <View className="mb-8 w-[260px] flex-row rounded-full p-1" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surfaceAlt }}>
          {['all', 'todo', 'completed'].map((f) => {
            const active = filter === f;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                className="flex-1 items-center justify-center rounded-full py-1.5"
                style={{ backgroundColor: active ? palette.primarySoft : 'transparent' }}
              >
                <Text className="font-body text-[13px] capitalize" style={{ color: active ? palette.primary : palette.textSecondary }}>
                  {f}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View>
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} onOpenDetails={handleOpenDetails} />
          ))}
        </View>
      </PageScroll>

      {isDesktop ? (
        <TaskDetailModalDesktop
          visible={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          width={width}
          height={height}
          data={
            selectedTask
              ? {
                  id: `TASK-${selectedTask.id.padStart(4, '0')}`,
                  title: selectedTask.title,
                  priorityLabel:
                    selectedTask.priority === 'High'
                      ? 'High Priority'
                      : `${selectedTask.priority} Priority`,
                  subject: selectedTask.subject ?? 'Design Systems',
                  chapter: selectedTask.chapter ?? 'Visual Physics',
                }
              : undefined
          }
        />
      ) : (
        <TaskDetailModalMobile
          visible={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          height={height}
          data={
            selectedTask
              ? {
                  id: `TASK-${selectedTask.id.padStart(4, '0')}`,
                  title: selectedTask.title,
                  priorityLabel:
                    selectedTask.priority === 'High'
                      ? 'High Priority'
                      : `${selectedTask.priority} Priority`,
                  subject: selectedTask.subject ?? 'Design Systems',
                  chapter: selectedTask.chapter ?? 'Visual Physics',
                }
              : undefined
          }
        />
      )}
    </SafeAreaView>
  );
}
