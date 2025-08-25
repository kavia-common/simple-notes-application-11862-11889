<template>
  <div v-if="note" class="editor">
    <div class="editor-toolbar">
      <input
        v-model="localTitle"
        type="text"
        class="title-input"
        placeholder="Note title"
        aria-label="Note title"
      />
      <div class="toolbar-actions">
        <button class="btn btn-accent" @click="save">Save</button>
        <button class="btn btn-danger" @click="onDelete">Delete</button>
      </div>
    </div>

    <textarea
      v-model="localContent"
      class="content"
      placeholder="Write your note here..."
      aria-label="Note content"
    />

    <div class="hint">
      Last updated: {{ formatDate(note.updatedAt) }}
    </div>
  </div>

  <div v-else class="empty-state">
    <h2>Select or create a note</h2>
    <p>Your notes will appear here. Use the New button to create one.</p>
  </div>
</template>

<script setup lang="ts">
import type { Note } from '~/composables/useNotes';
import { useNotes } from '~/composables/useNotes';

const props = defineProps<{
  noteId: string | null;
}>();
const emit = defineEmits<{
  (e: 'deleted', id: string): void;
}>();

const { getNote, updateNote, deleteNote } = useNotes();
const note = computed<Note | undefined>(() => (props.noteId ? getNote(props.noteId) : undefined));

const localTitle = ref('');
const localContent = ref('');

// Sync local editable state when the note changes
watch(
  () => note.value?.id,
  () => {
    localTitle.value = note.value?.title ?? '';
    localContent.value = note.value?.content ?? '';
  },
  { immediate: true },
);

function save() {
  if (!note.value) return;
  updateNote(note.value.id, {
    title: localTitle.value,
    content: localContent.value,
  });
}

function onDelete() {
  if (!note.value) return;
  const confirmed = window.confirm('Delete this note? This cannot be undone.');
  if (!confirmed) return;
  const id = note.value.id;
  const ok = deleteNote(id);
  if (ok) emit('deleted', id);
}

function formatDate(iso?: string) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleString();
}
</script>

<style scoped>
.editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.title-input {
  flex: 1;
  padding: 10px 12px;
  font-size: 1.1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.title-input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.15);
}

.content {
  flex: 1;
  resize: none;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  font-size: 1rem;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
  line-height: 1.5;
  min-height: 300px;
}

.hint {
  margin-top: 8px;
  color: #6b7280;
  font-size: 0.85rem;
}

.empty-state {
  color: #6b7280;
}

.btn {
  border: none;
  border-radius: 8px;
  padding: 8px 10px;
  font-weight: 600;
  cursor: pointer;
}

.btn-accent {
  background: #ffc107; /* accent */
  color: #1f2937;
}

.btn-accent:hover {
  background: #e0a800;
}

.btn-danger {
  background: #ef4444;
  color: #fff;
}

.btn-danger:hover {
  background: #dc2626;
}
</style>
