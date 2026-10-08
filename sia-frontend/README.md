# sia-frontend

Frontend **Sistem Informasi Akademik** — React + Vite + Tailwind CSS (tanpa library state management).

## Persyaratan

- Node.js 20+
- Backend `sia-backend` sudah berjalan di `http://localhost:4000`

## Menjalankan

```bash
# 1. Salin konfigurasi
cp .env.example .env

# 2. Install dependensi dan jalankan
npm install
npm run dev          # http://localhost:5173
```

`VITE_API_URL` di `.env` menunjuk ke alamat backend (default `http://localhost:4000`).

## Halaman

| Tab | Isi |
| --- | --- |
| Dashboard | 5 kartu statistik + tombol **Proses Kelulusan** |
| Siswa | Tabel, tambah, ubah, hapus (dengan konfirmasi) |
| Mata Pelajaran | Tabel, tambah, ubah, hapus |
| Ujian | Tabel, tambah (pilih mata pelajaran, tanggal, KKM), ubah, hapus |
| Peserta | Daftar peserta, daftarkan siswa ke ujian, ubah nilai, hapus |
| Laporan | Filter tanggal (3a), ringkasan ujian (3b), siswa gagal (3d) |

Setiap halaman menangani state **loading**, **kosong**, dan **error**.
Pesan error dari backend (termasuk penolakan hapus `409`) ditampilkan apa adanya.

## Struktur

```
index.html
vite.config.js      React + plugin Tailwind CSS v4
src/
├── App.jsx         Navigasi tab (state, tanpa router)
├── api.js          Fetch wrapper; pesan error backend dilempar sebagai Error
├── utils.js        Format tanggal, nilai, status
├── components/ui.jsx  Loading, ErrorBanner, InfoBanner, EmptyState, Card, tombol
└── pages/          Dashboard, Siswa, MataPelajaran, Ujian, Peserta, Laporan
```
