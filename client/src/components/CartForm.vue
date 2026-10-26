<script setup>
defineProps({
  cart: { type: Object, required: true },
});
const emit = defineEmits(['set-quantity', 'remove', 'clear']);

function onQuantityChange(itemId, event) {
  const quantity = Number(event.target.value);
  if (Number.isInteger(quantity) && quantity >= 0) {
    emit('set-quantity', itemId, quantity);
  }
}
</script>

<template>
  <section class="card">
    <h2>Your cart</h2>

    <p v-if="cart.items.length === 0" class="empty">Your cart is empty.</p>

    <form v-else @submit.prevent>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in cart.items" :key="item.id">
            <td>
              {{ item.name }}
              <small>{{ item.category }}</small>
            </td>
            <td>
              <input
                type="number"
                min="0"
                :value="item.quantity"
                :aria-label="`Quantity of ${item.name}`"
                @change="onQuantityChange(item.id, $event)"
              />
            </td>
            <td>
              <button type="button" class="link" @click="emit('remove', item.id)">Remove</button>
            </td>
          </tr>
        </tbody>
      </table>

      <footer>
        <strong>{{ cart.totalQuantity }} item(s)</strong>
        <button type="button" @click="emit('clear')">Clear cart</button>
      </footer>
    </form>
  </section>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
th {
  text-align: left;
  font-size: 0.8rem;
  color: var(--muted);
}
td {
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--border);
}
td small {
  display: block;
  color: var(--muted);
  text-transform: capitalize;
}
input {
  width: 4rem;
}
footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}
.empty {
  color: var(--muted);
}
</style>
