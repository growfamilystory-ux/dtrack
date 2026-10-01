'use client';

import React, { useState, useMemo } from 'react';
import { PatientMovement, Ruangan } from '@/lib/types';
import {
  ArrowRightLeft,
  Search,
  Filter,
  Calendar,
  UserPlus,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  Building2,
  PlusCircle,
} from 'lucide-react';

interface MutasiPasienProps {
  movements: PatientMovement[];
  rooms: Ruangan[];
  onOpenMutationModal: () => void;
  onSelectPatient: (patientId: string) => void;
}

export const MutasiPasien: React.FC<MutasiPasienProps> = ({
  movements,
  rooms,
  onOpenMutationModal,
  onSelectPatient,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJenis, setFilterJenis] = useState('ALL');
  const [filterRuangan, setFilterRuangan] = useState('ALL');

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      if (filterJenis !== 'ALL' && m.jenisMutasi !== filterJenis) return false;
      if (
        filterRuangan !== 'ALL' &&
        m.dariRuanganId !== filterRuangan &&
        m.keRuanganId !== filterRuangan
      )
        return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const patMatch = m.namaPasien.toLowerCase().includes(q);
        const rmMatch = m.noRm.toLowerCase().includes(q);
        const reasonMatch = m.alasanMutasi.toLowerCase().includes(q);
        const petMatch = m.petugas.toLowerCase().includes(q);
        const fromMatch = m.dariRuanganNama.toLowerCase().includes(q);
        const toMatch = m.keRuanganNama.toLowerCase().includes(q);
        return patMatch || rmMatch || reasonMatch || petMatch || fromMatch || toMatch;
      }

      return true;
    });
  }, [movements, filterJenis, filterRuangan, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Top Banner and Controls */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-sky-600" />
              Monitoring Seluruh Mutasi &amp; Pergerakan Pasien
            </h2>
            <p className="text-xs text-slate-500">
              Audit log real-time setiap perpindahan pasien antar-ruangan, kamar, dan bed dengan verifikasi perawat
            </p>
          </div>

          <button
            onClick={onOpenMutationModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-700 hover:bg-sky-800 text-white font-medium text-xs shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Input Mutasi Baru</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama pasien, No. RM, petugas..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-500 focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800"
            >
              <option value="ALL">Semua Jenis Mutasi</option>
              <option value="Masuk Rawat Inap">Masuk Rawat Inap (Admisi)</option>
              <option value="Pindah Ruangan">Pindah Ruangan</option>
              <option value="Pindah Kamar">Pindah Kamar</option>
              <option value="Pindah Bed">Pindah Bed</option>
              <option value="Pulang">Pulang (KRS)</option>
              <option value="Meninggal">Meninggal Dunia</option>
            </select>
          </div>

          <div>
            <select
              value={filterRuangan}
              onChange={(e) => setFilterRuangan(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800"
            >
              <option value="ALL">Semua Ruangan Terkait</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.namaRuangan}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Waktu Mutasi</th>
                <th className="py-2.5 px-3">Nama Pasien</th>
                <th className="py-2.5 px-3">No. RM</th>
                <th className="py-2.5 px-3">Jenis Mutasi</th>
                <th className="py-2.5 px-3">Dari (Asal)</th>
                <th className="py-2.5 px-3">Ke (Tujuan)</th>
                <th className="py-2.5 px-3">Alasan / Indikasi Medis</th>
                <th className="py-2.5 px-3">Petugas Penanggung Jawab</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    Tidak ada catatan pergerakan pasien yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => {
                  let badgeBg = 'bg-slate-100 text-slate-700';
                  if (m.jenisMutasi === 'Masuk Rawat Inap') badgeBg = 'bg-emerald-100 text-emerald-800';
                  else if (m.jenisMutasi === 'Pindah Ruangan') badgeBg = 'bg-sky-100 text-sky-800';
                  else if (m.jenisMutasi === 'Pindah Bed') badgeBg = 'bg-indigo-100 text-indigo-800';
                  else if (m.jenisMutasi === 'Pulang') badgeBg = 'bg-amber-100 text-amber-800';
                  else if (m.jenisMutasi === 'Meninggal') badgeBg = 'bg-rose-100 text-rose-800';

                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                        {m.waktuMutasi} WIB
                      </td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => onSelectPatient(m.pasienId)}
                          className="font-bold text-slate-900 hover:text-sky-700 text-left transition-colors"
                        >
                          {m.namaPasien}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                        {m.noRm}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeBg}`}>
                          {m.jenisMutasi}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-700">{m.dariRuanganNama}</div>
                        <div className="text-[11px] text-slate-500">
                          {m.dariKamarNama} &bull; Bed: <span className="font-semibold text-slate-800">{m.dariNomorBed}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{m.keRuanganNama}</div>
                        <div className="text-[11px] text-emerald-700">
                          {m.keKamarNama} &bull; Bed: <span className="font-bold">{m.keNomorBed}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-xs leading-snug">
                        {m.alasanMutasi}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-slate-800">{m.petugas}</span>
                        <div className="text-[10px] text-slate-500">{m.rolePetugas}</div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {m.statusVerifikasi}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500">
          Total {filteredMovements.length} transaksi pergerakan pasien tercatat di SIMUTASIS.
        </div>
      </div>
    </div>
  );
};
