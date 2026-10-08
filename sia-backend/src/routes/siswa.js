const express = require('express');
const pool = require('../db');
const { notFound, conflict } = require('../utils/errors');
const { wajibTeks } = require('../utils/validate');

const router = express.Router();

const KOLOM = 'nis, nama, alamat';

// GET /api/siswa - daftar semua siswa
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT s.nis, s.nama, s.alamat,
              COUNT(p.id_peserta)::int AS jumlah_ujian
         FROM siswa s
         LEFT JOIN peserta p ON p.nis = s.nis
        GROUP BY s.nis, s.nama, s.alamat
        ORDER BY s.nis`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/siswa/:nis
router.get('/:nis', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT ${KOLOM} FROM siswa WHERE nis = $1`,
      [req.params.nis]
    );
    if (rows.length === 0) throw notFound(`Siswa dengan NIS "${req.params.nis}" tidak ditemukan.`);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// POST /api/siswa - tambah siswa
router.post('/', async (req, res, next) => {
  try {
    const nis = wajibTeks(req.body.nis, 'NIS', 20);
    const nama = wajibTeks(req.body.nama, 'Nama', 50);
    const alamat = wajibTeks(req.body.alamat, 'Alamat', 100);

    const duplikat = await pool.query('SELECT 1 FROM siswa WHERE nis = $1', [nis]);
    if (duplikat.rows.length > 0) throw conflict(`NIS "${nis}" sudah terdaftar.`);

    const { rows } = await pool.query(
      `INSERT INTO siswa (nis, nama, alamat) VALUES ($1, $2, $3) RETURNING ${KOLOM}`,
      [nis, nama, alamat]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/siswa/:nis - ubah data siswa (NIS sebagai pengenal)
router.put('/:nis', async (req, res, next) => {
  try {
    const nama = wajibTeks(req.body.nama, 'Nama', 50);
    const alamat = wajibTeks(req.body.alamat, 'Alamat', 100);

    const { rows } = await pool.query(
      `UPDATE siswa SET nama = $1, alamat = $2 WHERE nis = $3 RETURNING ${KOLOM}`,
      [nama, alamat, req.params.nis]
    );
    if (rows.length === 0) throw notFound(`Siswa dengan NIS "${req.params.nis}" tidak ditemukan.`);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/siswa/:nis
router.delete('/:nis', async (req, res, next) => {
  try {
    const cek = await pool.query('SELECT 1 FROM siswa WHERE nis = $1', [req.params.nis]);
    if (cek.rows.length === 0) throw notFound(`Siswa dengan NIS "${req.params.nis}" tidak ditemukan.`);

    try {
      await pool.query('DELETE FROM siswa WHERE nis = $1', [req.params.nis]);
    } catch (err) {
      if (err.code === '23503') {
        throw conflict('Siswa tidak bisa dihapus karena sudah terdaftar di ujian.');
      }
      throw err;
    }
    res.json({ message: `Siswa "${req.params.nis}" berhasil dihapus.` });
  } catch (err) { next(err); }
});

module.exports = router;
