'use client';

import React, { useState, useMemo } from 'react';
import { Patient, Ruangan, Kamar, Bed, PatientMovement, UserRole } from '@/lib/types';
import { calculatePatientLOS } from '@/lib/hospitalMath';
import {
  X,
  User,
  BedDouble,
  Clock,
  ArrowRightLeft,
  CheckCircle2,
  Calendar,
  Shield,
  FileText,
  AlertTriangle,
  LogOut,
} from 'lucide-react';

interface PatientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  rooms: Ruangan[];
  kamar: Kamar[];
  beds: Bed[];
  movements: PatientMovement[];
  currentRole: UserRole;
  onOpenMutation?: (patientId: string) => void;
  onOpenDischarge?: (patientId: string) => void;
  onToggleDischargePlan?: (patientId: string, willDischarge: boolean) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  isOpen,
  onClose,
  patient,
  rooms,
  kamar,
  beds,
  movements,
  onOpenMutation,
  onOpenDischarge,
  onToggleDischargePlan,
}) => {
  const [activeTab, setActiveTab] = useState<'identitas' | 'posisi' | 'mutasi' | 'timeline' | 'rekonsiliasi'>('identitas');

  const currentBed = useMemo(() => beds.find((b) => b.id === patient?.bedId), [beds, patient]);
  const currentRoom = useMemo(() => rooms.find((r) => r.id === patient?.ruanganId), [rooms, patient]);
  const currentKamar = useMemo(() => kamar.find((k) => k.id === patient?.kamarId), [kamar, patient]);

  const patientMovements = useMemo(() => {
    if (!patient) return [];
    return movements.filter((m) => m.pasienId === patient.id);
  }, [movements, patient]);

  const losInfo = useMemo(() => {
    if (!patient) return { days: 0, hours: 0, label: '-' };
    return calculatePatientLOS(patient.tanggalMasuk, patient.jamMasuk);
  }, [patient]);

  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 bg-slate-800 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-emerald-400 font-bold text-sm border border-slate-600">
              {patient.jenisKelamin === 'L' ? 'TN' : 'NY'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">{patient.namaPasien}</h3>
                <span className="font-mono text-xs text-sky-300 font-bold bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                  {patient.noRm}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    patient.status === 'AKTIF'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-600 text-slate-200'
                  }`}
                >
                  {patient.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {currentRoom?.namaRuangan || 'Ruangan'} &bull; {currentKamar?.namaKamar || 'Kamar'} &bull; Bed{' '}
                <strong className="text-emerald-400">{currentBed?.nomorBed || '-'}</strong> &bull; Dirawat {losInfo.label}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('identitas')}
            className={`py-2.5 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'identitas'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Identitas Pasien
          </button>
          <button
            onClick={() => setActiveTab('posisi')}
            className={`py-2.5 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'posisi'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BedDouble className="w-3.5 h-3.5" /> Posisi Bed Saat Ini
          </button>
          <button
            onClick={() => setActiveTab('mutasi')}
            className={`py-2.5 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'mutasi'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" /> Riwayat Mutasi ({patientMovements.length})
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-2.5 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Timeline Pelayanan
          </button>
          <button
            onClick={() => setActiveTab('rekonsiliasi')}
            className={`py-2.5 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'rekonsiliasi'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Status Rekonsiliasi
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto text-xs text-slate-700 flex-1">
          {activeTab === 'identitas' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[11px]">Nama Lengkap</span>
                  <strong className="text-slate-900 text-sm">{patient.namaPasien}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Nomor Rekam Medis</span>
                  <strong className="font-mono text-slate-900">{patient.noRm}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">NIK / Identitas</span>
                  <span className="font-mono text-slate-800">{patient.nik || '31710XXXXXXXXXXX'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Jenis Kelamin / Usia</span>
                  <span className="text-slate-900 font-medium">
                    {patient.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} / {patient.umur} Tahun
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Tanggal Lahir</span>
                  <span className="text-slate-800">{patient.tanggalLahir || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Jaminan / Asuransi</span>
                  <span className="font-semibold text-emerald-700">{patient.jaminan}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Data Admisi Masuk
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tanggal &amp; Jam Masuk:</span>
                      <strong className="text-slate-900">{patient.tanggalMasuk} {patient.jamMasuk} WIB</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Lama Dirawat (LOS):</span>
                      <span className="font-bold text-sky-700">{losInfo.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">DPJP Utama:</span>
                      <span className="text-slate-900 font-medium">{patient.dokterPj}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Diagnosa &amp; Catatan Klinis
                  </div>
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Diagnosa Masuk:</span>
                      <strong className="text-slate-900">{patient.diagnosaMasuk}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Catatan Khusus:</span>
                      <p className="text-slate-700 italic">{patient.catatan || 'Tidak ada catatan khusus.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'posisi' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BedDouble className="w-5 h-5 text-emerald-700" />
                    <div>
                      <h4 className="font-bold text-emerald-950 text-sm">Alokasi Bed Aktif</h4>
                      <p className="text-[11px] text-emerald-700">Tercatat di SIMUTASIS sebagai penghuni resmi bed</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-700 text-white rounded font-bold text-xs">
                    BED {currentBed?.nomorBed}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-emerald-200 text-xs">
                  <div>
                    <span className="text-emerald-800 text-[11px] block">Ruangan</span>
                    <strong className="text-slate-900">{currentRoom?.namaRuangan}</strong>
                  </div>
                  <div>
                    <span className="text-emerald-800 text-[11px] block">Kamar</span>
                    <strong className="text-slate-900">{currentKamar?.namaKamar}</strong>
                  </div>
                  <div>
                    <span className="text-emerald-800 text-[11px] block">Kelas Perawatan</span>
                    <span className="text-slate-900 font-medium">{currentRoom?.kelas}</span>
                  </div>
                  <div>
                    <span className="text-emerald-800 text-[11px] block">Status Bed</span>
                    <span className="font-bold text-rose-700">{currentBed?.status}</span>
                  </div>
                </div>
              </div>

              {/* Rencana Pulang / Pindah quick toggles */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <h4 className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-slate-600" />
                  Rencana Tindak Lanjut Pasien (Discharge &amp; Transfer Planning)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">Rencana Pulang (KRS)</span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          patient.rencanaPulang ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {patient.rencanaPulang ? '🟨 Terencana Hari Ini' : 'Belum Terencana'}
                      </span>
                    </div>
                    {patient.rencanaPulang && (
                      <p className="text-[11px] text-slate-600 mt-1">
                        Target kepulangan: {patient.tanggalRencanaPulang || '30 Sep 2026'} pukul {patient.jamRencanaPulang || '14.00 WIB'}
                      </p>
                    )}
                    {onToggleDischargePlan && (
                      <button
                        onClick={() => onToggleDischargePlan(patient.id, !patient.rencanaPulang)}
                        className="mt-2 text-xs text-sky-700 hover:text-sky-800 font-medium underline"
                      >
                        {patient.rencanaPulang ? 'Batalkan Rencana Pulang' : 'Tandai Rencana Pulang Hari Ini'}
                      </button>
                    )}
                  </div>

                  <div className="p-3 bg-white rounded border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">Rencana Pindah Ruangan</span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          patient.rencanaPindah ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {patient.rencanaPindah ? '🟨 Terencana Transfer' : 'Tidak Ada'}
                      </span>
                    </div>
                    {patient.rencanaPindah && (
                      <p className="text-[11px] text-slate-600 mt-1">
                        Tujuan transfer: <strong>{patient.ruanganTujuanPindah || 'ICU / Ruang lain'}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mutasi' && (
            <div className="space-y-3">
              {patientMovements.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-lg">
                  Tidak ada catatan mutasi lain untuk pasien ini selain admisi awal.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Waktu Mutasi</th>
                        <th className="py-2 px-3">Jenis Mutasi</th>
                        <th className="py-2 px-3">Dari &rarr; Ke</th>
                        <th className="py-2 px-3">Petugas</th>
                        <th className="py-2 px-3">Alasan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {patientMovements.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600">{m.waktuMutasi}</td>
                          <td className="py-2 px-3">
                            <span className="font-semibold text-slate-800">{m.jenisMutasi}</span>
                          </td>
                          <td className="py-2 px-3">
                            <span className="text-slate-600">
                              {m.dariRuanganNama} [Bed: {m.dariNomorBed}]
                            </span>
                            <span className="text-slate-400 mx-1">&rarr;</span>
                            <strong className="text-slate-900">
                              {m.keRuanganNama} [Bed: {m.keNomorBed}]
                            </strong>
                          </td>
                          <td className="py-2 px-3 text-slate-600">{m.petugas}</td>
                          <td className="py-2 px-3 text-slate-600 max-w-xs truncate">{m.alasanMutasi}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {/* Admission Milestone */}
                <div className="relative">
                  <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow-xs" />
                  <div className="text-[11px] font-mono text-slate-500">
                    {patient.tanggalMasuk} {patient.jamMasuk} WIB
                  </div>
                  <h5 className="font-bold text-slate-900 text-xs">Pasien Masuk Rawat Inap (Admisi)</h5>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Masuk ke {currentRoom?.namaRuangan} Bed {currentBed?.nomorBed}. Diagnosa: {patient.diagnosaMasuk}. DPJP: {patient.dokterPj}.
                  </p>
                </div>

                {/* Movements */}
                {patientMovements.map((m) => (
                  <div key={m.id} className="relative">
                    <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-sky-600 border-2 border-white shadow-xs" />
                    <div className="text-[11px] font-mono text-slate-500">{m.waktuMutasi} WIB</div>
                    <h5 className="font-bold text-slate-900 text-xs">{m.jenisMutasi}</h5>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Perpindahan dari {m.dariRuanganNama} ke {m.keRuanganNama} (Bed {m.keNomorBed}). Petugas: {m.petugas}. Alasan: {m.alasanMutasi}
                    </p>
                  </div>
                ))}

                {/* Current State Milestone */}
                <div className="relative">
                  <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-xs" />
                  <div className="text-[11px] font-mono text-slate-500">Hari ini &bull; 30 Sep 2026</div>
                  <h5 className="font-bold text-slate-900 text-xs">
                    {patient.status === 'AKTIF' ? 'Perawatan Berjalan (Aktif)' : 'Pasien Sudah KRS'}
                  </h5>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Lama dirawat saat ini: <strong>{losInfo.label}</strong> di {currentRoom?.namaRuangan} Bed {currentBed?.nomorBed}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rekonsiliasi' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 text-[11px] block">Status Pencocokan Terakhir:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-bold ${
                        patient.statusRekonsiliasi === 'SESUAI'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {patient.statusRekonsiliasi}
                    </span>
                    <span className="text-slate-600 text-xs">
                      {patient.statusRekonsiliasi === 'SESUAI'
                        ? 'Data pasien fisik bangsal sinkron dengan data sistem SIMUTASIS.'
                        : 'Memerlukan verifikasi ulang pada shift rekonsiliasi berikutnya.'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-xs">
                <strong>Ketentuan Rekonsiliasi 3 Shift:</strong>
                <p className="mt-1">
                  Rekonsiliasi dilakukan 3 kali sehari pukul 08.00 WIB, 14.00 WIB, dan 20.00 WIB bersama Perawat Ruangan, Admisi TPPRI, dan Rekam Medis.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Quick Actions */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-100 border-t border-slate-200 shrink-0">
          <div className="text-xs text-slate-500">
            ID: <span className="font-mono text-slate-700">{patient.id}</span>
          </div>
          <div className="flex items-center gap-2">
            {patient.status === 'AKTIF' && (
              <>
                {onOpenMutation && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenMutation(patient.id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-700 hover:bg-sky-800 text-white font-medium text-xs transition-colors"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" /> Mutasikan Bed
                  </button>
                )}
                {onOpenDischarge && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenDischarge(patient.id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Proses Pulang (KRS)
                  </button>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
