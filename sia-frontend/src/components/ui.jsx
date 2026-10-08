// Komponen kecil yang dipakai bersama oleh semua halaman

export function Loading({ teks = 'Memuat data...' }) {
  return (
    <div className="flex items-center gap-3 py-8 text-slate-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
      <span>{teks}</span>
    </div>
  );
}

export function ErrorBanner({ pesan, onTutup }) {
  if (!pesan) return null;
  return (
    <div className="mb-4 flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <span>{pesan}</span>
      {onTutup && (
        <button
          onClick={onTutup}
          className="font-semibold text-red-500 hover:text-red-700"
          aria-label="Tutup pesan"
        >
          Tutup
        </button>
      )}
    </div>
  );
}

export function InfoBanner({ pesan, onTutup }) {
  if (!pesan) return null;
  return (
    <div className="mb-4 flex items-start justify-between gap-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
      <span>{pesan}</span>
      {onTutup && (
        <button
          onClick={onTutup}
          className="font-semibold text-green-600 hover:text-green-800"
          aria-label="Tutup pesan"
        >
          Tutup
        </button>
      )}
    </div>
  );
}

export function EmptyState({ pesan = 'Belum ada data.' }) {
  return (
    <div className="border-t border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
      {pesan}
    </div>
  );
}

export function Card({ judul, children, aksi }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-700">{judul}</h2>
        {aksi}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export const tombolSimpan =
  'rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50';

export const tombolBatal =
  'rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100';

export const tombolTambah =
  'rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700';

export const tombolHapus =
  'rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50';

export const tombolUbah =
  'rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100';

export const inputDasar =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none';

export const labelDasar = 'mb-1 block text-sm font-medium text-slate-600';
