import { pool } from '../db.js';

const BASE_QUERY = `
  SELECT i.id, i.name, c.id AS categoryId, c.name AS category
  FROM items i
  JOIN category c ON c.id = i.category_id
`;

export async function findAllItems() {
  const [rows] = await pool.query(`${BASE_QUERY} ORDER BY c.name, i.name`);
  return rows;
}

export async function findItemById(id) {
  const [rows] = await pool.query(`${BASE_QUERY} WHERE i.id = ?`, [id]);
  return rows[0] ?? null;
}

export async function findItemsByIds(ids) {
  if (ids.length === 0) return [];
  const [rows] = await pool.query(`${BASE_QUERY} WHERE i.id IN (?) ORDER BY c.name, i.name`, [ids]);
  return rows;
}
