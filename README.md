# Grocer

Small grocery store app where a shopper can view and modify their shopping cart.

- Vue 3 (Vite) front end
- Node.js / Express API
- MariaDB for items and categories
- Redis for the shopping cart

## Requirements

- Docker
- Node.js 20.6 or newer (I used Node 24)

## Running it

Start MariaDB and Redis. On the first start MariaDB also runs the SQL files in `schema/`.

```bash
docker compose up -d
```

Start the API on http://localhost:3000:

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Start the front end on http://localhost:5173 (in another terminal):

```bash
cd client
npm install
npm run dev
```

Then open http://localhost:5173.

To stop: Ctrl+C in both terminals and `docker compose down`.
To reset the database: `docker compose down -v && docker compose up -d`. The SQL files only run when the database volume is empty.

## How it works

```
Vue (5173)  --/api-->  Express (3000)  --> MariaDB: items, category
                                       --> Redis:   cart:<cartId>
```

In development Vite proxies `/api` to the Express server, so there is no CORS setup.

When the page loads the browser creates a cart id (a UUID) and saves it in localStorage. All cart requests use that id.

Each cart is a Redis hash, `cart:<cartId>`, where the field is the item id and the value is the quantity. The key expires after 7 days, and the expiry is reset every time the cart changes.

Redis only stores ids and quantities. When the API returns a cart it loads the item names and categories from MariaDB in one query (`WHERE id IN (...)`), so MariaDB stays the source of truth for item data.

The schema is the one provided, unchanged.

## API

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/items` | All items with their category |
| GET | `/api/items/:id` | One item |
| GET | `/api/cart/:cartId` | The cart |
| PUT | `/api/cart/:cartId/items/:itemId` | Set quantity, body `{ "quantity": 2 }`. 0 removes the item |
| DELETE | `/api/cart/:cartId/items/:itemId` | Remove an item |
| DELETE | `/api/cart/:cartId` | Empty the cart |

The cart endpoints all return the updated cart:

```json
{
  "cartId": "26af02f4-87f8-4bec-ac4d-163e6d8388c4",
  "items": [
    { "id": 2, "name": "Apple", "categoryId": 1, "category": "produce", "quantity": 3 }
  ],
  "totalQuantity": 3
}
```

Errors come back as `{ "error": "..." }` with status 400, 404 or 500.

Example with curl:

```bash
C=11111111-2222-4333-8444-555555555555
curl -X PUT -H 'Content-Type: application/json' -d '{"quantity":3}' localhost:3000/api/cart/$C/items/2
curl localhost:3000/api/cart/$C
```

## Project structure

```
docker-compose.yml
schema/                     SQL for category and items
server/
  src/index.js              Express setup
  src/db.js                 MariaDB connection pool
  src/redis.js              Redis client
  src/repositories/         SQL queries and Redis commands
  src/routes/               /api/items and /api/cart
client/
  src/App.vue
  src/api.js                fetch calls to the API
  src/composables/useCart.js
  src/components/ItemList.vue
  src/components/CartForm.vue
```

## Configuration

`server/.env`:

| Variable | Default |
|---|---|
| `PORT` | 3000 |
| `DB_HOST`, `DB_PORT` | 127.0.0.1, 3306 |
| `DB_USER`, `DB_PASSWORD`, `DB_NAME` | same as docker-compose.yml |
| `REDIS_URL` | redis://127.0.0.1:6379 |
| `CART_TTL_SECONDS` | 604800 (7 days) |

## Notes

- `PUT` sets the quantity instead of adding to it, so sending the same request twice gives the same result.
- The API validates the cart id (UUID), item id, and quantity, and checks that the item exists before writing to Redis.
- All SQL uses `?` placeholders.

Things I would add next: prices (`DECIMAL`), linking carts to logged-in users, a checkout that writes orders to MariaDB, a Redis volume with AOF so carts survive `docker compose down`, tests, and Dockerfiles for the API and client.

## Steps I took

1. Started the provided docker-compose file and checked the data with `mariadb` and `redis-cli`. Removed the obsolete `version:` key.
2. Created the API with `npm init`, installed `express` and `mysql2`, and added the items endpoints.
3. Installed `redis` and added the cart endpoints.
4. Created the front end with `npm create vite@latest client -- --template vue` and replaced the demo files.
5. Tested the endpoints with curl and the UI in the browser, and checked the Redis keys in TablePlus.

I used Claude Code while building this and went through it step by step, testing each part.

## Troubleshooting

- `docker: command not found`: open Docker Desktop once so it installs the CLI.
- Port 3306 in use: another MySQL is running locally. Stop it, or change the port mapping to `3307:3306` and set `DB_PORT=3307`.
- Changes to the SQL files are not applied: run `docker compose down -v` first.
