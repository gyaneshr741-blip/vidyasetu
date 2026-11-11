import { useEffect, useState, type FormEvent } from 'react';
import type {
  NotificationTarget,
  PortalState,
  TabId,
  User,
} from '../types/portal';
import { validateScoreRange } from '../utils/portal';
import { AnnouncementsForm } from './AnnouncementsForm';
import { NotificationsList } from './NotificationsCard';

interface FacultyViewProps {
  user: User;
  tab: TabId;
  state: PortalState;
  onSaveAttendance: (presentMap: Record<string, boolean>) => void;
  onPublishMarks: (marksMap: Record<string, number>) => void;
  onSendAnnouncement: (payload: {
    message: string;
    target: NotificationTarget;
    assignmentTitle: string;
  }) => void;
  onToast: (message: string) => void;
}

export function FacultyView({
  user,
  tab,
  state,
  onSaveAttendance,
  onPublishMarks,
  onSendAnnouncement,
  onToast,
}: FacultyViewProps) {
  const [presentMap, setPresentMap] = useState<Record<string, boolean>>({});
  const [marksInputs, setMarksInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    const initialAttendance: Record<string, boolean> = {};
    for (const id of Object.keys(state.stu)) {
      initialAttendance[id] = true;
    }
    setPresentMap(initialAttendance);
  }, [state.stu, tab]);

  useEffect(() => {
    if (tab === 'exam') {
      setMarksInputs({});
    }
  }, [tab]);

  if (tab === 'home') {
    return (
      <>
        <h2>Welcome, {user.n}</h2>
        <div className="grid">
          <div className="card stat">
            <b>3</b>
            <span>Subjects allocated</span>
          </div>
          <div className="card stat">
            <b>14 h</b>
            <span>Weekly workload</span>
          </div>
          <div className="card stat">
            <b>{Object.keys(state.stu).length}</b>
            <span>Students in class</span>
          </div>
        </div>
        <div className="card">
          <h3>Timetable</h3>
          <p>
            Mon 9:00 Data Structures, Room 204 · Wed 11:00 Database Systems, Lab
            2 · Fri 10:00 Operating Systems, Room 105
          </p>
        </div>
        <div className="card">
          <h3>Updates</h3>
          <NotificationsList notes={state.notes} role={user.r} />
        </div>
      </>
    );
  }

  if (tab === 'att') {
    const handleAttendanceSubmit = (event: FormEvent) => {
      event.preventDefault();
      onSaveAttendance(presentMap);
    };

    return (
      <>
        <h2>Mark attendance – Data Structures</h2>
        <form className="card" onSubmit={handleAttendanceSubmit}>
          {Object.entries(state.stu).map(([id, student]) => (
            <label key={id} className="check-row" htmlFor={`a${id}`}>
              <input
                id={`a${id}`}
                type="checkbox"
                checked={presentMap[id] ?? true}
                onChange={(event) =>
                  setPresentMap((prev) => ({
                    ...prev,
                    [id]: event.target.checked,
                  }))
                }
              />
              {student.n} ({student.dept})
            </label>
          ))}
          <div className="stack-gap">
            <button type="submit">Save attendance</button>
          </div>
        </form>
      </>
    );
  }

  if (tab === 'exam') {
    const handleMarksSubmit = (event: FormEvent) => {
      event.preventDefault();
      const parsed: Record<string, number> = {};

      for (const [id, student] of Object.entries(state.stu)) {
        const raw = marksInputs[id] ?? '';
        if (raw.trim() === '') continue;
        const result = validateScoreRange(raw, `Marks for ${student.n}`);
        if (!result.ok) {
          onToast(result.error);
          return;
        }
        parsed[id] = result.value;
      }

      if (Object.keys(parsed).length === 0) {
        onToast('Enter at least one mark');
        return;
      }

      onPublishMarks(parsed);
      setMarksInputs({});
    };

    return (
      <>
        <h2>Marks entry – Data Structures</h2>
        <form className="card" onSubmit={handleMarksSubmit}>
          {Object.entries(state.stu).map(([id, student]) => (
            <div key={id}>
              <label htmlFor={`m${id}`}>{student.n}</label>
              <input
                id={`m${id}`}
                type="number"
                min={0}
                max={100}
                value={marksInputs[id] ?? ''}
                onChange={(event) =>
                  setMarksInputs((prev) => ({
                    ...prev,
                    [id]: event.target.value,
                  }))
                }
                placeholder="Marks out of 100"
              />
            </div>
          ))}
          <div className="stack-gap">
            <button type="submit">Publish results</button>
          </div>
        </form>
      </>
    );
  }

  if (tab === 'ann') {
    return (
      <AnnouncementsForm
        allowAssignmentUpload
        defaultTarget="student"
        onSend={onSendAnnouncement}
        onToast={onToast}
      />
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
