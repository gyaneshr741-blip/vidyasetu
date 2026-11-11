export type Role = 'student' | 'faculty' | 'parent' | 'admin';

export type TabId =
  | 'home'
  | 'att'
  | 'reg'
  | 'exam'
  | 'fee'
  | 'gr'
  | 'nt'
  | 'ann'
  | 'pol'
  | 'rep';

export interface User {
  id: string;
  n: string;
  r: Role;
  sid?: string;
}

export interface FeeItem {
  id: number;
  n: string;
  a: number;
  paid: boolean;
}

export interface ResultItem {
  c: string;
  cr: number;
  m: number | null;
}

export type CondonationStatus = 'Pending' | 'Approved' | null;

export interface Student {
  n: string;
  dept: string;
  att: Record<string, [number, number]>;
  el: string[];
  fees: FeeItem[];
  res: ResultItem[];
  cond: CondonationStatus;
}

export interface Course {
  id: string;
  n: string;
  cr: number;
  t: string;
}

export type NotificationTarget = 'all' | 'student' | 'parent' | 'faculty' | 'admin';

export interface NotificationItem {
  to: NotificationTarget;
  m: string;
  t: string;
}

export type GrievanceStatus = 'In review' | 'Submitted' | 'Resolved';

export interface Grievance {
  id: number;
  by: string;
  t: string;
  st: GrievanceStatus;
}

export interface Assignment {
  c: string;
  n: string;
  due: string;
}

export interface PortalState {
  policy: Record<string, number>;
  regOpen: boolean;
  stu: Record<string, Student>;
  courses: Course[];
  notes: NotificationItem[];
  griev: Grievance[];
  assign: Assignment[];
}

export interface PersistedSession {
  userId: string;
  tab: TabId;
}

export type ModalState =
  | { type: 'pay'; feeId: number }
  | { type: 'receipt'; feeId: number }
  | null;
