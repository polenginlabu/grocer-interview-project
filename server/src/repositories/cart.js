import { redis } from '../redis.js';

// cart:<cartId> is a hash of itemId -> quantity
const key = (cartId) => `cart:${cartId}`;
const TTL = Number(process.env.CART_TTL_SECONDS) || 604800;

export async function getCartLines(cartId) {
  const hash = await redis.hGetAll(key(cartId));
  return Object.entries(hash).map(([itemId, qty]) => ({
    itemId: Number(itemId),
    quantity: Number(qty),
  }));
}

// reset the expiry on every change so only abandoned carts expire
export async function setQuantity(cartId, itemId, quantity) {
  await redis.multi()
    .hSet(key(cartId), String(itemId), String(quantity))
    .expire(key(cartId), TTL)
    .exec();
}

export async function removeItem(cartId, itemId) {
  await redis.hDel(key(cartId), String(itemId));
}

export async function clearCart(cartId) {
  await redis.del(key(cartId));
}
