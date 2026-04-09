import React, { useMemo, useState, ReactNode } from 'react';
import { View, Text, ScrollView, Pressable, SafeAreaView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import TaskDetailModalDesktop from '@/components/modals/TaskDetailModalDesktop';
import TaskDetailModalMobile from '@/components/modals/TaskDetailModalMobile';
import PageScroll from '@/components/ui/PageScroll';

const MOCK_TASKS = [
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

const Badge = ({ children, variant }: { children: ReactNode; variant: string }) => {
  const isSubject = variant === 'subject';
  const isHigh = variant === 'High';

  return (
    <View
      className={clsx('rounded-full border px-2 py-0.5', isSubject ? 'border-[#4ea4ff66] bg-[#4ea4ff1f]' : isHigh ? 'border-[#ff716c66] bg-[#ff716c1f]' : 'border-[#ffb46e66] bg-[#ffb46e1f]')}
    >
      <Text className={clsx('font-mono text-[10px]', isSubject ? 'text-[#70b1ff]' : isHigh ? 'text-[#ff716c]' : 'text-[#ffb46e]')}>
        {children}
      </Text>
    </View>
  );
};

const TaskCard = ({
  task,
  onOpenDetails,
}: {
  task: typeof MOCK_TASKS[0];
  onOpenDetails: (task: typeof MOCK_TASKS[0]) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const isCompleted = task.status === 'completed';
  const progress =
    task.subtasks.length > 0 ? (task.subtasks.filter((st) => st.completed).length / task.subtasks.length) * 100 : isCompleted ? 100 : 0;

  return (
    <View
      className={clsx('relative mb-4 overflow-hidden rounded-[16px] bg-[rgba(19,19,19,0.78)] p-5', isCompleted && 'opacity-55')}
      style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.19)' }}
    >
      <View className="absolute left-0 top-0 h-[2px] bg-[#4ea4ff]" style={{ width: `${progress}%` }} />

      <View className="flex-row items-start gap-4">
        <Pressable
          className={clsx(
            'mt-1 h-5 w-5 items-center justify-center rounded-[4px] border',
            isCompleted ? 'border-[#70b1ff] bg-[#70b1ff]' : 'border-white/25'
          )}
        >
          {isCompleted && <Ionicons name="checkmark" size={12} color="#0e0e0e" />}
        </Pressable>

        <View className="flex-1">
          <Text className={clsx('mb-2 font-section text-[18px] leading-6 tracking-tight text-void-text-primary', isCompleted && 'line-through text-void-text-secondary')}>
            {task.title}
          </Text>

          <View className="mb-3 flex-row flex-wrap gap-2">
            {task.subject && <Badge variant="subject">{task.subject}</Badge>}
            <Badge variant={task.priority}>{task.priority} Priority</Badge>
            <Pressable
              onPress={() => onOpenDetails(task)}
              className="rounded-full border border-[rgba(214,235,253,0.28)] px-2 py-0.5"
            >
              <Text className="font-mono text-[10px] text-void-text-secondary">Open Details</Text>
            </Pressable>
          </View>

          {(task.chapter || task.subtopic || task.deadline) && (
            <View className="mt-1 flex-row flex-wrap border-t border-white/10 pt-3">
              {task.chapter && (
                <View className="mb-2 mr-4">
                  <Text className="font-mono text-[9px] uppercase text-void-text-tertiary">Chapter</Text>
                  <Text className="font-body text-[12px] text-void-text-secondary">{task.chapter}</Text>
                </View>
              )}
              {task.deadline && (
                <View>
                  <Text className="font-mono text-[9px] uppercase text-void-text-tertiary">Deadline</Text>
                  <Text className="font-mono text-[11px] text-[#ff716c]">{task.deadline.replace('T', ' ')}</Text>
                </View>
              )}
            </View>
          )}

          {task.subtasks.length > 0 && (
            <View className="mt-2 border-t border-white/10 pt-3">
              <Pressable onPress={() => setExpanded(!expanded)} className="flex-row items-center justify-between">
                <Text className="font-body text-[12px] text-void-text-secondary">
                  Subtasks ({task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length})
                </Text>
                <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color="#a1a4a5" />
              </Pressable>

              {expanded && (
                <View className="mt-3 gap-2">
                  {task.subtasks.map((subtask) => (
                    <View key={subtask.id} className="flex-row items-center gap-3">
                      <View
                        className={clsx(
                          'h-3 w-3 rounded-[2px] border',
                          subtask.completed ? 'border-[#70b1ff] bg-[#70b1ff]' : 'border-white/25'
                        )}
                      >
                        {subtask.completed && <Ionicons name="checkmark" size={8} color="#0e0e0e" />}
                      </View>
                      <Text className={clsx('font-body text-[13px]', subtask.completed ? 'text-void-text-tertiary line-through' : 'text-void-text-secondary')}>
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
};

export default function TodoScreen() {
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const [filter, setFilter] = useState('all');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<(typeof MOCK_TASKS)[0] | null>(null);

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

  const handleOpenDetails = (task: (typeof MOCK_TASKS)[0]) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  return (
    <SafeAreaView className="min-h-0 flex-1 bg-[#0e0e0e]">
      <PageScroll>
        <View className="mb-10">
          <Text className="mb-1 font-mono text-[10px] uppercase tracking-[1.2px] text-[#70b1ff]">Produve</Text>
          <Text className="mb-2 font-display text-[56px] leading-none tracking-tighter text-void-text-primary">Overview</Text>
          <Text className="max-w-[280px] font-section text-[16px] leading-tight text-void-text-secondary">
            Track and manage your deep work sessions in the nocturnal grid.
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 flex-row gap-3">
          <View
            className="mr-3 flex-row items-center rounded-full px-4 py-2"
            style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.19)' }}
          >
            <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-[#4ea4ff33]">
              <Ionicons name="list" size={14} color="#70b1ff" />
            </View>
            <View className="flex-row items-center gap-1">
              <Text className="font-mono text-[14px] text-void-text-primary">{stats.pending}</Text>
              <Text className="font-body text-[12px] text-void-text-secondary">Pending</Text>
            </View>
          </View>

          <View
            className="mr-3 flex-row items-center rounded-full px-4 py-2"
            style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.19)' }}
          >
            <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-[#ff716c33]">
              <Ionicons name="flame" size={14} color="#ff716c" />
            </View>
            <View className="flex-row items-center gap-1">
              <Text className="font-mono text-[14px] text-void-text-primary">{stats.urgent}</Text>
              <Text className="font-body text-[12px] text-void-text-secondary">Urgent</Text>
            </View>
          </View>
        </ScrollView>

        <View
          className="mb-8 w-[260px] flex-row rounded-full p-1"
          style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.19)', backgroundColor: 'rgba(19,19,19,0.78)' }}
        >
          {['all', 'todo', 'completed'].map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              className={clsx('flex-1 items-center justify-center rounded-full py-1.5', filter === f ? 'bg-white/10' : '')}
            >
              <Text className={clsx('font-body text-[13px] capitalize', filter === f ? 'text-void-text-primary' : 'text-void-text-secondary')}>
                {f}
              </Text>
            </Pressable>
          ))}
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
                  priorityLabel: selectedTask.priority === 'High' ? 'High Priority' : `${selectedTask.priority} Priority`,
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
                  priorityLabel: selectedTask.priority === 'High' ? 'High Priority' : `${selectedTask.priority} Priority`,
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



