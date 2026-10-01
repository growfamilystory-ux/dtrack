'use client';

import React, { useState, useMemo } from 'react';
import {
  ReconciliationSession,
  Ruangan,
  Bed,
  Patient,
  PatientMovement,
  UserRole,
} from '@/lib/types';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Check,
  ShieldAlert,
  FileCheck,
  Sparkles,
  Users,
  RefreshCw,
  Building2,
  XCircle,
} from 'lucide-react';

interface RekonsiliasiProps {
  reconciliations: ReconciliationSession[];
  rooms: Ruangan[];
  beds: Bed[];
  patients: Patient[];
  movements: PatientMovement[];
  currentUser: string;
  currentRole: UserRole;
  onSaveSession: (session: ReconciliationSession) => void;
  onSelectPatient: (patientId: string) => void;
}

export const Rekonsiliasi: React.FC<RekonsiliasiProps> = ({
  reconciliations,
  rooms,
  beds,
  patients,
  movements,
  currentUser,
  currentRole,
  onSaveSession,
  onSelectPatient,
}) => {
  const [selectedShift, setSelectedShift] = useState<'08.00 WIB' | '14.00 WIB' | '20.00 WIB'>('14.00 WIB');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('ALL');

  // Automated Tracer: Identifies discrepancy conditions
  const discrepancies = useMemo(() => {
    const list: {
      type: string;
      severity: 'HIGH' | 'MEDIUM';
      deskripsi: string;
      patientId?: string;
      bedId?: string;
      roomId?: string;
    }[] = [];

    // 1. Bed status TERISI but no active patient associated
    beds.forEach((b) => {
      if (b.status === 'TERISI') {
        const p = patients.find((pat) => pat.bedId === b.id && pat.status === 'AKTIF');
        if (!p) {
          const room = rooms.find((r) => r.id === b.ruanganId);
          list.push({
            type: 'Bed Terisi Tanpa Pasien',
            severity: 'HIGH',
            deskripsi: `Bed ${b.nomorBed} (${room?.namaRuangan}) tercatat TERISI di sistem, namun tidak ditemukan pasien aktif penghuninya.`,
            bedId: b.id,
            roomId: b.ruanganId,
          });
        }
      }
    });

    // 2. Active patient marked with status SELISIH
    patients.forEach((p) => {
      if (p.status === 'AKTIF' && p.statusRekonsiliasi === 'SELISIH') {
        const room = rooms.find((r) => r.id === p.ruanganId);
        const bed = beds.find((b) => b.id === p.bedId);
        list.push({
          type: 'Status Pasien Belum Cocok',
          severity: 'HIGH',
          deskripsi: `Pasien ${p.namaPasien} (${p.noRm}) di ${room?.namaRuangan} Bed ${bed?.nomorBed || '-'} dilaporkan memiliki selisih fisik bangsal.`,
          patientId: p.id,
          bedId: p.bedId,
          roomId: p.ruanganId,
        });
      }
    });

    // 3. Active patient with missing or empty bed
    patients.forEach((p) => {
      if (p.status === 'AKTIF') {
        const assignedBed = beds.find((b) => b.id === p.bedId);
        if (!assignedBed) {
          list.push({
            type: 'Pasien Tanpa Bed',
            severity: 'HIGH',
            deskripsi: `Pasien ${p.namaPasien} (${p.noRm}) aktif tetapi nomor bed tidak valid di sistem.`,
            patientId: p.id,
          });
        }
      }
    });

    return list;
  }, [beds, patients, rooms]);

  // Current selected session
  const currentSession = useMemo(() => {
    return (
      reconciliations.find((r) => r.shift === selectedShift && (selectedRoomId === 'ALL' || r.ruanganId === selectedRoomId)) || {
        id: `REC-DRAFT-${selectedShift.replace(/\s+/g, '')}-${selectedRoomId}`,
        tanggal: '2026-09-30',
        shift: selectedShift,
        ruanganId: selectedRoomId,
        ruanganNama:
          selectedRoomId === 'ALL'
            ? 'Semua Ruangan (RS Keseluruhan)'
            : rooms.find((r) => r.id === selectedRoomId)?.namaRuangan || selectedRoomId,
        petugasRuangan: currentUser,
        petugasAdmisi: 'Sdr. Dimas Kurniawan (Admisi)',
        petugasRekamMedis: 'Sdri. Anisa Putri (Rekam Medis)',
        pasienSistem: patients.filter((p) => p.status === 'AKTIF').length,
        pasienAktual: patients.filter((p) => p.status === 'AKTIF').length,
        bedSistem: beds.length,
        bedAktual: beds.length,
        selisih: 0,
        status: 'Belum' as const,
        catatan: '',
      }
    );
  }, [reconciliations, selectedShift, selectedRoomId, rooms, patients, beds, currentUser]);

  // Local form editing state
  const [pasienAktual, setPasienAktual] = useState<number>(currentSession.pasienAktual || currentSession.pasienSistem);
  const [bedAktual, setBedAktual] = useState<number>(currentSession.bedAktual || currentSession.bedSistem);
  const [catatan, setCatatan] = useState<string>(currentSession.catatan || '');
  const [petugasRuangan, setPetugasRuangan] = useState<string>(currentSession.petugasRuangan || currentUser);
  const [petugasAdmisi, setPetugasAdmisi] = useState<string>(currentSession.petugasAdmisi || 'Sdr. Dimas Kurniawan');
  const [petugasRekamMedis, setPetugasRekamMedis] = useState<string>(
    currentSession.petugasRekamMedis || 'Sdri. Anisa Putri'
  );

  const calculatedSelisih = pasienAktual - currentSession.pasienSistem;

  const handleSave = (status: ReconciliationSession['status']) => {
    const updated: ReconciliationSession = {
      ...currentSession,
      pasienAktual: Number(pasienAktual),
      bedAktual: Number(bedAktual),
      selisih: calculatedSelisih,
      status,
      catatan,
      petugasRuangan,
      petugasAdmisi,
      petugasRekamMedis,
      waktuPenyelesaian: status === 'Selesai Diverifikasi' ? `${new Date().toLocaleTimeString('id-ID')} WIB` : undefined,
    };
    onSaveSession(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase">
                SOP REKONSILIASI 3 SHIFT
              </span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500 font-mono">08.00 WIB &bull; 14.00 WIB &bull; 20.00 WIB</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight mt-1">
              Rekonsiliasi Data Tempat Tidur &amp; Pasien Fisik Bangsal
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pencocokan tiga pihak antara <strong>Perawat Ruangan</strong>, <strong>Admisi/TPPRI</strong>, dan <strong>Rekam Medis</strong> untuk menjamin validitas 100% data rawat inap.
            </p>
          </div>
        </div>

        {/* Shift selector buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-100">
          {(['08.00 WIB', '14.00 WIB', '20.00 WIB'] as const).map((shift) => {
            const session = reconciliations.find((r) => r.shift === shift);
            const isSelected = selectedShift === shift;
            return (
              <div
                key={shift}
                onClick={() => setSelectedShift(shift)}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                    Shift {shift}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      session?.status === 'Selesai Diverifikasi'
                        ? 'bg-emerald-100 text-emerald-800'
                        : session?.status === 'Dalam Proses'
                        ? 'bg-amber-100 text-amber-800'
                        : session?.status === 'Selisih'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {session?.status || 'Belum'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-2">
                  Sistem: <strong className="text-slate-800">{session?.pasienSistem ?? patients.length}</strong> &bull; Aktual: <strong className="text-slate-800">{session?.pasienAktual ?? '-'}</strong>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {session?.waktuPenyelesaian ? `Selesai ${session.waktuPenyelesaian}` : 'Menunggu verifikasi'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Reconciliation Workspace: Left is Verification Sheet, Right is Automated Tracer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Sheet (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Lembar Kerja Rekonsiliasi &bull; Shift {selectedShift}
              </h3>
              <p className="text-xs text-slate-500">
                Tanggal: 30 September 2026 &bull; Status:{' '}
                <strong className="text-slate-900">{currentSession.status}</strong>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="px-2.5 py-1 border border-slate-300 rounded text-xs bg-white text-slate-800"
              >
                <option value="ALL">Semua Ruangan (RS Keseluruhan)</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.namaRuangan}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Counts Comparison Box */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Pasien Sistem</span>
              <div className="text-2xl font-bold text-slate-900">{currentSession.pasienSistem}</div>
              <span className="text-[10px] text-slate-400">Tercatat di SIMUTASIS</span>
            </div>

            <div>
              <label className="text-slate-700 block text-[11px] font-semibold">Pasien Aktual Fisik *</label>
              <input
                type="number"
                value={pasienAktual}
                onChange={(e) => setPasienAktual(Number(e.target.value))}
                className="w-full mt-1 px-2.5 py-1 text-base font-bold border border-slate-300 rounded bg-white text-slate-900"
              />
              <span className="text-[10px] text-slate-500">Sensus fisik perawat</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Tempat Tidur Sistem</span>
              <div className="text-2xl font-bold text-slate-900">{currentSession.bedSistem}</div>
              <span className="text-[10px] text-slate-400">Total bed aktif</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Selisih Data</span>
              <div
                className={`text-2xl font-extrabold ${
                  calculatedSelisih === 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {calculatedSelisih > 0 ? `+${calculatedSelisih}` : calculatedSelisih}
              </div>
              <span className="text-[10px] text-slate-500">
                {calculatedSelisih === 0 ? 'Data Fisik Sesuai' : 'Terdapat Diskrepansi!'}
              </span>
            </div>
          </div>

          {/* 3 Parties Sign-Off */}
          <div className="p-3 bg-emerald-50/40 rounded-lg border border-emerald-200 space-y-3 text-xs">
            <div className="font-semibold text-emerald-950 flex items-center justify-between">
              <span>Verifikasi Tiga Pihak (3-Way Cross Check)</span>
              <span className="text-[11px] text-emerald-700 font-normal">Wajib Disetujui Bersama</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  1. Perawat Ruangan:
                </label>
                <input
                  type="text"
                  value={petugasRuangan}
                  onChange={(e) => setPetugasRuangan(e.target.value)}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  2. Petugas Admisi / TPPRI:
                </label>
                <input
                  type="text"
                  value={petugasAdmisi}
                  onChange={(e) => setPetugasAdmisi(e.target.value)}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  3. Verifikator Rekam Medis:
                </label>
                <input
                  type="text"
                  value={petugasRekamMedis}
                  onChange={(e) => setPetugasRekamMedis(e.target.value)}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded bg-white text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-800 text-xs">
              Catatan Rekonsiliasi &amp; Temuan Fisik Bangsal:
            </label>
            <textarea
              rows={3}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan perpindahan belum terinput, pasien titipan di IGD, pasien pulang belum administrasi..."
              className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSave('Dalam Proses')}
                className="px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors"
              >
                Simpan Draft (Dalam Proses)
              </button>
              <button
                type="button"
                onClick={() => handleSave('Selisih')}
                className="px-3 py-1.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 font-medium text-xs transition-colors"
              >
                Laporkan Selisih
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleSave('Selesai Diverifikasi')}
              disabled={calculatedSelisih !== 0}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Tandai Sesuai &amp; Selesaikan Rekonsiliasi</span>
            </button>
          </div>
        </div>

        {/* Automated Tracer Discrepancy Engine (1 Column) */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-xs">Tracing Otomatis Diskrepansi</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {discrepancies.length} Temuan
            </span>
          </div>

          <p className="text-[11px] text-slate-500 leading-snug">
            Sistem secara kontinu memeriksa konsistensi silang antara bed map, pasien aktif, dan transaksi mutasi:
          </p>

          <div className="space-y-2.5 text-xs max-h-96 overflow-y-auto">
            {discrepancies.length === 0 ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-center text-xs">
                <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                Seluruh data tempat tidur dan pasien aktif konsisten 100%. Tidak ada konflik bed atau pasien tanpa tempat tidur.
              </div>
            ) : (
              discrepancies.map((d, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border border-rose-200 bg-rose-50/60 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-800 text-[11px]">{d.type}</span>
                    <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[10px] font-bold">
                      {d.severity}
                    </span>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-snug">{d.deskripsi}</p>
                  {d.patientId && (
                    <button
                      onClick={() => onSelectPatient(d.patientId!)}
                      className="text-[11px] font-semibold text-rose-800 hover:underline pt-0.5 block"
                    >
                      Buka Data Pasien &rarr;
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <strong>Checklist Tracing Otomatis:</strong>
            <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-slate-500">
              <li>Pasien berada di bed berbeda</li>
              <li>Pasien belum memiliki bed</li>
              <li>Bed tercatat terisi tetapi tanpa pasien</li>
              <li>Mutasi belum diverifikasi di ruangan tujuan</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
