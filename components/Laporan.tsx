'use client';

import React, { useState, useMemo } from 'react';
import {
  Patient,
  PatientMovement,
  Bed,
  Ruangan,
  ReconciliationSession,
  AlertItem,
  HospitalIndicators,
} from '@/lib/types';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Filter,
  Calendar,
  Building2,
  FileText,
  Search,
} from 'lucide-react';

interface LaporanProps {
  patients: Patient[];
  movements: PatientMovement[];
  beds: Bed[];
  rooms: Ruangan[];
  reconciliations: ReconciliationSession[];
  alerts: AlertItem[];
  indicators: HospitalIndicators;
  hospitalName: string;
}

export const Laporan: React.FC<LaporanProps> = ({
  patients,
  movements,
  beds,
  rooms,
  reconciliations,
  alerts,
  indicators,
  hospitalName,
}) => {
  const [reportType, setReportType] = useState<
    'pasien' | 'mutasi' | 'bed' | 'occupancy' | 'rekonsiliasi' | 'indikator'
  >('pasien');
  const [filterRuangan, setFilterRuangan] = useState<string>('ALL');

  // Export to CSV function
  const handleExportCsv = () => {
    let filename = `D-TRACK_${reportType.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    let headers: string[] = [];
    let rows: string[][] = [];

    if (reportType === 'pasien') {
      headers = ['No RM', 'Nama Pasien', 'Jenis Kelamin', 'Umur', 'Jaminan', 'Ruangan', 'Bed', 'Tgl Masuk', 'DPJP', 'Diagnosa', 'Rencana Pulang'];
      rows = patients
        .filter((p) => p.status === 'AKTIF')
        .map((p) => {
          const r = rooms.find((rm) => rm.id === p.ruanganId);
          const b = beds.find((bd) => bd.id === p.bedId);
          return [
            p.noRm,
            `"${p.namaPasien}"`,
            p.jenisKelamin,
            String(p.umur),
            p.jaminan,
            `"${r?.namaRuangan || ''}"`,
            b?.nomorBed || '',
            `${p.tanggalMasuk} ${p.jamMasuk}`,
            `"${p.dokterPj}"`,
            `"${p.diagnosaMasuk}"`,
            p.rencanaPulang ? 'Ya' : 'Tidak',
          ];
        });
    } else if (reportType === 'mutasi') {
      headers = ['Waktu Mutasi', 'No RM', 'Nama Pasien', 'Jenis Mutasi', 'Dari Ruangan', 'Dari Bed', 'Ke Ruangan', 'Ke Bed', 'Petugas', 'Alasan'];
      rows = movements.map((m) => [
        m.waktuMutasi,
        m.noRm,
        `"${m.namaPasien}"`,
        m.jenisMutasi,
        `"${m.dariRuanganNama}"`,
        m.dariNomorBed,
        `"${m.keRuanganNama}"`,
        m.keNomorBed,
        `"${m.petugas}"`,
        `"${m.alasanMutasi}"`,
      ]);
    } else if (reportType === 'bed') {
      headers = ['Nomor Bed', 'Ruangan', 'Kelas', 'Status', 'ID Pasien', 'Catatan'];
      rows = beds.map((b) => {
        const r = rooms.find((rm) => rm.id === b.ruanganId);
        return [b.nomorBed, `"${r?.namaRuangan || ''}"`, `"${r?.kelas || ''}"`, b.status, b.patientId || '-', `"${b.bookingNote || b.catatanMaintenance || ''}"`];
      });
    } else if (reportType === 'occupancy') {
      headers = ['Ruangan', 'Kelas', 'Total Bed', 'Bed Terisi', 'Bed Kosong', 'Booking', 'Occupancy (%)'];
      rows = rooms.map((r) => {
        const roomBeds = beds.filter((b) => b.ruanganId === r.id);
        const total = roomBeds.length;
        const occupied = roomBeds.filter((b) => b.status === 'TERISI' || b.status === 'AKAN_PULANG' || b.status === 'AKAN_PINDAH').length;
        const empty = roomBeds.filter((b) => b.status === 'KOSONG').length;
        const booking = roomBeds.filter((b) => b.status === 'BOOKING').length;
        const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;
        return [`"${r.namaRuangan}"`, `"${r.kelas}"`, String(total), String(occupied), String(empty), String(booking), `${pct}%`];
      });
    } else if (reportType === 'rekonsiliasi') {
      headers = ['Tanggal', 'Shift', 'Ruangan', 'Pasien Sistem', 'Pasien Aktual', 'Selisih', 'Status', 'Petugas Ruangan', 'Petugas Admisi', 'Petugas RM', 'Catatan'];
      rows = reconciliations.map((rec) => [
        rec.tanggal,
        rec.shift,
        `"${rec.ruanganNama}"`,
        String(rec.pasienSistem),
        String(rec.pasienAktual),
        String(rec.selisih),
        rec.status,
        `"${rec.petugasRuangan}"`,
        `"${rec.petugasAdmisi}"`,
        `"${rec.petugasRekamMedis}"`,
        `"${rec.catatan}"`,
      ]);
    } else {
      headers = ['Indikator', 'Nilai', 'Standar Depkes', 'Status'];
      rows = [
        ['BOR (Bed Occupancy Rate)', `${indicators.bor ?? indicators.occupancyRate}%`, '60% - 85%', 'Optimal'],
        ['ALOS (Average Length of Stay)', `${indicators.losRataRata ?? 4.2} Hari`, '4 - 5 Hari', 'Sesuai'],
        ['TOI (Turn Over Interval)', `${indicators.toi ?? 1.8} Hari`, '1 - 3 Hari', 'Optimal'],
        ['BTO (Bed Turn Over)', `${indicators.bto ?? 0.8} Kali`, '40 - 50x / Th', 'Aktif'],
        ['Total Bed', `${indicators.totalBed}`, '-', 'Kapasitas Operasional'],
        ['Bed Kosong', `${indicators.bedKosong}`, '-', 'Tersedia'],
      ];
    }

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Banner and Report Controls */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3 print:hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Pusat Laporan &amp; Ekspor Data SIMUTASIS
            </h2>
            <p className="text-xs text-slate-500">
              Cetak dan unduh laporan berkala ketersediaan bed, mutasi pasien, sensus harian, dan indikator efisiensi
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV (Excel)</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
          </div>
        </div>

        {/* Report Category Selectors */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          {[
            { id: 'pasien', label: '1. Pasien Aktif' },
            { id: 'mutasi', label: '2. Histori Mutasi' },
            { id: 'bed', label: '3. Status Bed' },
            { id: 'occupancy', label: '4. Occupancy Ruangan' },
            { id: 'rekonsiliasi', label: '5. Rekonsiliasi 3-Shift' },
            { id: 'indikator', label: '6. Indikator BOR/LOS' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setReportType(item.id as any)}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                reportType === item.id
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Printable Report Preview Sheet */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 print:border-none print:shadow-none print:p-0">
        {/* Hospital Header for Print */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-base font-bold text-slate-900 uppercase tracking-tight">{hospitalName}</h1>
              <p className="text-xs text-slate-600">SISTEM KENDALI DIGITAL TRACKING BED &amp; PATIENT MOVEMENT (SIMUTASIS)</p>
              <p className="text-[11px] text-slate-500">Jl. Kesehatan Raya No. 45 &bull; Telepon: (021) 3928-1002 &bull; Jakarta Pusat</p>
            </div>
            <div className="text-right text-xs">
              <span className="font-semibold text-slate-800">TANGGAL CETAK:</span>
              <div className="font-mono text-slate-700">30 Sep 2026, 12:00 WIB</div>
            </div>
          </div>
        </div>

        {/* Report Title */}
        <div className="mb-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase">
            {reportType === 'pasien' && 'LAPORAN REKAPITULASI PASIEN RAWAT INAP AKTIF'}
            {reportType === 'mutasi' && 'LAPORAN HISTORI PERGERAKAN & MUTASI PASIEN'}
            {reportType === 'bed' && 'LAPORAN STATUS & KETERSEDIAAN TEMPAT TIDUR'}
            {reportType === 'occupancy' && 'LAPORAN TINGKAT HUNIAN & OCCUPANCY RATE PER RUANGAN'}
            {reportType === 'rekonsiliasi' && 'LAPORAN REKONSILIASI SENSUS HARIAN 3 SHIFT'}
            {reportType === 'indikator' && 'LAPORAN INDIKATOR EFISIENSI PELAYANAN (BOR, LOS, TOI, BTO)'}
          </h2>
          <p className="text-xs text-slate-500">Periode Data: Terkini (Real-Time)</p>
        </div>

        {/* Content Table based on type */}
        <div className="overflow-x-auto text-xs">
          {reportType === 'pasien' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-y border-slate-300 font-semibold text-slate-800">
                  <th className="py-2 px-2">No.</th>
                  <th className="py-2 px-2">No. RM</th>
                  <th className="py-2 px-2">Nama Pasien</th>
                  <th className="py-2 px-2">Ruangan &amp; Bed</th>
                  <th className="py-2 px-2">Tgl Masuk</th>
                  <th className="py-2 px-2">Jaminan</th>
                  <th className="py-2 px-2">DPJP</th>
                  <th className="py-2 px-2">Diagnosa Masuk</th>
                  <th className="py-2 px-2">Rencana KRS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {patients
                  .filter((p) => p.status === 'AKTIF')
                  .map((p, i) => {
                    const r = rooms.find((rm) => rm.id === p.ruanganId);
                    const b = beds.find((bd) => bd.id === p.bedId);
                    return (
                      <tr key={p.id}>
                        <td className="py-2 px-2">{i + 1}</td>
                        <td className="py-2 px-2 font-mono font-semibold">{p.noRm}</td>
                        <td className="py-2 px-2 font-bold text-slate-900">{p.namaPasien}</td>
                        <td className="py-2 px-2">{r?.namaRuangan} [Bed: {b?.nomorBed || '-'}]</td>
                        <td className="py-2 px-2">{p.tanggalMasuk}</td>
                        <td className="py-2 px-2">{p.jaminan}</td>
                        <td className="py-2 px-2">{p.dokterPj}</td>
                        <td className="py-2 px-2">{p.diagnosaMasuk}</td>
                        <td className="py-2 px-2">{p.rencanaPulang ? 'Ya (Hari Ini)' : '-'}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}

          {reportType === 'mutasi' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-y border-slate-300 font-semibold text-slate-800">
                  <th className="py-2 px-2">Waktu Mutasi</th>
                  <th className="py-2 px-2">No. RM</th>
                  <th className="py-2 px-2">Nama Pasien</th>
                  <th className="py-2 px-2">Jenis Mutasi</th>
                  <th className="py-2 px-2">Dari</th>
                  <th className="py-2 px-2">Ke</th>
                  <th className="py-2 px-2">Petugas</th>
                  <th className="py-2 px-2">Alasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td className="py-2 px-2 font-mono">{m.waktuMutasi}</td>
                    <td className="py-2 px-2 font-mono font-semibold">{m.noRm}</td>
                    <td className="py-2 px-2 font-bold">{m.namaPasien}</td>
                    <td className="py-2 px-2 font-semibold">{m.jenisMutasi}</td>
                    <td className="py-2 px-2">{m.dariRuanganNama} (Bed {m.dariNomorBed})</td>
                    <td className="py-2 px-2">{m.keRuanganNama} (Bed {m.keNomorBed})</td>
                    <td className="py-2 px-2">{m.petugas}</td>
                    <td className="py-2 px-2">{m.alasanMutasi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'occupancy' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-y border-slate-300 font-semibold text-slate-800">
                  <th className="py-2 px-2">Nama Ruangan</th>
                  <th className="py-2 px-2">Kelas</th>
                  <th className="py-2 px-2">Gedung / Lt</th>
                  <th className="py-2 px-2">Total Bed</th>
                  <th className="py-2 px-2">Terisi</th>
                  <th className="py-2 px-2">Kosong</th>
                  <th className="py-2 px-2">Booking</th>
                  <th className="py-2 px-2">Occupancy Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rooms.map((r) => {
                  const rBeds = beds.filter((b) => b.ruanganId === r.id);
                  const total = rBeds.length;
                  const occ = rBeds.filter((b) => b.status === 'TERISI' || b.status === 'AKAN_PULANG' || b.status === 'AKAN_PINDAH').length;
                  const empty = rBeds.filter((b) => b.status === 'KOSONG').length;
                  const book = rBeds.filter((b) => b.status === 'BOOKING').length;
                  const pct = total > 0 ? Math.round((occ / total) * 100) : 0;
                  return (
                    <tr key={r.id}>
                      <td className="py-2 px-2 font-bold">{r.namaRuangan}</td>
                      <td className="py-2 px-2">{r.kelas}</td>
                      <td className="py-2 px-2">{r.gedung} &bull; Lt.{r.lantai}</td>
                      <td className="py-2 px-2 font-mono">{total}</td>
                      <td className="py-2 px-2 font-mono font-bold text-rose-700">{occ}</td>
                      <td className="py-2 px-2 font-mono font-bold text-emerald-700">{empty}</td>
                      <td className="py-2 px-2 font-mono">{book}</td>
                      <td className="py-2 px-2 font-mono font-bold">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {reportType === 'indikator' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-y border-slate-300 font-semibold text-slate-800">
                  <th className="py-2.5 px-3">Parameter Indikator</th>
                  <th className="py-2.5 px-3">Nilai Rumah Sakit</th>
                  <th className="py-2.5 px-3">Standar Nilai Ideal Depkes RI</th>
                  <th className="py-2.5 px-3">Keterangan / Evaluasi Klinis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2.5 px-3 font-bold">BOR (Bed Occupancy Rate)</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-700 text-sm">{indicators.bor ?? indicators.occupancyRate}%</td>
                  <td className="py-2.5 px-3">60% &ndash; 85%</td>
                  <td className="py-2.5 px-3 text-slate-600">Utilisasi kapasitas ruang perawatan berada dalam batas efisiensi ideal.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">ALOS (Average Length of Stay)</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-sky-700 text-sm">{indicators.losRataRata ?? 4.2} Hari</td>
                  <td className="py-2.5 px-3">4 &ndash; 5 Hari</td>
                  <td className="py-2.5 px-3 text-slate-600">Lama rawat rata-rata pasien sesuai dengan Clinical Pathway terstandar.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">TOI (Turn Over Interval)</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-700 text-sm">{indicators.toi ?? 1.8} Hari</td>
                  <td className="py-2.5 px-3">1 &ndash; 3 Hari</td>
                  <td className="py-2.5 px-3 text-slate-600">Interval tempat tidur kosong sampai terisi kembali sangat efisien.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">BTO (Bed Turn Over)</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-indigo-700 text-sm">{indicators.bto ?? 0.8} Kali</td>
                  <td className="py-2.5 px-3">40 &ndash; 50 Kali / Tahun</td>
                  <td className="py-2.5 px-3 text-slate-600">Perputaran pergantian pasien per tempat tidur berjalan aktif.</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Signature Area for Print */}
        <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <span className="text-slate-500">Petugas Ruangan:</span>
            <div className="h-14" />
            <div className="font-bold text-slate-900 border-t border-slate-300 pt-1 inline-block min-w-32">
              ( Ns. Jaga Ruangan )
            </div>
          </div>
          <div>
            <span className="text-slate-500">Verifikator Admisi / TPPRI:</span>
            <div className="h-14" />
            <div className="font-bold text-slate-900 border-t border-slate-300 pt-1 inline-block min-w-32">
              ( Petugas Admisi )
            </div>
          </div>
          <div>
            <span className="text-slate-500">Kepala Rekam Medis:</span>
            <div className="h-14" />
            <div className="font-bold text-slate-900 border-t border-slate-300 pt-1 inline-block min-w-32">
              ( Kepala Unit SIMRS &amp; RM )
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
