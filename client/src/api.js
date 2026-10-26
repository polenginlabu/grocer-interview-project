async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

export const api = {
  getItems: () => request('/items'),
  getCart: (cartId) => request(`/cart/${cartId}`),
  setQuantity: (cartId, itemId, quantity) =>
    request(`/cart/${cartId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),
  removeItem: (cartId, itemId) =>
    request(`/cart/${cartId}/items/${itemId}`, { method: 'DELETE' }),
  clearCart: (cartId) => request(`/cart/${cartId}`, { method: 'DELETE' }),
};
