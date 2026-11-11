import { useState, type FormEvent } from 'react';
import type { PortalState, TabId, User } from '../types/portal';
import {
  calcCgpa,
  calcFeesDue,
  calcOverallAttendance,
  calcPercentage,
  calcRegisteredCredits,
  formatRupees,
  gradePoint,
  letterGrade,
} from '../utils/portal';
import { NotificationsList } from './NotificationsCard';

interface StudentParentViewProps {
  user: User;
  tab: TabId;
  state: PortalState;
  onToggleCourse: (courseId: string) => void;
  onApplyCondonation: (reason: string) => void;
  onSubmitGrievance: (text: string) => void;
  onOpenPayModal: (feeId: number) => void;
  onOpenReceiptModal: (feeId: number) => void;
  onToast: (message: string) => void;
}

export function StudentParentView({
  user,
  tab,
  state,
  onToggleCourse,
  onApplyCondonation,
  onSubmitGrievance,
  onOpenPayModal,
  onOpenReceiptModal,
  onToast,
}: StudentParentViewProps) {
  const [condReason, setCondReason] = useState('');
  const [grievanceText, setGrievanceText] = useState('');

  const student = user.sid ? state.stu[user.sid] : undefined;
  if (!student) {
    return (
      <div className="card" role="alert">
        <h2>Student profile unavailable</h2>
        <p>The linked student record could not be loaded.</p>
      </div>
    );
  }

  const isParent = user.r === 'parent';
  const prefix = isParent ? 'Child: ' : '';
  const threshold = state.policy[student.dept] ?? 75;
  const overallAttendance = calcOverallAttendance(student);

  const lowAttendanceBanner =
    overallAttendance < threshold ? (
      <div className="note">
        Low attendance: {overallAttendance}% is below your department’s{' '}
        {threshold}% requirement.{' '}
        <small>You can apply for condonation under Attendance.</small>
      </div>
    ) : null;

  if (tab === 'home') {
    const sgpa = calcCgpa(student);
    const due = calcFeesDue(student);
    const credits = sgpa.c + calcRegisteredCredits(student, state.courses);

    return (
      <>
        <h2>
          {prefix}
          {student.n} <span className="tag">{student.dept}</span>
        </h2>
        {lowAttendanceBanner}
        <div className="grid">
          <div className="card stat">
            <b>{overallAttendance}%</b>
            <span>Attendance</span>
          </div>
          <div className="card stat">
            <b>{sgpa.g}</b>
            <span>SGPA</span>
          </div>
          <div className="card stat">
            <b>{credits}</b>
            <span>Credits earned + registered</span>
          </div>
          <div className="card stat">
            <b>{formatRupees(due)}</b>
            <span>Fees due</span>
          </div>
        </div>
        <div className="card">
          <h3>Latest updates</h3>
          <NotificationsList notes={state.notes} role={user.r} />
        </div>
        {!isParent ? (
          <div className="card">
            <h3>Assignments</h3>
            {state.assign.map((item, idx) => (
              <p key={`${item.c}-${item.n}-${idx}`}>
                {item.c}: {item.n}{' '}
                <span className="tag warn">Due {item.due}</span>
              </p>
            ))}
          </div>
        ) : null}
      </>
    );
  }

  if (tab === 'att') {
    const handleCondonation = (event: FormEvent) => {
      event.preventDefault();
      const trimmed = condReason.trim();
      if (!trimmed) {
        onToast('Enter a reason first');
        return;
      }
      onApplyCondonation(trimmed);
      setCondReason('');
    };

    return (
      <>
        <h2>Attendance</h2>
        <div className="card">
          <div className="wrap">
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Attended</th>
                  <th>%</th>
                  <th aria-label="Attendance bar" />
                </tr>
              </thead>
              <tbody>
                {Object.entries(student.att).map(([course, pair]) => {
                  const pctValue = calcPercentage(pair);
                  return (
                    <tr key={course}>
                      <td>{course}</td>
                      <td>
                        {pair[0]}/{pair[1]}
                      </td>
                      <td>{pctValue}%</td>
                      <td>
                        <div className="meter">
                          <i
                            className={pctValue < threshold ? 'low' : undefined}
                            style={{ width: `${pctValue}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p>
            Overall <b>{overallAttendance}%</b> · department requires{' '}
            <b>{threshold}%</b>
          </p>
        </div>

        {!isParent ? (
          <div className="card">
            <h3>Attendance condonation</h3>
            {student.cond ? (
              <p>
                Request status:{' '}
                <span
                  className={`tag ${
                    student.cond === 'Approved' ? 'ok' : 'warn'
                  }`}
                >
                  {student.cond}
                </span>
              </p>
            ) : (
              <form onSubmit={handleCondonation}>
                <label htmlFor="cr">Reason</label>
                <textarea
                  id="cr"
                  rows={2}
                  value={condReason}
                  onChange={(event) => setCondReason(event.target.value)}
                  placeholder="e.g. medical leave"
                />
                <div className="stack-gap">
                  <button type="submit">Apply for condonation</button>
                </div>
              </form>
            )}
          </div>
        ) : null}
      </>
    );
  }

  if (tab === 'reg') {
    const open = state.regOpen;
    const registeredCredits = calcRegisteredCredits(student, state.courses);
    const earnedCredits = calcCgpa(student).c;

    return (
      <>
        <h2>Course and elective registration</h2>
        <p>
          Window:{' '}
          <span className={`tag ${open ? 'ok' : 'bad'}`}>
            {open ? 'Open' : 'Closed'}
          </span>
        </p>
        <div className="card wrap">
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Type</th>
                <th>Credits</th>
                <th aria-label="Action" />
              </tr>
            </thead>
            <tbody>
              {state.courses.map((course) => {
                const enrolled = student.el.includes(course.id);
                return (
                  <tr key={course.id}>
                    <td>{course.n}</td>
                    <td>{course.t}</td>
                    <td>{course.cr}</td>
                    <td>
                      <button
                        type="button"
                        className={`sm ${enrolled ? 'ghost' : ''}`}
                        disabled={!open}
                        onClick={() => onToggleCourse(course.id)}
                      >
                        {enrolled ? 'Drop' : 'Register'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p>
          Registered credits: <b>{registeredCredits}</b> · Credits earned so
          far: <b>{earnedCredits}</b>
        </p>
      </>
    );
  }

  if (tab === 'exam') {
    const sgpa = calcCgpa(student);

    return (
      <>
        <h2>Examinations and results</h2>
        <div className="card wrap">
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Credits</th>
                <th>Marks</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {student.res.map((result) => (
                <tr key={result.c}>
                  <td>{result.c}</td>
                  <td>{result.cr}</td>
                  <td>{result.m ?? 'Pending'}</td>
                  <td>
                    {result.m === null || result.m === undefined ? (
                      '–'
                    ) : (
                      <span
                        className={`tag ${
                          gradePoint(result.m) > 0 ? 'ok' : 'bad'
                        }`}
                      >
                        {letterGrade(result.m)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          SGPA <b>{sgpa.g}</b> · Credits earned <b>{sgpa.c}</b>
        </p>
        <div className="card">
          <h3>Exam schedule</h3>
          <p>
            Data Structures – 2 Dec, 10:00 · Database Systems – 5 Dec, 10:00 ·
            Operating Systems – 9 Dec, 10:00
          </p>
        </div>
      </>
    );
  }

  if (tab === 'fee') {
    return (
      <>
        <h2>Fees</h2>
        <div className="card wrap">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Amount</th>
                <th>Status</th>
                <th aria-label="Action" />
              </tr>
            </thead>
            <tbody>
              {student.fees.map((fee) => (
                <tr key={fee.id}>
                  <td>{fee.n}</td>
                  <td>{formatRupees(fee.a)}</td>
                  <td>
                    <span className={`tag ${fee.paid ? 'ok' : 'bad'}`}>
                      {fee.paid ? 'Paid' : 'Due'}
                    </span>
                  </td>
                  <td>
                    {fee.paid ? (
                      <button
                        type="button"
                        className="sm ghost"
                        onClick={() => onOpenReceiptModal(fee.id)}
                      >
                        Receipt
                      </button>
                    ) : isParent ? null : (
                      <button
                        type="button"
                        className="sm"
                        onClick={() => onOpenPayModal(fee.id)}
                      >
                        Pay online
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  if (tab === 'gr') {
    const myGrievances = state.griev.filter(
      (item) => item.by === user.sid,
    );

    const handleGrievanceSubmit = (event: FormEvent) => {
      event.preventDefault();
      const trimmed = grievanceText.trim();
      if (!trimmed) {
        onToast('Describe the complaint first');
        return;
      }
      onSubmitGrievance(trimmed);
      setGrievanceText('');
    };

    return (
      <>
        <h2>Grievance portal</h2>
        <form className="card" onSubmit={handleGrievanceSubmit}>
          <label htmlFor="gt">Describe your complaint</label>
          <textarea
            id="gt"
            rows={2}
            value={grievanceText}
            onChange={(event) => setGrievanceText(event.target.value)}
          />
          <div className="stack-gap">
            <button type="submit">Submit grievance</button>
          </div>
        </form>
        <div className="card wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Complaint</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myGrievances.length > 0 ? (
                myGrievances.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.t}</td>
                    <td>
                      <span
                        className={`tag ${
                          item.st === 'Resolved' ? 'ok' : 'warn'
                        }`}
                      >
                        {item.st}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>No grievances submitted.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  return (
    <>
      <h2>Notifications</h2>
      <div className="card">
        <NotificationsList notes={state.notes} role={user.r} />
      </div>
    </>
  );
}
