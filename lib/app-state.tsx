import React, { createContext, useContext, useMemo, useState } from 'react';

export type TodoStatus = 'todo' | 'doing' | 'completed';
export type TodoPriority = 'High' | 'Medium' | 'Low';

export type TodoItem = {
  id: string;
  title: string;
  status: TodoStatus;
  priority: TodoPriority;
  subject?: string;
  resourceId?: string;
  sectionId?: string;
  dueDate: string;
  subtasks: { id: string; title: string; completed: boolean }[];
};

export type PlannerCategory = 'focus' | 'revision' | 'practice' | 'break';
export type PlannerBlock = {
  id: string;
  title: string;
  startSlot: number;
  durationSlots: number;
  color: string;
  day: number;
  category: PlannerCategory;
  done: boolean;
  linkedSubjectId?: string;
  linkedResourceId?: string;
};

export type StudyQuestion = {
  id: string;
  title: string;
  solved: boolean;
  good: boolean;
  redo: boolean;
};

export type ResourceAttachmentType = 'image' | 'pdf' | 'link' | 'doc';
export type ResourceAttachment = {
  id: string;
  type: ResourceAttachmentType;
  name: string;
  meta: string;
};

export type ResourceNote = {
  id: string;
  title: string;
  body: string;
  updatedAt: string;
};

export type ReadingLog = {
  id: string;
  date: string;
  pages: number;
};

export type StudySection = {
  id: string;
  name: string;
  questions: StudyQuestion[];
};

export type StudyResource = {
  id: string;
  title: string;
  author: string;
  progress: number;
  currentPart: string;
  totalPages: number;
  pagesRead: number;
  readingLogs: ReadingLog[];
  notes: ResourceNote[];
  attachments: ResourceAttachment[];
  sections: StudySection[];
};

export type SubjectTemplate = 'exam-standard' | 'revision-heavy' | 'question-first';
export type StudySubject = {
  id: string;
  name: string;
  icon: string;
  color: string;
  exam: string;
  goalTemplate: SubjectTemplate;
  resources: StudyResource[];
};

export type RichContentAttachment = {
  id: string;
  type: 'image' | 'pdf' | 'link' | 'doc';
  name: string;
  meta: string;
};

export type StudyGuide = {
  id: string;
  title: string;
  exam: string;
  subjectId: string;
  ownerId: string;
  summary: string;
  mdxBody: string;
  attachments: RichContentAttachment[];
  createdAt: string;
  saves: number;
  comments: { id: string; userId: string; text: string; createdAt: string }[];
};

export type StudyThread = {
  id: string;
  exam: string;
  title: string;
  ownerId: string;
  body: string;
  attachments: RichContentAttachment[];
  tags: string[];
  upvotes: number;
  comments: number;
  createdAt: string;
  commentItems: { id: string; userId: string; text: string; createdAt: string }[];
};

export type ChatAttachmentType = 'image' | 'doc' | 'link';
export type ChatAttachment = {
  id: string;
  type: ChatAttachmentType;
  name: string;
  meta: string;
};

export type GroupMessage = {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  attachments: ChatAttachment[];
  sharedTaskIds?: string[];
};

export type GroupPollOption = {
  id: string;
  label: string;
  votes: string[];
};

export type GroupPoll = {
  id: string;
  question: string;
  mode: 'single' | 'multi';
  options: GroupPollOption[];
  createdBy: string;
};

export type GroupMember = {
  id: string;
  name: string;
  streak: number;
  focusMins: number;
  bio: string;
  todayGoal: string;
};

export type GroupState = {
  roomCode: string;
  members: GroupMember[];
  chat: GroupMessage[];
  polls: GroupPoll[];
};

type AppStateContextValue = {
  todos: TodoItem[];
  setTodos: React.Dispatch<React.SetStateAction<TodoItem[]>>;
  plannerBlocks: PlannerBlock[];
  setPlannerBlocks: React.Dispatch<React.SetStateAction<PlannerBlock[]>>;
  subjects: StudySubject[];
  setSubjects: React.Dispatch<React.SetStateAction<StudySubject[]>>;
  guides: StudyGuide[];
  setGuides: React.Dispatch<React.SetStateAction<StudyGuide[]>>;
  threads: StudyThread[];
  setThreads: React.Dispatch<React.SetStateAction<StudyThread[]>>;
  group: GroupState;
  setGroup: React.Dispatch<React.SetStateAction<GroupState>>;
};

