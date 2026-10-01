'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Ruangan, Bed, Patient, UserRole } from '@/lib/types';
import { calculatePatientLOS } from '@/lib/hospitalMath';
import { X, LogOut, CheckCircle2, AlertCircle, FileCheck, DollarSign } from 'lucide-react';

interface DischargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  rooms: Ruangan[];
  beds: Bed[];
  currentUser: string;
  currentRole: UserRole;
  preselectedPatientId?: string | null;
  onDischarge: (
    patientId: string,
    caraKeluar: Patient['caraKeluar'],
    catatan: string
  ) => void;
}

export const DischargeModal: React.FC<DischargeModalProps> = ({
  isOpen,
  onClose,
  patients,
  rooms,
  beds,
  preselectedPatientId,
  onDischarge,
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

  const [caraKeluar, setCaraKeluar] = useState<Patient['caraKeluar']>('Atas Persetujuan Dokter');
  const [resumeMedisCheck, setResumeMedisCheck] = useState(true);
  const [billingCheck, setBillingCheck] = useState(true);
  const [obatCheck, setObatCheck] = useState(true);
  const [catatan, setCatatan] = useState('Pasien KRS dalam kondisi stabil, obat pulang telah diedukasikan.');
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const losInfo = useMemo(() => {
    if (!currentPatient) return { days: 0, hours: 0, label: '-' };
    return calculatePatientLOS(currentPatient.tanggalMasuk, currentPatient.jamMasuk);
  }, [currentPatient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedPatientId) {
      setErrorMsg('Pilih pasien yang akan dipulangkan.');
      return;
    }
    if (!resumeMedisCheck || !billingCheck) {
      setErrorMsg('Verifikasi rekam medis dan billing keuangan wajib disetujui.');
      return;
    }

    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    onDischarge(selectedPatientId, caraKeluar, catatan.trim());
    setIsConfirming(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-800 text-white">
          <div className="flex items-center gap-2.5">
            <LogOut className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold tracking-tight">Formulir Pasien Keluar / Pulang (Discharge)</h3>
              <p className="text-xs text-slate-300">Validasi rekam medis, billing, dan pelepasan bed otomatis</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
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
                Konfirmasi Penyelesaian Rawat Inap (KRS)
              </div>
              <p className="text-amber-900 leading-relaxed">
                Anda akan memulangkan pasien berikut dan membebaskan tempat tidur:
              </p>
              <div className="space-y-2 text-xs bg-white p-3 rounded border border-amber-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Pasien:</span>
                  <strong className="text-slate-900">{currentPatient?.namaPasien} ({currentPatient?.noRm})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ruangan &amp; Bed:</span>
                  <span className="font-semibold text-slate-900">{currentRoom?.namaRuangan} &bull; Bed {currentBed?.nomorBed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lama Dirawat (LOS):</span>
                  <span className="font-bold text-sky-700">{losInfo.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cara Keluar:</span>
                  <span className="font-semibold text-slate-900">{caraKeluar}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 text-slate-600">
                  <span className="text-slate-500">Catatan:</span> {catatan}
                </div>
              </div>
              <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200">
                &check; Status Bed <strong>{currentBed?.nomorBed}</strong> akan langsung diubah menjadi <strong>KOSONG</strong> dan tersedia untuk pasien admisi baru.
              </p>
            </div>
          ) : (
            <>
              {/* Patient Selection */}
              <div>
                <label className="block font-semibold mb-1 text-slate-800">Pilih Pasien Aktif *</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setInternalPatientId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white focus:outline-hidden"
                >
                  <option value="">-- Pilih Pasien --</option>
                  {activePatients.map((p) => {
                    const r = rooms.find((rm) => rm.id === p.ruanganId);
                    const b = beds.find((bd) => bd.id === p.bedId);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.namaPasien} ({p.noRm}) &mdash; {r?.namaRuangan} [Bed: {b?.nomorBed || '-'}] {p.rencanaPulang ? '🟨 (Rencana KRS)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Patient Summary Card */}
              {currentPatient && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Tempat Tidur Saat Ini:</span>
                    <strong className="text-slate-900">{currentRoom?.namaRuangan} &bull; Bed {currentBed?.nomorBed}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Lama Rawat (LOS Berjalan):</span>
                    <strong className="text-sky-700">{losInfo.label}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Masuk Sejak:</span>
                    <span className="text-slate-800">{currentPatient.tanggalMasuk} {currentPatient.jamMasuk} WIB</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">DPJP / Diagnosa:</span>
                    <span className="text-slate-800 truncate block">{currentPatient.dokterPj}</span>
                  </div>
                </div>
              )}

              {/* Discharge Reason */}
              <div>
                <label className="block font-semibold mb-1 text-slate-800">Cara Keluar Pasien *</label>
                <select
                  value={caraKeluar}
                  onChange={(e) => setCaraKeluar(e.target.value as Patient['caraKeluar'])}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-hidden"
                >
                  <option value="Atas Persetujuan Dokter">Atas Persetujuan Dokter (Sembuh / Perbaikan)</option>
                  <option value="Permintaan Sendiri">Permintaan Sendiri (PAPS)</option>
                  <option value="Rujuk">Dirujuk ke Rumah Sakit Lain</option>
                  <option value="Meninggal">Meninggal Dunia</option>
                </select>
              </div>

              {/* Multi-role Verification Checkpoints */}
              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-2">
                <div className="font-semibold text-emerald-900 border-b border-emerald-200 pb-1 flex items-center justify-between">
                  <span>Checklist Verifikasi 3 Divisi</span>
                  <span className="text-[11px] text-emerald-700 font-normal">SOP Kepulangan Rawat Inap</span>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={resumeMedisCheck}
                    onChange={(e) => setResumeMedisCheck(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <FileCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-slate-700">Resume medis rawat inap &amp; verifikasi rekam medis tervalidasi</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={billingCheck}
                    onChange={(e) => setBillingCheck(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <DollarSign className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-slate-700">Rincian administrasi kasir &amp; SEP BPJS / Asuransi telah selesai</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={obatCheck}
                    onChange={(e) => setObatCheck(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-slate-700">Obat pulang &amp; edukasi kontrol telah diserahterimakan kepada keluarga</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-800">Catatan Ringkasan Pulang / Edukasi</label>
                <textarea
                  rows={2}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Catatan kondisi akhir pasien saat pulang..."
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
                  className="px-4 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-medium transition-colors"
                >
                  Ya, Pulangkan &amp; Bebaskan Bed
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
                  disabled={!selectedPatientId || !resumeMedisCheck || !billingCheck}
                  className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-medium transition-colors disabled:opacity-50"
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
