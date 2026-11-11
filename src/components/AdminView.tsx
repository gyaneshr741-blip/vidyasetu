import { useEffect, useState, type FormEvent } from 'react';
import { USERS } from '../data/initialState';
import type {
  NotificationTarget,
  PortalState,
  TabId,
} from '../types/portal';
import {
  calcFeesDue,
  calcOverallAttendance,
  formatRupees,
  validateScoreRange,
} from '../utils/portal';
import { AnnouncementsForm } from './AnnouncementsForm';

interface AdminViewProps {
  tab: TabId;
  state: PortalState;
  onSavePolicies: (policies: Record<string, number>) => void;
  onToggleRegWindow: () => void;
  onApproveCondonation: (studentId: string) => void;
  onResolveGrievance: (grievanceId: number) => void;
  onSendAnnouncement: (payload: {
    message: string;
    target: NotificationTarget;
    assignmentTitle: string;
  }) => void;
  onToast: (message: string) => void;
}

export function AdminView({
  tab,
  state,
  onSavePolicies,
  onToggleRegWindow,
  onApproveCondonation,
  onResolveGrievance,
  onSendAnnouncement,
  onToast,
}: AdminViewProps) {
  const [policyInputs, setPolicyInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const [dept, val] of Object.entries(state.policy)) {
      next[dept] = String(val);
    }
    setPolicyInputs(next);
  }, [state.policy]);

  if (tab === 'home') {
    const openGrievances = state.griev.filter(
      (item) => item.st !== 'Resolved',
    ).length;
    const feesCollected = Object.values(state.stu)
      .flatMap((student) => student.fees)
      .filter((fee) => fee.paid)
      .reduce((sum, fee) => sum + fee.a, 0);

    return (
      <>
        <h2>Administrator dashboard</h2>
        <div className="grid">
          <div className="card stat">
            <b>{Object.keys(state.stu).length}</b>
            <span>Students</span>
          </div>
          <div className="card stat">
            <b>1</b>
            <span>Faculty</span>
          </div>
          <div className="card stat">
            <b>{openGrievances}</b>
            <span>Open grievances</span>
          </div>
          <div className="card stat">
            <b>{formatRupees(feesCollected)}</b>
            <span>Fees collected</span>
          </div>
        </div>
        <div className="card">
          <h3>Users and roles</h3>
          <div className="wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(USERS).map((u) => (
                  <tr key={u.id}>
                    <td>{u.n}</td>
                    <td>
                      <span className="tag">{u.r}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  if (tab === 'pol') {
    const condonationRequests = Object.entries(state.stu).filter(
      ([, student]) => student.cond !== null,
    );

    const handlePolicySubmit = (event: FormEvent) => {
      event.preventDefault();
      const updated: Record<string, number> = {};
      for (const dept of Object.keys(state.policy)) {
        const check = validateScoreRange(
          policyInputs[dept] ?? '',
          `${dept} minimum attendance`,
        );
        if (!check.ok) {
          onToast(check.error);
          return;
        }
        updated[dept] = check.value;
      }
      onSavePolicies(updated);
    };

    return (
      <>
        <h2>Department policies</h2>
        <form className="card" onSubmit={handlePolicySubmit}>
          {Object.keys(state.policy).map((dept) => (
            <div key={dept}>
              <label htmlFor={`p${dept}`}>{dept} minimum attendance (%)</label>
              <input
                id={`p${dept}`}
                type="number"
                min={0}
                max={100}
                value={policyInputs[dept] ?? ''}
                onChange={(event) =>
                  setPolicyInputs((prev) => ({
                    ...prev,
                    [dept]: event.target.value,
                  }))
                }
              />
            </div>
          ))}
          <div className="stack-gap">
            <button type="submit">Save policy</button>
          </div>
        </form>

        <div className="card">
          <h3>Elective registration window</h3>
          <button type="button" onClick={onToggleRegWindow}>
            {state.regOpen ? 'Close registration' : 'Open registration'}
          </button>
        </div>

        <div className="card">
          <h3>Attendance condonation requests</h3>
          {condonationRequests.length > 0 ? (
            condonationRequests.map(([id, student]) => (
              <p key={id}>
                {student.n}:{' '}
                <span
                  className={`tag ${
                    student.cond === 'Approved' ? 'ok' : 'warn'
                  }`}
                >
                  {student.cond}
                </span>{' '}
                {student.cond !== 'Approved' ? (
                  <button
                    type="button"
                    className="sm"
                    onClick={() => onApproveCondonation(id)}
                  >
                    Approve
                  </button>
                ) : null}
              </p>
            ))
          ) : (
            <p>No requests.</p>
          )}
        </div>
      </>
    );
  }

  if (tab === 'gr') {
    return (
      <>
        <h2>Grievances</h2>
        <div className="card wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Complaint</th>
                <th>Status</th>
                <th aria-label="Action" />
              </tr>
            </thead>
            <tbody>
              {state.griev.map((grievance) => {
                const resolved = grievance.st === 'Resolved';
                return (
                  <tr key={grievance.id}>
                    <td>{grievance.id}</td>
                    <td>{state.stu[grievance.by]?.n ?? grievance.by}</td>
                    <td>{grievance.t}</td>
                    <td>
                      <span className={`tag ${resolved ? 'ok' : 'warn'}`}>
                        {grievance.st}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="sm"
                        disabled={resolved}
                        onClick={() => onResolveGrievance(grievance.id)}
                      >
                        {resolved ? 'Resolved' : 'Mark resolved'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  if (tab === 'ann') {
    return (
      <AnnouncementsForm
        defaultTarget="all"
        onSend={onSendAnnouncement}
        onToast={onToast}
      />
    );
  }

  return (
    <>
      <h2>Reports</h2>
      <div className="card wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Dept</th>
              <th>Attendance</th>
              <th>Required</th>
              <th>Fees due</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(state.stu).map(([id, student]) => {
              const overall = calcOverallAttendance(student);
              const required = state.policy[student.dept] ?? 75;
              const low = overall < required;
              const feesDue = calcFeesDue(student);
              return (
                <tr key={id}>
                  <td>{student.n}</td>
                  <td>{student.dept}</td>
                  <td>{overall}%</td>
                  <td>{required}%</td>
                  <td>{formatRupees(feesDue)}</td>
                  <td>
                    <span className={`tag ${low ? 'bad' : 'ok'}`}>
                      {low ? 'Shortage' : 'Eligible'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
