// "2026-06-15 08:00:00" -> "15 Jun 2026 08.00"
export function formatTanggal(value) {
  if (!value) return '-';
  const tanggal = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(tanggal.getTime())) return value;
  return tanggal.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// "2026-06-15 08:00:00" -> "15 Jun 2026"
export function formatTanggalPendek(value) {
  if (!value) return '-';
  const tanggal = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(tanggal.getTime())) return value;
  return tanggal.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Nilai database ("60.00") -> tampilan rapi ("60")
export function formatNilai(value) {
  if (value === null || value === undefined || value === '') return 'Belum dinilai';
  const angka = Number(value);
  return Number.isInteger(angka) ? String(angka) : angka.toFixed(1);
}

export function labelStatus(status) {
  const peta = {
    lulus: 'Lulus',
    tidak_lulus: 'Tidak Lulus',
    belum_dinilai: 'Belum Dinilai',
  };
  return peta[status] || status;
}

// Kelas warna lencana status
export function kelasStatus(status) {
  const peta = {
    lulus: 'bg-green-100 text-green-700',
    tidak_lulus: 'bg-red-100 text-red-700',
    belum_dinilai: 'bg-slate-200 text-slate-600',
  };
  return peta[status] || 'bg-slate-100 text-slate-600';
}

// Input datetime-local butuh "YYYY-MM-DDTHH:mm"
export function keDateTimeLokal(value) {
  if (!value) return '';
  return String(value).replace(' ', 'T').slice(0, 16);
}
