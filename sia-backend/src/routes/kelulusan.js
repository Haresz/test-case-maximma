const express = require('express');
const pool = require('../db');
const { notFound } = require('../utils/errors');
const { prosesKelulusan } = require('../services/kelulusan');

const router = express.Router();

// POST /api/kelulusan/proses
// Body opsional: { "id_ujian": 1 } -> hanya ujian itu;
// tanpa body (atau id_ujian null) -> semua ujian.
// Idempoten: dipanggil berkali-kali hasilnya sama.
router.post('/proses', async (req, res, next) => {
  try {
    const idUjian = req.body?.id_ujian ?? req.query?.id_ujian ?? null;

    if (idUjian !== null && idUjian !== undefined && idUjian !== '') {
      const id = Number(idUjian);
      if (!Number.isInteger(id)) {
        return res.status(400).json({ error: 'id_ujian harus berupa angka.' });
      }
      const { rows } = await pool.query('SELECT 1 FROM ujian WHERE id_ujian = $1', [id]);
      if (rows.length === 0) {
        throw notFound(`Ujian dengan id ${id} tidak ditemukan.`);
      }
      const ringkasan = await prosesKelulusan(id);
      return res.json({ id_ujian: id, ...ringkasan });
    }

    const ringkasan = await prosesKelulusan(null);
    res.json({ id_ujian: null, ...ringkasan });
  } catch (err) { next(err); }
});

module.exports = router;
