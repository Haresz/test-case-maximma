-- Data contoh untuk demo Sistem Informasi Akademik
-- Kasus yang dicakup:
--   * Andi  : lulus di SEMUA ujian
--   * Budi  : gagal di SATU ujian
--   * Citra : gagal di DUA mata pelajaran berbeda (Matematika & IPA)
--   * Dewi  : terdaftar tapi nilainya masih kosong (belum_dinilai)
--   * Gita  : nilainya masih kosong pada ujian yang diikuti
--   * Hasan : belum pernah ikut ujian sama sekali
--   * Ujian 1 dan 2 ber tanggal sama (2026-06-15) untuk menguji filter tanggal

BEGIN;

TRUNCATE TABLE peserta, ujian, mata_pelajaran, siswa RESTART IDENTITY CASCADE;

-- ---------------------------------------------------------------- siswa (8)
INSERT INTO siswa (nis, nama, alamat) VALUES
    ('24001', 'Andi Wijaya',    'Jl. Melati No. 1'),
    ('24002', 'Budi Santoso',   'Jl. Mawar No. 2'),
    ('24003', 'Citra Lestari',  'Jl. Kenanga No. 3'),
    ('24004', 'Dewi Anggraini', 'Jl. Dahlia No. 4'),
    ('24005', 'Eko Prasetyo',   'Jl. Cendana No. 5'),
    ('24006', 'Fajar Nugroho',  'Jl. Flamboyan No. 6'),
    ('24007', 'Gita Permata',   'Jl. Anggrek No. 7'),
    ('24008', 'Hasan Basri',    'Jl. Tulip No. 8');

-- ------------------------------------------------------ mata pelajaran (4)
INSERT INTO mata_pelajaran (nama_matpel) VALUES
    ('Matematika'),
    ('Bahasa Indonesia'),
    ('IPA'),
    ('Bahasa Inggris');

-- ------------------------------------------------------------- ujian (5)
INSERT INTO ujian (nama_ujian, id_matpel, tanggal, kkm) VALUES
    ('UAS Matematika',     1, '2026-06-15 08:00:00', 70),  -- id_ujian 1
    ('UAS Bahasa Indonesia', 2, '2026-06-15 10:00:00', 70), -- id_ujian 2 (tanggal sama dgn 1)
    ('UTS IPA',            3, '2026-06-20 08:00:00', 75),  -- id_ujian 3
    ('UTS Bahasa Inggris', 4, '2026-06-25 09:00:00', 70),  -- id_ujian 4
    ('Ulangan Matematika', 1, '2026-06-30 08:00:00', 65);  -- id_ujian 5

-- ------------------------------------------------------------ peserta (18)
-- Andi: lulus di semua ujian (5 ujian)
INSERT INTO peserta (id_ujian, nis, nilai, status) VALUES
    (1, '24001', 85, 'lulus'),
    (2, '24001', 80, 'lulus'),
    (3, '24001', 80, 'lulus'),   -- kkm 75
    (4, '24001', 90, 'lulus'),
    (5, '24001', 75, 'lulus');   -- kkm 65

-- Budi: gagal di satu ujian saja (Matematika, 60 < kkm 70)
INSERT INTO peserta (id_ujian, nis, nilai, status) VALUES
    (1, '24002', 60, 'tidak_lulus'),
    (2, '24002', 75, 'lulus'),
    (3, '24002', 80, 'lulus');   -- kkm 75

-- Citra: gagal di dua mata pelajaran berbeda (Matematika & IPA)
INSERT INTO peserta (id_ujian, nis, nilai, status) VALUES
    (1, '24003', 65, 'tidak_lulus'),  -- Matematika, kkm 70
    (3, '24003', 70, 'tidak_lulus'),  -- IPA, kkm 75
    (5, '24003', 70, 'lulus');        -- Ulangan MTK, kkm 65

-- Dewi: terdaftar di 2 ujian, nilai masih kosong
INSERT INTO peserta (id_ujian, nis, nilai, status) VALUES
    (1, '24004', NULL, 'belum_dinilai'),
    (2, '24004', NULL, 'belum_dinilai');

-- Eko: lulus di semua ujian yang diikuti
INSERT INTO peserta (id_ujian, nis, nilai, status) VALUES
    (2, '24005', 88, 'lulus'),
    (4, '24005', 75, 'lulus');

-- Fajar: lulus Bahasa Indonesia, gagal Bahasa Inggris (65 < kkm 70)
INSERT INTO peserta (id_ujian, nis, nilai, status) VALUES
    (2, '24006', 80, 'lulus'),
    (4, '24006', 65, 'tidak_lulus');

-- Gita: terdaftar di satu ujian, nilai masih kosong
INSERT INTO peserta (id_ujian, nis, nilai, status) VALUES
    (5, '24007', NULL, 'belum_dinilai');

-- Hasan (24008): sengaja TIDAK dimasukkan -> belum pernah ikut ujian

COMMIT;
