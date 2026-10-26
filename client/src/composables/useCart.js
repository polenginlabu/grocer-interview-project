import { ref } from 'vue';
import { api } from '../api.js';

function getCartId() {
  let id = localStorage.getItem('cartId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('cartId', id);
  }
  return id;
}

export function useCart() {
  const cartId = getCartId();
  const cart = ref({ items: [], totalQuantity: 0 });
  const error = ref('');

  // the API always responds with the updated cart
  async function run(call) {
    error.value = '';
    try {
      cart.value = await call();
    } catch (err) {
      error.value = err.message;
    }
  }

  function add(itemId) {
    const current = cart.value.items.find((i) => i.id === itemId)?.quantity || 0;
    return run(() => api.setQuantity(cartId, itemId, current + 1));
  }

  return {
    cart,
    error,
    add,
    load: () => run(() => api.getCart(cartId)),
    setQuantity: (itemId, quantity) => run(() => api.setQuantity(cartId, itemId, quantity)),
    remove: (itemId) => run(() => api.removeItem(cartId, itemId)),
    clear: () => run(() => api.clearCart(cartId)),
  };
}
