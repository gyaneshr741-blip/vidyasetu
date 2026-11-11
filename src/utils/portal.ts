import type { Course, NotificationItem, Role, Student } from '../types/portal';

/** Format an integer amount using Indian rupee grouping. */
export function formatRupees(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}

/** Clamp a percentage between 0 and 100. */
export function clampPercentage(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/** Calculate rounded attendance percentage for a single subject pair [present, total]. */
export function calcPercentage([present, total]: [number, number]): number {
  if (!total || total <= 0) return 0;
  return clampPercentage(Math.round((present / total) * 100));
}

/** Calculate overall rounded attendance percentage across all subjects of a student. */
export function calcOverallAttendance(student: Student): number {
  let present = 0;
  let total = 0;
  for (const subject of Object.values(student.att)) {
    present += subject[0];
    total += subject[1];
  }
  if (total <= 0) return 0;
  return clampPercentage(Math.round((present / total) * 100));
}

/** Map marks (0-100) to VidyaSetu grade points on a 10-point scale. */
export function gradePoint(marks: number): number {
  if (marks >= 90) return 10;
  if (marks >= 80) return 9;
  if (marks >= 70) return 8;
  if (marks >= 60) return 7;
  if (marks >= 50) return 6;
  if (marks >= 40) return 5;
  return 0;
}

/** Map marks (0-100) to letter grade. */
export function letterGrade(marks: number): string {
  if (marks >= 90) return 'O';
  if (marks >= 80) return 'A+';
  if (marks >= 70) return 'A';
  if (marks >= 60) return 'B+';
  if (marks >= 50) return 'B';
  if (marks >= 40) return 'C';
  return 'F';
}

/** Compute earned credits and SGPA string for published results. */
export function calcCgpa(student: Student): { c: number; g: string } {
  let earnedCredits = 0;
  let weightedPoints = 0;
  let attemptedCredits = 0;

  for (const result of student.res) {
    if (result.m === null || result.m === undefined) continue;
    const points = gradePoint(result.m);
    if (points > 0) earnedCredits += result.cr;
    weightedPoints += points * result.cr;
    attemptedCredits += result.cr;
  }

  return {
    c: earnedCredits,
    g: attemptedCredits > 0 ? (weightedPoints / attemptedCredits).toFixed(2) : '–',
  };
}

/** Sum credits for electives currently registered by a student. */
export function calcRegisteredCredits(student: Student, courses: Course[]): number {
  return student.el.reduce((sum, id) => {
    const course = courses.find((item) => item.id === id);
    return sum + (course ? course.cr : 0);
  }, 0);
}

/** Sum unpaid fee items for a student. */
export function calcFeesDue(student: Student): number {
  return student.fees
    .filter((fee) => !fee.paid)
    .reduce((sum, fee) => sum + fee.a, 0);
}

/** Filter notifications visible to a given role. */
export function filterNotificationsForRole(
  notes: NotificationItem[],
  role: Role,
): NotificationItem[] {
  return notes.filter((note) => note.to === 'all' || note.to === role);
}

/** Validate a UPI ID such as student@okaxis or name.surname@bank. */
export function isValidUpi(upi: string): boolean {
  const trimmed = upi.trim();
  return /^[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9.-]{2,}$/.test(trimmed);
}

/** Validate a mark value between 0 and 100. */
export function validateScoreRange(
  raw: string,
  label: string,
): { ok: true; value: number } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: `${label} cannot be empty.` };
  }
  const num = Number(trimmed);
  if (!Number.isFinite(num) || num < 0 || num > 100) {
    return { ok: false, error: `${label} must be between 0 and 100.` };
  }
  return { ok: true, value: Math.round(num) };
}
