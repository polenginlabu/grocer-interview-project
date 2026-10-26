import { Router } from 'express';
import { findAllItems, findItemById } from '../repositories/items.js';

const router = Router();

router.get('/', async (req, res) => {
  res.json(await findAllItems());
});

router.get('/:id', async (req, res) => {
  const item = await findItemById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json(item);
});

export default router;
