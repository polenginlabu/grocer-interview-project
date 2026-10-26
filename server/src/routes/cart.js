import { Router } from 'express';
import { findItemById, findItemsByIds } from '../repositories/items.js';
import { getCartLines, setQuantity, removeItem, clearCart } from '../repositories/cart.js';

const router = Router();

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

router.param('cartId', (req, res, next, cartId) => {
  if (!UUID.test(cartId)) return res.status(400).json({ error: 'Invalid cart id' });
  next();
});

// MySQL casts "2abc" to 2, so only accept plain numbers
router.param('itemId', (req, res, next, itemId) => {
  if (!/^[1-9]\d*$/.test(itemId)) return res.status(400).json({ error: 'Invalid item id' });
  next();
});

// Redis only has item ids and quantities, item details come from MySQL
async function buildCart(cartId) {
  const lines = await getCartLines(cartId);
  const items = await findItemsByIds(lines.map((l) => l.itemId));
  const qtyById = new Map(lines.map((l) => [l.itemId, l.quantity]));

  const cartItems = items.map((item) => ({ ...item, quantity: qtyById.get(item.id) }));
  return {
    cartId,
    items: cartItems,
    totalQuantity: cartItems.reduce((sum, i) => sum + i.quantity, 0),
  };
}

router.get('/:cartId', async (req, res) => {
  res.json(await buildCart(req.params.cartId));
});

// body: { quantity }, 0 removes the item
router.put('/:cartId/items/:itemId', async (req, res) => {
  const { cartId, itemId } = req.params;
  const quantity = req.body?.quantity;

  if (!Number.isInteger(quantity) || quantity < 0) {
    return res.status(400).json({ error: 'quantity must be a whole number, 0 or more' });
  }
  if (!(await findItemById(itemId))) {
    return res.status(404).json({ error: 'Item not found' });
  }

  if (quantity === 0) await removeItem(cartId, itemId);
  else await setQuantity(cartId, itemId, quantity);

  res.json(await buildCart(cartId));
});

router.delete('/:cartId/items/:itemId', async (req, res) => {
  const { cartId, itemId } = req.params;
  await removeItem(cartId, itemId);
  res.json(await buildCart(cartId));
});

router.delete('/:cartId', async (req, res) => {
  await clearCart(req.params.cartId);
  res.json(await buildCart(req.params.cartId));
});

export default router;
