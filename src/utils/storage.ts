import { INITIAL_STATE, MENU, USERS } from '../data/initialState';
import type { PersistedSession, PortalState, TabId } from '../types/portal';

const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY || 'vidyasetu_portal_v1';

interface StoredBundle {
  state: PortalState;
  session: PersistedSession | null;
}

export function cloneInitialState(): PortalState {
  return structuredClone(INITIAL_STATE);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidPortalState(value: unknown): value is PortalState {
  if (!isRecord(value)) return false;
  return (
    isRecord(value.policy) &&
    typeof value.regOpen === 'boolean' &&
    isRecord(value.stu) &&
    Array.isArray(value.courses) &&
    Array.isArray(value.notes) &&
    Array.isArray(value.griev) &&
    Array.isArray(value.assign)
  );
}

function isValidTabForUser(userId: string, tab: unknown): tab is TabId {
  const user = USERS[userId];
  if (!user || typeof tab !== 'string') return false;
  return MENU[user.r].some(([key]) => key === tab);
}

export function loadPortalBundle(): {
  state: PortalState;
  session: PersistedSession | null;
  recoveredFromError: boolean;
} {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { state: cloneInitialState(), session: null, recoveredFromError: false };
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !isValidPortalState(parsed.state)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return { state: cloneInitialState(), session: null, recoveredFromError: true };
    }

    let session: PersistedSession | null = null;
    if (
      isRecord(parsed.session) &&
      typeof parsed.session.userId === 'string' &&
      USERS[parsed.session.userId]
    ) {
      const tab = isValidTabForUser(parsed.session.userId, parsed.session.tab)
        ? parsed.session.tab
        : 'home';
      session = { userId: parsed.session.userId, tab };
    }

    return {
      state: parsed.state,
      session,
      recoveredFromError: false,
    };
  } catch {
    return { state: cloneInitialState(), session: null, recoveredFromError: false };
  }
}

export function savePortalBundle(
  state: PortalState,
  session: PersistedSession | null,
): boolean {
  try {
    const payload: StoredBundle = { state, session };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function clearPortalStorage(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage unavailability (e.g., private browsing restrictions)
  }
}
