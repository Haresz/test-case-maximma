const pool = require('../db');

// Status diturunkan langsung dari nilai vs KKM ujiannya:
//   nilai NULL      -> belum_dinilai
//   nilai >= kkm    -> lulus
//   nilai <  kkm    -> tidak_lulus
const RUMUS_STATUS = `
  CASE
    WHEN p.nilai IS NULL THEN 'belum_dinilai'
    WHEN p.nilai >= u.kkm THEN 'lulus'
    ELSE 'tidak_lulus'
  END`;

/**
 * Menjalankan logika kelulusan untuk semua peserta
 * (atau hanya peserta pada satu ujian bila idUjian diberikan).
 * Idempoten: baris yang statusnya sudah sesuai tidak diubah lagi.
 */
async function prosesKelulusan(idUjian = null) {
  const params = [];
  let filterUjian = '';
  if (idUjian !== null && idUjian !== undefined) {
    params.push(idUjian);
    filterUjian = 'AND p.id_ujian = $1';
  }

  // Ringkasan: hanya peserta yang nilainya sudah terisi yang diproses
  const { rows: [ringkasan] } = await pool.query(
    `SELECT COUNT(*)::int AS diproses,
            COUNT(*) FILTER (WHERE p.nilai >= u.kkm)::int AS lulus,
            COUNT(*) FILTER (WHERE p.nilai <  u.kkm)::int AS tidak_lulus
       FROM peserta p
       JOIN ujian u ON u.id_ujian = p.id_ujian
      WHERE p.nilai IS NOT NULL ${filterUjian}`,
    params
  );

  const { rowCount } = await pool.query(
    `UPDATE peserta p
        SET status = ${RUMUS_STATUS}
       FROM ujian u
      WHERE u.id_ujian = p.id_ujian
        ${filterUjian}
        AND p.status IS DISTINCT FROM ${RUMUS_STATUS}`,
    params
  );

  return {
    diproses: ringkasan.diproses,
    lulus: ringkasan.lulus,
    tidak_lulus: ringkasan.tidak_lulus,
    diperbarui: rowCount,
  };
}

// Dipanggil setiap kali nilai peserta berubah lewat CRUD,
// supaya status ikut menyesuaikan tanpa perlu proses manual.
async function sinkronStatusUjian(idUjian) {
  return prosesKelulusan(idUjian);
}

module.exports = { prosesKelulusan, sinkronStatusUjian };
