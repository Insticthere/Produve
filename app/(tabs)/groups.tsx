import React, { useMemo, useState } from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, Text, TextInput, View, Platform } from 'react-native';
import PageScroll from '@/components/ui/PageScroll';
import ScreenIntro from '@/components/ui/ScreenIntro';
import { useAppTheme } from '@/lib/theme';
import { type ChatAttachmentType, type GroupMember, useAppState } from '@/lib/app-state';
import GroupsMobileScreen from '@/components/screens/GroupsScreen.mobile';

const CURRENT_USER_ID = 'u1';

export default function GroupsScreen() {
  if (Platform.OS !== 'web') {
    return <GroupsMobileScreen />;
  }

  const { palette } = useAppTheme();
  const { group, setGroup, todos, setTodos } = useAppState();

  const [workspaceTab, setWorkspaceTab] = useState<'chat' | 'polls' | 'members' | 'goals'>('chat');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showTaskShareModal, setShowTaskShareModal] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const [messageDraft, setMessageDraft] = useState('');
  const [attachments, setAttachments] = useState<{ type: ChatAttachmentType; name: string; meta: string }[]>([]);

  const [pollQuestion, setPollQuestion] = useState('');
  const [pollMode, setPollMode] = useState<'single' | 'multi'>('single');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const todayGoals = useMemo(() => todos.filter((t) => t.status !== 'completed').slice(0, 6), [todos]);
  const taskById = (id: string) => todos.find((t) => t.id === id);

  const addMockAttachment = (type: ChatAttachmentType) => {
    const item =
      type === 'image'
        ? { type, name: 'session-board.png', meta: 'Image • 420 KB' }
        : type === 'doc'
        ? { type, name: 'today-goals.pdf', meta: 'PDF • 132 KB' }
        : { type, name: 'https://example.com/strategy', meta: 'Link Preview' };
    setAttachments((prev) => [...prev, item]);
  };

  const sendMessage = () => {
    if (!messageDraft.trim() && attachments.length === 0) return;
    setGroup((prev) => ({
      ...prev,
      chat: [
        ...prev.chat,
        {
          id: `m-${Date.now()}`,
          userId: CURRENT_USER_ID,
          text: messageDraft.trim() || 'Shared attachment',
          createdAt: new Date().toTimeString().slice(0, 5),
          attachments: attachments.map((a, idx) => ({ id: `a-${Date.now()}-${idx}`, ...a })),
        },
      ],
    }));
    setMessageDraft('');
    setAttachments([]);
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]));
  };

  const shareSelectedTasks = () => {
    if (selectedTaskIds.length === 0) return;
    setGroup((prev) => ({
      ...prev,
      chat: [
        ...prev.chat,
        {
          id: `m-${Date.now()}`,
          userId: CURRENT_USER_ID,
          text: `Shared ${selectedTaskIds.length} task${selectedTaskIds.length > 1 ? 's' : ''}`,
          createdAt: new Date().toTimeString().slice(0, 5),
          attachments: [],
          sharedTaskIds: selectedTaskIds,
        },
      ],
    }));
    setSelectedTaskIds([]);
    setShowTaskShareModal(false);
  };

  const addSimilarTask = (taskId: string) => {
    const original = taskById(taskId);
    if (!original) return;
    setTodos((prev) => [
      ...prev,
      {
        ...original,
        id: `task-copy-${Date.now()}`,
        title: `${original.title} (copy)`,
        status: 'todo',
        subtasks: original.subtasks.map((s, idx) => ({ ...s, id: `${s.id}-copy-${idx}`, completed: false })),
      },
    ]);
  };

  const createPoll = () => {
    const cleanOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
    if (!pollQuestion.trim() || cleanOptions.length < 2) return;

    setGroup((prev) => ({
      ...prev,
      polls: [
        {
          id: `poll-${Date.now()}`,
          question: pollQuestion.trim(),
          mode: pollMode,
          createdBy: CURRENT_USER_ID,
          options: cleanOptions.map((option, idx) => ({ id: `opt-${idx}-${Date.now()}`, label: option, votes: [] })),
        },
        ...prev.polls,
      ],
    }));

    setPollQuestion('');
    setPollMode('single');
    setPollOptions(['', '']);
    setShowPollModal(false);
  };

  const votePoll = (pollId: string, optionId: string) => {
    setGroup((prev) => ({
      ...prev,
      polls: prev.polls.map((poll) => {
        if (poll.id !== pollId) return poll;

        if (poll.mode === 'single') {
          return {
            ...poll,
            options: poll.options.map((o) => ({
              ...o,
              votes: o.id === optionId ? Array.from(new Set([...o.votes.filter((v) => v !== CURRENT_USER_ID), CURRENT_USER_ID])) : o.votes.filter((v) => v !== CURRENT_USER_ID),
            })),
          };
        }

        return {
          ...poll,
          options: poll.options.map((o) => {
            if (o.id !== optionId) return o;
            const hasVote = o.votes.includes(CURRENT_USER_ID);
            return { ...o, votes: hasVote ? o.votes.filter((v) => v !== CURRENT_USER_ID) : [...o.votes, CURRENT_USER_ID] };
          }),
        };
      }),
    }));
  };

  const memberById = (id: string) => group.members.find((m) => m.id === id)?.name ?? 'Member';

  return (
    <SafeAreaView className="min-h-0 flex-1" style={{ backgroundColor: palette.background }}>
      <PageScroll>
        <ScreenIntro
          title="Groups"
          description="Group workspace with chat, polls, members, and shared goals."
          className="mb-8"
        />

        <View className="mb-6 rounded-[18px] p-5" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
          <Text className="font-mono text-[10px] uppercase tracking-[1.2px]" style={{ color: palette.textSecondary }}>Live Group Timer</Text>
          <Text className="mt-2 font-display text-[48px]" style={{ color: palette.textPrimary }}>24:15</Text>
          <Text className="font-body text-[13px]" style={{ color: palette.textSecondary }}>Room: {group.roomCode} • {group.members.length} members active</Text>
        </View>

        <View className="mb-5 flex-row rounded-full p-1" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface }}>
          {(['chat', 'polls', 'members', 'goals'] as const).map((tab) => (
            <Pressable key={tab} onPress={() => setWorkspaceTab(tab)} className="flex-1 items-center rounded-full py-2" style={{ backgroundColor: workspaceTab === tab ? palette.primarySoft : 'transparent' }}>
              <Text className="font-mono text-[10px] uppercase" style={{ color: workspaceTab === tab ? palette.primary : palette.textSecondary }}>{tab}</Text>
            </Pressable>
          ))}
        </View>

        {workspaceTab === 'chat' && (
          <View className="rounded-[18px] p-5" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
            <View className="mb-4 gap-3">
              {group.chat.map((msg) => (
                <View key={msg.id} className="rounded-[14px] p-3" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surfaceAlt }}>
                  <View className="flex-row items-center justify-between">
                    <Text className="font-body text-[13px]" style={{ color: palette.textPrimary }}>{memberById(msg.userId)}</Text>
                    <Text className="font-mono text-[10px]" style={{ color: palette.textTertiary }}>{msg.createdAt}</Text>
                  </View>
                  <Text className="mt-1 font-body text-[13px]" style={{ color: palette.textSecondary }}>{msg.text}</Text>
                  {msg.sharedTaskIds?.length ? (
                    <View className="mt-2 gap-2">
                      {msg.sharedTaskIds
                        .map((id) => taskById(id))
                        .filter(Boolean)
                        .map((task) => (
                          <View key={task!.id} className="rounded-[10px] px-3 py-2" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface }}>
                            <Text className="font-body text-[12px]" style={{ color: palette.textPrimary }}>{task!.title}</Text>
                            <Text className="mt-1 font-mono text-[10px]" style={{ color: palette.textTertiary }}>{task!.subject ?? 'General'} • {task!.priority}</Text>
                            <Pressable onPress={() => addSimilarTask(task!.id)} className="mt-2 self-start rounded-full border px-3 py-1" style={{ borderColor: palette.border }}>
                              <Text className="font-mono text-[10px]" style={{ color: palette.textSecondary }}>Add Similar</Text>
                            </Pressable>
                          </View>
                        ))}
                    </View>
                  ) : null}
                  {msg.attachments.length > 0 && (
                    <View className="mt-2 gap-2">
                      {msg.attachments.map((a) => (
                        <View key={a.id} className="rounded-[10px] px-3 py-2" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface }}>
                          <Text className="font-mono text-[10px] uppercase" style={{ color: palette.primary }}>{a.type}</Text>
                          <Text className="font-body text-[12px]" style={{ color: palette.textPrimary }}>{a.name}</Text>
                          <Text className="font-mono text-[10px]" style={{ color: palette.textTertiary }}>{a.meta}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>

            <View className="rounded-[14px] p-3" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surfaceAlt }}>
              <TextInput value={messageDraft} onChangeText={setMessageDraft} placeholder="Send a message..." placeholderTextColor={palette.textTertiary} className="rounded-[12px] border px-3 py-2" style={{ borderColor: palette.border, backgroundColor: palette.surface, color: palette.textPrimary }} />
              <View className="mt-2 flex-row gap-2">
                <Pressable onPress={() => addMockAttachment('image')} className="rounded-full border px-3 py-1.5" style={{ borderColor: palette.border }}><Text className="font-mono text-[10px]" style={{ color: palette.textSecondary }}>Image</Text></Pressable>
                <Pressable onPress={() => addMockAttachment('doc')} className="rounded-full border px-3 py-1.5" style={{ borderColor: palette.border }}><Text className="font-mono text-[10px]" style={{ color: palette.textSecondary }}>Doc</Text></Pressable>
                <Pressable onPress={() => addMockAttachment('link')} className="rounded-full border px-3 py-1.5" style={{ borderColor: palette.border }}><Text className="font-mono text-[10px]" style={{ color: palette.textSecondary }}>Link</Text></Pressable>
                <Pressable onPress={() => setShowTaskShareModal(true)} className="rounded-full border px-3 py-1.5" style={{ borderColor: palette.border }}><Text className="font-mono text-[10px]" style={{ color: palette.textSecondary }}>Share Tasks</Text></Pressable>
                <View className="flex-1" />
                <Pressable onPress={sendMessage} className="rounded-full px-4 py-1.5" style={{ backgroundColor: palette.primary }}><Text className="font-body text-[12px]" style={{ color: palette.dark ? '#001b32' : '#ffffff' }}>Send</Text></Pressable>
              </View>
              {attachments.length > 0 && <Text className="mt-2 font-mono text-[10px]" style={{ color: palette.textTertiary }}>{attachments.length} attachment(s) ready</Text>}
            </View>
          </View>
        )}

        {workspaceTab === 'polls' && (
          <View className="rounded-[18px] p-5" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="font-mono text-[10px] uppercase tracking-[1.2px]" style={{ color: palette.textSecondary }}>Polls</Text>
              <Pressable onPress={() => setShowPollModal(true)} className="rounded-full px-3 py-1.5" style={{ backgroundColor: palette.primary }}><Text className="font-body text-[12px]" style={{ color: palette.dark ? '#001b32' : '#ffffff' }}>Create Poll</Text></Pressable>
            </View>
            <View className="gap-3">
              {group.polls.map((poll) => {
                const totalVotes = poll.options.reduce((sum, o) => sum + o.votes.length, 0);
                return (
                  <View key={poll.id} className="rounded-[14px] p-3" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surfaceAlt }}>
                    <Text className="font-body text-[14px]" style={{ color: palette.textPrimary }}>{poll.question}</Text>
                    <Text className="mt-1 font-mono text-[10px] uppercase" style={{ color: palette.textTertiary }}>{poll.mode}</Text>
                    <View className="mt-3 gap-2">
                      {poll.options.map((opt) => {
                        const pct = totalVotes ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
                        const selected = opt.votes.includes(CURRENT_USER_ID);
                        return (
                          <Pressable key={opt.id} onPress={() => votePoll(poll.id, opt.id)} className="rounded-[10px] px-3 py-2" style={{ borderWidth: 1, borderColor: selected ? `${palette.primary}99` : palette.border, backgroundColor: selected ? palette.primarySoft : palette.surface }}>
                            <View className="flex-row items-center justify-between">
                              <Text className="font-body text-[12px]" style={{ color: selected ? palette.primary : palette.textPrimary }}>{opt.label}</Text>
                              <Text className="font-mono text-[10px]" style={{ color: palette.textSecondary }}>{pct}% ({opt.votes.length})</Text>
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {workspaceTab === 'members' && (
          <View className="rounded-[18px] p-5" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
            <View className="gap-3">
              {group.members.map((m) => (
                <Pressable key={m.id} onPress={() => { setSelectedMember(m); setShowProfileModal(true); }} className="rounded-[14px] p-3" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surfaceAlt }}>
                  <View className="flex-row items-center justify-between">
                    <Text className="font-body text-[14px]" style={{ color: palette.textPrimary }}>{m.name}</Text>
                    <Text className="font-mono text-[10px]" style={{ color: palette.primary }}>{m.focusMins}m</Text>
                  </View>
                  <Text className="mt-1 font-mono text-[10px]" style={{ color: palette.textTertiary }}>{m.streak} day streak</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {workspaceTab === 'goals' && (
          <View className="rounded-[18px] p-5" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
            <Text className="mb-3 font-mono text-[10px] uppercase tracking-[1.2px]" style={{ color: palette.textSecondary }}>Shared Today Goals (from Todo)</Text>
            <View className="gap-3">
              {todayGoals.map((goal) => (
                <View key={goal.id} className="rounded-[14px] p-3" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surfaceAlt }}>
                  <Text className="font-body text-[13px]" style={{ color: palette.textPrimary }}>{goal.title}</Text>
                  <Text className="mt-1 font-mono text-[10px]" style={{ color: palette.textTertiary }}>{goal.subject ?? 'General'} • Due {goal.dueDate.slice(0, 10)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </PageScroll>

      <Modal visible={showProfileModal} transparent animationType="fade" onRequestClose={() => setShowProfileModal(false)}>
        <View className="flex-1 items-center justify-center p-5" style={{ backgroundColor: palette.overlay }}>
          <Pressable className="absolute inset-0" onPress={() => setShowProfileModal(false)} />
          {selectedMember && (
            <View className="w-full max-w-[500px] rounded-[20px] p-5" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.modalBackground }}>
              <Text className="font-mono text-[10px] uppercase" style={{ color: palette.primary }}>Member Profile</Text>
              <Text className="mt-1 font-section text-[24px]" style={{ color: palette.textPrimary }}>{selectedMember.name}</Text>
              <Text className="mt-2 font-body text-[13px]" style={{ color: palette.textSecondary }}>{selectedMember.bio}</Text>
              <Text className="mt-2 font-mono text-[10px]" style={{ color: palette.textTertiary }}>Streak {selectedMember.streak} days • Focus {selectedMember.focusMins}m</Text>
              <Text className="mt-2 font-body text-[13px]" style={{ color: palette.textPrimary }}>Today Goal: {selectedMember.todayGoal}</Text>
            </View>
          )}
        </View>
      </Modal>

      <Modal visible={showPollModal} transparent animationType="fade" onRequestClose={() => setShowPollModal(false)}>
        <View className="flex-1 items-center justify-center p-5" style={{ backgroundColor: palette.overlay }}>
          <Pressable className="absolute inset-0" onPress={() => setShowPollModal(false)} />
          <View className="w-full max-w-[520px] rounded-[20px] p-5" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.modalBackground }}>
            <Text className="font-mono text-[10px] uppercase" style={{ color: palette.primary }}>Create Poll</Text>
            <TextInput value={pollQuestion} onChangeText={setPollQuestion} placeholder="Poll question" placeholderTextColor={palette.textTertiary} className="mt-3 rounded-full border px-4 py-2.5" style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }} />
            <View className="mt-2 flex-row gap-2">
              {(['single', 'multi'] as const).map((m) => (
                <Pressable key={m} onPress={() => setPollMode(m)} className="rounded-full px-3 py-1.5" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: pollMode === m ? palette.primarySoft : 'transparent' }}>
                  <Text className="font-mono text-[10px] uppercase" style={{ color: pollMode === m ? palette.primary : palette.textSecondary }}>{m}</Text>
                </Pressable>
              ))}
            </View>
            <View className="mt-2 gap-2">
              {pollOptions.map((opt, idx) => (
                <TextInput key={`${idx}-${pollOptions.length}`} value={opt} onChangeText={(v) => setPollOptions((prev) => prev.map((p, i) => (i === idx ? v : p)))} placeholder={`Option ${idx + 1}`} placeholderTextColor={palette.textTertiary} className="rounded-full border px-4 py-2.5" style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }} />
              ))}
            </View>
            <View className="mt-3 flex-row gap-2">
              <Pressable onPress={() => setPollOptions((prev) => [...prev, ''])} className="rounded-full border px-3 py-1.5" style={{ borderColor: palette.border }}><Text className="font-mono text-[10px]" style={{ color: palette.textSecondary }}>Add Option</Text></Pressable>
              <View className="flex-1" />
              <Pressable onPress={createPoll} className="rounded-full px-4 py-1.5" style={{ backgroundColor: palette.primary }}><Text className="font-body text-[12px]" style={{ color: palette.dark ? '#001b32' : '#ffffff' }}>Create</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showTaskShareModal} transparent animationType="fade" onRequestClose={() => setShowTaskShareModal(false)}>
        <View className="flex-1 items-center justify-center p-5" style={{ backgroundColor: palette.overlay }}>
          <Pressable className="absolute inset-0" onPress={() => setShowTaskShareModal(false)} />
          <View className="w-full max-w-[560px] rounded-[20px] p-5" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.modalBackground }}>
            <Text className="font-mono text-[10px] uppercase" style={{ color: palette.primary }}>Share Tasks</Text>
            <Text className="mt-1 font-body text-[13px]" style={{ color: palette.textSecondary }}>Select tasks to share in chat. Teammates can add similar copies.</Text>
            <View className="mt-3 max-h-[280px]">
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="gap-2">
                  {todos.map((task) => {
                    const selected = selectedTaskIds.includes(task.id);
                    return (
                      <Pressable key={task.id} onPress={() => toggleTaskSelection(task.id)} className="rounded-[12px] px-3 py-2" style={{ borderWidth: 1, borderColor: selected ? `${palette.primary}99` : palette.border, backgroundColor: selected ? palette.primarySoft : palette.surfaceAlt }}>
                        <Text className="font-body text-[13px]" style={{ color: selected ? palette.primary : palette.textPrimary }}>{task.title}</Text>
                        <Text className="mt-1 font-mono text-[10px]" style={{ color: palette.textTertiary }}>{task.subject ?? 'General'} • {task.status}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
            <View className="mt-3 flex-row gap-2">
              <Pressable onPress={() => setSelectedTaskIds([])} className="rounded-full border px-3 py-1.5" style={{ borderColor: palette.border }}>
                <Text className="font-mono text-[10px]" style={{ color: palette.textSecondary }}>Deselect All</Text>
              </Pressable>
              <View className="flex-1" />
              <Pressable onPress={shareSelectedTasks} className="rounded-full px-4 py-1.5" style={{ backgroundColor: palette.primary }}>
                <Text className="font-body text-[12px]" style={{ color: palette.dark ? '#001b32' : '#ffffff' }}>Share Selected</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}


