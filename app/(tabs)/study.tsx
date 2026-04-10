import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, TextInput, useWindowDimensions, View, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import PageScroll from '@/components/ui/PageScroll';
import ScreenIntro from '@/components/ui/ScreenIntro';
import StudyChipRow from '@/components/study/StudyChipRow';
import StudyComposerCard from '@/components/study/StudyComposerCard';
import StudyPreview from '@/components/study/StudyPreview';
import { type ResourceAttachmentType, type StudyGuide, type StudyQuestion, type StudyResource, type StudySection, type StudyThread, type SubjectTemplate, useAppState } from '@/lib/app-state';
import { useAppTheme } from '@/lib/theme';
import StudyMobileScreen from '@/components/screens/StudyScreen.mobile';

const UID = 'u1';
type MainTab = 'subjects' | 'resources' | 'threads' | 'saved';
type ResourceTab = 'mine' | 'guides' | 'community';
type Plan = { id: string; title: string; type: 'Plan' | 'Strategy' | 'Review'; subject: string; author: string; rating: number; saves: number; summary: string };

const PLANS: Plan[] = [
  { id: 'c1', title: '4-Week Physics Sprint Plan', type: 'Plan', subject: 'Physics', author: 'Aisha M.', rating: 4.8, saves: 214, summary: 'Daily 3-block rotation across concepts and error review.' },
  { id: 'c2', title: 'Irodov Strategy Stack', type: 'Strategy', subject: 'Physics', author: 'Rohan K.', rating: 4.6, saves: 161, summary: 'Section-first progression with redo queue every 48h.' },
];

