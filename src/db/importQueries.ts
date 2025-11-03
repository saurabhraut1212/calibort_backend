import pool from "./index";

export async function upsertUsersBulk(
  rows: Array<{ name: string; email: string; avatar_url: string | null; reqres_id: number | null }>
): Promise<void> {
  if (rows.length === 0) return;

  const placeholders = rows.map(() => "(?, ?, ?, ?)").join(", ");
  const sql = `
    INSERT INTO users (name, email, avatar_url, reqres_id)
    VALUES ${placeholders}
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      avatar_url = VALUES(avatar_url),
      reqres_id = COALESCE(VALUES(reqres_id), reqres_id),
      provider = 'reqres',
      updated_at = CURRENT_TIMESTAMP
  `;

  const values: Array<string | number | null> = [];
  for (const r of rows) {
    values.push(r.name, r.email, r.avatar_url ?? null, r.reqres_id ?? null);
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(sql, values);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
