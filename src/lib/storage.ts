// Browser-only storage helpers. SSR safe (no-ops on server).

const safe = (): Storage | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const storage = {
  get(key: string): string | null {
    return safe()?.getItem(key) ?? null;
  },
  set(key: string, value: string): void {
    safe()?.setItem(key, value);
  },
  remove(key: string): void {
    safe()?.removeItem(key);
  },
};