export default function StudyScreen() {
  if (Platform.OS !== 'web') {
    return <StudyMobileScreen />;
  }

  const { palette } = useAppTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 1024;
  const { subjects, setSubjects, todos, guides, setGuides, threads, setThreads } = useAppState();

  const [tab, setTab] = useState<MainTab>('subjects');
  const [resourceTab, setResourceTab] = useState<ResourceTab>('mine');
  const [exam, setExam] = useState<'all' | string>('all');
  const [saved, setSaved] = useState<Plan[]>([]);

  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [resourceId, setResourceId] = useState(subjects[0]?.resources[0]?.id ?? '');
  const [sectionId, setSectionId] = useState(subjects[0]?.resources[0]?.sections[0]?.id ?? '');

  const [newSubject, setNewSubject] = useState('');
  const [newExam, setNewExam] = useState('JEE Advanced');
  const [newTemplate, setNewTemplate] = useState<SubjectTemplate>('exam-standard');
  const [newResource, setNewResource] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newTotalPages, setNewTotalPages] = useState('300');
  const [newChapter, setNewChapter] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');

  const [mode, setMode] = useState<'guide' | 'thread'>('guide');
  const [title, setTitle] = useState('');
  const [meta, setMeta] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<{ type: ResourceAttachmentType; name: string; meta: string }[]>([]);

  const subject = useMemo(() => subjects.find((s) => s.id === subjectId), [subjects, subjectId]);
  const resource = useMemo(() => subject?.resources.find((r) => r.id === resourceId), [subject, resourceId]);
  const section = useMemo(() => resource?.sections.find((s) => s.id === sectionId), [resource, sectionId]);

  const exams = useMemo(
    () => ['all', ...Array.from(new Set([...subjects.map((s) => s.exam), ...guides.map((g) => g.exam), ...threads.map((t) => t.exam)]))],
    [subjects, guides, threads]
  );

  const tasksBySection = useMemo(
    () => (!resource || !section ? [] : todos.filter((t) => t.resourceId === resource.id && t.sectionId === section.id)),
    [todos, resource, section]
  );

  const guidesFiltered = useMemo(() => (exam === 'all' ? guides : guides.filter((g) => g.exam === exam)), [guides, exam]);
  const threadsFiltered = useMemo(() => (exam === 'all' ? threads : threads.filter((t) => t.exam === exam)), [threads, exam]);

  const stats = useMemo(() => {
    const allResources = subjects.flatMap((s) => s.resources);
    const allQuestions = allResources.flatMap((r) => r.sections.flatMap((c) => c.questions));
    return {
      resources: allResources.length,
      solved: allQuestions.filter((q) => q.solved).length,
      redo: allQuestions.filter((q) => q.redo).length,
    };
  }, [subjects]);

  const updateResource = (sid: string, rid: string, fn: (resource: StudyResource) => StudyResource) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id !== sid ? s : { ...s, resources: s.resources.map((r) => (r.id === rid ? fn(r) : r)) }))
    );
  };

  const addSubject = () => {
    if (!newSubject.trim()) return;
    const next = { id: `s-${Date.now()}`, name: newSubject.trim(), exam: newExam, icon: 'book', color: '#4ea4ff', goalTemplate: newTemplate, resources: [] };
    setSubjects((prev) => [...prev, next]);
    setSubjectId(next.id);
    setNewSubject('');
  };

  const addResource = () => {
    if (!subject || !newResource.trim()) return;
    const next: StudyResource = {
      id: `r-${Date.now()}`,
      title: newResource.trim(),
      author: newAuthor || 'Unknown',
      progress: 0,
      currentPart: 'Chapter 1',
      totalPages: Number(newTotalPages) || 300,
      pagesRead: 0,
      readingLogs: [],
      notes: [],
      attachments: [],
      sections: [],
    };
    setSubjects((prev) => prev.map((s) => (s.id === subject.id ? { ...s, resources: [...s.resources, next] } : s)));
    setResourceId(next.id);
    setNewResource('');
  };

  const deleteResource = () => {
    if (!subject || !resource) return;
    setSubjects((prev) => prev.map((s) => (s.id === subject.id ? { ...s, resources: s.resources.filter((r) => r.id !== resource.id) } : s)));
    setResourceId('');
    setSectionId('');
  };

  const addChapter = () => {
    if (!subject || !resource || !newChapter.trim()) return;
    const next: StudySection = { id: `sec-${Date.now()}`, name: newChapter.trim(), questions: [] };
    updateResource(subject.id, resource.id, (r) => ({ ...r, sections: [...r.sections, next] }));
    setSectionId(next.id);
    setNewChapter('');
  };

  const addQuestion = () => {
    if (!subject || !resource || !section || !newQuestion.trim()) return;
    const next: StudyQuestion = { id: `q-${Date.now()}`, title: newQuestion.trim(), solved: false, good: false, redo: false };
    updateResource(subject.id, resource.id, (r) => ({
      ...r,
      sections: r.sections.map((c) => (c.id === section.id ? { ...c, questions: [...c.questions, next] } : c)),
    }));
    setNewQuestion('');
  };

  const toggleQuestion = (qid: string, key: 'solved' | 'good' | 'redo') => {
    if (!subject || !resource || !section) return;
    updateResource(subject.id, resource.id, (r) => ({
      ...r,
      sections: r.sections.map((c) =>
        c.id !== section.id ? c : { ...c, questions: c.questions.map((q) => (q.id === qid ? { ...q, [key]: !q[key] } : q)) }
      ),
    }));
  };

  const addNote = () => {
    if (!subject || !resource || !noteTitle.trim()) return;
    updateResource(subject.id, resource.id, (r) => ({
      ...r,
      notes: [{ id: `n-${Date.now()}`, title: noteTitle, body: noteBody || 'No details', updatedAt: new Date().toISOString().slice(0, 10) }, ...r.notes],
    }));
    setNoteTitle('');
    setNoteBody('');
  };

  const updateReading = (delta: number) => {
    if (!subject || !resource) return;
    updateResource(subject.id, resource.id, (r) => {
      const pagesRead = Math.max(0, Math.min(r.totalPages, r.pagesRead + delta));
      return {
        ...r,
        pagesRead,
        progress: Math.round((pagesRead / r.totalPages) * 100),
        readingLogs: delta > 0 ? [{ id: `l-${Date.now()}`, date: new Date().toISOString().slice(0, 10), pages: delta }, ...r.readingLogs] : r.readingLogs,
      };
    });
  };

  const addAttachment = (type: ResourceAttachmentType) => {
    const next = type === 'image' ? { type, name: 'snapshot.png', meta: 'Image • 480 KB' } : type === 'pdf' ? { type, name: 'sheet.pdf', meta: 'PDF • 220 KB' } : type === 'doc' ? { type, name: 'notes.docx', meta: 'DOCX • 90 KB' } : { type, name: 'https://example.com', meta: 'Link' };
    setAttachments((prev) => [...prev, next]);
  };

  const submitComposer = () => {
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
        <ScreenIntro
          title="Study"
          description={`Subject > Resource > Chapter > Questions + Guides + Exam Threads.`}
          className="mb-4"
        />

        <View className="mb-4">
          <StudyChipRow values={exams} selected={exam} onSelect={setExam} allLabel="All Exams" />
        </View>

        <View className="mb-4 flex-row rounded-full p-1" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface }}>
          {(['subjects', 'resources', 'threads', 'saved'] as const).map((value) => (
            <Pressable key={value} onPress={() => setTab(value)} className="flex-1 items-center rounded-full py-2" style={{ backgroundColor: tab === value ? palette.primarySoft : 'transparent' }}>
              <Text className="font-mono text-[10px] uppercase" style={{ color: tab === value ? palette.primary : palette.textSecondary }}>{value}</Text>
            </Pressable>
          ))}
        </View>

        {tab === 'subjects' && (
          <>
            <View className="mb-4 rounded-[14px] p-3" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
              <View className="flex-row" style={{ gap: 8, flexWrap: isWide ? 'nowrap' : 'wrap' }}>
                <View className="rounded-[10px] px-3 py-2" style={{ backgroundColor: palette.surfaceAlt, flex: 1 }}>
                  <Text className="font-mono text-[10px]" style={{ color: palette.textTertiary }}>Solved</Text>
                  <Text className="font-section text-[22px]" style={{ color: palette.textPrimary }}>{stats.solved}</Text>
                </View>
                <View className="rounded-[10px] px-3 py-2" style={{ backgroundColor: palette.surfaceAlt, flex: 1 }}>
                  <Text className="font-mono text-[10px]" style={{ color: palette.textTertiary }}>Resources</Text>
                  <Text className="font-section text-[22px]" style={{ color: palette.primary }}>{stats.resources}</Text>
                </View>
                <View className="rounded-[10px] px-3 py-2" style={{ backgroundColor: palette.surfaceAlt, flex: 1 }}>
                  <Text className="font-mono text-[10px]" style={{ color: palette.textTertiary }}>Redo</Text>
                  <Text className="font-section text-[22px]" style={{ color: palette.danger }}>{stats.redo}</Text>
                </View>
              </View>
            </View>

            <View className="rounded-[14px] p-3 mb-4" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
              <Text className="font-mono text-[10px] uppercase" style={{ color: palette.textSecondary }}>Add Subject</Text>
              <TextInput value={newSubject} onChangeText={setNewSubject} placeholder="Subject" placeholderTextColor={palette.textTertiary} className="mt-2 rounded-full border px-4 py-2" style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }} />
              <TextInput value={newExam} onChangeText={setNewExam} placeholder="Exam" placeholderTextColor={palette.textTertiary} className="mt-2 rounded-full border px-4 py-2" style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
                <View className="flex-row gap-2">
                  {(['exam-standard', 'revision-heavy', 'question-first'] as const).map((value) => (
                    <Pressable key={value} onPress={() => setNewTemplate(value)} className="rounded-full px-3 py-1.5" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: newTemplate === value ? palette.primarySoft : 'transparent' }}>
                      <Text className="font-mono text-[10px]" style={{ color: newTemplate === value ? palette.primary : palette.textSecondary }}>{value}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
              <Pressable onPress={addSubject} className="mt-2 self-start rounded-full px-3 py-1.5" style={{ backgroundColor: palette.primary }}>
                <Text className="font-body text-[12px]" style={{ color: palette.dark ? '#001b32' : '#fff' }}>Add</Text>
              </Pressable>
            </View>

            <View className="mb-3">
              <StudyChipRow values={subjects.map((s) => s.id)} selected={subjectId} onSelect={(value) => { setSubjectId(value); const nextSubject = subjects.find((s) => s.id === value); setResourceId(nextSubject?.resources[0]?.id ?? ''); setSectionId(nextSubject?.resources[0]?.sections[0]?.id ?? ''); }} />
            </View>

            <View className="rounded-[14px] p-3 mb-4" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
              <Text className="font-mono text-[10px] uppercase" style={{ color: palette.textSecondary }}>Resources</Text>
              <View className="mt-2 gap-2">
                {subject?.resources.map((r) => (
                  <Pressable key={r.id} onPress={() => { setResourceId(r.id); setSectionId(r.sections[0]?.id ?? ''); }} className="rounded-[10px] p-2" style={{ borderWidth: resourceId === r.id ? 1 : 0, borderColor: `${palette.primary}88`, backgroundColor: palette.surfaceAlt }}>
                    <Text className="font-body text-[13px]" style={{ color: palette.textPrimary }}>{r.title}</Text>
                    <Text className="font-mono text-[10px]" style={{ color: palette.textTertiary }}>{r.author} • {r.progress}%</Text>
                  </Pressable>
                ))}
              </View>
              <View className="mt-2">
                <TextInput value={newResource} onChangeText={setNewResource} placeholder="Resource title" placeholderTextColor={palette.textTertiary} className="rounded-full border px-4 py-2" style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }} />
                <TextInput value={newAuthor} onChangeText={setNewAuthor} placeholder="Author" placeholderTextColor={palette.textTertiary} className="mt-2 rounded-full border px-4 py-2" style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }} />
                <TextInput value={newTotalPages} onChangeText={setNewTotalPages} placeholder="Total pages" keyboardType="number-pad" placeholderTextColor={palette.textTertiary} className="mt-2 rounded-full border px-4 py-2" style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }} />
                <View className="mt-2 flex-row gap-2">
                  <Pressable onPress={addResource} className="rounded-full px-3 py-1.5" style={{ backgroundColor: palette.primary }}><Text className="font-body text-[12px]" style={{ color: palette.dark ? '#001b32' : '#fff' }}>Add Resource</Text></Pressable>
                  {resource && <Pressable onPress={deleteResource} className="rounded-full border px-3 py-1.5" style={{ borderColor: `${palette.danger}66` }}><Text className="font-body text-[12px]" style={{ color: palette.danger }}>Delete</Text></Pressable>}
                </View>
              </View>
            </View>

            {resource && (
              <View className="rounded-[14px] p-3 mb-4" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
                <Text className="font-mono text-[10px] uppercase" style={{ color: palette.textSecondary }}>Reading Tracker</Text>
                <Text className="mt-1 font-body text-[13px]" style={{ color: palette.textSecondary }}>{resource.pagesRead}/{resource.totalPages} pages</Text>
                <View className="mt-2 h-2 rounded-full" style={{ backgroundColor: palette.surfaceAlt }}><View className="h-2 rounded-full" style={{ width: `${resource.progress}%`, backgroundColor: palette.primary }} /></View>
                <View className="mt-2 flex-row gap-2">
                  <Pressable onPress={() => updateReading(-5)} className="rounded-full border px-3 py-1.5" style={{ borderColor: palette.border }}><Text className="font-mono text-[10px]" style={{ color: palette.textSecondary }}>-5</Text></Pressable>
                  <Pressable onPress={() => updateReading(5)} className="rounded-full border px-3 py-1.5" style={{ borderColor: palette.border }}><Text className="font-mono text-[10px]" style={{ color: palette.textSecondary }}>+5</Text></Pressable>
                  <Pressable onPress={() => updateReading(10)} className="rounded-full border px-3 py-1.5" style={{ borderColor: palette.border }}><Text className="font-mono text-[10px]" style={{ color: palette.textSecondary }}>+10</Text></Pressable>
                </View>
                {resource.readingLogs.slice(0, 3).map((log) => <Text key={log.id} className="font-mono text-[10px]" style={{ color: palette.textTertiary }}>{log.date} • +{log.pages} pages</Text>)}
              </View>
            )}

            <View className="rounded-[14px] p-3 mb-4" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
              <Text className="font-mono text-[10px] uppercase" style={{ color: palette.textSecondary }}>Chapters</Text>
              <View className="mt-2 gap-2">
                {resource?.sections.map((c) => {
                  const count = todos.filter((t) => t.resourceId === resource.id && t.sectionId === c.id).length;
                  return (
                    <Pressable key={c.id} onPress={() => setSectionId(c.id)} className="rounded-[10px] p-2" style={{ borderWidth: sectionId === c.id ? 1 : 0, borderColor: `${palette.primary}aa`, backgroundColor: palette.surfaceAlt }}>
                      <Text className="font-body text-[13px]" style={{ color: palette.textPrimary }}>{c.name}</Text>
                      <Text className="font-mono text-[10px]" style={{ color: palette.textTertiary }}>Linked tasks: {count}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <TextInput value={newChapter} onChangeText={setNewChapter} placeholder="New chapter" placeholderTextColor={palette.textTertiary} className="mt-2 rounded-full border px-4 py-2" style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }} />
              <Pressable onPress={addChapter} className="mt-2 self-start rounded-full px-3 py-1.5" style={{ backgroundColor: palette.primary }}><Text className="font-body text-[12px]" style={{ color: palette.dark ? '#001b32' : '#fff' }}>Add Chapter</Text></Pressable>
              {section && (
                <View className="mt-2 rounded-[10px] p-2" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surfaceAlt }}>
                  <Text className="font-mono text-[10px]" style={{ color: palette.textSecondary }}>Tasks for {section.name}</Text>
                  {tasksBySection.length ? tasksBySection.map((t) => <Text key={t.id} className="font-body text-[12px]" style={{ color: palette.textPrimary }}>{t.title}</Text>) : <Text className="font-body text-[12px]" style={{ color: palette.textTertiary }}>No tasks linked</Text>}
                </View>
              )}
            </View>

            <View className="rounded-[14px] p-3 mb-4" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
              <Text className="font-mono text-[10px] uppercase" style={{ color: palette.textSecondary }}>Questions</Text>
              {section?.questions.map((q) => (
                <View key={q.id} className="mt-2 rounded-[10px] p-2" style={{ backgroundColor: palette.surfaceAlt }}>
                  <Text className="font-body text-[13px]" style={{ color: palette.textPrimary }}>{q.title}</Text>
                  <View className="mt-2 flex-row gap-2">
                    {(['solved', 'good', 'redo'] as const).map((key) => (
                      <Pressable key={key} onPress={() => toggleQuestion(q.id, key)} className="rounded-full px-3 py-1" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: q[key] ? palette.primarySoft : 'transparent' }}>
                        <Text className="font-mono text-[10px]" style={{ color: q[key] ? palette.primary : palette.textSecondary }}>{key}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}
              <TextInput value={newQuestion} onChangeText={setNewQuestion} placeholder="New question" placeholderTextColor={palette.textTertiary} className="mt-2 rounded-full border px-4 py-2" style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }} />
              <Pressable onPress={addQuestion} className="mt-2 self-start rounded-full px-3 py-1.5" style={{ backgroundColor: palette.primary }}><Text className="font-body text-[12px]" style={{ color: palette.dark ? '#001b32' : '#fff' }}>Add Question</Text></Pressable>
            </View>

            {resource && (
              <View className="rounded-[14px] p-3" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
                <Text className="font-mono text-[10px] uppercase" style={{ color: palette.textSecondary }}>Resource Notes</Text>
                {resource.notes.map((n) => (
                  <View key={n.id} className="mt-2 rounded-[10px] p-2" style={{ backgroundColor: palette.surfaceAlt }}>
                    <Text className="font-body text-[13px]" style={{ color: palette.textPrimary }}>{n.title}</Text>
                    <Text className="font-body text-[12px]" style={{ color: palette.textSecondary }}>{n.body}</Text>
                    <Text className="font-mono text-[10px]" style={{ color: palette.textTertiary }}>{n.updatedAt}</Text>
                  </View>
                ))}
                <TextInput value={noteTitle} onChangeText={setNoteTitle} placeholder="Note title" placeholderTextColor={palette.textTertiary} className="mt-2 rounded-full border px-4 py-2" style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary }} />
                <TextInput value={noteBody} onChangeText={setNoteBody} placeholder="Note body" placeholderTextColor={palette.textTertiary} multiline className="mt-2 rounded-[12px] border px-4 py-2" style={{ borderColor: palette.border, backgroundColor: palette.surfaceAlt, color: palette.textPrimary, minHeight: 90, textAlignVertical: 'top' }} />
                <Pressable onPress={addNote} className="mt-2 self-start rounded-full px-3 py-1.5" style={{ backgroundColor: palette.primary }}><Text className="font-body text-[12px]" style={{ color: palette.dark ? '#001b32' : '#fff' }}>Add Note</Text></Pressable>
              </View>
            )}
          </>
        )}

        {tab === 'resources' && (
          <View className="rounded-[14px] p-3" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
            <View className="mb-2 flex-row rounded-full p-1" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surfaceAlt }}>
              {(['mine', 'guides', 'community'] as const).map((value) => (
                <Pressable key={value} onPress={() => setResourceTab(value)} className="flex-1 items-center rounded-full py-2" style={{ backgroundColor: resourceTab === value ? palette.primarySoft : 'transparent' }}>
                  <Text className="font-mono text-[10px]" style={{ color: resourceTab === value ? palette.primary : palette.textSecondary }}>{value}</Text>
                </Pressable>
              ))}
            </View>

            {resourceTab === 'mine' &&
              subjects
                .filter((s) => exam === 'all' || s.exam === exam)
                .flatMap((s) => s.resources.map((r) => ({ s, r })))
                .map(({ s, r }) => (
                  <View key={r.id} className="mt-2 rounded-[10px] p-2" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surfaceAlt }}>
                    <Text className="font-body text-[13px]" style={{ color: palette.textPrimary }}>{r.title}</Text>
                    <Text className="font-mono text-[10px]" style={{ color: palette.textTertiary }}>{s.exam} • {s.name}</Text>
                  </View>
                ))}

            {resourceTab === 'guides' &&
              guidesFiltered.map((g) => (
                <View key={g.id} className="mt-2 rounded-[10px] p-2" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surfaceAlt }}>
                  <Text className="font-body text-[13px]" style={{ color: palette.textPrimary }}>{g.title}</Text>
                  <Text className="font-mono text-[10px]" style={{ color: palette.textTertiary }}>{g.exam} • {g.summary}</Text>
                  <Text className="font-mono text-[10px]" style={{ color: palette.textTertiary }}>{g.comments.length} comments</Text>
                  <StudyPreview body={g.mdxBody} />
                  <Pressable onPress={() => router.push(`/guide/${g.id}` as any)} className="mt-2 self-start rounded-full border px-3 py-1" style={{ borderColor: palette.border }}>
                    <Text className="font-mono text-[10px]" style={{ color: palette.textSecondary }}>Open Page</Text>
                  </Pressable>
                  {g.ownerId === UID && (
                    <Pressable onPress={() => setGuides((prev) => prev.filter((x) => x.id !== g.id))} className="mt-2 self-start rounded-full border px-3 py-1" style={{ borderColor: `${palette.danger}66` }}>
                      <Text className="font-mono text-[10px]" style={{ color: palette.danger }}>Delete</Text>
                    </Pressable>
                  )}
                </View>
              ))}

            {resourceTab === 'community' &&
              PLANS.map((p) => (
                <Pressable key={p.id} onPress={() => setSaved((prev) => (prev.some((x) => x.id === p.id) ? prev : [...prev, p]))} className="mt-2 rounded-[10px] p-2" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surfaceAlt }}>
                  <Text className="font-body text-[13px]" style={{ color: palette.textPrimary }}>{p.title}</Text>
                  <Text className="font-mono text-[10px]" style={{ color: palette.textTertiary }}>Tap to save • rating {p.rating}</Text>
                </Pressable>
              ))}
          </View>
        )}

        {tab === 'threads' && (
          <View className="rounded-[14px] p-3" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
            {threadsFiltered.map((t) => (
              <View key={t.id} className="mt-2 rounded-[10px] p-2" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surfaceAlt }}>
                <Text className="font-body text-[13px]" style={{ color: palette.textPrimary }}>{t.title}</Text>
                <Text className="font-mono text-[10px]" style={{ color: palette.textTertiary }}>{t.exam} • {t.tags.map((k) => `#${k}`).join(' ')}</Text>
                <Text className="font-mono text-[10px]" style={{ color: palette.textTertiary }}>{t.commentItems.length} comments</Text>
                <StudyPreview body={t.body} />
                <Pressable onPress={() => router.push(`/thread/${t.id}` as any)} className="mt-2 self-start rounded-full border px-3 py-1" style={{ borderColor: palette.border }}>
                  <Text className="font-mono text-[10px]" style={{ color: palette.textSecondary }}>Open Page</Text>
                </Pressable>
                {t.ownerId === UID && (
                  <Pressable onPress={() => setThreads((prev) => prev.filter((x) => x.id !== t.id))} className="mt-2 self-start rounded-full border px-3 py-1" style={{ borderColor: `${palette.danger}66` }}>
                    <Text className="font-mono text-[10px]" style={{ color: palette.danger }}>Delete</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        )}

        {(tab === 'resources' || tab === 'threads') && (
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

        {tab === 'saved' && (
          <View className="rounded-[14px] p-3" style={{ borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: palette.surface }}>
            {saved.length ? saved.map((p) => (
              <View key={p.id} className="mt-2 rounded-[10px] p-2" style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surfaceAlt }}>
                <Text className="font-body text-[13px]" style={{ color: palette.textPrimary }}>{p.title}</Text>
                <Text className="font-mono text-[10px]" style={{ color: palette.textTertiary }}>{p.subject} • {p.author}</Text>
              </View>
            )) : <Text className="font-body text-[13px]" style={{ color: palette.textTertiary }}>No saved plans yet.</Text>}
          </View>
        )}
      </PageScroll>
    </SafeAreaView>
  );
}




