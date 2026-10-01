'use client';

import React, { useState, useMemo } from 'react';
import { Patient, Ruangan, Kamar, Bed } from '@/lib/types';
import { calculatePatientLOS } from '@/lib/hospitalMath';
import {
  Users,
  Search,
  Filter,
  Eye,
  EyeOff,
  ArrowRightLeft,
  LogOut,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface PasienAktifProps {
  patients: Patient[];
  rooms: Ruangan[];
  kamar: Kamar[];
  beds: Bed[];
  onSelectPatient: (patientId: string) => void;
  onOpenMutation: (patientId: string) => void;
  onOpenDischarge: (patientId: string) => void;
}

export const PasienAktif: React.FC<PasienAktifProps> = ({
  patients,
  rooms,
  kamar,
  beds,
  onSelectPatient,
  onOpenMutation,
  onOpenDischarge,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRuangan, setFilterRuangan] = useState('ALL');
  const [filterJaminan, setFilterJaminan] = useState('ALL');
  const [filterRencanaPulang, setFilterRencanaPulang] = useState('ALL');
  const [maskRm, setMaskRm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const activePatients = useMemo(() => {
    return patients.filter((p) => p.status === 'AKTIF');
  }, [patients]);

  const filteredPatients = useMemo(() => {
    return activePatients.filter((p) => {
      if (filterRuangan !== 'ALL' && p.ruanganId !== filterRuangan) return false;
      if (filterJaminan !== 'ALL' && p.jaminan !== filterJaminan) return false;
      if (filterRencanaPulang === 'YA' && !p.rencanaPulang) return false;
      if (filterRencanaPulang === 'TIDAK' && p.rencanaPulang) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const room = rooms.find((r) => r.id === p.ruanganId);
        const bed = beds.find((b) => b.id === p.bedId);
        const nameMatch = p.namaPasien.toLowerCase().includes(q);
        const rmMatch = p.noRm.toLowerCase().includes(q);
        const diagMatch = p.diagnosaMasuk.toLowerCase().includes(q);
        const roomMatch = room?.namaRuangan.toLowerCase().includes(q);
        const bedMatch = bed?.nomorBed.toLowerCase().includes(q);
        return nameMatch || rmMatch || diagMatch || roomMatch || bedMatch;
      }

      return true;
    });
  }, [activePatients, filterRuangan, filterJaminan, filterRencanaPulang, searchQuery, rooms, beds]);

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage) || 1;
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPatients.slice(start, start + itemsPerPage);
  }, [filteredPatients, currentPage, itemsPerPage]);

  const formatRm = (rm: string) => {
    if (!maskRm) return rm;
    if (rm.length > 5) return rm.slice(0, 4) + '***';
    return rm;
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Monitoring Pasien Aktif Rawat Inap
            </h2>
            <p className="text-xs text-slate-500">
              Daftar seluruh pasien yang saat ini menghuni tempat tidur rumah sakit ({activePatients.length} Pasien Aktif)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMaskRm(!maskRm)}
              className="px-2.5 py-1.5 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {maskRm ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{maskRm ? 'RM Tersensor' : 'RM Terbuka'}</span>
            </button>
          </div>
        </div>

        {/* Filter controls row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 pt-1 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama pasien, No. RM, diagnosa..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-500 focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={filterRuangan}
              onChange={(e) => {
                setFilterRuangan(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800"
            >
              <option value="ALL">Semua Ruangan ({rooms.length})</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.namaRuangan}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterJaminan}
              onChange={(e) => {
                setFilterJaminan(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800"
            >
              <option value="ALL">Semua Jenis Jaminan</option>
              <option value="BPJS Kesehatan">BPJS Kesehatan</option>
              <option value="Asuransi Swasta">Asuransi Swasta</option>
              <option value="Umum / Mandiri">Umum / Mandiri</option>
            </select>
          </div>

          <div>
            <select
              value={filterRencanaPulang}
              onChange={(e) => {
                setFilterRencanaPulang(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800"
            >
              <option value="ALL">Semua Rencana Pulang</option>
              <option value="YA">Hanya Rencana KRS Hari Ini (🟨)</option>
              <option value="TIDAK">Bukan Rencana KRS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">No.</th>
                <th className="py-2.5 px-3">Nama Pasien</th>
                <th className="py-2.5 px-3">No. RM</th>
                <th className="py-2.5 px-3">Lokasi (Ruang / Kamar / Bed)</th>
                <th className="py-2.5 px-3">Tgl &amp; Jam Masuk</th>
                <th className="py-2.5 px-3">LOS Berjalan</th>
                <th className="py-2.5 px-3">DPJP &amp; Diagnosa</th>
                <th className="py-2.5 px-3">Jaminan</th>
                <th className="py-2.5 px-3">Rencana KRS</th>
                <th className="py-2.5 px-3">Rekonsiliasi</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedPatients.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500">
                    Tidak ada pasien aktif yang cocok dengan kriteria pencarian/filter.
                  </td>
                </tr>
              ) : (
                paginatedPatients.map((p, idx) => {
                  const room = rooms.find((r) => r.id === p.ruanganId);
                  const km = kamar.find((k) => k.id === p.kamarId);
                  const bed = beds.find((b) => b.id === p.bedId);
                  const los = calculatePatientLOS(p.tanggalMasuk, p.jamMasuk);
                  const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-center font-mono text-slate-500">{rowNumber}</td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => onSelectPatient(p.id)}
                          className="font-bold text-slate-900 hover:text-emerald-700 text-left transition-colors"
                        >
                          {p.namaPasien}
                        </button>
                        <div className="text-[11px] text-slate-500">
                          {p.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}, {p.umur} th
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                        {formatRm(p.noRm)}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{room?.namaRuangan}</div>
                        <div className="text-slate-600 text-[11px]">
                          {km?.namaKamar} &bull; Bed: <strong className="text-emerald-700 font-bold">{bed?.nomorBed || '-'}</strong>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-slate-700 text-[11px] block">{p.tanggalMasuk}</span>
                        <span className="text-slate-400 text-[10px]">{p.jamMasuk} WIB</span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-sky-700 font-mono">
                        {los.label}
                      </td>
                      <td className="py-2.5 px-3 max-w-xs">
                        <div className="font-medium text-slate-800 truncate">{p.dokterPj}</div>
                        <div className="text-slate-500 text-[11px] truncate">{p.diagnosaMasuk}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-emerald-700 font-medium">{p.jaminan}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        {p.rencanaPulang ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            🟨 KRS: {p.jamRencanaPulang || 'Hari Ini'}
                          </span>
                        ) : p.rencanaPindah ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Transfer
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.statusRekonsiliasi === 'SESUAI'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {p.statusRekonsiliasi}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectPatient(p.id)}
                            className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
                            title="Detail Pasien"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenMutation(p.id)}
                            className="p-1 text-sky-600 hover:text-sky-800 rounded hover:bg-sky-50 transition-colors"
                            title="Mutasikan Pasien"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenDischarge(p.id)}
                            className="p-1 text-amber-600 hover:text-amber-800 rounded hover:bg-amber-50 transition-colors"
                            title="Pulangkan Pasien (KRS)"
                          >
                            <LogOut className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Menampilkan {filteredPatients.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} &ndash;{' '}
            {Math.min(currentPage * itemsPerPage, filteredPatients.length)} dari {filteredPatients.length} pasien aktif
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-slate-700">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
