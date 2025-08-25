<template>
  <div class="layout">
    <Sidebar v-model="selectedId" @create="onCreate" />
    <main class="main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const selectedId = useState<string | null>('selected_note_id', () => null);

// Keep route query in sync (optional UX)
watch(selectedId, (id) => {
  const route = useRoute();
  const router = useRouter();
  const q = { ...route.query, note: id || undefined };
  router.replace({ query: q });
});

function onCreate() {
  // handled by Sidebar which sets selectedId
}
</script>

<style>
:root {
  --color-primary: #1976d2;
  --color-secondary: #424242;
  --color-accent: #ffc107;
  --bg: #f9fafb;
  --text: #111827;
}

html, body, #__nuxt, #__layout {
  height: 100%;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
}

.layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  height: 100vh;
}

.main {
  padding: 16px;
  overflow: auto;
}
</style>
