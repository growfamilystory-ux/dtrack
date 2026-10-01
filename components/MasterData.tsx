'use client';

import React, { useState } from 'react';
import { Ruangan, Kamar, Bed, UserRole } from '@/lib/types';
import {
  Database,
  Building2,
  BedDouble,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface MasterDataProps {
  rooms: Ruangan[];
  kamar: Kamar[];
  beds: Bed[];
  currentUser: string;
  currentRole: UserRole;
  onAddRoom: (room: Ruangan) => void;
  onAddBed: (bed: Bed) => void;
  onDeleteBed: (bedId: string) => void;
}

export const MasterData: React.FC<MasterDataProps> = ({
  rooms,
  kamar,
  beds,
  onAddRoom,
  onAddBed,
  onDeleteBed,
}) => {
  const [activeTab, setActiveTab] = useState<'ruangan' | 'kamar' | 'bed'>('ruangan');

  // New Room Modal state
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [namaRuangan, setNamaRuangan] = useState('');
  const [kodeRuangan, setKodeRuangan] = useState('');
  const [kelas, setKelas] = useState('Kelas 1');
  const [gedung, setGedung] = useState('Gedung Utama');
  const [lantai, setLantai] = useState(2);
  const [pjRuangan, setPjRuangan] = useState('');

  // New Bed Modal state
  const [showAddBed, setShowAddBed] = useState(false);
  const [newBedNomor, setNewBedNomor] = useState('');
  const [newBedRoomId, setNewBedRoomId] = useState(rooms[0]?.id ?? '');
  const [newBedKamarId, setNewBedKamarId] = useState(kamar[0]?.id ?? '');

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaRuangan.trim()) return;
    const newRoom: Ruangan = {
      id: `R-${Date.now()}`,
      namaRuangan: namaRuangan.trim(),
      kodeRuangan: kodeRuangan.trim().toUpperCase() || 'RM',
      kelas,
      gedung,
      lantai: Number(lantai) || 1,
      pjRuangan: pjRuangan.trim() || 'Ns. Penanggung Jawab',
      kapasitasMaksimal: 10,
    };
    onAddRoom(newRoom);
    setShowAddRoom(false);
    setNamaRuangan('');
  };

  const handleSaveBed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBedNomor.trim()) return;
    const newBed: Bed = {
      id: `BED-${Date.now()}`,
      nomorBed: newBedNomor.trim().toUpperCase(),
      ruanganId: newBedRoomId,
      kamarId: newBedKamarId,
      status: 'KOSONG',
      updatedAt: '2026-09-30 12:00',
    };
    onAddBed(newBed);
    setShowAddBed(false);
    setNewBedNomor('');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner and Tabs */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              Pengelolaan Master Data Rumah Sakit
            </h2>
            <p className="text-xs text-slate-500">
              Konfigurasi master ruangan bangsal, unit kamar, dan tempat tidur operasional
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'ruangan' && (
              <button
                onClick={() => setShowAddRoom(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Ruangan</span>
              </button>
            )}
            {activeTab === 'bed' && (
              <button
                onClick={() => setShowAddBed(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Bed Baru</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('ruangan')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'ruangan'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Master Ruangan ({rooms.length})
          </button>
          <button
            onClick={() => setActiveTab('kamar')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'kamar'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Master Kamar ({kamar.length})
          </button>
          <button
            onClick={() => setActiveTab('bed')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'bed'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Master Tempat Tidur ({beds.length})
          </button>
        </div>
      </div>

      {/* Tables based on active tab */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {activeTab === 'ruangan' && (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Kode</th>
                <th className="py-2.5 px-3">Nama Ruangan</th>
                <th className="py-2.5 px-3">Kelas Perawatan</th>
                <th className="py-2.5 px-3">Gedung / Lantai</th>
                <th className="py-2.5 px-3">Penanggung Jawab (PJ)</th>
                <th className="py-2.5 px-3 text-center">Total Bed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rooms.map((r) => {
                const totalBeds = beds.filter((b) => b.ruanganId === r.id).length;
                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{r.kodeRuangan}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{r.namaRuangan}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium">
                        {r.kelas}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">{r.gedung}, Lantai {r.lantai}</td>
                    <td className="py-2.5 px-3">{r.pjRuangan}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">
                      {totalBeds} Bed
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {activeTab === 'kamar' && (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">ID Kamar</th>
                <th className="py-2.5 px-3">Nama Kamar</th>
                <th className="py-2.5 px-3">Ruangan Induk</th>
                <th className="py-2.5 px-3">Kelas</th>
                <th className="py-2.5 px-3 text-center">Kapasitas Bed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {kamar.map((km) => {
                const r = rooms.find((rm) => rm.id === km.ruanganId);
                return (
                  <tr key={km.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-600">{km.id}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{km.namaKamar}</td>
                    <td className="py-2.5 px-3">{r?.namaRuangan}</td>
                    <td className="py-2.5 px-3">{km.kelas}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold">{km.totalBed} Bed</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {activeTab === 'bed' && (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Nomor Bed</th>
                <th className="py-2.5 px-3">Ruangan</th>
                <th className="py-2.5 px-3">Kamar</th>
                <th className="py-2.5 px-3">Status Saat Ini</th>
                <th className="py-2.5 px-3">ID Pasien Penghuni</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {beds.map((b) => {
                const r = rooms.find((rm) => rm.id === b.ruanganId);
                const km = kamar.find((k) => k.id === b.kamarId);
                return (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{b.nomorBed}</td>
                    <td className="py-2.5 px-3">{r?.namaRuangan}</td>
                    <td className="py-2.5 px-3">{km?.namaKamar}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status === 'KOSONG'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'TERISI'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{b.patientId || '-'}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => {
                          if (b.status === 'TERISI') {
                            alert('Bed sedang terisi tidak dapat dihapus.');
                            return;
                          }
                          if (confirm(`Hapus bed ${b.nomorBed}?`)) {
                            onDeleteBed(b.id);
                          }
                        }}
                        disabled={b.status === 'TERISI'}
                        className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1"
                        title="Hapus Bed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Room Modal */}
      {showAddRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-5 border border-slate-200 text-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Tambah Master Ruangan</h3>
            <form onSubmit={handleSaveRoom} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Nama Ruangan *</label>
                <input
                  type="text"
                  required
                  value={namaRuangan}
                  onChange={(e) => setNamaRuangan(e.target.value)}
                  placeholder="Contoh: Ruang Dahlia (Kelas 1)"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Kode Ruangan</label>
                  <input
                    type="text"
                    value={kodeRuangan}
                    onChange={(e) => setKodeRuangan(e.target.value)}
                    placeholder="DAH"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Kelas</label>
                  <select
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="Kelas 1">Kelas 1</option>
                    <option value="Kelas 2">Kelas 2</option>
                    <option value="Kelas 3">Kelas 3</option>
                    <option value="VIP">VIP</option>
                    <option value="VVIP">VVIP</option>
                    <option value="Intensif">Intensif (ICU)</option>
                    <option value="Isolasi">Isolasi</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Gedung</label>
                  <input
                    type="text"
                    value={gedung}
                    onChange={(e) => setGedung(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Lantai</label>
                  <input
                    type="number"
                    value={lantai}
                    onChange={(e) => setLantai(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Penanggung Jawab (PJ Ruangan)</label>
                <input
                  type="text"
                  value={pjRuangan}
                  onChange={(e) => setPjRuangan(e.target.value)}
                  placeholder="Ns. ..., S.Kep"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddRoom(false)}
                  className="px-3 py-1.5 rounded border border-slate-300"
                >
                  Batal
                </button>
                <button type="submit" className="px-4 py-1.5 rounded bg-emerald-700 text-white font-medium">
                  Simpan Ruangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Bed Modal */}
      {showAddBed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-5 border border-slate-200 text-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Tambah Master Tempat Tidur</h3>
            <form onSubmit={handleSaveBed} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Nomor Bed *</label>
                <input
                  type="text"
                  required
                  value={newBedNomor}
                  onChange={(e) => setNewBedNomor(e.target.value)}
                  placeholder="Contoh: B-105-1"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Ruangan *</label>
                <select
                  value={newBedRoomId}
                  onChange={(e) => {
                    setNewBedRoomId(e.target.value);
                    const k = kamar.find((km) => km.ruanganId === e.target.value);
                    setNewBedKamarId(k ? k.id : '');
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.namaRuangan}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Kamar *</label>
                <select
                  value={newBedKamarId}
                  onChange={(e) => setNewBedKamarId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                >
                  {kamar
                    .filter((km) => km.ruanganId === newBedRoomId)
                    .map((km) => (
                      <option key={km.id} value={km.id}>
                        {km.namaKamar}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddBed(false)}
                  className="px-3 py-1.5 rounded border border-slate-300"
                >
                  Batal
                </button>
                <button type="submit" className="px-4 py-1.5 rounded bg-emerald-700 text-white font-medium">
                  Simpan Bed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
