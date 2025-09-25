// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ==== MySQL Pool ====
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'app', // <-- pon aquí el nombre exacto de tu BD
  port: +(process.env.DB_PORT || 3308),
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  decimalNumbers: true,
});

// ==== Tablas permitidas ====
const TABLES = new Set(['carnes', 'importados', 'lacteos']);
const ensureTable = (t) => {
  if (!TABLES.has(t)) {
    const e = new Error('Tabla no permitida');
    e.status = 400;
    throw e;
  }
  return `\`${t}\``; // backticks para evitar conflictos con nombres
};

// ==== Utilidades de consulta (id + nombre; alias para compatibilidad front) ====
const SELECT_MIN = (tblQuoted) => `
  SELECT id, nombre, '' AS descripcion, NULL AS precio, '' AS imagen
  FROM ${tblQuoted}
`;

async function listAll(tabla) {
  const tbl = ensureTable(tabla);
  const [rows] = await pool.query(`${SELECT_MIN(tbl)} ORDER BY id ASC`);
  return rows;
}

async function search(tabla, q) {
  const tbl = ensureTable(tabla);
  const like = `%${q}%`;
  const sql = `
    ${SELECT_MIN(tbl)}
    WHERE LOWER(CONVERT(nombre USING utf8mb4)) LIKE LOWER(CONVERT(? USING utf8mb4))
    ORDER BY id ASC
    LIMIT 200
  `;
  const [rows] = await pool.query(sql, [like]);
  console.log(`[search/${tabla}] q="${q}" -> ${rows.length} row(s)`); // debug útil
  return rows;
}


async function byId(tabla, idNum) {
  const tbl = ensureTable(tabla);
  const [rows] = await pool.query(
    `${SELECT_MIN(tbl)} WHERE id = ?`,
    [idNum]
  );
  return rows[0] || null;
}

// ==== Healthcheck ====
app.get('/api/health', async (_req, res) => {
  try {
    const c = await pool.getConnection();
    await c.ping();
    c.release();
    res.json({ ok: true, db: 'up', tables: [...TABLES] });
  } catch (e) {
    console.error('Health error:', e);
    res.status(500).json({ ok: false, error: 'DB down' });
  }
});

// ==== Rutas genéricas: sirven para carnes/importados/lacteos ====
app.get('/api/:tabla', async (req, res) => {
  try {
    res.json(await listAll(req.params.tabla));
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Error listando' });
  }
});

app.get('/api/:tabla/buscar', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.json([]);
  try {
    res.json(await search(req.params.tabla, q));
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Error búsqueda' });
  }
});

app.get('/api/:tabla/:id', async (req, res) => {
  try {
    const idNum = Number(req.params.id);
    if (!Number.isInteger(idNum)) return res.status(400).json({ error: 'ID inválido' });
    const row = await byId(req.params.tabla, idNum);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    res.json(row);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Error detalle' });
  }
});

// Crear/Actualizar/Borrar minimalistas (solo 'nombre')
app.post('/api/:tabla', async (req, res) => {
  try {
    const tbl = ensureTable(req.params.tabla);
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'nombre es requerido' });
    const [r] = await pool.query(`INSERT INTO ${tbl} (nombre) VALUES (?)`, [nombre]);
    res.status(201).json({ id: r.insertId });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Error creando' });
  }
});

app.put('/api/:tabla/:id', async (req, res) => {
  try {
    const tbl = ensureTable(req.params.tabla);
    const idNum = Number(req.params.id);
    if (!Number.isInteger(idNum)) return res.status(400).json({ error: 'ID inválido' });
    const { nombre } = req.body;
    await pool.query(`UPDATE ${tbl} SET nombre=? WHERE id=?`, [nombre ?? null, idNum]);
    res.json({ ok: true });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Error actualizando' });
  }
});

app.delete('/api/:tabla/:id', async (req, res) => {
  try {
    const tbl = ensureTable(req.params.tabla);
    const idNum = Number(req.params.id);
    if (!Number.isInteger(idNum)) return res.status(400).json({ error: 'ID inválido' });
    await pool.query(`DELETE FROM ${tbl} WHERE id=?`, [idNum]);
    res.json({ ok: true });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Error eliminando' });
  }
});

// ==== Rutas específicas (alias cómodos) ====
for (const t of TABLES) {
  app.get(`/api/${t}`, (req, res) => listAll(t).then(d => res.json(d)).catch(e => res.status(e.status || 500).json({ error: e.message })));
  app.get(`/api/${t}/buscar`, (req, res) => {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json([]);
    search(t, q).then(d => res.json(d)).catch(e => res.status(e.status || 500).json({ error: e.message }));
  });
  app.get(`/api/${t}/:id`, (req, res) => {
    const idNum = Number(req.params.id);
    if (!Number.isInteger(idNum)) return res.status(400).json({ error: 'ID inválido' });
    byId(t, idNum).then(row => row ? res.json(row) : res.status(404).json({ error: 'No encontrado' }))
                  .catch(e => res.status(e.status || 500).json({ error: e.message }));
  });
}

// ==== Inicio ====
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`API lista en http://0.0.0.0:${PORT}`)
);
