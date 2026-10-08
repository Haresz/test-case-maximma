import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { ErrorBanner, InfoBanner, Loading } from '../components/ui';

function Kartu({ judul, nilai, warna }) {
  const warnaTeks = {
    slate: 'text-slate-800',
    green: 'text-green-600',
    red: 'text-red-600',
    amber: 'text-amber-600',
    blue: 'text-blue-600',
  }[warna];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{judul}</p>
      <p className={`mt-2 text-3xl font-bold ${warnaTeks}`}>{nilai ?? '-'}</p>
    </div>
  );
}

export default function Dashboard() {
  const [statistik, setStatistik] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pesan, setPesan] = useState('');
  const [proses, setProses] = useState(false);

  const muat = useCallback(async () => {
    try {
      setError('');
      setStatistik(await api.get('/api/laporan/statistik'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  async function prosesKelulusan() {
    try {
      setProses(true);
      setError('');
      setPesan('');
      const ringkasan = await api.post('/api/kelulusan/proses', {});
      setPesan(
        `Proses kelulusan selesai: ${ringkasan.diproses} peserta dinilai ` +
          `(${ringkasan.lulus} lulus, ${ringkasan.tidak_lulus} tidak lulus), ` +
          `${ringkasan.diperbarui} status diperbarui.`
      );
      await muat();
    } catch (err) {
      setError(err.message);
    } finally {
      setProses(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500">Ringkasan data akademik sekolah</p>
        </div>
        <button
          onClick={prosesKelulusan}
          disabled={proses}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {proses ? 'Memproses...' : 'Proses Kelulusan'}
        </button>
      </div>

      <ErrorBanner pesan={error} onTutup={() => setError('')} />
      <InfoBanner pesan={pesan} onTutup={() => setPesan('')} />

      {loading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Kartu judul="Jumlah Siswa" nilai={statistik?.total_siswa} warna="blue" />
          <Kartu judul="Jumlah Mata Pelajaran" nilai={statistik?.total_mata_pelajaran} warna="slate" />
          <Kartu judul="Lulus" nilai={statistik?.jumlah_lulus} warna="green" />
          <Kartu judul="Tidak Lulus" nilai={statistik?.jumlah_tidak_lulus} warna="red" />
          <Kartu judul="Belum Ada Hasil" nilai={statistik?.jumlah_belum_hasil} warna="amber" />
        </div>
      )}

      {statistik && (
        <p className="mt-4 text-xs text-slate-400">
          Cek: lulus + tidak lulus + belum ada hasil ={' '}
          {statistik.jumlah_lulus + statistik.jumlah_tidak_lulus + statistik.jumlah_belum_hasil} =
          total siswa {statistik.total_siswa}
        </p>
      )}
    </div>
  );
}
