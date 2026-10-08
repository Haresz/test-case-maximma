import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import {
  Card,
  EmptyState,
  ErrorBanner,
  InfoBanner,
  Loading,
  inputDasar,
  labelDasar,
  tombolBatal,
  tombolHapus,
  tombolSimpan,
  tombolTambah,
  tombolUbah,
} from '../components/ui';

export default function MataPelajaran() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pesan, setPesan] = useState('');
  const [namaBaru, setNamaBaru] = useState('');
  const [idUbah, setIdUbah] = useState(null);
  const [namaUbah, setNamaUbah] = useState('');
  const [sedangSimpan, setSedangSimpan] = useState(false);

  const muat = useCallback(async () => {
    try {
      setError('');
      setData(await api.get('/api/mata-pelajaran'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  async function tambah(event) {
    event.preventDefault();
    setSedangSimpan(true);
    setError('');
    try {
      const hasil = await api.post('/api/mata-pelajaran', { nama_matpel: namaBaru });
      setPesan(`Mata pelajaran "${hasil.nama_matpel}" berhasil ditambahkan.`);
      setNamaBaru('');
      await muat();
    } catch (err) {
      setError(err.message);
    } finally {
      setSedangSimpan(false);
    }
  }

  async function ubah(event) {
    event.preventDefault();
    setSedangSimpan(true);
    setError('');
    try {
      await api.put(`/api/mata-pelajaran/${idUbah}`, { nama_matpel: namaUbah });
      setPesan(`Mata pelajaran berhasil diperbarui menjadi "${namaUbah}".`);
      setIdUbah(null);
      await muat();
    } catch (err) {
      setError(err.message);
    } finally {
      setSedangSimpan(false);
    }
  }

  async function hapus(matpel) {
    if (!window.confirm(`Hapus mata pelajaran "${matpel.nama_matpel}"?`)) return;
    setError('');
    setPesan('');
    try {
      const hasil = await api.del(`/api/mata-pelajaran/${matpel.id_matpel}`);
      setPesan(hasil.message);
      await muat();
    } catch (err) {
      setError(err.message); // 409 bila sudah dipakai ujian
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Mata Pelajaran</h1>
        <p className="text-sm text-slate-500">Daftar mata pelajaran yang diajarkan</p>
      </div>

      <ErrorBanner pesan={error} onTutup={() => setError('')} />
      <InfoBanner pesan={pesan} onTutup={() => setPesan('')} />

      <Card judul="Tambah Mata Pelajaran">
        <form onSubmit={tambah} className="flex flex-wrap items-end gap-3">
          <div className="min-w-64 flex-1">
            <label className={labelDasar}>Nama Mata Pelajaran</label>
            <input
              className={inputDasar}
              value={namaBaru}
              maxLength={50}
              onChange={(e) => setNamaBaru(e.target.value)}
              placeholder="mis. Kimia"
            />
          </div>
          <button className={tombolSimpan} disabled={sedangSimpan}>
            {sedangSimpan ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </Card>

      <div className="mt-4">
        <Card judul={`Daftar Mata Pelajaran (${data.length})`}>
          {loading ? (
            <Loading />
          ) : data.length === 0 ? (
            <EmptyState pesan="Belum ada mata pelajaran." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Nama Mata Pelajaran</th>
                    <th className="px-3 py-2 text-center">Jumlah Ujian</th>
                    <th className="px-3 py-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((m) => (
                    <tr key={m.id_matpel} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono">{m.id_matpel}</td>
                      <td className="px-3 py-2">
                        {idUbah === m.id_matpel ? (
                          <form onSubmit={ubah} className="flex items-center gap-2">
                            <input
                              className={`${inputDasar} w-56`}
                              value={namaUbah}
                              maxLength={50}
                              onChange={(e) => setNamaUbah(e.target.value)}
                            />
                            <button className={tombolSimpan} disabled={sedangSimpan}>
                              Simpan
                            </button>
                            <button type="button" className={tombolBatal} onClick={() => setIdUbah(null)}>
                              Batal
                            </button>
                          </form>
                        ) : (
                          m.nama_matpel
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">{m.jumlah_ujian}</td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-2">
                          <button
                            className={tombolUbah}
                            onClick={() => {
                              setIdUbah(m.id_matpel);
                              setNamaUbah(m.nama_matpel);
                            }}
                          >
                            Ubah
                          </button>
                          <button className={tombolHapus} onClick={() => hapus(m)}>
                            Hapus
                          </button>
                        </div>
                      </td>
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
