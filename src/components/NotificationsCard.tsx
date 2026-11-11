import type { NotificationItem, Role } from '../types/portal';
import { filterNotificationsForRole } from '../utils/portal';

interface NotificationsCardProps {
  notes: NotificationItem[];
  role: Role;
}

export function NotificationsList({ notes, role }: NotificationsCardProps) {
  const visible = filterNotificationsForRole(notes, role);

  if (visible.length === 0) {
    return <p>No notifications yet.</p>;
  }

  return (
    <>
      {visible.map((note, index) => (
        <div key={`${note.to}-${note.t}-${index}`} className="note">
          {note.m}
          <br />
          <small>{note.t}</small>
        </div>
      ))}
    </>
  );
}
