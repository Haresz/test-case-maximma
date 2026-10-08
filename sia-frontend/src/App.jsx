import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Siswa from './pages/Siswa';
import MataPelajaran from './pages/MataPelajaran';
import Ujian from './pages/Ujian';
import Peserta from './pages/Peserta';
import Laporan from './pages/Laporan';

const MENU = [
  { id: 'dashboard', label: 'Dashboard', halaman: Dashboard },
  { id: 'siswa', label: 'Siswa', halaman: Siswa },
  { id: 'mata-pelajaran', label: 'Mata Pelajaran', halaman: MataPelajaran },
  { id: 'ujian', label: 'Ujian', halaman: Ujian },
  { id: 'peserta', label: 'Peserta', halaman: Peserta },
  { id: 'laporan', label: 'Laporan', halaman: Laporan },
];

export default function App() {
  const [aktif, setAktif] = useState('dashboard');
  const Halaman = MENU.find((m) => m.id === aktif).halaman;

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-6 py-4">
          <span className="mr-4 text-lg font-bold text-slate-800">
            SIA <span className="text-sm font-medium text-slate-400">Sistem Informasi Akademik</span>
          </span>
          <div className="flex flex-wrap gap-1">
            {MENU.map((m) => (
              <button
                key={m.id}
                onClick={() => setAktif(m.id)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  aktif === m.id
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Halaman />
      </main>
    </div>
  );
}
