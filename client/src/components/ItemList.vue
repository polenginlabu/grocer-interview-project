<script setup>
import { computed } from 'vue';

const props = defineProps({
  items: { type: Array, required: true },
});
const emit = defineEmits(['add']);

const byCategory = computed(() => Object.groupBy(props.items, (item) => item.category));
</script>

<template>
  <section class="card">
    <h2>Products</h2>
    <div v-for="(items, category) in byCategory" :key="category" class="category">
      <h3>{{ category }}</h3>
      <ul>
        <li v-for="item in items" :key="item.id">
          <span>{{ item.name }}</span>
          <button type="button" @click="emit('add', item.id)">Add</button>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.category h3 {
  text-transform: capitalize;
  margin: 1rem 0 0.25rem;
  font-size: 0.95rem;
  color: var(--muted);
}
li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--border);
}
li span {
  flex: 1;
}
</style>
