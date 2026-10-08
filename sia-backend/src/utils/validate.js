const { badRequest } = require('./errors');

// Validasi teks wajib: ada, tidak kosong, dan sesuai panjang kolom
function wajibTeks(nilai, namaField, panjangMaks) {
  if (nilai === undefined || nilai === null || String(nilai).trim() === '') {
    throw badRequest(`${namaField} wajib diisi.`);
  }
  const teks = String(nilai).trim();
  if (panjangMaks && teks.length > panjangMaks) {
    throw badRequest(`${namaField} maksimal ${panjangMaks} karakter.`);
  }
  return teks;
}

function teksOpsional(nilai, namaField, panjangMaks) {
  if (nilai === undefined || nilai === null) return null;
  const teks = String(nilai).trim();
  if (teks === '') throw badRequest(`${namaField} tidak boleh kosong.`);
  if (panjangMaks && teks.length > panjangMaks) {
    throw badRequest(`${namaField} maksimal ${panjangMaks} karakter.`);
  }
  return teks;
}

function wajibAngka(nilai, namaField) {
  if (nilai === undefined || nilai === null || String(nilai).trim() === '') {
    throw badRequest(`${namaField} wajib diisi.`);
  }
  const angka = Number(nilai);
  if (!Number.isInteger(angka)) {
    throw badRequest(`${namaField} harus berupa angka bulat.`);
  }
  return angka;
}

// Nilai ujian: antara 0 dan 100 (null hanya jika memang dikosongkan)
function validasiNilai(nilai) {
  if (nilai === null) return null;
  if (nilai === undefined || String(nilai).trim() === '') {
    throw badRequest('Nilai wajib diisi.');
  }
  const angka = Number(nilai);
  if (Number.isNaN(angka) || angka < 0 || angka > 100) {
    throw badRequest('Nilai harus antara 0 dan 100.');
  }
  return angka;
}

// Tanggal ujian: format YYYY-MM-DD atau YYYY-MM-DD HH:MM:SS
function validasiTanggal(nilai) {
  const teks = wajibTeks(nilai, 'Tanggal', null);
  if (!/^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2}(:\d{2})?)?$/.test(teks)) {
    throw badRequest('Tanggal harus berformat YYYY-MM-DD atau YYYY-MM-DD HH:MM:SS.');
  }
  return teks.replace('T', ' ');
}

function validasiKKM(nilai) {
  if (nilai === undefined || nilai === null || String(nilai).trim() === '') return 70;
  const angka = Number(nilai);
  if (Number.isNaN(angka) || angka < 0 || angka > 100) {
    throw badRequest('KKM harus antara 0 dan 100.');
  }
  return angka;
}

module.exports = { wajibTeks, teksOpsional, wajibAngka, validasiNilai, validasiTanggal, validasiKKM };
