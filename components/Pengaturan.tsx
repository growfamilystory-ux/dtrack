'use client';

import React, { useState } from 'react';
import { HospitalConfig, AuditLog } from '@/lib/types';
import {
  GAS_CODE_GS,
  GAS_INDEX_HTML,
  GAS_CSS_HTML,
  GAS_JS_HTML,
} from '@/lib/gasTemplates';
import {
  Settings,
  Shield,
  FileCode,
  RotateCcw,
  Download,
  Upload,
  Copy,
  Check,
  Building2,
  Table,
  History,
} from 'lucide-react';

interface PengaturanProps {
  config: HospitalConfig;
  auditLogs: AuditLog[];
  onUpdateConfig: (newConfig: HospitalConfig) => void;
  onResetDemo: () => void;
  onExportJson: () => void;
  onImportJson: (json: string) => void;
}

export const Pengaturan: React.FC<PengaturanProps> = ({
  config,
  auditLogs,
  onUpdateConfig,
  onResetDemo,
  onExportJson,
  onImportJson,
}) => {
  const [activeTab, setActiveTab] = useState<'profil' | 'gas' | 'audit' | 'backup'>('profil');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form profile
  const [namaRs, setNamaRs] = useState(config.namaRumahSakit);
  const [kodeFaskes, setKodeFaskes] = useState(config.kodeFaskes);
  const [alamat, setAlamat] = useState(config.alamat);
  const [telepon, setTelepon] = useState(config.telepon);
  const [threshold, setThreshold] = useState(config.overcapacityThreshold);

  // GAS tab selection
  const [gasFile, setGasFile] = useState<'Code.gs' | 'Index.html' | 'CSS.html' | 'JS.html' | 'Sheets'>(
    'Code.gs'
  );

  const handleCopy = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      ...config,
      namaRumahSakit: namaRs.trim(),
      kodeFaskes: kodeFaskes.trim(),
      alamat: alamat.trim(),
      telepon: telepon.trim(),
      overcapacityThreshold: Number(threshold) || 85,
    });
    alert('Pengaturan profil rumah sakit berhasil disimpan!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        onImportJson(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner and Tabs */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-700" />
              Pengaturan Sistem &amp; Arsitektur Google Apps Script Hub
            </h2>
            <p className="text-xs text-slate-500">
              Konfigurasi parameter faskes, zona waktu, audit trail log, dan modul siap pakai Google Apps Script / Spreadsheet
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('profil')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'profil' ? 'bg-slate-900 text-white font-semibold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Profil Rumah Sakit &amp; Alert
          </button>
          <button
            onClick={() => setActiveTab('gas')}
            className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'gas' ? 'bg-emerald-700 text-white font-semibold' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Google Apps Script &amp; Sheets Hub</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'audit' ? 'bg-slate-900 text-white font-semibold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail Log ({auditLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'backup' ? 'bg-slate-900 text-white font-semibold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Cadangan Data &amp; Reset Demo
          </button>
        </div>
      </div>

      {/* Profile Form */}
      {activeTab === 'profil' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 max-w-2xl text-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Identitas Fasilitas Kesehatan (Faskes)</h3>
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div>
              <label className="block font-semibold mb-1 text-slate-700">Nama Rumah Sakit *</label>
              <input
                type="text"
                required
                value={namaRs}
                onChange={(e) => setNamaRs(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Kode Faskes Kemenkes</label>
                <input
                  type="text"
                  value={kodeFaskes}
                  onChange={(e) => setKodeFaskes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Zona Waktu Sistem</label>
                <input
                  type="text"
                  disabled
                  value={config.zonaWaktu}
                  className="w-full px-3 py-1.5 border border-slate-200 bg-slate-100 rounded text-slate-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700">Alamat Fasilitas</label>
              <input
                type="text"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Nomor Telepon Operasional</label>
                <input
                  type="text"
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700">
                  Ambang Batas Peringatan Overcapacity (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors"
              >
                Simpan Perubahan Profil
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Google Apps Script & Sheets Hub */}
      {activeTab === 'gas' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 text-xs space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-600" />
                Google Apps Script (GAS) &amp; Spreadsheet Deployment Hub
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Modul kode lengkap siap salin (Copy-Paste) untuk diunggah langsung ke Google Sheets &amp; Apps Script Web App.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {(['Code.gs', 'Index.html', 'CSS.html', 'JS.html', 'Sheets'] as const).map((fn) => (
                <button
                  key={fn}
                  onClick={() => setGasFile(fn)}
                  className={`px-2.5 py-1 rounded font-mono font-medium transition-colors ${
                    gasFile === fn
                      ? 'bg-emerald-700 text-white font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {fn}
                </button>
              ))}
            </div>
          </div>

          {gasFile === 'Sheets' ? (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs">
                <strong>Struktur Database Google Spreadsheet:</strong>
                <p className="mt-0.5">
                  Buat Google Spreadsheet baru lalu jalankan fungsi <code>setupDatabaseSheets()</code> di script editor untuk membuat 9 sheet tabel secara otomatis:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
                {[
                  { name: 'USERS', cols: 'ID, Username, Nama, Role, Email, Status, CreatedAt' },
                  { name: 'ROOMS', cols: 'ID, NamaRuangan, Kode, Kelas, Gedung, Lantai, PJRuangan, KapasitasMaksimal' },
                  { name: 'ROOMS_BEDS', cols: 'ID, NomorBed, KamarID, RuanganID, Status, PatientID, Catatan, UpdatedAt' },
                  { name: 'PATIENTS', cols: 'ID, NoRM, NamaPasien, NIK, JK, TanggalMasuk, JamMasuk, RuanganID, KamarID, BedID, DokterPJ, Diagnosa, Status, RencanaPulang, StatusRekonsiliasi' },
                  { name: 'MOVEMENTS', cols: 'ID, WaktuMutasi, PasienID, NamaPasien, NoRM, DariRuangan, DariBed, KeRuangan, KeBed, JenisMutasi, Alasan, Petugas, Timestamp' },
                  { name: 'RECONCILIATIONS', cols: 'ID, Tanggal, Shift, RuanganID, PetugasRuangan, PetugasAdmisi, PetugasRM, PasienSistem, PasienAktual, Selisih, Status, Catatan, WaktuSelesai' },
                  { name: 'ALERTS', cols: 'ID, Kategori, Severity, Waktu, RuanganID, Deskripsi, Status, ActionType' },
                  { name: 'AUDIT_LOG', cols: 'ID, TimestampWIB, User, Role, Action, Entity, DataSebelum, DataSesudah' },
                  { name: 'SETTINGS', cols: 'Key, Value, Keterangan' },
                ].map((s) => (
                  <div key={s.name} className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                    <strong className="text-slate-900 block font-bold text-xs">{s.name}</strong>
                    <span className="text-slate-500 text-[10px] break-all">{s.cols}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-800 text-xs">
                  File: {gasFile}
                </span>
                <button
                  onClick={() => {
                    const content =
                      gasFile === 'Code.gs'
                        ? GAS_CODE_GS
                        : gasFile === 'Index.html'
                        ? GAS_INDEX_HTML
                        : gasFile === 'CSS.html'
                        ? GAS_CSS_HTML
                        : GAS_JS_HTML;
                    handleCopy(gasFile, content);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
                >
                  {copiedKey === gasFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === gasFile ? 'Tersalin!' : `Salin ${gasFile}`}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-950 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto max-h-96 border border-slate-800 leading-snug">
                {gasFile === 'Code.gs' && GAS_CODE_GS}
                {gasFile === 'Index.html' && GAS_INDEX_HTML}
                {gasFile === 'CSS.html' && GAS_CSS_HTML}
                {gasFile === 'JS.html' && GAS_JS_HTML}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Audit Trail Log */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Audit Trail &amp; Rekam Aktivitas Pengguna</h3>
              <p className="text-xs text-slate-500">
                Pencatatan setiap transaksi admisi, mutasi, discharge, dan perubahan data di SIMUTASIS
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Total {auditLogs.length} Rekam Log
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Waktu (WIB)</th>
                <th className="py-2.5 px-3">Pengguna &amp; Peran</th>
                <th className="py-2.5 px-3">Aksi Transaksi</th>
                <th className="py-2.5 px-3">Entitas</th>
                <th className="py-2.5 px-3">Data Sebelum &rarr; Sesudah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-2 px-3">
                    <strong className="text-slate-900 block">{log.user}</strong>
                    <span className="text-[10px] text-slate-500">{log.role}</span>
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-800">{log.action}</td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 font-mono text-[10px] text-slate-700">
                      {log.entity}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-600 text-[11px] max-w-md">
                    <div><span className="text-slate-400">Sebelum:</span> {log.dataSebelum}</div>
                    <div><span className="text-emerald-700 font-semibold">Sesudah:</span> {log.dataSesudah}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Backup and Reset Demo */}
      {activeTab === 'backup' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 max-w-2xl text-xs space-y-6">
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Ekspor &amp; Impor Database JSON</h3>
            <p className="text-slate-500 text-xs">
              Simpan seluruh database lokal (ruangan, bed, pasien, mutasi, rekonsiliasi, audit) ke file JSON atau pulihkan data dari file sebelumnya.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onExportJson}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File Cadangan (JSON)</span>
              </button>

              <label className="flex items-center gap-1.5 px-3.5 py-2 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Pulihkan dari File JSON</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 space-y-2">
            <h3 className="font-bold text-rose-800 text-sm">Reset ke Data Demo Awal</h3>
            <p className="text-slate-600 text-xs">
              Kembalikan seluruh data ruangan, tempat tidur (52 bed), 34 pasien aktif, dan histori transaksi kembali ke status demonstrasi bawaan rumah sakit.
            </p>
            <button
              onClick={() => {
                if (confirm('Anda yakin ingin mereset seluruh data kembali ke kondisi demo awal? Semua perubahan baru akan diganti.')) {
                  onResetDemo();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition-colors shadow-2xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Seluruh Data ke Demo Awal</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