const seedSubjects: StudySubject[] = [
  {
    id: 's1',
    name: 'Physics',
    icon: 'flask',
    color: '#4ea4ff',
    exam: 'JEE Advanced',
    goalTemplate: 'exam-standard',
    resources: [
      {
        id: 'r1',
        title: 'Irodov',
        author: 'I.E. Irodov',
        progress: 48,
        currentPart: 'Mechanics',
        totalPages: 480,
        pagesRead: 230,
        readingLogs: [
          { id: 'rl-1', date: '2026-04-07', pages: 18 },
          { id: 'rl-2', date: '2026-04-08', pages: 24 },
          { id: 'rl-3', date: '2026-04-09', pages: 12 },
        ],
        notes: [
          { id: 'n-1', title: 'Kinematics traps', body: 'Watch relative frame sign conventions.', updatedAt: '2026-04-09' },
          { id: 'n-2', title: 'Revision cue', body: 'Redo Q2, Q5, Q11 from chapter set.', updatedAt: '2026-04-10' },
        ],
        attachments: [
          { id: 'ra-1', type: 'pdf', name: 'irodov-solutions-part1.pdf', meta: 'PDF • 2.1 MB' },
          { id: 'ra-2', type: 'link', name: 'https://example.com/kinematics-notes', meta: 'Reference Link' },
        ],
        sections: [
          {
            id: 'sec1',
            name: 'Kinematics',
            questions: [
              { id: 'q1', title: 'Relative velocity mixed set', solved: true, good: true, redo: false },
              { id: 'q2', title: 'Projectile edge-case drills', solved: false, good: false, redo: true },
            ],
          },
          {
            id: 'sec2',
            name: 'Dynamics',
            questions: [{ id: 'q3', title: 'Inclined plane constraints', solved: false, good: false, redo: false }],
          },
        ],
      },
    ],
  },
  {
    id: 's2',
    name: 'Math',
    icon: 'function',
    color: '#ffad5e',
    exam: 'JEE Main',
    goalTemplate: 'question-first',
    resources: [
      {
        id: 'r2',
        title: 'Problem Solving 101',
        author: 'A. Das',
        progress: 34,
        currentPart: 'Probability',
        totalPages: 320,
        pagesRead: 110,
        readingLogs: [
          { id: 'rl-4', date: '2026-04-06', pages: 10 },
          { id: 'rl-5', date: '2026-04-09', pages: 16 },
        ],
        notes: [{ id: 'n-3', title: 'Bayes sheet', body: 'Create one-page posterior cheat sheet.', updatedAt: '2026-04-09' }],
        attachments: [{ id: 'ra-3', type: 'doc', name: 'probability-formulas.docx', meta: 'DOCX • 180 KB' }],
        sections: [
          {
            id: 'sec3',
            name: 'Conditional Probability',
            questions: [{ id: 'q4', title: 'Bayes ladder', solved: true, good: false, redo: true }],
          },
        ],
      },
    ],
  },
];

const seedTodos: TodoItem[] = [
  {
    id: 't1',
    title: 'Deep Work Session: UI Architecture',
    status: 'todo',
    priority: 'High',
    subject: 'Physics',
    resourceId: 'r1',
    sectionId: 'sec1',
    dueDate: '2026-04-10T09:00',
    subtasks: [
      { id: 't1-1', title: 'Set chapter targets', completed: true },
      { id: 't1-2', title: 'Solve warm-up set', completed: true },
      { id: 't1-3', title: 'Review wrong answers', completed: false },
    ],
  },
  {
    id: 't2',
    title: 'Review System Logs',
    status: 'completed',
    priority: 'Medium',
    subject: 'General',
    dueDate: '2026-04-09T16:00',
    subtasks: [],
  },
  {
    id: 't3',
    title: 'Prepare Weekly Sprint Plan',
    status: 'doing',
    priority: 'High',
    subject: 'Math',
    resourceId: 'r2',
    sectionId: 'sec3',
    dueDate: '2026-04-14T10:30',
    subtasks: [
      { id: 't3-1', title: 'Gather stats', completed: false },
      { id: 't3-2', title: 'Plan question blocks', completed: false },
    ],
  },
];

const seedPlanner: PlannerBlock[] = [
  { id: 'p1', title: 'Deep Work', startSlot: 8, durationSlots: 6, color: '#4ea4ff', day: 0, category: 'focus', done: false, linkedSubjectId: 's1', linkedResourceId: 'r1' },
  { id: 'p2', title: 'Irodov Questions', startSlot: 24, durationSlots: 4, color: '#01fc97', day: 0, category: 'practice', done: false, linkedSubjectId: 's1', linkedResourceId: 'r1' },
  { id: 'p3', title: 'Redo Queue', startSlot: 34, durationSlots: 6, color: '#ff716c', day: 0, category: 'revision', done: false, linkedSubjectId: 's2', linkedResourceId: 'r2' },
];

