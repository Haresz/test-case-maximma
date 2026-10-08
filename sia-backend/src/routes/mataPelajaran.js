const express = require('express');
const pool = require('../db');
const { badRequest, notFound, conflict } = require('../utils/errors');
const { wajibTeks, wajibAngka } = require('../utils/validate');

const router = express.Router();

const KOLOM = 'id_matpel, nama_matpel';

// GET /api/mata-pelajaran
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT m.id_matpel, m.nama_matpel,
              COUNT(u.id_ujian)::int AS jumlah_ujian
         FROM mata_pelajaran m
         LEFT JOIN ujian u ON u.id_matpel = m.id_matpel
        GROUP BY m.id_matpel, m.nama_matpel
        ORDER BY m.id_matpel`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/mata-pelajaran/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = wajibAngka(req.params.id, 'ID mata pelajaran');
    const { rows } = await pool.query(
      `SELECT ${KOLOM} FROM mata_pelajaran m WHERE id_matpel = $1`, [id]
    );
    if (rows.length === 0) throw notFound(`Mata pelajaran dengan id ${id} tidak ditemukan.`);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// POST /api/mata-pelajaran
router.post('/', async (req, res, next) => {
  try {
    const namaMatpel = wajibTeks(req.body.nama_matpel, 'Nama mata pelajaran', 50);
    const { rows } = await pool.query(
      `INSERT INTO mata_pelajaran (nama_matpel) VALUES ($1) RETURNING ${KOLOM}`,
      [namaMatpel]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/mata-pelajaran/:id
router.put('/:id', async (req, res, next) => {
  try {
    const id = wajibAngka(req.params.id, 'ID mata pelajaran');
    const namaMatpel = wajibTeks(req.body.nama_matpel, 'Nama mata pelajaran', 50);
    const { rows } = await pool.query(
      `UPDATE mata_pelajaran SET nama_matpel = $1 WHERE id_matpel = $2 RETURNING ${KOLOM}`,
      [namaMatpel, id]
    );
    if (rows.length === 0) throw notFound(`Mata pelajaran dengan id ${id} tidak ditemukan.`);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/mata-pelajaran/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = wajibAngka(req.params.id, 'ID mata pelajaran');
    const cek = await pool.query('SELECT 1 FROM mata_pelajaran WHERE id_matpel = $1', [id]);
    if (cek.rows.length === 0) throw notFound(`Mata pelajaran dengan id ${id} tidak ditemukan.`);

    try {
      await pool.query('DELETE FROM mata_pelajaran WHERE id_matpel = $1', [id]);
    } catch (err) {
      if (err.code === '23503') {
        throw conflict('Mata pelajaran tidak bisa dihapus karena sudah dipakai ujian.');
      }
      throw err;
    }
    res.json({ message: `Mata pelajaran "${req.params.id}" berhasil dihapus.` });
  } catch (err) { next(err); }
});

module.exports = router;
