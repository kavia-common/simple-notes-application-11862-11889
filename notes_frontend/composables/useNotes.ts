/**
 * Lightweight UUID v4 generator to avoid external dependency.
 * Uses crypto.getRandomValues when available, otherwise Math.random fallback.
 */
function uuidv4(): string {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    // @ts-expect-error - TS may not recognize global crypto in some contexts
    const buf = new Uint8Array(16);
    // @ts-expect-error
    crypto.getRandomValues(buf);
    // Per RFC 4122
    buf[6] = (buf[6] & 0x0f) | 0x40; // version 4
    buf[8] = (buf[8] & 0x3f) | 0x80; // variant
    const byteToHex: string[] = [];
    for (let i = 0; i < 256; ++i) {
      byteToHex.push((i + 0x100).toString(16).substring(1));
    }
    const bth = byteToHex;
    return (
      bth[buf[0]] + bth[buf[1]] + bth[buf[2]] + bth[buf[3]] + '-' +
      bth[buf[4]] + bth[buf[5]] + '-' +
      bth[buf[6]] + bth[buf[7]] + '-' +
      bth[buf[8]] + bth[buf[9]] + '-' +
      bth[buf[10]] + bth[buf[11]] + bth[buf[12]] + bth[buf[13]] + bth[buf[14]] + bth[buf[15]]
    );
  } else {
    // Fallback (not cryptographically strong, but sufficient here)
    // eslint-disable-next-line no-bitwise
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      // eslint-disable-next-line no-bitwise
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

export type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string; // ISO string
  createdAt: string; // ISO string
};

const STORAGE_KEY = 'notes_app_notes_v1';

// PUBLIC_INTERFACE
export function useNotes() {
  /**
   * This composable provides CRUD operations for notes and persists them to localStorage.
   * It is a simple client-side store for the demo application.
   */
  const notes = useState<Note[]>('notes', () => []);
  const loaded = useState<boolean>('notes_loaded', () => false);

  // Load from localStorage once on first use
  if (process.client && !loaded.value) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Note[];
        // Basic validation/coercion
        notes.value = parsed
          .filter((n) => n && n.id && typeof n.title === 'string')
          .map((n) => ({
            ...n,
            createdAt: n.createdAt || new Date().toISOString(),
            updatedAt: n.updatedAt || new Date().toISOString(),
          }))
          // Sort by updatedAt desc initially
          .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
      } else {
        // Seed with an example note
        const now = new Date().toISOString();
        notes.value = [
          {
            id: uuidv4(),
            title: 'Welcome to Notes',
            content:
              'This is a simple notes app built with Nuxt 3.\n\n- Create new notes\n- Edit existing notes\n- Delete notes\n\nEnjoy!',
            createdAt: now,
            updatedAt: now,
          },
        ];
        persist();
      }
    } catch (e) {
      // If something goes wrong with localStorage, start fresh
      // eslint-disable-next-line no-console
      console.error('Failed to load notes from localStorage', e);
      notes.value = [];
    } finally {
      loaded.value = true;
    }
  }

  function persist() {
    if (!process.client) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes.value));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to persist notes', e);
    }
  }

  // PUBLIC_INTERFACE
  function createNote(partial?: Partial<Note>): Note {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: uuidv4(),
      title: partial?.title?.trim() || 'Untitled',
      content: partial?.content || '',
      createdAt: now,
      updatedAt: now,
    };
    notes.value = [newNote, ...notes.value];
    persist();
    return newNote;
  }

  // PUBLIC_INTERFACE
  function updateNote(id: string, updates: Partial<Pick<Note, 'title' | 'content'>>): Note | undefined {
    const idx = notes.value.findIndex((n) => n.id === id);
    if (idx === -1) return undefined;
    const updated: Note = {
      ...notes.value[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    // Move updated note to top
    notes.value = [updated, ...notes.value.filter((n) => n.id !== id)];
    persist();
    return updated;
  }

  // PUBLIC_INTERFACE
  function deleteNote(id: string): boolean {
    const before = notes.value.length;
    notes.value = notes.value.filter((n) => n.id !== id);
    if (notes.value.length !== before) {
      persist();
      return true;
    }
    return false;
  }

  // PUBLIC_INTERFACE
  function getNote(id: string): Note | undefined {
    return notes.value.find((n) => n.id === id);
  }

  // PUBLIC_INTERFACE
  function searchNotes(query: string): Note[] {
    const q = query.trim().toLowerCase();
    if (!q) return notes.value;
    return notes.value.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q),
    );
  }

  return {
    notes,
    createNote,
    updateNote,
    deleteNote,
    getNote,
    searchNotes,
  };
}
