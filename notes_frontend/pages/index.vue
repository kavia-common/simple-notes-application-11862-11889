<template>
  <div class="page">
    <NoteEditor :note-id="selectedId" @deleted="onDeleted" />
  </div>
</template>

<script setup lang="ts">
import { useNotes } from '~/composables/useNotes';

const selectedId = useState<string | null>('selected_note_id', () => null);
const { notes } = useNotes();

// Ensure there is a selected note on first load
onMounted(() => {
  if (!selectedId.value && notes.value.length > 0) {
    selectedId.value = notes.value[0].id;
  }
});

function onDeleted(id: string) {
  const { notes } = useNotes();
  selectedId.value = notes.value[0]?.id || null;
}
</script>

<style scoped>
.page {
  height: 100%;
}
</style>
