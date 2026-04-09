import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import clsx from 'clsx';
import PageScroll from '@/components/ui/PageScroll';

type Question = {
  id: string;
  title: string;
  section: string;
  solved: boolean;
  good: boolean;
  redo: boolean;
};

type Book = {
  id: string;
  title: string;
  author: string;
  progress: number;
  currentPart: string;
  questions: Question[];
};

type Subject = {
  id: string;
  name: string;
  books: Book[];
};

type CommunityPlan = {
  id: string;
  title: string;
  type: 'Plan' | 'Strategy' | 'Review';
  subject: string;
  author: string;
  rating: number;
  saves: number;
  summary: string;
};

const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 's1',
    name: 'Physics',
    books: [
      {
        id: 'b1',
        title: 'Conceptual Physics',
        author: 'Paul Hewitt',
        progress: 48,
        currentPart: 'Ch 6 - Motion',
        questions: [
          {
            id: 'q1',
            title: 'Relative velocity mixed set',
            section: 'Kinematics',
            solved: true,
            good: true,
            redo: false,
          },
          {
            id: 'q2',
            title: 'Projectile edge-case drills',
            section: 'Kinematics',
            solved: false,
            good: false,
            redo: true,
          },
        ],
      },
    ],
  },
  {
    id: 's2',
    name: 'Math',
    books: [
      {
        id: 'b2',
        title: 'Advanced Problem Solving',
        author: 'A. Das',
        progress: 62,
        currentPart: 'Probability - Bayes',
        questions: [
          {
            id: 'q3',
            title: 'Conditional probability ladder',
            section: 'Probability',
            solved: true,
            good: false,
            redo: true,
          },
        ],
      },
    ],
  },
];

const COMMUNITY_PLANS: CommunityPlan[] = [
  {
    id: 'c1',
    title: '4-Week Physics Sprint Plan',
    type: 'Plan',
    subject: 'Physics',
    author: 'Aisha M.',
    rating: 4.8,
    saves: 214,
    summary: 'Daily 3-block rotation across concepts, questions, and error log review.',
  },
  {
    id: 'c2',
    title: 'Probability Revision Strategy',
    type: 'Strategy',
    subject: 'Math',
    author: 'Rohan K.',
    rating: 4.6,
    saves: 161,
    summary: 'Use tree diagrams + spaced redo list every 48 hours.',
  },
  {
    id: 'c3',
    title: 'Book Review: Deep Work for Students',
    type: 'Review',
    subject: 'General',
    author: 'Nivi R.',
    rating: 4.7,
    saves: 92,
    summary: 'Practical review focused on implementation tips for exam prep cycles.',
  },
];

const PERSONAL_RESOURCES = [
  { id: 'r1', title: 'Fluid Mechanics Playlist', note: 'Lecture 7 has strong boundary layer examples.' },
  { id: 'r2', title: 'Past Paper 2022', note: 'Redo Q12 and Q18 this weekend.' },
];

