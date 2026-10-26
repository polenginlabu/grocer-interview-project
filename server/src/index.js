import express from 'express';
import { redis } from './redis.js';
import itemsRouter from './routes/items.js';
import cartRouter from './routes/cart.js';

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/items', itemsRouter);
app.use('/api/cart', cartRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

await redis.connect();

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
