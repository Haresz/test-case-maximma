require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { errorHandler, notFoundHandler } = require('./utils/errors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', aplikasi: 'SIA Backend' });
});

app.use('/api/siswa', require('./routes/siswa'));
app.use('/api/mata-pelajaran', require('./routes/mataPelajaran'));
app.use('/api/ujian', require('./routes/ujian'));
app.use('/api/peserta', require('./routes/peserta'));
app.use('/api/kelulusan', require('./routes/kelulusan'));
app.use('/api/laporan', require('./routes/laporan'));

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`SIA Backend berjalan di http://localhost:${PORT}`);
});
