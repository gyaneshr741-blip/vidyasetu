import { MENU } from '../data/initialState';
import type { Role, TabId } from '../types/portal';

interface SidebarNavProps {
  role: Role;
  activeTab: TabId;
  onSelect: (tab: TabId) => void;
}

export function SidebarNav({ role, activeTab, onSelect }: SidebarNavProps) {
  const items = MENU[role];

  return (
    <nav id="nav" aria-label="Sections">
      {items.map(([key, label]) => (
        <button
          key={key}
          type="button"
          className={key === activeTab ? 'on' : undefined}
          aria-current={key === activeTab ? 'page' : undefined}
          onClick={() => onSelect(key)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
