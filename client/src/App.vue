<script setup>
import { ref, onMounted } from 'vue';
import { api } from './api.js';
import { useCart } from './composables/useCart.js';
import ItemList from './components/ItemList.vue';
import CartForm from './components/CartForm.vue';

const items = ref([]);
const loadError = ref('');
const { cart, error, load, add, setQuantity, remove, clear } = useCart();

onMounted(async () => {
  try {
    items.value = await api.getItems();
  } catch (err) {
    loadError.value = err.message;
  }
  await load();
});
</script>

<template>
  <header>
    <h1>Grocer</h1>
  </header>

  <p v-if="loadError || error" class="error">{{ loadError || error }}</p>

  <main>
    <ItemList :items="items" @add="add" />
    <CartForm :cart="cart" @set-quantity="setQuantity" @remove="remove" @clear="clear" />
  </main>
</template>

<style scoped>
main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: start;
}
@media (max-width: 700px) {
  main {
    grid-template-columns: 1fr;
  }
}
.error {
  background: var(--error-bg);
  color: var(--error);
  padding: 0.6rem 1rem;
  border-radius: 6px;
}
</style>
