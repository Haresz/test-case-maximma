import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { formatNilai, formatTanggal, kelasStatus, labelStatus } from '../utils';
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
} from '../components/ui';

export default function Peserta() {
  const [data, setData] = useState([]);
  const [siswa, setSiswa] = useState([]);
  const [ujian, setUjian] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pesan, setPesan] = useState('');
  const [tampilForm, setTampilForm] = useState(false);
  const [form, setForm] = useState({ id_ujian: '', nis: '', nilai: '' });
  const [editNilai, setEditNilai] = useState(null); // { id_peserta, nilai }
  const [sedangSimpan, setSedangSimpan] = useState(false);

  const muat = useCallback(async () => {
    try {
      setError('');
      const [peserta, daftarSiswa, daftarUjian] = await Promise.all([
        api.get('/api/peserta'),
        api.get('/api/siswa'),
        api.get('/api/ujian'),
      ]);
      setData(peserta);
      setSiswa(daftarSiswa);
      setUjian(daftarUjian);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  async function daftar(event) {
    event.preventDefault();
    setSedangSimpan(true);
    setError('');
    try {
      const body = {
        id_ujian: Number(form.id_ujian),
        nis: form.nis,
        nilai: form.nilai === '' ? null : Number(form.nilai),
      };
      const hasil = await api.post('/api/peserta', body);
      setPesan(`${hasil.nama} terdaftar di ${hasil.nama_ujian} (status: ${labelStatus(hasil.status)}).`);
      setForm({ id_ujian: '', nis: '', nilai: '' });
      setTampilForm(false);
      await muat();
    } catch (err) {
      setError(err.message); // duplikat -> 409, referensi salah -> 400, nilai > 100 -> 400
    } finally {
      setSedangSimpan(false);
    }
  }

  async function simpanNilai(event) {
    event.preventDefault();
    setSedangSimpan(true);
    setError('');
    try {
      const hasil = await api.put(`/api/peserta/${editNilai.id_peserta}`, {
        nilai: editNilai.nilai === '' ? null : Number(editNilai.nilai),
      });
      setPesan(
        `Nilai ${hasil.nama} (${hasil.nama_ujian}) = ${formatNilai(hasil.nilai)}, ` +
          `status ${labelStatus(hasil.status)}.`
      );
      setEditNilai(null);
      await muat();
    } catch (err) {
      setError(err.message);
    } finally {
      setSedangSimpan(false);
    }
  }

  async function hapus(peserta) {
    if (
      !window.confirm(
        `Hapus pendaftaran ${peserta.nama} di ujian "${peserta.nama_ujian}"?`
      )
    )
      return;
    setError('');
    setPesan('');
    try {
      const hasil = await api.del(`/api/peserta/${peserta.id_peserta}`);
      setPesan(hasil.message);
      await muat();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Peserta Ujian</h1>
          <p className="text-sm text-slate-500">
            Daftarkan siswa ke ujian, isi atau ubah nilai mereka
          </p>
        </div>
        <button className={tombolTambah} onClick={() => setTampilForm(!tampilForm)}>
          {tampilForm ? 'Tutup Form' : 'Tambah Peserta'}
        </button>
      </div>

      <ErrorBanner pesan={error} onTutup={() => setError('')} />
      <InfoBanner pesan={pesan} onTutup={() => setPesan('')} />

      {tampilForm && (
        <Card judul="Daftarkan Siswa ke Ujian">
          <form onSubmit={daftar} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelDasar}>Ujian</label>
              <select
                className={inputDasar}
                value={form.id_ujian}
                onChange={(e) => setForm({ ...form, id_ujian: e.target.value })}
              >
                <option value="">-- pilih ujian --</option>
                {ujian.map((u) => (
                  <option key={u.id_ujian} value={u.id_ujian}>
                    {u.nama_ujian} ({formatTanggal(u.tanggal)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelDasar}>Siswa</label>
              <select
                className={inputDasar}
                value={form.nis}
                onChange={(e) => setForm({ ...form, nis: e.target.value })}
              >
                <option value="">-- pilih siswa --</option>
                {siswa.map((s) => (
                  <option key={s.nis} value={s.nis}>
                    {s.nis} - {s.nama}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelDasar}>Nilai (opsional, 0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                className={inputDasar}
                value={form.nilai}
                onChange={(e) => setForm({ ...form, nilai: e.target.value })}
                placeholder="kosong = belum dinilai"
              />
            </div>
            <div className="flex gap-2 sm:col-span-3">
              <button className={tombolSimpan} disabled={sedangSimpan}>
                {sedangSimpan ? 'Menyimpan...' : 'Daftarkan'}
              </button>
              <button type="button" className={tombolBatal} onClick={() => setTampilForm(false)}>
                Batal
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className="mt-4">
        <Card judul={`Daftar Peserta (${data.length})`}>
          {loading ? (
            <Loading />
          ) : data.length === 0 ? (
            <EmptyState pesan="Belum ada siswa yang terdaftar di ujian mana pun." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="px-3 py-2">NIS</th>
                    <th className="px-3 py-2">Nama</th>
                    <th className="px-3 py-2">Ujian</th>
                    <th className="px-3 py-2">Mata Pelajaran</th>
                    <th className="px-3 py-2 text-center">Nilai</th>
                    <th className="px-3 py-2 text-center">KKM</th>
                    <th className="px-3 py-2 text-center">Status</th>
                    <th className="px-3 py-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((p) => (
                    <tr key={p.id_peserta} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono">{p.nis}</td>
                      <td className="px-3 py-2">{p.nama}</td>
                      <td className="px-3 py-2">{p.nama_ujian}</td>
                      <td className="px-3 py-2">{p.nama_matpel}</td>
                      <td className="px-3 py-2 text-center">
                        {editNilai?.id_peserta === p.id_peserta ? (
                          <form onSubmit={simpanNilai} className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              className={`${inputDasar} w-20 px-2 py-1 text-center`}
                              value={editNilai.nilai}
                              onChange={(e) =>
                                setEditNilai({ ...editNilai, nilai: e.target.value })
                              }
                            />
                            <button className={tombolSimpan} disabled={sedangSimpan}>
                              Simpan
                            </button>
                            <button
                              type="button"
                              className={tombolBatal}
                              onClick={() => setEditNilai(null)}
                            >
                              Batal
                            </button>
                          </form>
                        ) : (
                          formatNilai(p.nilai)
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">{p.kkm}</td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${kelasStatus(
                            p.status
                          )}`}
                        >
                          {labelStatus(p.status)}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-2">
                          <button
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                            onClick={() =>
                              setEditNilai({
                                id_peserta: p.id_peserta,
                                nilai: p.nilai === null || p.nilai === undefined ? '' : String(p.nilai),
                              })
                            }
                          >
                            Ubah Nilai
                          </button>
                          <button className={tombolHapus} onClick={() => hapus(p)}>
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
