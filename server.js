require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;

app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'library',
    password: process.env.DB_PASSWORD,
    port: 5432,
});

// CREATE
app.post('/books', async (req, res) => {
    try {
        const { title, author, published_year } = req.body;

        const result = await pool.query(
            'INSERT INTO books (title, author, published_year) VALUES ($1, $2, $3) RETURNING *',
            [title, author, published_year]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// READ ALL
app.get('/books', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM books ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// READ ONE
app.get('/books/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT * FROM books WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Book not found');
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// UPDATE
app.put('/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, published_year } = req.body;

        const result = await pool.query(
            `UPDATE books
             SET title = $1, author = $2, published_year = $3
             WHERE id = $4
             RETURNING *`,
            [title, author, published_year, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Book not found');
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// DELETE
app.delete('/books/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM books WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Book not found');
        }

        res.json({
            message: 'Book deleted',
            book: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.listen(port, () => {
    console.log(`Сервер запущено на http://localhost:${port}/books`);
});