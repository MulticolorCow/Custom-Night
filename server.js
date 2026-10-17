const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

pool.query(`
    CREATE TABLE IF NOT EXISTS cards (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        bio TEXT,
        avatar_url TEXT,
        color VARCHAR(7),
        quote TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
    )
`).catch(err => console.error('Error creando tabla:', err));

app.get('/api/cards', async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT id, name, bio, avatar_url AS "avatarUrl", color, quote
             FROM cards ORDER BY id DESC`
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'No se pudieron leer las tarjetas' });
    }
});

app.post('/api/cards', async (req, res) => {
    const { name, bio, avatarUrl, color, quote } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre es obligatorio' });
    try {
        const { rows } = await pool.query(
            `INSERT INTO cards (name, bio, avatar_url, color, quote)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, bio, avatar_url AS "avatarUrl", color, quote`,
            [name, bio, avatarUrl, color, quote]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'No se pudo guardar la tarjeta' });
    }
});

app.delete('/api/cards/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM cards WHERE id = $1', [req.params.id]);
        res.status(204).end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'No se pudo borrar la tarjeta' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));