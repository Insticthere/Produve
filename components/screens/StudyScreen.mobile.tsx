import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import PageScroll from '@/components/ui/PageScroll';
import StudyComposerCard from '@/components/study/StudyComposerCard';
import ScreenIntro from '@/components/ui/ScreenIntro';
import { type ResourceAttachmentType, type StudyGuide, type StudyThread, useAppState } from '@/lib/app-state';
import { useAppTheme } from '@/lib/theme';

const UID = 'u1';

export default function StudyMobileScreen() {
  const { palette } = useAppTheme();
  const router = useRouter();
  const { subjects, guides, setGuides, threads, setThreads } = useAppState();

  const [tab, setTab] = useState<'resources' | 'threads' | 'compose'>('resources');
  const [exam, setExam] = useState<'all' | string>('all');
  const [mode, setMode] = useState<'guide' | 'thread'>('guide');
  const [title, setTitle] = useState('');
  const [meta, setMeta] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<{ type: ResourceAttachmentType; name: string; meta: string }[]>([]);
  const [newSubject, setNewSubject] = useState('');

  const exams = useMemo(() => ['all', ...Array.from(new Set([...subjects.map((s) => s.exam), ...guides.map((g) => g.exam), ...threads.map((t) => t.exam)]))], [subjects, guides, threads]);
  const guidesFiltered = useMemo(() => (exam === 'all' ? guides : guides.filter((g) => g.exam === exam)), [guides, exam]);
  const threadsFiltered = useMemo(() => (exam === 'all' ? threads : threads.filter((t) => t.exam === exam)), [threads, exam]);

  const addAttachment = (type: ResourceAttachmentType) => {
    const next = type === 'image' ? { type, name: 'snapshot.png', meta: 'Image | 480 KB' } : type === 'pdf' ? { type, name: 'sheet.pdf', meta: 'PDF | 220 KB' } : type === 'doc' ? { type, name: 'notes.docx', meta: 'DOCX | 90 KB' } : { type, name: 'https://example.com', meta: 'Link' };
    setAttachments((prev) => [...prev, next]);
  };

  const submitComposer = () => {
    const subject = subjects[0];
    if (!subject || !title.trim() || !body.trim()) return;
    if (mode === 'guide') {
      const next: StudyGuide = { id: `g-${Date.now()}`, title, exam: subject.exam, subjectId: subject.id, ownerId: UID, summary: meta || 'No summary', mdxBody: body, attachments: attachments.map((a, i) => ({ id: `ga-${Date.now()}-${i}`, ...a })), createdAt: new Date().toISOString().slice(0, 10), saves: 0, comments: [] };
      setGuides((prev) => [next, ...prev]);
    } else {
      const next: StudyThread = { id: `t-${Date.now()}`, exam: subject.exam, title, ownerId: UID, body, attachments: attachments.map((a, i) => ({ id: `ta-${Date.now()}-${i}`, ...a })), tags: (meta || 'discussion').split(',').map((v) => v.trim()).filter(Boolean), upvotes: 0, comments: 0, createdAt: new Date().toISOString().slice(0, 10), commentItems: [] };
      setThreads((prev) => [next, ...prev]);
    }
    setTitle('');
    setMeta('');
    setBody('');
    setAttachments([]);
  };

  return (
    <SafeAreaView className="min-h-0 flex-1" style={{ backgroundColor: palette.background }}>
      <PageScroll>
        <ScreenIntro title="Study" description="Mobile study feed with guides, threads, and composer." compact className="mb-0" />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
          <View className="flex-row gap-2">
            {exams.map((e) => (
              <Pressable key={e} onPress={() => setExam(e)} className="rounded-full px-3 py-1.5" style={{ borderWidth: 1, borderColor: exam === e ? `${palette.primary}aa` : palette.border, backgroundColor: exam === e ? palette.primarySoft : palette.surface }}>
                <Text className="font-mono text-[10px] uppercase" style={{ color: exam === e ? palette.primary : palette.textSecondary }}>{e === 'all' ? 'All' : e}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View className="mt-3 flex-row rounded-full p-1" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface }}>
          {(['resources', 'threads', 'compose'] as const).map((v) => (
            <Pressable key={v} onPress={() => setTab(v)} className="flex-1 items-center rounded-full py-2" style={{ backgroundColor: tab === v ? palette.primarySoft : 'transparent' }}>
              <Text className="font-mono text-[10px] uppercase" style={{ color: tab === v ? palette.primary : palette.textSecondary }}>{v}</Text>
            </Pressable>
          ))}
        </View>

        <View className="mt-4 rounded-[14px] p-3" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
          <Text className="font-mono text-[10px] uppercase" style={{ color: palette.textSecondary }}>Quick Subject</Text>
          <TextInput value={newSubject} onChangeText={setNewSubject} placeholder="Subject name" placeholderTextColor={palette.textTertiary} className="mt-2 rounded-full border px-4 py-2" style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }} />
          <Text className="mt-2 font-mono text-[10px]" style={{ color: palette.textTertiary }}>Tip: full subject/resource editing is richer on web layout.</Text>
        </View>

        {tab === 'resources' && (
          <View className="mt-4 gap-3">
            {guidesFiltered.map((g) => (
              <View key={g.id} className="rounded-[14px] p-3" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface }}>
                <Text className="font-body text-[14px]" style={{ color: palette.textPrimary }}>{g.title}</Text>
                <Text className="mt-1 font-mono text-[10px]" style={{ color: palette.textTertiary }}>{g.exam} | {g.comments.length} comments</Text>
                <Pressable onPress={() => router.push(`/guide/${g.id}` as any)} className="mt-2 self-start rounded-full border px-3 py-1" style={{ borderColor: palette.border }}>
                  <Text className="font-mono text-[10px]" style={{ color: palette.textSecondary }}>Open Page</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {tab === 'threads' && (
          <View className="mt-4 gap-3">
            {threadsFiltered.map((t) => (
              <View key={t.id} className="rounded-[14px] p-3" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface }}>
                <Text className="font-body text-[14px]" style={{ color: palette.textPrimary }}>{t.title}</Text>
                <Text className="mt-1 font-mono text-[10px]" style={{ color: palette.textTertiary }}>{t.exam} | {t.commentItems.length} comments</Text>
                <Pressable onPress={() => router.push(`/thread/${t.id}` as any)} className="mt-2 self-start rounded-full border px-3 py-1" style={{ borderColor: palette.border }}>
                  <Text className="font-mono text-[10px]" style={{ color: palette.textSecondary }}>Open Page</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {tab === 'compose' && (
          <StudyComposerCard
            mode={mode}
            title={title}
            meta={meta}
            body={body}
            attachments={attachments}
            onModeChange={setMode}
            onTitleChange={setTitle}
            onMetaChange={setMeta}
            onBodyChange={setBody}
            onAddAttachment={addAttachment}
            onSubmit={submitComposer}
          />
        )}
      </PageScroll>
    </SafeAreaView>
  );
}
