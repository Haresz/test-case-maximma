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

const KOSONG = { nis: '', nama: '', alamat: '' };

export default function Siswa() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pesan, setPesan] = useState('');
  const [form, setForm] = useState(null); // null = form tertutup
  const [sedangSimpan, setSedangSimpan] = useState(false);

  const muat = useCallback(async () => {
    try {
      setError('');
      setData(await api.get('/api/siswa'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  async function simpan(event) {
    event.preventDefault();
    setSedangSimpan(true);
    setError('');
    try {
      if (form.ubah) {
        await api.put(`/api/siswa/${form.nis}`, { nama: form.nama, alamat: form.alamat });
        setPesan(`Siswa "${form.nis}" berhasil diperbarui.`);
      } else {
        await api.post('/api/siswa', form);
        setPesan(`Siswa "${form.nis}" berhasil ditambahkan.`);
      }
      setForm(null);
      await muat();
    } catch (err) {
      setError(err.message); // pesan error backend (400/409/...) tampil di atas tabel
    } finally {
      setSedangSimpan(false);
    }
  }

  async function hapus(siswa) {
    if (!window.confirm(`Hapus siswa "${siswa.nama}" (${siswa.nis})?`)) return;
    setError('');
    setPesan('');
    try {
      const hasil = await api.del(`/api/siswa/${siswa.nis}`);
      setPesan(hasil.message);
      await muat();
    } catch (err) {
      setError(err.message); // termasuk 409: "Siswa tidak bisa dihapus karena sudah terdaftar di ujian"
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Data Siswa</h1>
          <p className="text-sm text-slate-500">Tambah, ubah, hapus, dan lihat data siswa</p>
        </div>
        <button
          className={tombolTambah}
          onClick={() => setForm(form ? null : { ...KOSONG })}
        >
          {form ? 'Tutup Form' : 'Tambah Siswa'}
        </button>
      </div>

      <ErrorBanner pesan={error} onTutup={() => setError('')} />
      <InfoBanner pesan={pesan} onTutup={() => setPesan('')} />

      {form && !form.ubah && (
        <Card judul="Tambah Siswa">
          <form onSubmit={simpan} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelDasar}>NIS</label>
              <input
                className={inputDasar}
                value={form.nis}
                maxLength={20}
                onChange={(e) => setForm({ ...form, nis: e.target.value })}
                placeholder="mis. 24009"
              />
            </div>
            <div>
              <label className={labelDasar}>Nama</label>
              <input
                className={inputDasar}
                value={form.nama}
                maxLength={50}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Nama lengkap"
              />
            </div>
            <div>
              <label className={labelDasar}>Alamat</label>
              <input
                className={inputDasar}
                value={form.alamat}
                maxLength={100}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                placeholder="Alamat siswa"
              />
            </div>
            <div className="flex gap-2 sm:col-span-3">
              <button className={tombolSimpan} disabled={sedangSimpan}>
                {sedangSimpan ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button type="button" className={tombolBatal} onClick={() => setForm(null)}>
                Batal
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className="mt-4">
        <Card judul={`Daftar Siswa (${data.length})`}>
          {loading ? (
            <Loading />
          ) : data.length === 0 ? (
            <EmptyState pesan="Belum ada siswa terdaftar." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="px-3 py-2">NIS</th>
                    <th className="px-3 py-2">Nama</th>
                    <th className="px-3 py-2">Alamat</th>
                    <th className="px-3 py-2 text-center">Jumlah Ujian</th>
                    <th className="px-3 py-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((s) => (
                    <tr key={s.nis} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono">{s.nis}</td>
                      <td className="px-3 py-2">{s.nama}</td>
                      <td className="px-3 py-2 text-slate-500">{s.alamat}</td>
                      <td className="px-3 py-2 text-center">{s.jumlah_ujian}</td>
                      <td className="px-3 py-2">
                        {form?.ubah && form.nis === s.nis ? (
                          <form onSubmit={simpan} className="flex flex-wrap items-center gap-2">
                            <input
                              className={`${inputDasar} w-40`}
                              value={form.nama}
                              maxLength={50}
                              onChange={(e) => setForm({ ...form, nama: e.target.value })}
                              placeholder="Nama"
                            />
                            <input
                              className={`${inputDasar} w-52`}
                              value={form.alamat}
                              maxLength={100}
                              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                              placeholder="Alamat"
                            />
                            <button className={tombolSimpan} disabled={sedangSimpan}>
                              Simpan
                            </button>
                            <button type="button" className={tombolBatal} onClick={() => setForm(null)}>
                              Batal
                            </button>
                          </form>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              className={tombolUbah}
                              onClick={() => {
                                setForm({ ubah: true, nis: s.nis, nama: s.nama, alamat: s.alamat });
                              }}
                            >
                              Ubah
                            </button>
                            <button className={tombolHapus} onClick={() => hapus(s)}>
                              Hapus
                            </button>
                          </div>
                        )}
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
