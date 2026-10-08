const express = require('express');
const { badRequest } = require('../utils/errors');
const laporan = require('../queries/laporan');

const router = express.Router();

// 3a. GET /api/laporan/ujian?tanggal=YYYY-MM-DD
// Tanpa parameter -> semua ujian
router.get('/ujian', async (req, res, next) => {
  try {
    const { tanggal } = req.query;
    if (tanggal && !/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
      throw badRequest('Parameter tanggal harus berformat YYYY-MM-DD.');
    }
    res.json(await laporan.daftarUjian(tanggal || null));
  } catch (err) { next(err); }
});

// 3b. GET /api/laporan/ujian-ringkas
router.get('/ujian-ringkas', async (req, res, next) => {
  try {
    res.json(await laporan.ujianRingkas());
  } catch (err) { next(err); }
});

// 3c. GET /api/laporan/statistik
router.get('/statistik', async (req, res, next) => {
  try {
    res.json(await laporan.statistik());
  } catch (err) { next(err); }
});

// 3d. GET /api/laporan/siswa-gagal
router.get('/siswa-gagal', async (req, res, next) => {
  try {
    res.json(await laporan.siswaGagal());
  } catch (err) { next(err); }
});

module.exports = router;
