-- Skema Sistem Informasi Akademik (PostgreSQL)
-- Semua foreign key memakai ON DELETE RESTRICT:
-- menghapus data induk yang masih dipakai akan ditolak database.

DROP TABLE IF EXISTS peserta CASCADE;
DROP TABLE IF EXISTS ujian CASCADE;
DROP TABLE IF EXISTS mata_pelajaran CASCADE;
DROP TABLE IF EXISTS siswa CASCADE;

-- 1. Siswa
CREATE TABLE siswa (
    nis     VARCHAR(20)  PRIMARY KEY,
    nama    VARCHAR(50)  NOT NULL,
    alamat  VARCHAR(100) NOT NULL
);

-- 2. Mata pelajaran
CREATE TABLE mata_pelajaran (
    id_matpel   SERIAL      PRIMARY KEY,
    nama_matpel VARCHAR(50) NOT NULL
);

-- 3. Ujian (kolom 'tanggal' = perbaikan typo "TANNGAL" pada diagram)
CREATE TABLE ujian (
    id_ujian   SERIAL       PRIMARY KEY,
    nama_ujian VARCHAR(50)  NOT NULL,
    id_matpel  INTEGER      NOT NULL
                 REFERENCES mata_pelajaran (id_matpel) ON DELETE RESTRICT,
    tanggal    TIMESTAMP    NOT NULL,
    kkm        NUMERIC(5,2) NOT NULL DEFAULT 70
                 CHECK (kkm >= 0 AND kkm <= 100)
);

-- 4. Peserta: tabel penghubung ujian <-> siswa,
--    id_peserta dibuat SERIAL (bukan id_ujian auto increment)
CREATE TABLE peserta (
    id_peserta SERIAL       PRIMARY KEY,
    id_ujian   INTEGER      NOT NULL
                 REFERENCES ujian (id_ujian) ON DELETE RESTRICT,
    nis        VARCHAR(20)  NOT NULL
                 REFERENCES siswa (nis) ON DELETE RESTRICT,
    nilai      NUMERIC(5,2) CHECK (nilai IS NULL OR (nilai >= 0 AND nilai <= 100)),
    status     VARCHAR(20)  NOT NULL DEFAULT 'belum_dinilai'
                 CHECK (status IN ('belum_dinilai', 'lulus', 'tidak_lulus')),
    -- satu siswa hanya boleh terdaftar sekali di satu ujian
    CONSTRAINT uq_peserta_ujian_siswa UNIQUE (id_ujian, nis)
);

CREATE INDEX idx_ujian_tanggal  ON ujian (tanggal);
CREATE INDEX idx_peserta_nis    ON peserta (nis);
CREATE INDEX idx_peserta_ujian  ON peserta (id_ujian);