export default function StudyScreen() {
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const [selectedSubjectId, setSelectedSubjectId] = useState(INITIAL_SUBJECTS[0]?.id ?? '');
  const [selectedBookId, setSelectedBookId] = useState(INITIAL_SUBJECTS[0]?.books[0]?.id ?? '');

  const [tab, setTab] = useState<'subjects' | 'resources' | 'saved'>('subjects');
  const [resourceTab, setResourceTab] = useState<'mine' | 'community'>('mine');

  const [savedPlans, setSavedPlans] = useState<CommunityPlan[]>([]);

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<CommunityPlan | null>(null);

  const [newSubject, setNewSubject] = useState('');
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookPart, setNewBookPart] = useState('');
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionSection, setNewQuestionSection] = useState('');

  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 320, useNativeDriver: true }).start();
  }, [fade]);

  const selectedSubject = useMemo(
    () => subjects.find((s) => s.id === selectedSubjectId) ?? null,
    [subjects, selectedSubjectId]
  );

  const selectedBook = useMemo(
    () => selectedSubject?.books.find((b) => b.id === selectedBookId) ?? null,
    [selectedSubject, selectedBookId]
  );

  const stats = useMemo(() => {
    const allBooks = subjects.flatMap((s) => s.books);
    const allQuestions = allBooks.flatMap((b) => b.questions);
    const solved = allQuestions.filter((q) => q.solved).length;
    const redo = allQuestions.filter((q) => q.redo).length;
    const good = allQuestions.filter((q) => q.good).length;
    return { solved, redo, good, books: allBooks.length };
  }, [subjects]);

  const addSubject = () => {
    if (!newSubject.trim()) return;
    const next: Subject = { id: `s-${Date.now()}`, name: newSubject.trim(), books: [] };
    setSubjects((prev) => [...prev, next]);
    setSelectedSubjectId(next.id);
    setSelectedBookId('');
    setNewSubject('');
    setShowSubjectModal(false);
  };

  const addBook = () => {
    if (!selectedSubject || !newBookTitle.trim()) return;
    const nextBook: Book = {
      id: `b-${Date.now()}`,
      title: newBookTitle.trim(),
      author: newBookAuthor.trim() || 'Unknown Author',
      currentPart: newBookPart.trim() || 'Not started',
      progress: 0,
      questions: [],
    };
    setSubjects((prev) =>
      prev.map((s) => (s.id === selectedSubject.id ? { ...s, books: [...s.books, nextBook] } : s))
    );
    setSelectedBookId(nextBook.id);
    setNewBookTitle('');
    setNewBookAuthor('');
    setNewBookPart('');
    setShowBookModal(false);
  };

  const addQuestion = () => {
    if (!selectedSubject || !selectedBook || !newQuestionTitle.trim()) return;
    const nextQuestion: Question = {
      id: `q-${Date.now()}`,
      title: newQuestionTitle.trim(),
      section: newQuestionSection.trim() || 'General',
      solved: false,
      good: false,
      redo: false,
    };

    setSubjects((prev) =>
      prev.map((s) =>
        s.id !== selectedSubject.id
          ? s
          : {
              ...s,
              books: s.books.map((b) =>
                b.id === selectedBook.id ? { ...b, questions: [...b.questions, nextQuestion] } : b
              ),
            }
      )
    );
    setNewQuestionTitle('');
    setNewQuestionSection('');
    setShowQuestionModal(false);
  };

  const updateQuestion = (questionId: string, key: 'solved' | 'good' | 'redo') => {
    if (!selectedSubject || !selectedBook) return;
    setSubjects((prev) =>
      prev.map((s) =>
        s.id !== selectedSubject.id
          ? s
          : {
              ...s,
              books: s.books.map((b) =>
                b.id !== selectedBook.id
                  ? b
                  : {
                      ...b,
                      questions: b.questions.map((q) =>
                        q.id === questionId ? { ...q, [key]: !q[key] } : q
                      ),
                    }
              ),
            }
      )
    );
  };

  const updateBookProgress = (bookId: string, delta: number) => {
    if (!selectedSubject) return;
    setSubjects((prev) =>
      prev.map((s) =>
        s.id !== selectedSubject.id
          ? s
          : {
              ...s,
              books: s.books.map((b) =>
                b.id === bookId
                  ? { ...b, progress: Math.max(0, Math.min(100, b.progress + delta)) }
                  : b
              ),
            }
      )
    );
  };

  const savePlan = (plan: CommunityPlan) => {
    setSavedPlans((prev) => (prev.some((p) => p.id === plan.id) ? prev : [...prev, plan]));
    setShowPlanModal(false);
  };

  return (
    <SafeAreaView className="min-h-0 flex-1 bg-[#0e0e0e]">
      <Animated.View style={{ opacity: fade }} className="min-h-0 flex-1">
        <PageScroll>
          <View className="mb-8">
            <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-[#70b1ff]">Produve</Text>
            <Text className="mt-1 font-display text-[46px] leading-[48px] text-void-text-primary">Study</Text>
            <Text className="mt-2 font-body text-[14px] text-void-text-secondary">
              Subject-based workflow: Subjects to Books to Questions.
            </Text>
          </View>

          <View
            className="mb-6 flex-row rounded-full bg-[rgba(19,19,19,0.78)] p-1"
            style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.2)' }}
          >
            {([
              { id: 'subjects', label: 'Subjects' },
              { id: 'resources', label: 'Resources' },
              { id: 'saved', label: 'Saved Plans' },
            ] as const).map((item) => (
              <Pressable
                key={item.id}
                onPress={() => setTab(item.id)}
                className={clsx('flex-1 rounded-full py-2 items-center', tab === item.id ? 'bg-white/10' : '')}
              >
                <Text className={clsx('font-mono text-[10px] uppercase', tab === item.id ? 'text-white' : 'text-void-text-secondary')}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {tab === 'subjects' ? (
            <>
              <View className="mb-6 gap-3">
                <View className="rounded-[16px] bg-[rgba(19,19,19,0.78)] p-4" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.19)' }}>
                  <Text className="font-mono text-[10px] uppercase text-void-text-tertiary">Questions Solved</Text>
                  <Text className="mt-1 font-section text-[22px] text-white">{stats.solved}</Text>
                </View>
                <View className="rounded-[16px] bg-[rgba(19,19,19,0.78)] p-4" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.19)' }}>
                  <Text className="font-mono text-[10px] uppercase text-void-text-tertiary">Books Active</Text>
                  <Text className="mt-1 font-section text-[22px] text-[#70b1ff]">{stats.books}</Text>
                </View>
                <View className="rounded-[16px] bg-[rgba(19,19,19,0.78)] p-4" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.19)' }}>
                  <Text className="font-mono text-[10px] uppercase text-void-text-tertiary">Redo Queue</Text>
                  <Text className="mt-1 font-section text-[22px] text-[#ff716c]">{stats.redo}</Text>
                </View>
              </View>

              <View className="mb-4 flex-row items-center justify-between">
                <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-void-text-secondary">Subjects</Text>
                <Pressable onPress={() => setShowSubjectModal(true)} className="rounded-full bg-[#4ea4ff] px-3 py-1.5">
                  <Text className="font-body text-[11px] text-[#001b32]">Add Subject</Text>
                </Pressable>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                <View className="flex-row gap-2">
                  {subjects.map((s) => (
                    <Pressable
                      key={s.id}
                      onPress={() => {
                        setSelectedSubjectId(s.id);
                        setSelectedBookId(s.books[0]?.id ?? '');
                      }}
                      className={clsx(
                        'rounded-full border px-3 py-1.5',
                        selectedSubjectId === s.id ? 'bg-[#4ea4ff2a]' : 'bg-[rgba(19,19,19,0.78)]'
                      )}
                      style={{
                        borderColor:
                          selectedSubjectId === s.id ? 'rgba(78,164,255,0.65)' : 'rgba(214,235,253,0.2)',
                      }}
                    >
                      <Text className={clsx('font-mono text-[10px] uppercase', selectedSubjectId === s.id ? 'text-[#70b1ff]' : 'text-void-text-secondary')}>
                        {s.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>

              <View className="mb-8 rounded-[18px] bg-[rgba(19,19,19,0.78)] p-5" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.22)' }}>
                <View className="flex-row items-center justify-between">
                  <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-void-text-secondary">Books</Text>
                  <Pressable onPress={() => setShowBookModal(true)} className="rounded-full border border-white/20 px-3 py-1.5">
                    <Text className="font-mono text-[10px] text-white">Add Book</Text>
                  </Pressable>
                </View>

                <View className="mt-4 gap-3">
                  {selectedSubject?.books.length ? (
                    selectedSubject.books.map((book) => (
                      <Pressable
                        key={book.id}
                        onPress={() => setSelectedBookId(book.id)}
                        className={clsx(
                          'rounded-[14px] bg-[rgba(23,26,29,0.72)] p-3',
                          selectedBookId === book.id ? 'border-[#4ea4ff66]' : ''
                        )}
                        style={{ borderWidth: 1, borderColor: selectedBookId === book.id ? 'rgba(78,164,255,0.5)' : 'rgba(214,235,253,0.13)' }}
                      >
                        <View className="flex-row items-center justify-between">
                          <Text className="font-body text-[14px] text-white">{book.title}</Text>
                          <Text className="font-mono text-[10px] text-[#70b1ff]">{book.progress}%</Text>
                        </View>
                        <Text className="mt-1 font-body text-[12px] text-void-text-secondary">{book.author}</Text>
                        <Text className="mt-1 font-mono text-[10px] text-void-text-tertiary">{book.currentPart}</Text>
                        <View className="mt-2 h-2 overflow-hidden rounded-full bg-black/40">
                          <View className="h-full bg-[#4ea4ff]" style={{ width: `${book.progress}%` }} />
                        </View>
                        <View className="mt-3 flex-row gap-2">
                          <Pressable onPress={() => updateBookProgress(book.id, -5)} className="rounded-full border border-white/20 px-3 py-1.5">
                            <Text className="font-mono text-[10px] text-void-text-secondary">-5%</Text>
                          </Pressable>
                          <Pressable onPress={() => updateBookProgress(book.id, 5)} className="rounded-full border border-white/20 px-3 py-1.5">
                            <Text className="font-mono text-[10px] text-void-text-secondary">+5%</Text>
                          </Pressable>
                        </View>
                      </Pressable>
                    ))
                  ) : (
                    <Text className="font-body text-[13px] text-void-text-tertiary">No books in this subject yet.</Text>
                  )}
                </View>
              </View>

              <View className="rounded-[18px] bg-[rgba(19,19,19,0.78)] p-5" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.22)' }}>
                <View className="flex-row items-center justify-between">
                  <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-void-text-secondary">Questions</Text>
                  <Pressable onPress={() => setShowQuestionModal(true)} className="rounded-full border border-white/20 px-3 py-1.5">
                    <Text className="font-mono text-[10px] text-white">Add Question</Text>
                  </Pressable>
                </View>

                <View className="mt-4 gap-3">
                  {selectedBook?.questions.length ? (
                    selectedBook.questions.map((q) => (
                      <View key={q.id} className="rounded-[14px] bg-[rgba(23,26,29,0.72)] p-3" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.12)' }}>
                        <Text className="font-body text-[14px] text-white">{q.title}</Text>
                        <Text className="mt-1 font-mono text-[10px] text-void-text-tertiary">{q.section}</Text>
                        <View className="mt-3 flex-row gap-2">
                          <Pressable onPress={() => updateQuestion(q.id, 'solved')} className={clsx('rounded-full px-3 py-1.5', q.solved ? 'bg-[#4ea4ff2a]' : 'bg-transparent')} style={{ borderWidth: 1, borderColor: q.solved ? 'rgba(78,164,255,0.6)' : 'rgba(214,235,253,0.2)' }}>
                            <Text className={clsx('font-mono text-[10px]', q.solved ? 'text-[#70b1ff]' : 'text-void-text-secondary')}>Solved</Text>
                          </Pressable>
                          <Pressable onPress={() => updateQuestion(q.id, 'good')} className={clsx('rounded-full px-3 py-1.5', q.good ? 'bg-[#01fc972a]' : 'bg-transparent')} style={{ borderWidth: 1, borderColor: q.good ? 'rgba(1,252,151,0.6)' : 'rgba(214,235,253,0.2)' }}>
                            <Text className={clsx('font-mono text-[10px]', q.good ? 'text-[#01fc97]' : 'text-void-text-secondary')}>Good</Text>
                          </Pressable>
                          <Pressable onPress={() => updateQuestion(q.id, 'redo')} className={clsx('rounded-full px-3 py-1.5', q.redo ? 'bg-[#ff716c2a]' : 'bg-transparent')} style={{ borderWidth: 1, borderColor: q.redo ? 'rgba(255,113,108,0.6)' : 'rgba(214,235,253,0.2)' }}>
                            <Text className={clsx('font-mono text-[10px]', q.redo ? 'text-[#ff716c]' : 'text-void-text-secondary')}>Redo</Text>
                          </Pressable>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text className="font-body text-[13px] text-void-text-tertiary">Pick a book to manage questions.</Text>
                  )}
                </View>
              </View>
            </>
          ) : null}

          {tab === 'resources' ? (
            <View className="rounded-[18px] bg-[rgba(19,19,19,0.78)] p-5" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.22)' }}>
              <View className="mb-4 flex-row rounded-full bg-[#0f1113] p-1" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.16)' }}>
                <Pressable onPress={() => setResourceTab('mine')} className={clsx('flex-1 rounded-full py-2 items-center', resourceTab === 'mine' ? 'bg-white/10' : '')}>
                  <Text className={clsx('font-mono text-[10px] uppercase', resourceTab === 'mine' ? 'text-white' : 'text-void-text-secondary')}>My Resources</Text>
                </Pressable>
                <Pressable onPress={() => setResourceTab('community')} className={clsx('flex-1 rounded-full py-2 items-center', resourceTab === 'community' ? 'bg-white/10' : '')}>
                  <Text className={clsx('font-mono text-[10px] uppercase', resourceTab === 'community' ? 'text-white' : 'text-void-text-secondary')}>Community</Text>
                </Pressable>
              </View>

              {resourceTab === 'mine' ? (
                <View className="gap-3">
                  {PERSONAL_RESOURCES.map((r) => (
                    <View key={r.id} className="rounded-[14px] bg-[rgba(23,26,29,0.72)] p-3" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.12)' }}>
                      <Text className="font-body text-[13px] text-white">{r.title}</Text>
                      <Text className="mt-1 font-body text-[12px] text-void-text-secondary">{r.note}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="gap-3">
                  {COMMUNITY_PLANS.map((plan) => (
                    <Pressable
                      key={plan.id}
                      onPress={() => {
                        setSelectedPlan(plan);
                        setShowPlanModal(true);
                      }}
                      className="rounded-[14px] bg-[rgba(23,26,29,0.72)] p-3"
                      style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.12)' }}
                    >
                      <View className="flex-row items-center justify-between">
                        <Text className="font-body text-[14px] text-white">{plan.title}</Text>
                        <Text className="font-mono text-[10px] text-[#70b1ff]">{plan.type}</Text>
                      </View>
                      <Text className="mt-1 font-mono text-[10px] text-void-text-tertiary">
                        {plan.subject} | by {plan.author}
                      </Text>
                      <Text className="mt-1 font-body text-[12px] text-void-text-secondary">{plan.summary}</Text>
                      <Text className="mt-2 font-mono text-[10px] text-void-text-tertiary">
                        * {plan.rating.toFixed(1)} | Saves {plan.saves}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          ) : null}

          {tab === 'saved' ? (
            <View className="rounded-[18px] bg-[rgba(19,19,19,0.78)] p-5" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.22)' }}>
              <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-void-text-secondary">Saved Plans</Text>
              <View className="mt-4 gap-3">
                {savedPlans.length ? (
                  savedPlans.map((plan) => (
                    <View key={plan.id} className="rounded-[14px] bg-[rgba(23,26,29,0.72)] p-3" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.12)' }}>
                      <View className="flex-row items-center justify-between">
                        <Text className="font-body text-[14px] text-white">{plan.title}</Text>
                        <Text className="font-mono text-[10px] text-[#70b1ff]">{plan.type}</Text>
                      </View>
                      <Text className="mt-1 font-mono text-[10px] text-void-text-tertiary">
                        {plan.subject} â€¢ {plan.author}
                      </Text>
                      <Text className="mt-1 font-body text-[12px] text-void-text-secondary">{plan.summary}</Text>
                    </View>
                  ))
                ) : (
                  <Text className="font-body text-[13px] text-void-text-tertiary">
                    No saved plans yet. Save plans from Resources to Community.
                  </Text>
                )}
              </View>
            </View>
          ) : null}
        </PageScroll>
      </Animated.View>

      <Modal visible={showSubjectModal} transparent animationType="fade" onRequestClose={() => setShowSubjectModal(false)}>
        <View className="flex-1 items-center justify-center bg-black/70 p-5">
          <Pressable className="absolute inset-0" onPress={() => setShowSubjectModal(false)} />
          <View className="w-full max-w-[500px] rounded-[20px] bg-[rgba(19,19,19,0.78)] p-5" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.22)' }}>
            <Text className="font-mono text-[10px] uppercase text-[#70b1ff]">Add Subject</Text>
            <TextInput
              value={newSubject}
              onChangeText={setNewSubject}
              placeholder="Subject name"
              placeholderTextColor="#6f767a"
              className="mt-3 rounded-full border border-white/20 bg-[#0f1113] px-4 py-2.5 text-white"
            />
            <Pressable onPress={addSubject} className="mt-4 self-start rounded-full bg-[#4ea4ff] px-4 py-2.5">
              <Text className="font-body text-[12px] text-[#001b32]">Save Subject</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showBookModal} transparent animationType="fade" onRequestClose={() => setShowBookModal(false)}>
        <View className="flex-1 items-center justify-center bg-black/70 p-5">
          <Pressable className="absolute inset-0" onPress={() => setShowBookModal(false)} />
          <View className="w-full max-w-[500px] rounded-[20px] bg-[rgba(19,19,19,0.78)] p-5" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.22)' }}>
            <Text className="font-mono text-[10px] uppercase text-[#70b1ff]">Add Book</Text>
            <TextInput value={newBookTitle} onChangeText={setNewBookTitle} placeholder="Book title" placeholderTextColor="#6f767a" className="mt-3 rounded-full border border-white/20 bg-[#0f1113] px-4 py-2.5 text-white" />
            <TextInput value={newBookAuthor} onChangeText={setNewBookAuthor} placeholder="Author" placeholderTextColor="#6f767a" className="mt-2 rounded-full border border-white/20 bg-[#0f1113] px-4 py-2.5 text-white" />
            <TextInput value={newBookPart} onChangeText={setNewBookPart} placeholder="Current part" placeholderTextColor="#6f767a" className="mt-2 rounded-full border border-white/20 bg-[#0f1113] px-4 py-2.5 text-white" />
            <Pressable onPress={addBook} className="mt-4 self-start rounded-full bg-[#4ea4ff] px-4 py-2.5">
              <Text className="font-body text-[12px] text-[#001b32]">Save Book</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showQuestionModal} transparent animationType="fade" onRequestClose={() => setShowQuestionModal(false)}>
        <View className="flex-1 items-center justify-center bg-black/70 p-5">
          <Pressable className="absolute inset-0" onPress={() => setShowQuestionModal(false)} />
          <View className="w-full max-w-[500px] rounded-[20px] bg-[rgba(19,19,19,0.78)] p-5" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.22)' }}>
            <Text className="font-mono text-[10px] uppercase text-[#70b1ff]">Add Question</Text>
            <TextInput value={newQuestionTitle} onChangeText={setNewQuestionTitle} placeholder="Question title" placeholderTextColor="#6f767a" className="mt-3 rounded-full border border-white/20 bg-[#0f1113] px-4 py-2.5 text-white" />
            <TextInput value={newQuestionSection} onChangeText={setNewQuestionSection} placeholder="Section/topic" placeholderTextColor="#6f767a" className="mt-2 rounded-full border border-white/20 bg-[#0f1113] px-4 py-2.5 text-white" />
            <Pressable onPress={addQuestion} className="mt-4 self-start rounded-full bg-[#4ea4ff] px-4 py-2.5">
              <Text className="font-body text-[12px] text-[#001b32]">Save Question</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showPlanModal} transparent animationType="fade" onRequestClose={() => setShowPlanModal(false)}>
        <View className="flex-1 items-center justify-center bg-black/70 p-5">
          <Pressable className="absolute inset-0" onPress={() => setShowPlanModal(false)} />
          {selectedPlan ? (
            <View className="w-full max-w-[520px] rounded-[20px] bg-[rgba(19,19,19,0.78)] p-5" style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.22)' }}>
              <Text className="font-mono text-[10px] uppercase text-[#70b1ff]">{selectedPlan.type}</Text>
              <Text className="mt-1 font-section text-[24px] text-white">{selectedPlan.title}</Text>
              <Text className="mt-1 font-mono text-[10px] text-void-text-tertiary">
                {selectedPlan.subject} | by {selectedPlan.author}
              </Text>
              <Text className="mt-3 font-body text-[13px] text-void-text-secondary">{selectedPlan.summary}</Text>
              <Text className="mt-2 font-mono text-[10px] text-void-text-tertiary">
                * {selectedPlan.rating.toFixed(1)} | Saves {selectedPlan.saves}
              </Text>
              <Pressable onPress={() => savePlan(selectedPlan)} className="mt-4 self-start rounded-full bg-[#4ea4ff] px-4 py-2.5">
                <Text className="font-body text-[12px] text-[#001b32]">Save Plan</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}




