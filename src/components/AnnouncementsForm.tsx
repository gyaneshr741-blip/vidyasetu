import { useState, type FormEvent } from 'react';
import type { NotificationTarget } from '../types/portal';

interface AnnouncementsFormProps {
  allowAssignmentUpload?: boolean;
  defaultTarget?: NotificationTarget;
  onSend: (payload: {
    message: string;
    target: NotificationTarget;
    assignmentTitle: string;
  }) => void;
  onToast: (message: string) => void;
}

export function AnnouncementsForm({
  allowAssignmentUpload = false,
  defaultTarget = 'all',
  onSend,
  onToast,
}: AnnouncementsFormProps) {
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<NotificationTarget>(defaultTarget);
  const [assignmentTitle, setAssignmentTitle] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    const trimmedAssignment = assignmentTitle.trim();

    if (!trimmedMessage && !trimmedAssignment) {
      onToast('Write a message first');
      return;
    }

    onSend({
      message: trimmedMessage,
      target,
      assignmentTitle: trimmedAssignment,
    });
    setMessage('');
    setAssignmentTitle('');
  };

  return (
    <>
      <h2>Announcements</h2>
      <form className="card" onSubmit={handleSubmit}>
        <label htmlFor="an">Message</label>
        <textarea
          id="an"
          rows={2}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <label htmlFor="at">Send to</label>
        <select
          id="at"
          value={target}
          onChange={(event) =>
            setTarget(event.target.value as NotificationTarget)
          }
        >
          <option value="all">Everyone</option>
          <option value="student">Students</option>
          <option value="parent">Parents</option>
        </select>
        {allowAssignmentUpload ? (
          <>
            <label htmlFor="as">Or upload assignment title</label>
            <input
              id="as"
              value={assignmentTitle}
              onChange={(event) => setAssignmentTitle(event.target.value)}
              placeholder="e.g. Assignment 3: Trees"
            />
          </>
        ) : null}
        <div className="stack-gap">
          <button type="submit">Send</button>
        </div>
      </form>
    </>
  );
}
