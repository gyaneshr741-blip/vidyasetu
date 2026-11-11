import { describe, expect, it } from 'vitest';
import { INITIAL_STATE } from '../data/initialState';
import type { Student } from '../types/portal';
import {
  calcCgpa,
  calcFeesDue,
  calcOverallAttendance,
  calcPercentage,
  calcRegisteredCredits,
  filterNotificationsForRole,
  formatRupees,
  gradePoint,
  isValidUpi,
  letterGrade,
  validateScoreRange,
} from '../utils/portal';

describe('VidyaSetu portal calculations and validation', () => {
  it('computes single-course and overall attendance safely', () => {
    const ravi = INITIAL_STATE.stu.s1;
    expect(calcPercentage([34, 45])).toBe(76);
    expect(calcPercentage([0, 0])).toBe(0);
    expect(calcOverallAttendance(ravi)).toBe(80);

    const emptyStudent: Student = {
      n: 'Empty',
      dept: 'CSE',
      att: {},
      el: [],
      fees: [],
      res: [],
      cond: null,
    };
    expect(calcOverallAttendance(emptyStudent)).toBe(0);
  });

  it('computes SGPA, earned credits, and letter grades accurately', () => {
    const ravi = INITIAL_STATE.stu.s1;
    expect(calcCgpa(ravi)).toEqual({ c: 7, g: '7.57' });
    expect(gradePoint(92)).toBe(10);
    expect(letterGrade(92)).toBe('O');
    expect(gradePoint(35)).toBe(0);
    expect(letterGrade(35)).toBe('F');
  });

  it('computes registered credits and fees due', () => {
    const ravi: Student = { ...INITIAL_STATE.stu.s1, el: ['AI', 'EN'] };
    expect(calcRegisteredCredits(ravi, INITIAL_STATE.courses)).toBe(5);
    expect(calcFeesDue(ravi)).toBe(5500);
    expect(formatRupees(42000)).toBe('₹42,000');
  });

  it('filters role notifications cleanly', () => {
    const studentNotes = filterNotificationsForRole(
      INITIAL_STATE.notes,
      'student',
    );
    const parentNotes = filterNotificationsForRole(
      INITIAL_STATE.notes,
      'parent',
    );
    expect(studentNotes).toHaveLength(2);
    expect(parentNotes).toHaveLength(1);
  });

  it('validates UPI IDs and numeric 0-100 score ranges', () => {
    expect(isValidUpi('ravi@okaxis')).toBe(true);
    expect(isValidUpi('ravi.kumar@sbi')).toBe(true);
    expect(isValidUpi('@')).toBe(false);
    expect(isValidUpi('invalid')).toBe(false);

    expect(validateScoreRange('85', 'Marks')).toEqual({ ok: true, value: 85 });
    expect(validateScoreRange('101', 'Marks').ok).toBe(false);
    expect(validateScoreRange('-1', 'Marks').ok).toBe(false);
    expect(validateScoreRange('', 'Marks').ok).toBe(false);
  });
});
