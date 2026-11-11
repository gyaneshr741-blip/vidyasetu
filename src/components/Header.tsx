import { APP_NAME } from '../data/initialState';
import type { User } from '../types/portal';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  return (
    <header>
      <b>{APP_NAME}</b>
      <span className="role" id="who">
        {user.n} · {user.r}
      </span>
      <span className="sp" />
      <button type="button" className="ghost sm" onClick={onLogout}>
        Sign out
      </button>
    </header>
  );
}
