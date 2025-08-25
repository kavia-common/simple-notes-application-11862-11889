<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h1 class="app-title">Notes</h1>
      <button class="btn btn-primary" @click="onCreate">
        + New
      </button>
    </div>

    <div class="search">
      <input
        v-model="query"
        type="text"
        placeholder="Search notes..."
        class="input"
        aria-label="Search notes"
      />
    </div>

    <ul class="notes-list">
      <li
        v-for="n in filtered"
        :key="n.id"
        :class="['note-item', { active: n.id === modelValue }]"
        @click="$emit('update:modelValue', n.id)"
      >
        <div class="note-title">{{ n.title || 'Untitled' }}</div>
        <div class="note-meta">
          {{ formatDate(n.updatedAt) }}
        </div>
      </li>
      <li v-if="filtered.length === 0" class="empty">
        No notes found.
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import type { Note } from '~/composables/useNotes';
import { useNotes } from '~/composables/useNotes';

type Props = {
  modelValue: string | null;
};
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void;
  (e: 'create'): void;
}>();

const { notes, searchNotes, createNote } = useNotes();
const query = ref('');

const filtered = computed<Note[]>(() => searchNotes(query.value));

function onCreate() {
  const note = createNote();
  emit('create');
  emit('update:modelValue', note.id);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}
</script>

<style scoped>
.sidebar {
  width: 300px;
  min-width: 260px;
  max-width: 360px;
  border-right: 1px solid #e5e7eb;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 12px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #424242; /* secondary */
  margin: 0;
}

.search .input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  outline: none;
  font-size: 0.95rem;
}

.search .input:focus {
  border-color: #1976d2; /* primary */
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.15);
}

.notes-list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow: auto;
  flex: 1;
}

.note-item {
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
}

.note-item:hover {
  background: #f6f9fe;
  border-color: #e0e7ff;
}

.note-item.active {
  background: #e8f2fe;
  border-color: #1976d2;
}

.note-title {
  font-weight: 600;
  color: #1f2937;
}

.note-meta {
  font-size: 0.8rem;
  color: #6b7280;
}

.empty {
  color: #6b7280;
  font-size: 0.9rem;
  padding: 8px;
  text-align: center;
}

.btn {
  border: none;
  border-radius: 8px;
  padding: 8px 10px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: #1976d2;
  color: #fff;
}

.btn-primary:hover {
  background: #155fa8;
}
</style>
