const express = require('express');
const pool = require('../db');
const { badRequest, notFound, conflict } = require('../utils/errors');
const { wajibAngka, validasiNilai } = require('../utils/validate');
const { sinkronStatusUjian } = require('../services/kelulusan');

const router = express.Router();

const SELECT_PESERTA = `
  SELECT p.id_peserta, p.id_ujian, p.nis, s.nama,
         u.nama_ujian, u.tanggal, u.kkm, m.nama_matpel,
         p.nilai, p.status
    FROM peserta p
    JOIN siswa s          ON s.nis = p.nis
    JOIN ujian u          ON u.id_ujian = p.id_ujian
    JOIN mata_pelajaran m ON m.id_matpel = u.id_matpel`;

async function ambilPeserta(id) {
  const { rows } = await pool.query(`${SELECT_PESERTA} WHERE p.id_peserta = $1`, [id]);
  if (rows.length === 0) throw notFound(`Peserta dengan id ${id} tidak ditemukan.`);
  return rows[0];
}

// GET /api/peserta - semua peserta (untuk tabel di frontend)
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`${SELECT_PESERTA} ORDER BY u.tanggal, s.nama`);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/peserta/:id
router.get('/:id', async (req, res, next) => {
  try {
    res.json(await ambilPeserta(wajibAngka(req.params.id, 'ID peserta')));
  } catch (err) { next(err); }
});

// POST /api/peserta - daftarkan siswa ke ujian (nilai boleh langsung diisi)
router.post('/', async (req, res, next) => {
  try {
    const idUjian = wajibAngka(req.body.id_ujian, 'Ujian');
    const nis = String(req.body.nis ?? '').trim();
    if (!nis) throw badRequest('NIS wajib diisi.');
    const nilai = 'nilai' in req.body ? validasiNilai(req.body.nilai) : null;

    const ujian = await pool.query('SELECT 1 FROM ujian WHERE id_ujian = $1', [idUjian]);
    if (ujian.rows.length === 0) throw badRequest(`Ujian dengan id ${idUjian} tidak ditemukan.`);

    const siswa = await pool.query('SELECT 1 FROM siswa WHERE nis = $1', [nis]);
    if (siswa.rows.length === 0) throw badRequest(`Siswa dengan NIS "${nis}" tidak ditemukan.`);

    const duplikat = await pool.query(
      'SELECT 1 FROM peserta WHERE id_ujian = $1 AND nis = $2', [idUjian, nis]
    );
    if (duplikat.rows.length > 0) {
      throw conflict(`Siswa "${nis}" sudah terdaftar di ujian ini.`);
    }

    const { rows } = await pool.query(
      `INSERT INTO peserta (id_ujian, nis, nilai) VALUES ($1, $2, $3) RETURNING id_peserta`,
      [idUjian, nis, nilai]
    );

    // Logika kelulusan yang sama dengan operasi "Proses Kelulusan"
    await sinkronStatusUjian(idUjian);
    res.status(201).json(await ambilPeserta(rows[0].id_peserta));
  } catch (err) { next(err); }
});

// PUT /api/peserta/:id - isi / ubah nilai (null = dikosongkan kembali)
router.put('/:id', async (req, res, next) => {
  try {
    const id = wajibAngka(req.params.id, 'ID peserta');
    if (!('nilai' in req.body)) {
      throw badRequest('Nilai wajib diisi (gunakan null untuk mengosongkan nilai).');
    }
    const nilai = validasiNilai(req.body.nilai);

    const peserta = await pool.query(
      'SELECT id_ujian FROM peserta WHERE id_peserta = $1', [id]
    );
    if (peserta.rows.length === 0) throw notFound(`Peserta dengan id ${id} tidak ditemukan.`);

    await pool.query('UPDATE peserta SET nilai = $1 WHERE id_peserta = $2', [nilai, id]);

    // Status ikut diperbarui memakai logika kelulusan yang sama
    await sinkronStatusUjian(peserta.rows[0].id_ujian);
    res.json(await ambilPeserta(id));
  } catch (err) { next(err); }
});

// DELETE /api/peserta/:id - pendaftaran boleh dihapus bebas
router.delete('/:id', async (req, res, next) => {
  try {
    const id = wajibAngka(req.params.id, 'ID peserta');
    const { rowCount } = await pool.query('DELETE FROM peserta WHERE id_peserta = $1', [id]);
    if (rowCount === 0) throw notFound(`Peserta dengan id ${id} tidak ditemukan.`);
    res.json({ message: `Peserta "${id}" berhasil dihapus.` });
  } catch (err) { next(err); }
});

module.exports = router;
