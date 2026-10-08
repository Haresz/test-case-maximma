const express = require('express');
const pool = require('../db');
const { badRequest, notFound, conflict } = require('../utils/errors');
const { wajibTeks, wajibAngka, validasiTanggal, validasiKKM } = require('../utils/validate');
const { sinkronStatusUjian } = require('../services/kelulusan');

const router = express.Router();

const KOLOM = `u.id_ujian, u.nama_ujian, u.id_matpel, m.nama_matpel, u.tanggal, u.kkm`;
const FROM = `FROM ujian u JOIN mata_pelajaran m ON m.id_matpel = u.id_matpel`;

async function cekMatpelDipakai(idMatpel) {
  const { rows } = await pool.query('SELECT 1 FROM mata_pelajaran WHERE id_matpel = $1', [idMatpel]);
  if (rows.length === 0) throw badRequest(`Mata pelajaran dengan id ${idMatpel} tidak ditemukan.`);
}

// GET /api/ujian - daftar ujian lengkap dengan nama mata pelajaran
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT ${KOLOM},
              COUNT(p.id_peserta)::int AS jumlah_peserta
         ${FROM}
         LEFT JOIN peserta p ON p.id_ujian = u.id_ujian
        GROUP BY u.id_ujian, u.nama_ujian, u.id_matpel, m.nama_matpel, u.tanggal, u.kkm
        ORDER BY u.tanggal, u.id_ujian`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/ujian/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = wajibAngka(req.params.id, 'ID ujian');
    const { rows } = await pool.query(`SELECT ${KOLOM} ${FROM} WHERE u.id_ujian = $1`, [id]);
    if (rows.length === 0) throw notFound(`Ujian dengan id ${id} tidak ditemukan.`);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// POST /api/ujian
router.post('/', async (req, res, next) => {
  try {
    const namaUjian = wajibTeks(req.body.nama_ujian, 'Nama ujian', 50);
    const idMatpel = wajibAngka(req.body.id_matpel, 'Mata pelajaran');
    await cekMatpelDipakai(idMatpel);
    const tanggal = validasiTanggal(req.body.tanggal);
    const kkm = validasiKKM(req.body.kkm);

    const { rows } = await pool.query(
      `INSERT INTO ujian (nama_ujian, id_matpel, tanggal, kkm)
       VALUES ($1, $2, $3, $4)
       RETURNING id_ujian`,
      [namaUjian, idMatpel, tanggal, kkm]
    );
    const { rows: hasil } = await pool.query(`SELECT ${KOLOM} ${FROM} WHERE u.id_ujian = $1`, [rows[0].id_ujian]);
    res.status(201).json(hasil[0]);
  } catch (err) { next(err); }
});

// PUT /api/ujian/:id
router.put('/:id', async (req, res, next) => {
  try {
    const id = wajibAngka(req.params.id, 'ID ujian');
    const namaUjian = wajibTeks(req.body.nama_ujian, 'Nama ujian', 50);
    const idMatpel = wajibAngka(req.body.id_matpel, 'Mata pelajaran');
    await cekMatpelDipakai(idMatpel);
    const tanggal = validasiTanggal(req.body.tanggal);
    const kkm = validasiKKM(req.body.kkm);

    const { rows } = await pool.query(
      `UPDATE ujian
          SET nama_ujian = $1, id_matpel = $2, tanggal = $3, kkm = $4
        WHERE id_ujian = $5
        RETURNING id_ujian`,
      [namaUjian, idMatpel, tanggal, kkm, id]
    );
    if (rows.length === 0) throw notFound(`Ujian dengan id ${id} tidak ditemukan.`);

    // KKM bisa berubah -> status kelulusan ikut disesuaikan
    await sinkronStatusUjian(id);

    const { rows: hasil } = await pool.query(`SELECT ${KOLOM} ${FROM} WHERE u.id_ujian = $1`, [id]);
    res.json(hasil[0]);
  } catch (err) { next(err); }
});

// DELETE /api/ujian/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = wajibAngka(req.params.id, 'ID ujian');
    const cek = await pool.query('SELECT 1 FROM ujian WHERE id_ujian = $1', [id]);
    if (cek.rows.length === 0) throw notFound(`Ujian dengan id ${id} tidak ditemukan.`);

    try {
      await pool.query('DELETE FROM ujian WHERE id_ujian = $1', [id]);
    } catch (err) {
      if (err.code === '23503') {
        throw conflict('Ujian tidak bisa dihapus karena sudah ada peserta yang terdaftar.');
      }
      throw err;
    }
    res.json({ message: `Ujian "${id}" berhasil dihapus.` });
  } catch (err) { next(err); }
});

module.exports = router;