const seedGuides: StudyGuide[] = [
  {
    id: 'g1',
    title: '4 Week Irodov Attack Plan',
    exam: 'JEE Advanced',
    subjectId: 's1',
    ownerId: 'u1',
    summary: 'Concept to question loop with daily redo queue.',
    mdxBody:
      '# Week 1\\n- Build chapter map\\n- Solve 20 core questions\\n\\n## Math note\\nUse $F = ma$ and energy checks before final answer.',
    attachments: [{ id: 'ga-1', type: 'pdf', name: 'irodov-plan.pdf', meta: 'PDF • 412 KB' }],
    createdAt: '2026-04-08',
    saves: 57,
    comments: [
      { id: 'gc-1', userId: 'u2', text: 'This sequence is solid for week 1.', createdAt: '2026-04-09 09:40' },
    ],
  },
];

const seedThreads: StudyThread[] = [
  {
    id: 'th-1',
    exam: 'JEE Advanced',
    title: 'Best way to structure Irodov revision?',
    ownerId: 'u2',
    body: 'I am trying a 2-day gap. Anyone tested this with chapter buckets?\\n\\nFormula check: $v^2 = u^2 + 2as$',
    attachments: [],
    tags: ['physics', 'revision', 'irodov'],
    upvotes: 23,
    comments: 11,
    createdAt: '2026-04-09',
    commentItems: [
      { id: 'tc-1', userId: 'u1', text: 'Try chapter bucket + daily micro-redo.', createdAt: '2026-04-09 10:12' },
      { id: 'tc-2', userId: 'u3', text: '2-day gap worked for me too.', createdAt: '2026-04-09 10:28' },
    ],
  },
  {
    id: 'th-2',
    exam: 'JEE Main',
    title: 'Probability question selection strategy',
    ownerId: 'u1',
    body: 'Sharing my shortlist approach: easy-medium-hard in 3 loops.',
    attachments: [{ id: 'ta-1', type: 'doc', name: 'probability-shortlist.docx', meta: 'DOCX • 90 KB' }],
    tags: ['math', 'strategy'],
    upvotes: 16,
    comments: 7,
    createdAt: '2026-04-10',
    commentItems: [{ id: 'tc-3', userId: 'u2', text: 'Can you share your easy/medium ratio?', createdAt: '2026-04-10 08:11' }],
  },
];

const seedGroup: GroupState = {
  roomCode: 'NIGHT-OPS-07',
  members: [
    { id: 'u1', name: 'Nitin', streak: 8, focusMins: 210, bio: 'Design + deep work loops.', todayGoal: 'Finish 2 sections in Irodov' },
    { id: 'u2', name: 'Aisha', streak: 11, focusMins: 195, bio: 'Daily question sprints.', todayGoal: 'Solve 30 probability questions' },
    { id: 'u3', name: 'Rohan', streak: 6, focusMins: 176, bio: 'Night study sessions.', todayGoal: 'Complete revision block' },
  ],
  chat: [
    {
      id: 'm1',
      userId: 'u2',
      text: 'Starting 45-min sprint now. Anyone joining?',
      createdAt: '09:20',
      attachments: [],
    },
    {
      id: 'm2',
      userId: 'u1',
      text: "Uploading today's checklist.",
      createdAt: '09:21',
      attachments: [{ id: 'a1', type: 'doc', name: 'today-goals.pdf', meta: '132 KB' }],
    },
  ],
  polls: [
    {
      id: 'poll1',
      question: 'Tonight focus target?',
      mode: 'single',
      createdBy: 'u1',
      options: [
        { id: 'o1', label: 'Revision', votes: ['u1'] },
        { id: 'o2', label: 'Questions', votes: ['u2', 'u3'] },
      ],
    },
  ],
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [todos, setTodos] = useState<TodoItem[]>(seedTodos);
  const [plannerBlocks, setPlannerBlocks] = useState<PlannerBlock[]>(seedPlanner);
  const [subjects, setSubjects] = useState<StudySubject[]>(seedSubjects);
  const [guides, setGuides] = useState<StudyGuide[]>(seedGuides);
  const [threads, setThreads] = useState<StudyThread[]>(seedThreads);
  const [group, setGroup] = useState<GroupState>(seedGroup);

  const value = useMemo(
    () => ({
      todos,
      setTodos,
      plannerBlocks,
      setPlannerBlocks,
      subjects,
      setSubjects,
      guides,
      setGuides,
      threads,
      setThreads,
      group,
      setGroup,
    }),
    [group, guides, plannerBlocks, subjects, threads, todos]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used inside AppStateProvider');
  }
  return context;
}

