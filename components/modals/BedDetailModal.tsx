'use client';

import React, { useState } from 'react';
import { Bed, Ruangan, Kamar, Patient, UserRole } from '@/lib/types';
import { X, BedDouble, Wrench, Bookmark, CheckCircle2, UserPlus, AlertCircle } from 'lucide-react';

interface BedDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  bed: Bed | null;
  room: Ruangan | null;
  kamar: Kamar | null;
  patient: Patient | null;
  currentUser: string;
  currentRole: UserRole;
  onUpdateBedStatus: (bedId: string, newStatus: Bed['status'], note: string) => void;
  onAdmitToBed?: (bedId: string) => void;
  onViewPatient?: (patientId: string) => void;
}

export const BedDetailModal: React.FC<BedDetailModalProps> = ({
  isOpen,
  onClose,
  bed,
  room,
  kamar,
  patient,
  onUpdateBedStatus,
  onAdmitToBed,
  onViewPatient,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<Bed['status']>(bed?.status || 'KOSONG');
  const [note, setNote] = useState('');

  if (!isOpen || !bed) return null;

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBedStatus(bed.id, selectedStatus, note.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-800 text-white">
          <div className="flex items-center gap-2.5">
            <BedDouble className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold tracking-tight">Detail Tempat Tidur (Bed {bed.nomorBed})</h3>
              <p className="text-xs text-slate-300">
                {room?.namaRuangan} &bull; {kamar?.namaKamar} &bull; {room?.kelas}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 text-xs text-slate-700 space-y-4">
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <span className="text-slate-500 block text-[11px]">ID Bed:</span>
              <strong className="font-mono text-slate-900">{bed.id}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Status Saat Ini:</span>
              <span className="font-bold text-slate-900">{bed.status}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Ruangan / Gedung:</span>
              <span className="text-slate-800">{room?.namaRuangan} ({room?.gedung})</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Terakhir Diperbarui:</span>
              <span className="text-slate-600 font-mono text-[11px]">{bed.updatedAt}</span>
            </div>
          </div>

          {/* If Bed is occupied by Patient */}
          {patient && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
              <div className="text-[11px] font-semibold text-rose-800 uppercase mb-1">Pasien Yang Menghuni:</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{patient.namaPasien}</div>
                  <div className="text-slate-600 text-xs mt-0.5">
                    No. RM: <strong className="font-mono">{patient.noRm}</strong> &bull; Diagnosa: {patient.diagnosaMasuk}
                  </div>
                </div>
                {onViewPatient && (
                  <button
                    onClick={() => {
                      onClose();
                      onViewPatient(patient.id);
                    }}
                    className="px-2.5 py-1 bg-white border border-rose-300 text-rose-800 font-semibold rounded text-xs hover:bg-rose-100 transition-colors"
                  >
                    Buka Detail
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick Action: If Bed is empty, show Admit button */}
          {bed.status === 'KOSONG' && onAdmitToBed && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
              <div>
                <strong className="text-emerald-900 block text-xs">Bed Tersedia untuk Pasien Baru</strong>
                <span className="text-[11px] text-emerald-700">Bed ini siap dialokasikan dari IGD atau Poliklinik</span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onAdmitToBed(bed.id);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded text-xs transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" /> Alokasikan Pasien
              </button>
            </div>
          )}

          {/* Override Bed Status form (for maintenance, booking, etc.) */}
          <form onSubmit={handleSaveStatus} className="pt-2 border-t border-slate-200 space-y-3">
            <h4 className="font-semibold text-slate-900 text-xs">Ubah Status Operasional Bed:</h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedStatus('KOSONG')}
                className={`py-2 px-2 text-center rounded border text-xs font-semibold transition-colors ${
                  selectedStatus === 'KOSONG'
                    ? 'border-emerald-600 bg-emerald-100 text-emerald-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                🟩 KOSONG
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('BOOKING')}
                className={`py-2 px-2 text-center rounded border text-xs font-semibold transition-colors ${
                  selectedStatus === 'BOOKING'
                    ? 'border-sky-600 bg-sky-100 text-sky-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                🟦 BOOKING
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('MAINTENANCE')}
                className={`py-2 px-2 text-center rounded border text-xs font-semibold transition-colors ${
                  selectedStatus === 'MAINTENANCE'
                    ? 'border-slate-600 bg-slate-200 text-slate-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                ⚙️ MAINTENANCE
              </button>
            </div>

            <div>
              <label className="block font-medium mb-1 text-slate-700 text-[11px]">
                Keterangan / Alasan Status (Opsional):
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: Booking IGD dr. Ananta, perbaikan regulator O2, dsb..."
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Tutup
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
