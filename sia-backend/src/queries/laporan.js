// Semua query laporan ada di satu modul ini.
// Setiap fungsi = satu query SQL tunggal, mudah dibahas saat presentasi.
const pool = require('../db');

/**
 * 3a. Daftar ujian pada tanggal tertentu (tanpa parameter = semua ujian).
 * Filter membandingkan bagian tanggal saja (tanggal::date),
 * sehingga jam pada kolom timestamp tidak mengganggu.
 */
async function daftarUjian(tanggal = null) {
  const params = [];
  let where = '';
  if (tanggal) {
    params.push(tanggal);
    where = 'WHERE u.tanggal::date = $1::date';
  }

  const { rows } = await pool.query(
    `SELECT u.id_ujian, u.nama_ujian, m.nama_matpel, u.tanggal, u.kkm
       FROM ujian u
       JOIN mata_pelajaran m ON m.id_matpel = u.id_matpel
       ${where}
      ORDER BY u.tanggal, u.id_ujian`,
    params
  );
  return rows;
}

/**
 * 3b. Ringkasan tiap ujian: jumlah peserta dan jumlah yang lulus.
 * LEFT JOIN supaya ujian tanpa peserta tetap muncul (jumlah_peserta = 0).
 * COUNT(p.id_peserta) menghitung baris peserta, bukan baris ujian,
 * sehingga tetap 0 untuk ujian yang tidak punya peserta.
 */
async function ujianRingkas() {
  const { rows } = await pool.query(
    `SELECT u.id_ujian,
            u.nama_ujian,
            m.nama_matpel,
            u.tanggal,
            COUNT(p.id_peserta)::int  AS jumlah_peserta,
            COUNT(p.id_peserta) FILTER (WHERE p.status = 'lulus')::int AS jumlah_lulus
       FROM ujian u
       JOIN mata_pelajaran m ON m.id_matpel = u.id_matpel
       LEFT JOIN peserta p ON p.id_ujian = u.id_ujian
      GROUP BY u.id_ujian, u.nama_ujian, m.nama_matpel, u.tanggal
      ORDER BY u.tanggal, u.id_ujian`
  );
  return rows;
}

/**
 * 3c. Statistik per siswa (total siswa, total matpel, lulus,
 *     tidak lulus, belum ada hasil).
 *
 * Langkah 1: agregasi tiap siswa dari tabel peserta
 *   ada_tidak_lulus = bool_or(status = 'tidak_lulus') -> true bila minimal 1 gagal
 *   ada_lulus       = bool_or(status = 'lulus')       -> true bila minimal 1 lulus
 * Langkah 2: klasifikasi mutuex (siswa tanpa peserta -> semua NULL -> belum_hasil)
 *   tidak lulus = ada minimal satu tidak_lulus
 *   lulus       = ada minimal satu lulus DAN tidak ada tidak_lulus
 *   belum hasil = sisanya (belum pernah ikut ujian atau semua belum_dinilai)
 * Ketiganya saling lepas sehingga jumlahnya selalu = total_siswa.
 */
async function statistik() {
  const { rows } = await pool.query(
    `SELECT (SELECT COUNT(*) FROM siswa)::int             AS total_siswa,
            (SELECT COUNT(*) FROM mata_pelajaran)::int    AS total_mata_pelajaran,
            COUNT(*) FILTER (WHERE COALESCE(hasil.ada_tidak_lulus, false))::int AS jumlah_tidak_lulus,
            COUNT(*) FILTER (WHERE NOT COALESCE(hasil.ada_tidak_lulus, false)
                               AND COALESCE(hasil.ada_lulus, false))::int        AS jumlah_lulus,
            COUNT(*) FILTER (WHERE NOT COALESCE(hasil.ada_tidak_lulus, false)
                               AND NOT COALESCE(hasil.ada_lulus, false))::int    AS jumlah_belum_hasil
       FROM siswa s
       LEFT JOIN (
           SELECT nis,
                  bool_or(status = 'tidak_lulus') AS ada_tidak_lulus,
                  bool_or(status = 'lulus')       AS ada_lulus
             FROM peserta
            GROUP BY nis
       ) hasil ON hasil.nis = s.nis`
  );
  return rows[0];
}

/**
 * 3d. Siswa yang gagal: satu baris per kombinasi siswa + mata pelajaran.
 * Baris diambil dari peserta berstatus 'tidak_lulus' lalu di-UNIQUE-kan
 * per (nis, id_matpel); bila satu siswa gagal lebih dari satu ujian
 * pada mata pelajaran sama, yang ditampilkan adalah kegagalan
 * dengan nilai paling rendah (paling parah).
 */
async function siswaGagal() {
  const { rows } = await pool.query(
    `SELECT DISTINCT ON (p.nis, u.id_matpel)
            p.nis,
            s.nama,
            m.nama_matpel,
            u.nama_ujian,
            p.nilai,
            u.kkm
       FROM peserta p
       JOIN siswa s          ON s.nis = p.nis
       JOIN ujian u          ON u.id_ujian = p.id_ujian
       JOIN mata_pelajaran m ON m.id_matpel = u.id_matpel
      WHERE p.status = 'tidak_lulus'
      ORDER BY p.nis, u.id_matpel, p.nilai ASC, u.tanggal`
  );
  return rows;
}

module.exports = { daftarUjian, ujianRingkas, statistik, siswaGagal };
