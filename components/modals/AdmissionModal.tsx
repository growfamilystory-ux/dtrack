'use client';

import React, { useState, useMemo } from 'react';
import { Ruangan, Kamar, Bed, Patient, UserRole } from '@/lib/types';
import { X, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Ruangan[];
  kamar: Kamar[];
  beds: Bed[];
  currentRole: UserRole;
  currentUser: string;
  onAdmit: (patientData: Omit<Patient, 'id' | 'status' | 'statusRekonsiliasi'>) => void;
  preselectedBedId?: string | null;
}

export const AdmissionModal: React.FC<AdmissionModalProps> = ({
  isOpen,
  onClose,
  rooms,
  kamar,
  beds,
  onAdmit,
  preselectedBedId,
}) => {
  const preselectedBed = useMemo(() => beds.find((b) => b.id === preselectedBedId), [beds, preselectedBedId]);

  const [namaPasien, setNamaPasien] = useState('');
  const [noRm, setNoRm] = useState('RM-495201');
  const [nik, setNik] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [tanggalLahir, setTanggalLahir] = useState('1985-05-20');
  const [umur, setUmur] = useState(41);
  const [jaminan, setJaminan] = useState<Patient['jaminan']>('BPJS Kesehatan');
  const [tanggalMasuk, setTanggalMasuk] = useState('2026-09-30');
  const [jamMasuk, setJamMasuk] = useState('11:30');
  const [ruanganId, setRuanganId] = useState(preselectedBed?.ruanganId || (rooms[0]?.id ?? ''));
  const [kamarId, setKamarId] = useState(preselectedBed?.kamarId || '');
  const [bedId, setBedId] = useState(preselectedBed?.id || '');
  const [dokterPj, setDokterPj] = useState('dr. Budi Setiawan, Sp.PD');
  const [diagnosaMasuk, setDiagnosaMasuk] = useState('');
  const [catatan, setCatatan] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Update filtered kamar when ruangan changes
  const filteredKamar = useMemo(() => {
    return kamar.filter((k) => k.ruanganId === ruanganId);
  }, [kamar, ruanganId]);

  // Update filtered available beds
  const availableBeds = useMemo(() => {
    return beds.filter((b) => {
      const matchRoom = b.ruanganId === ruanganId;
      const matchKamar = kamarId ? b.kamarId === kamarId : true;
      const isAvailable = b.status === 'KOSONG' || b.id === preselectedBedId;
      return matchRoom && matchKamar && isAvailable;
    });
  }, [beds, ruanganId, kamarId, preselectedBedId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!namaPasien.trim()) {
      setErrorMsg('Nama pasien wajib diisi.');
      return;
    }
    if (!noRm.trim()) {
      setErrorMsg('Nomor Rekam Medis wajib diisi.');
      return;
    }
    if (!bedId) {
      setErrorMsg('Bed tujuan wajib dipilih.');
      return;
    }
    if (!diagnosaMasuk.trim()) {
      setErrorMsg('Diagnosa masuk wajib diisi.');
      return;
    }

    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    // Final Execute
    onAdmit({
      noRm: noRm.trim().toUpperCase(),
      namaPasien: namaPasien.trim(),
      nik: nik.trim(),
      jenisKelamin,
      tanggalLahir,
      umur: Number(umur) || 0,
      jaminan,
      tanggalMasuk,
      jamMasuk,
      ruanganId,
      kamarId: kamarId || filteredKamar[0]?.id || '',
      bedId,
      dokterPj,
      diagnosaMasuk: diagnosaMasuk.trim(),
      rencanaPulang: false,
      rencanaPindah: false,
      catatan: catatan.trim(),
    });

    setIsConfirming(false);
    onClose();
  };

  if (!isOpen) return null;

  const selectedBedObj = beds.find((b) => b.id === bedId);
  const selectedRoomObj = rooms.find((r) => r.id === ruanganId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-800 text-white">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold tracking-tight">Formulir Pasien Masuk (Admisi / TPPRI)</h3>
              <p className="text-xs text-slate-300">Registrasi dan alokasi tempat tidur rawat inap</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
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
                Konfirmasi Alokasi Pasien Masuk
              </div>
              <p className="text-amber-900 leading-relaxed">
                Anda akan mengalokasikan pasien berikut ke dalam sistem SIMUTASIS:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded border border-amber-200">
                <div><span className="text-slate-500">Nama Pasien:</span> <strong className="text-slate-900">{namaPasien}</strong></div>
                <div><span className="text-slate-500">No. Rekam Medis:</span> <strong className="text-slate-900">{noRm}</strong></div>
                <div><span className="text-slate-500">Ruangan:</span> <strong className="text-slate-900">{selectedRoomObj?.namaRuangan}</strong></div>
                <div><span className="text-slate-500">Nomor Bed:</span> <strong className="text-emerald-700">{selectedBedObj?.nomorBed} (KOSONG &rarr; TERISI)</strong></div>
                <div><span className="text-slate-500">Waktu Masuk:</span> <span className="text-slate-900">{tanggalMasuk} {jamMasuk} WIB</span></div>
                <div><span className="text-slate-500">Dokter PJ:</span> <span className="text-slate-900">{dokterPj}</span></div>
                <div className="col-span-2"><span className="text-slate-500">Diagnosa Masuk:</span> <span className="text-slate-900">{diagnosaMasuk}</span></div>
              </div>
              <p className="text-[11px] text-amber-700 italic">
                * Setelah submit, status bed akan berubah otomatis menjadi <strong>TERISI</strong> dan histori mutasi awal akan tercatat.
              </p>
            </div>
          ) : (
            <>
              {/* Patient Identity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block font-semibold mb-1 text-slate-800">Nama Lengkap Pasien *</label>
                  <input
                    type="text"
                    required
                    value={namaPasien}
                    onChange={(e) => setNamaPasien(e.target.value)}
                    placeholder="Contoh: Tn. Bambang Irawan"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-800">No. Rekam Medis *</label>
                  <input
                    type="text"
                    required
                    value={noRm}
                    onChange={(e) => setNoRm(e.target.value)}
                    placeholder="RM-XXXXXX"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-slate-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-800">Jenis Kelamin</label>
                  <select
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value as 'L' | 'P')}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-hidden"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-800">Umur (Tahun)</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={umur}
                    onChange={(e) => setUmur(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-hidden"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold mb-1 text-slate-800">Jenis Jaminan / Pembayaran</label>
                  <select
                    value={jaminan}
                    onChange={(e) => setJaminan(e.target.value as Patient['jaminan'])}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-hidden"
                  >
                    <option value="BPJS Kesehatan">BPJS Kesehatan</option>
                    <option value="Asuransi Swasta">Asuransi Swasta</option>
                    <option value="Umum / Mandiri">Umum / Mandiri</option>
                  </select>
                </div>
              </div>

              {/* Admission Location Selection */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <div className="font-semibold text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span>Alokasi Tempat Tidur (Bed Allocation)</span>
                  <span className="text-[11px] text-emerald-700 font-normal">
                    Tersedia {availableBeds.length} bed kosong di kriteria ini
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-800">Ruangan Tujuan *</label>
                    <select
                      value={ruanganId}
                      onChange={(e) => {
                        const newRId = e.target.value;
                        setRuanganId(newRId);
                        const kFirst = kamar.find((k) => k.ruanganId === newRId);
                        setKamarId(kFirst ? kFirst.id : '');
                        setBedId('');
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
                    <label className="block font-semibold mb-1 text-slate-800">Kamar</label>
                    <select
                      value={kamarId}
                      onChange={(e) => {
                        setKamarId(e.target.value);
                        setBedId('');
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-hidden"
                    >
                      <option value="">Semua Kamar</option>
                      {filteredKamar.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.namaKamar} ({k.totalBed} bed)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-800">Bed Tersedia *</label>
                    <select
                      required
                      value={bedId}
                      onChange={(e) => setBedId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-emerald-500 rounded text-xs bg-emerald-50 text-slate-900 font-semibold focus:outline-hidden"
                    >
                      <option value="">-- Pilih Bed Kosong --</option>
                      {availableBeds.map((b) => (
                        <option key={b.id} value={b.id}>
                          Bed {b.nomorBed} (Status: {b.status})
                        </option>
                      ))}
                    </select>
                    {availableBeds.length === 0 && (
                      <p className="text-[11px] text-rose-600 mt-1">
                        Tidak ada bed kosong pada ruangan ini.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-medium mb-1 text-slate-700">Tanggal Masuk</label>
                    <input
                      type="date"
                      value={tanggalMasuk}
                      onChange={(e) => setTanggalMasuk(e.target.value)}
                      className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-slate-700">Jam Masuk (WIB)</label>
                    <input
                      type="time"
                      value={jamMasuk}
                      onChange={(e) => setJamMasuk(e.target.value)}
                      className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Clinical Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-800">Dokter Penanggung Jawab (DPJP) *</label>
                  <input
                    type="text"
                    required
                    value={dokterPj}
                    onChange={(e) => setDokterPj(e.target.value)}
                    placeholder="dr. ..., Sp.XX"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-800">Diagnosa Masuk *</label>
                  <input
                    type="text"
                    required
                    value={diagnosaMasuk}
                    onChange={(e) => setDiagnosaMasuk(e.target.value)}
                    placeholder="Contoh: DHF Grade II / Dyspepsia Akut"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-800">Catatan Khusus / Keterangan Admisi</label>
                <textarea
                  rows={2}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Catatan alergi, instruksi khusus ruangan, atau rujukan..."
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
                  Ya, Simpan &amp; Alokasikan Bed
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
                  disabled={availableBeds.length === 0}
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
