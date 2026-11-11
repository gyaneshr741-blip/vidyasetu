import type { PortalState, Role, TabId, User } from '../types/portal';

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'VidyaSetu';
export const UNIVERSITY_NAME =
  import.meta.env.VITE_UNIVERSITY_NAME || 'Nagarjuna University';

export const USERS: Record<string, User> = {
  ravi: { id: 'ravi', n: 'Ravi Kumar', r: 'student', sid: 's1' },
  sita: { id: 'sita', n: 'Sita Devi', r: 'student', sid: 's2' },
  drrao: { id: 'drrao', n: 'Dr. Rao', r: 'faculty' },
  parent1: { id: 'parent1', n: 'Parent of Ravi Kumar', r: 'parent', sid: 's1' },
  admin: { id: 'admin', n: 'Administrator', r: 'admin' },
};

export const DEMO_PASSWORD = 'pass';

export const DEMO_QUICK_FILL: Array<{ username: string; label: string }> = [
  { username: 'ravi', label: 'Student' },
  { username: 'drrao', label: 'Faculty' },
  { username: 'parent1', label: 'Parent' },
  { username: 'admin', label: 'Admin' },
];

export const MENU: Record<Role, Array<[TabId, string]>> = {
  student: [
    ['home', 'Dashboard'],
    ['att', 'Attendance'],
    ['reg', 'Course registration'],
    ['exam', 'Results'],
    ['fee', 'Fees'],
    ['gr', 'Grievances'],
    ['nt', 'Notifications'],
  ],
  faculty: [
    ['home', 'Dashboard'],
    ['att', 'Mark attendance'],
    ['exam', 'Marks entry'],
    ['ann', 'Announcements'],
    ['nt', 'Notifications'],
  ],
  parent: [
    ['home', 'Dashboard'],
    ['att', 'Attendance'],
    ['exam', 'Results'],
    ['fee', 'Fees'],
    ['nt', 'Notifications'],
  ],
  admin: [
    ['home', 'Dashboard'],
    ['pol', 'Policies'],
    ['gr', 'Grievances'],
    ['ann', 'Announcements'],
    ['rep', 'Reports'],
  ],
};

export const INITIAL_STATE: PortalState = {
  policy: { CSE: 75, ECE: 85 },
  regOpen: true,
  stu: {
    s1: {
      n: 'Ravi Kumar',
      dept: 'CSE',
      att: {
        'Data Structures': [34, 45],
        'Database Systems': [39, 44],
        'Operating Systems': [30, 40],
      },
      el: [],
      fees: [
        { id: 1, n: 'Tuition – Sem 3', a: 42000, paid: true },
        { id: 2, n: 'Exam fee', a: 2500, paid: false },
        { id: 3, n: 'Library & Lab', a: 3000, paid: false },
      ],
      res: [
        { c: 'Maths III', cr: 4, m: 78 },
        { c: 'Digital Logic', cr: 3, m: 64 },
        { c: 'Data Structures', cr: 4, m: null },
      ],
      cond: null,
    },
    s2: {
      n: 'Sita Devi',
      dept: 'ECE',
      att: {
        Signals: [40, 44],
        Circuits: [36, 42],
        Electromagnetics: [33, 41],
      },
      el: [],
      fees: [{ id: 1, n: 'Tuition – Sem 3', a: 42000, paid: true }],
      res: [
        { c: 'Signals', cr: 4, m: 88 },
        { c: 'Circuits', cr: 3, m: 71 },
      ],
      cond: null,
    },
  },
  courses: [
    { id: 'AI', n: 'Intro to AI', cr: 3, t: 'Elective' },
    { id: 'DS', n: 'Data Science Basics', cr: 3, t: 'Interdisciplinary' },
    { id: 'PSY', n: 'Psychology of Learning', cr: 2, t: 'Interdisciplinary' },
    { id: 'EN', n: 'Entrepreneurship', cr: 2, t: 'Elective' },
  ],
  notes: [
    {
      to: 'all',
      m: 'Welcome to VidyaSetu – release 1 is live for feedback.',
      t: 'Today',
    },
    {
      to: 'student',
      m: 'Elective registration window closes Friday.',
      t: 'Today',
    },
  ],
  griev: [{ id: 1, by: 's2', t: 'Timetable clash on Tuesday', st: 'In review' }],
  assign: [
    { c: 'Data Structures', n: 'Assignment 2: Linked lists', due: 'Next Mon' },
  ],
};
