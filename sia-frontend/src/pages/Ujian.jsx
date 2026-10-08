import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { formatTanggal, keDateTimeLokal } from '../utils';
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

const KOSONG = { nama_ujian: '', id_matpel: '', tanggal: '', kkm: 70 };

export default function Ujian() {
  const [data, setData] = useState([]);
  const [matpel, setMatpel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pesan, setPesan] = useState('');
  const [form, setForm] = useState(null);
  const [sedangSimpan, setSedangSimpan] = useState(false);

  const muat = useCallback(async () => {
    try {
      setError('');
      const [ujian, daftarMatpel] = await Promise.all([
        api.get('/api/ujian'),
        api.get('/api/mata-pelajaran'),
      ]);
      setData(ujian);
      setMatpel(daftarMatpel);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  function isiField(field, nilai) {
    setForm((f) => ({ ...f, [field]: nilai }));
  }

  async function simpan(event) {
    event.preventDefault();
    setSedangSimpan(true);
    setError('');
    try {
      const body = {
        nama_ujian: form.nama_ujian,
        id_matpel: Number(form.id_matpel),
        tanggal: form.tanggal,
        kkm: form.kkm,
      };
      if (form.ubah) {
        await api.put(`/api/ujian/${form.id_ujian}`, body);
        setPesan(`Ujian "${form.nama_ujian}" berhasil diperbarui.`);
      } else {
        await api.post('/api/ujian', body);
        setPesan(`Ujian "${form.nama_ujian}" berhasil ditambahkan.`);
      }
      setForm(null);
      await muat();
    } catch (err) {
      setError(err.message);
    } finally {
      setSedangSimpan(false);
    }
  }

  async function hapus(ujian) {
    if (!window.confirm(`Hapus ujian "${ujian.nama_ujian}"?`)) return;
    setError('');
    setPesan('');
    try {
      const hasil = await api.del(`/api/ujian/${ujian.id_ujian}`);
      setPesan(hasil.message);
      await muat();
    } catch (err) {
      setError(err.message); // 409 bila sudah ada peserta
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Data Ujian</h1>
          <p className="text-sm text-slate-500">Jadwal ujian, mata pelajaran, dan KKM</p>
        </div>
        <button className={tombolTambah} onClick={() => setForm(form ? null : { ...KOSONG })}>
          {form ? 'Tutup Form' : 'Tambah Ujian'}
        </button>
      </div>

      <ErrorBanner pesan={error} onTutup={() => setError('')} />
      <InfoBanner pesan={pesan} onTutup={() => setPesan('')} />

      {form && (
        <Card judul={form.ubah ? `Ubah Ujian #${form.id_ujian}` : 'Tambah Ujian'}>
          <form onSubmit={simpan} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={labelDasar}>Nama Ujian</label>
              <input
                className={inputDasar}
                value={form.nama_ujian}
                maxLength={50}
                onChange={(e) => isiField('nama_ujian', e.target.value)}
                placeholder="mis. UAS Matematika"
              />
            </div>
            <div>
              <label className={labelDasar}>Mata Pelajaran</label>
              <select
                className={inputDasar}
                value={form.id_matpel}
                onChange={(e) => isiField('id_matpel', e.target.value)}
              >
                <option value="">-- pilih --</option>
                {matpel.map((m) => (
                  <option key={m.id_matpel} value={m.id_matpel}>
                    {m.nama_matpel}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelDasar}>Tanggal &amp; Jam</label>
              <input
                type="datetime-local"
                className={inputDasar}
                value={form.tanggal}
                onChange={(e) => isiField('tanggal', e.target.value)}
              />
            </div>
            <div>
              <label className={labelDasar}>KKM</label>
              <input
                type="number"
                min="0"
                max="100"
                className={inputDasar}
                value={form.kkm}
                onChange={(e) => isiField('kkm', e.target.value)}
              />
            </div>
            <div className="flex gap-2 lg:col-span-4">
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
        <Card judul={`Daftar Ujian (${data.length})`}>
          {loading ? (
            <Loading />
          ) : data.length === 0 ? (
            <EmptyState pesan="Belum ada ujian terjadwal." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Nama Ujian</th>
                    <th className="px-3 py-2">Mata Pelajaran</th>
                    <th className="px-3 py-2">Tanggal</th>
                    <th className="px-3 py-2 text-center">KKM</th>
                    <th className="px-3 py-2 text-center">Peserta</th>
                    <th className="px-3 py-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((u) => (
                    <tr key={u.id_ujian} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono">{u.id_ujian}</td>
                      <td className="px-3 py-2">{u.nama_ujian}</td>
                      <td className="px-3 py-2">{u.nama_matpel}</td>
                      <td className="px-3 py-2">{formatTanggal(u.tanggal)}</td>
                      <td className="px-3 py-2 text-center">{u.kkm}</td>
                      <td className="px-3 py-2 text-center">{u.jumlah_peserta}</td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-2">
                          <button
                            className={tombolUbah}
                            onClick={() =>
                              setForm({
                                ubah: true,
                                id_ujian: u.id_ujian,
                                nama_ujian: u.nama_ujian,
                                id_matpel: u.id_matpel,
                                tanggal: keDateTimeLokal(u.tanggal),
                                kkm: u.kkm,
                              })
                            }
                          >
                            Ubah
                          </button>
                          <button className={tombolHapus} onClick={() => hapus(u)}>
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
