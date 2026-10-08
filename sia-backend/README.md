# sia-backend

Backend **Sistem Informasi Akademik** — Node.js + Express + PostgreSQL (query SQL langsung lewat `pg`, tanpa ORM).

## Persyaratan

- Node.js 20+
- Docker Desktop (dengan WSL integration bila dijalankan dari WSL)

## Menjalankan

```bash
# 1. Salin konfigurasi
cp .env.example .env

# 2. Nyalakan PostgreSQL (named volume "sia-pgdata" -> data tidak hilang saat container dihapus)
docker compose up -d

# 3. Muat skema + data contoh
npm run db:schema
npm run db:seed
# (atau sekaligus: npm run db:reset)

# 4. Install dependensi dan jalankan server
npm install
npm run dev          # http://localhost:4000
```

Cek cepat: `curl http://localhost:4000/api/health`

## Reset database ke kondisi awal (satu perintah)

```bash
npm run db:reset
```

> Perintah `db:*` memakai kredensial default `sia`/`sia`/`sia_db` sesuai `.env`.
> Pastikan container database sudah `docker compose up -d` sebelum dijalankan.

## Struktur

```
docker-compose.yml      PostgreSQL 16 + named volume
db/schema.sql           Skema 4 tabel (FK ON DELETE RESTRICT, UNIQUE, CHECK)
db/seed.sql             Data contoh: 8 siswa, 4 mata pelajaran, 5 ujian, 18 peserta
src/
├── server.js           Express + CORS + mount route
├── db.js               Pool koneksi pg
├── routes/             CRUD siswa, mata-pelajaran, ujian, peserta, kelulusan, laporan
├── services/kelulusan.js  Logika kelulusan (idempoten), dipakai endpoint & saat nilai diubah
├── queries/laporan.js  SEMUA query laporan (3a-3d), satu SQL tunggal per fungsi
└── utils/              Pesan error Indonesia + validasi input
```

## API

| Metode | Endpoint | Keterangan |
| --- | --- | --- |
| GET/POST/PUT/DELETE | `/api/siswa[/:nis]` | CRUD siswa |
| GET/POST/PUT/DELETE | `/api/mata-pelajaran[/:id]` | CRUD mata pelajaran |
| GET/POST/PUT/DELETE | `/api/ujian[/:id]` | CRUD ujian (tanggal, KKM) |
| GET/POST/PUT/DELETE | `/api/peserta[/:id]` | Daftarkan siswa ke ujian, isi/ubah nilai |
| POST | `/api/kelulusan/proses` | Proses kelulusan (filter opsional `{ "id_ujian": 1 }`), idempoten |
| GET | `/api/laporan/ujian?tanggal=YYYY-MM-DD` | 3a. Ujian pada tanggal tertentu (tanpa parameter = semua) |
| GET | `/api/laporan/ujian-ringkas` | 3b. Nama ujian, matpel, tanggal, jumlah peserta, jumlah lulus |
| GET | `/api/laporan/statistik` | 3c. Total siswa/matpel, jumlah lulus, tidak lulus, belum ada hasil |
| GET | `/api/laporan/siswa-gagal` | 3d. Siswa + mata pelajaran yang nilainya di bawah KKM |

Status error: `400` validasi, `404` data tidak ditemukan, `409` duplikat / data induk masih dipakai
(contoh: *"Siswa tidak bisa dihapus karena sudah terdaftar di ujian"*).

## Kasus pada data seed

- Andi lulus di semua ujian; Budi gagal di 1 ujian; Citra gagal di 2 mata pelajaran berbeda
- Dewi & Gita nilainya masih kosong; Hasan belum pernah ikut ujian
- Ujian 1 dan 2 ber tanggal sama (2026-06-15) untuk menguji filter tanggal
- Statistik: 8 siswa = 2 lulus + 3 tidak lulus + 3 belum ada hasil
