'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Ruangan, Kamar, Bed, Patient, UserRole } from '@/lib/types';
import { X, ArrowRightLeft, CheckCircle2, AlertCircle, BedDouble } from 'lucide-react';

interface MutationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  rooms: Ruangan[];
  kamar: Kamar[];
  beds: Bed[];
  currentUser: string;
  currentRole: UserRole;
  preselectedPatientId?: string | null;
  onMutate: (
    patientId: string,
    targetRuanganId: string,
    targetKamarId: string,
    targetBedId: string,
    alasanMutasi: string
  ) => void;
}

export const MutationModal: React.FC<MutationModalProps> = ({
  isOpen,
  onClose,
  patients,
  rooms,
  kamar,
  beds,
  preselectedPatientId,
  onMutate,
}) => {
  const activePatients = useMemo(() => patients.filter((p) => p.status === 'AKTIF'), [patients]);

  const [internalPatientId, setInternalPatientId] = useState<string>('');
  const selectedPatientId = preselectedPatientId || internalPatientId || activePatients[0]?.id || '';

  const currentPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId),
    [patients, selectedPatientId]
  );

  const currentBed = useMemo(() => beds.find((b) => b.id === currentPatient?.bedId), [beds, currentPatient]);
  const currentRoom = useMemo(() => rooms.find((r) => r.id === currentPatient?.ruanganId), [rooms, currentPatient]);
  const currentKamar = useMemo(() => kamar.find((k) => k.id === currentPatient?.kamarId), [kamar, currentPatient]);

  // Target Location State
  const [selectedTargetRuanganId, setSelectedTargetRuanganId] = useState<string>('');
  const targetRuanganId = selectedTargetRuanganId || currentPatient?.ruanganId || rooms[0]?.id || '';

  const [selectedTargetKamarId, setSelectedTargetKamarId] = useState<string>('');
  const [targetBedId, setTargetBedId] = useState<string>('');
  const [alasanMutasi, setAlasanMutasi] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const filteredTargetKamar = useMemo(() => {
    return kamar.filter((k) => k.ruanganId === targetRuanganId);
  }, [kamar, targetRuanganId]);

  const targetKamarId = selectedTargetKamarId || filteredTargetKamar[0]?.id || '';

  const availableTargetBeds = useMemo(() => {
    return beds.filter((b) => {
      const matchRoom = b.ruanganId === targetRuanganId;
      const matchKamar = targetKamarId ? b.kamarId === targetKamarId : true;
      const isNotCurrentBed = b.id !== currentPatient?.bedId;
      const isEmpty = b.status === 'KOSONG';
      return matchRoom && matchKamar && isNotCurrentBed && isEmpty;
    });
  }, [beds, targetRuanganId, targetKamarId, currentPatient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedPatientId) {
      setErrorMsg('Pilih pasien yang akan dimutasi.');
      return;
    }
    if (!targetBedId) {
      setErrorMsg('Pilih bed tujuan yang kosong.');
      return;
    }
    if (!alasanMutasi.trim()) {
      setErrorMsg('Alasan mutasi wajib diisi.');
      return;
    }

    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    onMutate(selectedPatientId, targetRuanganId, targetKamarId || filteredTargetKamar[0]?.id || '', targetBedId, alasanMutasi.trim());
    setIsConfirming(false);
    onClose();
  };

  if (!isOpen) return null;

  const targetBedObj = beds.find((b) => b.id === targetBedId);
  const targetRoomObj = rooms.find((r) => r.id === targetRuanganId);
  const targetKamarObj = kamar.find((k) => k.id === targetKamarId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-800 text-white">
          <div className="flex items-center gap-2.5">
            <ArrowRightLeft className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-sm font-bold tracking-tight">Formulir Mutasi Pasien (Bed / Ruang Transfer)</h3>
              <p className="text-xs text-slate-300">Pencatatan perpindahan pasien dan update otomatis status bed</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 text-xs text-slate-700 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-md">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isConfirming ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
              <div className="flex items-center gap-2 font-semibold text-amber-800 text-sm">
                <CheckCircle2 className="w-4 h-4 text-amber-700" />
                Konfirmasi Mutasi Pasien
              </div>
              <p className="text-amber-900 leading-relaxed">
                Mohon teliti perpindahan tempat tidur berikut sebelum eksekusi sistem:
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded border border-amber-200">
                <div className="col-span-2">
                  <span className="text-slate-500">Pasien:</span>{' '}
                  <strong className="text-slate-900 text-sm">{currentPatient?.namaPasien}</strong> ({currentPatient?.noRm})
                </div>

                {/* From -> To box */}
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded">
                  <div className="text-[11px] font-semibold text-rose-800 uppercase">Posisi Asal (Akan Menjadi KOSONG)</div>
                  <div className="mt-1 font-medium text-slate-800">{currentRoom?.namaRuangan}</div>
                  <div className="text-slate-600">{currentKamar?.namaKamar} &bull; Bed: <span className="font-bold text-rose-700">{currentBed?.nomorBed}</span></div>
                </div>

                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded">
                  <div className="text-[11px] font-semibold text-emerald-800 uppercase">Posisi Tujuan (Akan Menjadi TERISI)</div>
                  <div className="mt-1 font-medium text-slate-800">{targetRoomObj?.namaRuangan}</div>
                  <div className="text-slate-600">{targetKamarObj?.namaKamar} &bull; Bed: <span className="font-bold text-emerald-700">{targetBedObj?.nomorBed}</span></div>
                </div>

                <div className="col-span-2">
                  <span className="text-slate-500">Alasan Mutasi:</span>{' '}
                  <span className="text-slate-900 font-medium">{alasanMutasi}</span>
                </div>
              </div>

              <p className="text-[11px] text-amber-700 italic">
                * Sistem akan otomatis mengubah Bed lama ({currentBed?.nomorBed}) menjadi <strong>KOSONG</strong>, Bed tujuan ({targetBedObj?.nomorBed}) menjadi <strong>TERISI</strong>, dan mencatat audit trail log pergerakan.
              </p>
            </div>
          ) : (
            <>
              {/* Select Patient */}
              <div>
                <label className="block font-semibold mb-1 text-slate-800">Pilih Pasien Aktif *</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => {
                    setInternalPatientId(e.target.value);
                    setTargetBedId('');
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white focus:outline-hidden"
                >
                  <option value="">-- Pilih Pasien --</option>
                  {activePatients.map((p) => {
                    const r = rooms.find((rm) => rm.id === p.ruanganId);
                    const b = beds.find((bd) => bd.id === p.bedId);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.namaPasien} ({p.noRm}) &mdash; {r?.namaRuangan} [Bed: {b?.nomorBed || '-'}]
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Current Position Display */}
              {currentPatient && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Posisi Saat Ini:</span>
                    <span className="font-semibold text-slate-900">
                      {currentRoom?.namaRuangan} &bull; {currentKamar?.namaKamar} &bull; Bed {currentBed?.nomorBed}
                    </span>
                    <span className="text-slate-500 block mt-0.5">
                      Diagnosa: {currentPatient.diagnosaMasuk} &bull; DPJP: {currentPatient.dokterPj}
                    </span>
                  </div>
                  <div className="px-2.5 py-1 bg-rose-100 text-rose-800 font-semibold rounded text-[11px] border border-rose-200">
                    Bed Asal: {currentBed?.nomorBed}
                  </div>
                </div>
              )}

              {/* Target Position Selection */}
              <div className="p-3 bg-sky-50/50 rounded-lg border border-sky-200 space-y-3">
                <div className="font-semibold text-sky-950 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <BedDouble className="w-4 h-4 text-sky-700" />
                    Tujuan Mutasi Baru
                  </span>
                  <span className="text-[11px] text-sky-700 font-normal">
                    {availableTargetBeds.length} bed kosong dapat dipilih
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-800">Ruangan Tujuan *</label>
                    <select
                      value={targetRuanganId}
                      onChange={(e) => {
                        const newRId = e.target.value;
                        setSelectedTargetRuanganId(newRId);
                        const kFirst = kamar.find((k) => k.ruanganId === newRId);
                        setSelectedTargetKamarId(kFirst ? kFirst.id : '');
                        setTargetBedId('');
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-hidden"
                    >
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.namaRuangan} ({r.kelas})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-800">Kamar Tujuan</label>
                    <select
                      value={targetKamarId}
                      onChange={(e) => {
                        setSelectedTargetKamarId(e.target.value);
                        setTargetBedId('');
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-hidden"
                    >
                      <option value="">Semua Kamar</option>
                      {filteredTargetKamar.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.namaKamar}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-800">Bed Tujuan (Wajib Kosong) *</label>
                    <select
                      required
                      value={targetBedId}
                      onChange={(e) => setTargetBedId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-emerald-500 rounded text-xs bg-emerald-50 text-slate-900 font-semibold focus:outline-hidden"
                    >
                      <option value="">-- Pilih Bed Kosong --</option>
                      {availableTargetBeds.map((b) => (
                        <option key={b.id} value={b.id}>
                          Bed {b.nomorBed} (KOSONG)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {availableTargetBeds.length === 0 && (
                  <p className="text-[11px] text-rose-600">
                    Tidak ada bed kosong pada ruangan ini. Silakan pilih ruangan atau kamar lain.
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-800">Alasan Mutasi / Keterangan Medis *</label>
                <textarea
                  required
                  rows={2}
                  value={alasanMutasi}
                  onChange={(e) => setAlasanMutasi(e.target.value)}
                  placeholder="Contoh: Perbaikan klinis step down dari ICU, permintaan naik kelas VIP, atau perbaikan sirkulasi oksigen..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-hidden"
                />
              </div>
            </>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            {isConfirming ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsConfirming(false)}
                  className="px-3.5 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Kembali Edit
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-sky-700 hover:bg-sky-800 text-white font-medium transition-colors"
                >
                  Ya, Eksekusi Mutasi
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={availableTargetBeds.length === 0 || !selectedPatientId}
                  className="px-4 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors disabled:opacity-50"
                >
                  Lanjut Konfirmasi
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
