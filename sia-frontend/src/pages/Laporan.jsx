import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { formatNilai, formatTanggal } from '../utils';
import {
  Card,
  EmptyState,
  ErrorBanner,
  Loading,
  inputDasar,
  labelDasar,
  tombolBatal,
  tombolSimpan,
} from '../components/ui';

export default function Laporan() {
  // 3a. Ujian berdasarkan tanggal
  const [tanggal, setTanggal] = useState('');
  const [ujianPerTanggal, setUjianPerTanggal] = useState([]);
  const [loadUjian, setLoadUjian] = useState(true);
  const [errUjian, setErrUjian] = useState('');

  // 3b. Ringkasan ujian
  const [ringkas, setRingkas] = useState([]);
  const [loadRingkas, setLoadRingkas] = useState(true);
  const [errRingkas, setErrRingkas] = useState('');

  // 3d. Siswa yang gagal
  const [gagal, setGagal] = useState([]);
  const [loadGagal, setLoadGagal] = useState(true);
  const [errGagal, setErrGagal] = useState('');

  const muatUjian = useCallback(async (tgl) => {
    setLoadUjian(true);
    setErrUjian('');
    try {
      const query = tgl ? `?tanggal=${tgl}` : '';
      setUjianPerTanggal(await api.get(`/api/laporan/ujian${query}`));
    } catch (err) {
      setErrUjian(err.message);
    } finally {
      setLoadUjian(false);
    }
  }, []);

  useEffect(() => {
    muatUjian('');
  }, [muatUjian]);

  useEffect(() => {
    (async () => {
      try {
        setRingkas(await api.get('/api/laporan/ujian-ringkas'));
      } catch (err) {
        setErrRingkas(err.message);
      } finally {
        setLoadRingkas(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setGagal(await api.get('/api/laporan/siswa-gagal'));
      } catch (err) {
        setErrGagal(err.message);
      } finally {
        setLoadGagal(false);
      }
    })();
  }, []);

  function tampilkanTanggal(event) {
    event.preventDefault();
    muatUjian(tanggal);
  }

  function tampilkanSemua() {
    setTanggal('');
    muatUjian('');
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Laporan</h1>
        <p className="text-sm text-slate-500">
          Daftar ujian per tanggal, ringkasan ujian, dan siswa yang gagal
        </p>
      </div>

      {/* 3a */}
      <Card judul="Ujian per Tanggal">
        <form onSubmit={tampilkanTanggal} className="mb-4 flex flex-wrap items-end gap-3">
          <div>
            <label className={labelDasar}>Tanggal (YYYY-MM-DD)</label>
            <input
              type="date"
              className={`${inputDasar} w-52`}
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
            />
          </div>
          <button className={tombolSimpan}>Tampilkan</button>
          <button type="button" className={tombolBatal} onClick={tampilkanSemua}>
            Semua Ujian
          </button>
        </form>

        <ErrorBanner pesan={errUjian} onTutup={() => setErrUjian('')} />
        {loadUjian ? (
          <Loading />
        ) : ujianPerTanggal.length === 0 ? (
          <EmptyState
            pesan={
              tanggal
                ? `Tidak ada ujian pada tanggal ${tanggal}.`
                : 'Belum ada ujian terdaftar.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="px-3 py-2">Nama Ujian</th>
                  <th className="px-3 py-2">Mata Pelajaran</th>
                  <th className="px-3 py-2">Tanggal</th>
                  <th className="px-3 py-2 text-center">KKM</th>
                </tr>
              </thead>
              <tbody>
                {ujianPerTanggal.map((u) => (
                  <tr key={u.id_ujian} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2">{u.nama_ujian}</td>
                    <td className="px-3 py-2">{u.nama_matpel}</td>
                    <td className="px-3 py-2">{formatTanggal(u.tanggal)}</td>
                    <td className="px-3 py-2 text-center">{u.kkm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 3b */}
      <div className="mt-6">
        <Card judul="Ringkasan Ujian (jumlah peserta & yang lulus)">
          <ErrorBanner pesan={errRingkas} onTutup={() => setErrRingkas('')} />
          {loadRingkas ? (
            <Loading />
          ) : ringkas.length === 0 ? (
            <EmptyState pesan="Belum ada ujian." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="px-3 py-2">Nama Ujian</th>
                    <th className="px-3 py-2">Mata Pelajaran</th>
                    <th className="px-3 py-2">Tanggal</th>
                    <th className="px-3 py-2 text-center">Jumlah Peserta</th>
                    <th className="px-3 py-2 text-center">Jumlah Lulus</th>
                  </tr>
                </thead>
                <tbody>
                  {ringkas.map((u) => (
                    <tr key={u.id_ujian} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2">{u.nama_ujian}</td>
                      <td className="px-3 py-2">{u.nama_matpel}</td>
                      <td className="px-3 py-2">{formatTanggal(u.tanggal)}</td>
                      <td className="px-3 py-2 text-center">{u.jumlah_peserta}</td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-semibold text-green-600">{u.jumlah_lulus}</span>
                        <span className="text-slate-400"> / {u.jumlah_peserta}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* 3d */}
      <div className="mt-6">
        <Card judul="Siswa yang Gagal (nilai < KKM)">
          <ErrorBanner pesan={errGagal} onTutup={() => setErrGagal('')} />
          {loadGagal ? (
            <Loading />
          ) : gagal.length === 0 ? (
            <EmptyState pesan="Tidak ada siswa yang gagal. Semua nilai di atas KKM." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="px-3 py-2">NIS</th>
                    <th className="px-3 py-2">Nama</th>
                    <th className="px-3 py-2">Mata Pelajaran</th>
                    <th className="px-3 py-2">Ujian</th>
                    <th className="px-3 py-2 text-center">Nilai</th>
                    <th className="px-3 py-2 text-center">KKM</th>
                  </tr>
                </thead>
                <tbody>
                  {gagal.map((g, i) => (
                    <tr key={`${g.nis}-${i}`} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono">{g.nis}</td>
                      <td className="px-3 py-2">{g.nama}</td>
                      <td className="px-3 py-2">{g.nama_matpel}</td>
                      <td className="px-3 py-2">{g.nama_ujian}</td>
                      <td className="px-3 py-2 text-center font-semibold text-red-600">
                        {formatNilai(g.nilai)}
                      </td>
                      <td className="px-3 py-2 text-center">{g.kkm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
