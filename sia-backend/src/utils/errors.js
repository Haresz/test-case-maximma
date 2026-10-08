// Error aplikasi dengan status code HTTP yang bisa dipilih route
class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function badRequest(message) {
  return new AppError(message, 400);
}

function notFound(message) {
  return new AppError(message, 404);
}

function conflict(message) {
  return new AppError(message, 409);
}

// Handler error global: pesan Indonesia + status code yang tepat
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }

  // Foreign key violation -> data induk masih dipakai
  if (err.code === '23503') {
    return res.status(409).json({
      error: 'Data tidak bisa dihapus karena masih digunakan oleh data lain.',
    });
  }

  // Unique violation -> duplikat
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Data duplikat sudah terdaftar.' });
  }

  // Not null / tipe data tidak valid
  if (err.code === '23502' || err.code === '22P02' || err.code === '22007' || err.code === '22008') {
    return res.status(400).json({ error: 'Format data tidak valid.' });
  }

  console.error(err);
  return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Endpoint tidak ditemukan.' });
}

module.exports = { AppError, badRequest, notFound, conflict, errorHandler, notFoundHandler };
