'use client';

import React, { useState, useMemo } from 'react';
import { Bed, Patient, Ruangan, Kamar, BedStatus } from '@/lib/types';
import {
  Search,
  Filter,
  Eye,
  EyeOff,
  User,
  BedDouble,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';

interface PetaBedProps {
  rooms: Ruangan[];
  kamar: Kamar[];
  beds: Bed[];
  patients: Patient[];
  onSelectBed: (bedId: string) => void;
  onSelectPatient: (patientId: string) => void;
  onOpenAdmissionWithBed: (bedId: string) => void;
}

export const PetaBed: React.FC<PetaBedProps> = ({
  rooms,
  kamar,
  beds,
  patients,
  onSelectBed,
  onSelectPatient,
  onOpenAdmissionWithBed,
}) => {
  const [selectedWardId, setSelectedWardId] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maskRm, setMaskRm] = useState<boolean>(true);
  const [collapsedRooms, setCollapsedRooms] = useState<Record<string, boolean>>({});

  const toggleRoomCollapse = (roomId: string) => {
    setCollapsedRooms((prev) => ({ ...prev, [roomId]: !prev[roomId] }));
  };

  // Helper to mask RM
  const formatRm = (rm: string) => {
    if (!maskRm) return rm;
    if (rm.length > 5) {
      return rm.slice(0, 4) + '***';
    }
    return rm;
  };

  // Filter beds according to search & status
  const filteredBeds = useMemo(() => {
    return beds.filter((b) => {
      // Ward filter
      if (selectedWardId !== 'ALL' && b.ruanganId !== selectedWardId) return false;

      // Status filter
      if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const room = rooms.find((r) => r.id === b.ruanganId);
        const roomMatch = room?.namaRuangan.toLowerCase().includes(q);
        const bedMatch = b.nomorBed.toLowerCase().includes(q);
        const patient = patients.find((p) => p.bedId === b.id && p.status === 'AKTIF');
        const patNameMatch = patient?.namaPasien.toLowerCase().includes(q);
        const patRmMatch = patient?.noRm.toLowerCase().includes(q);
        return roomMatch || bedMatch || patNameMatch || patRmMatch;
      }

      return true;
    });
  }, [beds, selectedWardId, statusFilter, searchQuery, rooms, patients]);

  // Overall counts for legend badges
  const counts = useMemo(() => {
    return {
      all: beds.length,
      kosong: beds.filter((b) => b.status === 'KOSONG').length,
      terisi: beds.filter((b) => b.status === 'TERISI').length,
      booking: beds.filter((b) => b.status === 'BOOKING').length,
      pulang: beds.filter((b) => b.status === 'AKAN_PULANG').length,
      pindah: beds.filter((b) => b.status === 'AKAN_PINDAH').length,
      maintenance: beds.filter((b) => b.status === 'MAINTENANCE').length,
    };
  }, [beds]);

  const activeWardList = useMemo(() => {
    if (selectedWardId === 'ALL') return rooms;
    return rooms.filter((r) => r.id === selectedWardId);
  }, [rooms, selectedWardId]);

  return (
    <div className="space-y-5">
      {/* Header controls & Filters */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-emerald-600" />
              Peta Ketersediaan Tempat Tidur (Bed Map Real-Time)
            </h2>
            <p className="text-xs text-slate-500">
              Visualisasi grid kamar dan bed di setiap ruangan dengan color coding status operasional
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMaskRm(!maskRm)}
              className="px-2.5 py-1.5 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Sensor / Buka Sensor No. RM untuk Privasi Pasien"
            >
              {maskRm ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{maskRm ? 'RM Tersensor' : 'RM Terbuka'}</span>
            </button>
          </div>
        </div>

        {/* Filter bar and search input */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 pt-1">
          {/* Search box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor bed, pasien, No. RM, atau kamar..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-500 focus:outline-hidden"
            />
          </div>

          {/* Ward filter */}
          <div className="md:col-span-3">
            <select
              value={selectedWardId}
              onChange={(e) => setSelectedWardId(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-hidden"
            >
              <option value="ALL">Semua Ruangan Rawat Inap ({rooms.length})</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.namaRuangan} ({r.kelas})
                </option>
              ))}
            </select>
          </div>

          {/* Status interactive buttons */}
          <div className="md:col-span-5 flex items-center gap-1 overflow-x-auto py-0.5">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded text-xs font-medium shrink-0 transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({counts.all})
            </button>

            <button
              onClick={() => setStatusFilter('KOSONG')}
              className={`px-2.5 py-1 rounded text-xs font-medium shrink-0 transition-colors flex items-center gap-1 ${
                statusFilter === 'KOSONG'
                  ? 'bg-emerald-700 text-white font-semibold'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Kosong ({counts.kosong})
            </button>

            <button
              onClick={() => setStatusFilter('TERISI')}
              className={`px-2.5 py-1 rounded text-xs font-medium shrink-0 transition-colors flex items-center gap-1 ${
                statusFilter === 'TERISI'
                  ? 'bg-rose-700 text-white font-semibold'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              Terisi ({counts.terisi})
            </button>

            <button
              onClick={() => setStatusFilter('AKAN_PULANG')}
              className={`px-2.5 py-1 rounded text-xs font-medium shrink-0 transition-colors flex items-center gap-1 ${
                statusFilter === 'AKAN_PULANG'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              KRS ({counts.pulang})
            </button>

            <button
              onClick={() => setStatusFilter('BOOKING')}
              className={`px-2.5 py-1 rounded text-xs font-medium shrink-0 transition-colors flex items-center gap-1 ${
                statusFilter === 'BOOKING'
                  ? 'bg-sky-700 text-white font-semibold'
                  : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
              Booking ({counts.booking})
            </button>
          </div>
        </div>

        {/* Legend Ribbon */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-slate-800">Color Coding:</span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              <strong className="text-emerald-800">🟩 Hijau</strong> = Kosong
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
              <strong className="text-rose-800">🟥 Merah</strong> = Terisi
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <strong className="text-amber-800">🟨 Kuning</strong> = Akan Pindah / Pulang
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
              <strong className="text-sky-800">🟦 Biru</strong> = Booking Masuk
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />
              <strong className="text-slate-800">⚙️ Abu-abu</strong> = Maintenance
            </span>
          </div>
          <span className="text-slate-400 italic">* Klik bed untuk melihat detail pasien atau alokasi</span>
        </div>
      </div>

      {/* Ward Cards and Room Bed Grids */}
      <div className="space-y-6">
        {activeWardList.map((room) => {
          const roomKamar = kamar.filter((k) => k.ruanganId === room.id);
          const roomBeds = filteredBeds.filter((b) => b.ruanganId === room.id);
          const totalWardBeds = beds.filter((b) => b.ruanganId === room.id).length;
          const occupiedWardBeds = beds.filter(
            (b) => b.ruanganId === room.id && (b.status === 'TERISI' || b.status === 'AKAN_PULANG' || b.status === 'AKAN_PINDAH')
          ).length;
          const emptyWardBeds = beds.filter((b) => b.ruanganId === room.id && b.status === 'KOSONG').length;
          const bookingWardBeds = beds.filter((b) => b.ruanganId === room.id && b.status === 'BOOKING').length;
          const dischargingWardBeds = beds.filter((b) => b.ruanganId === room.id && b.status === 'AKAN_PULANG').length;
          const pct = totalWardBeds > 0 ? Math.round((occupiedWardBeds / totalWardBeds) * 100) : 0;
          const isCollapsed = collapsedRooms[room.id] ?? false;

          // If no beds match search in this room, omit or show quiet indicator
          if (roomBeds.length === 0 && searchQuery) {
            return null;
          }

          return (
            <div key={room.id} className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
              {/* Ward Header */}
              <div
                onClick={() => toggleRoomCollapse(room.id)}
                className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {room.kodeRuangan}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{room.namaRuangan}</h3>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                        {room.kelas}
                      </span>
                      <span className="text-xs text-slate-500 font-normal">
                        {room.gedung} &bull; Lt. {room.lantai}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      PJ Ruangan: <strong className="text-slate-700 font-medium">{room.pjRuangan}</strong>
                    </div>
                  </div>
                </div>

                {/* Ward stats quick bar */}
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-3 font-medium">
                    <span className="text-emerald-700">Kosong: <strong>{emptyWardBeds}</strong></span>
                    <span className="text-rose-700">Terisi: <strong>{occupiedWardBeds}</strong></span>
                    {bookingWardBeds > 0 && <span className="text-sky-700">Booking: <strong>{bookingWardBeds}</strong></span>}
                    {dischargingWardBeds > 0 && <span className="text-amber-700">KRS: <strong>{dischargingWardBeds}</strong></span>}
                    <span className="font-mono font-bold text-slate-900 ml-1">
                      {occupiedWardBeds}/{totalWardBeds} ({pct}%)
                    </span>
                  </div>

                  <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden hidden sm:block">
                    <div
                      className={`h-full rounded-full ${
                        pct >= 90 ? 'bg-rose-600' : pct >= 75 ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  <button className="text-slate-400 hover:text-slate-600 p-1">
                    {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Room & Bed Grids (when not collapsed) */}
              {!isCollapsed && (
                <div className="p-5 space-y-6">
                  {roomKamar.map((km) => {
                    const kamarBeds = roomBeds.filter((b) => b.kamarId === km.id);
                    if (kamarBeds.length === 0 && searchQuery) return null;

                    return (
                      <div key={km.id} className="space-y-2">
                        {/* Kamar Title Bar */}
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 border-b border-slate-100 pb-1">
                          <span className="flex items-center gap-1.5 uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            {km.namaKamar} ({km.totalBed} Bed)
                          </span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            Kelas {km.kelas}
                          </span>
                        </div>

                        {/* Beds Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
                          {kamarBeds.map((bed) => {
                            const patient = patients.find((p) => p.bedId === bed.id && p.status === 'AKTIF');

                            // Card color coding based on official rules
                            let cardBorder = 'border-t-4 border-t-emerald-600 bg-white hover:border-emerald-700';
                            let badgeBg = 'bg-emerald-100 text-emerald-800';
                            let statusText = 'KOSONG';

                            if (bed.status === 'TERISI') {
                              cardBorder = 'border-t-4 border-t-rose-600 bg-rose-50/20 hover:border-rose-700';
                              badgeBg = 'bg-rose-100 text-rose-800';
                              statusText = 'TERISI';
                            } else if (bed.status === 'AKAN_PULANG') {
                              cardBorder = 'border-t-4 border-t-amber-500 bg-amber-50/30 hover:border-amber-600';
                              badgeBg = 'bg-amber-100 text-amber-800';
                              statusText = 'AKAN PULANG';
                            } else if (bed.status === 'AKAN_PINDAH') {
                              cardBorder = 'border-t-4 border-t-amber-500 bg-amber-50/30 hover:border-amber-600';
                              badgeBg = 'bg-amber-100 text-amber-800';
                              statusText = 'AKAN PINDAH';
                            } else if (bed.status === 'BOOKING') {
                              cardBorder = 'border-t-4 border-t-sky-600 bg-sky-50/20 hover:border-sky-700';
                              badgeBg = 'bg-sky-100 text-sky-800';
                              statusText = 'BOOKING';
                            } else if (bed.status === 'MAINTENANCE') {
                              cardBorder = 'border-t-4 border-t-slate-500 bg-slate-50 hover:border-slate-600';
                              badgeBg = 'bg-slate-200 text-slate-800';
                              statusText = 'MAINTENANCE';
                            }

                            return (
                              <div
                                key={bed.id}
                                onClick={() => {
                                  if (patient) {
                                    onSelectPatient(patient.id);
                                  } else {
                                    onSelectBed(bed.id);
                                  }
                                }}
                                className={`rounded-lg border border-slate-200 p-3.5 shadow-2xs transition-all cursor-pointer flex flex-col justify-between ${cardBorder}`}
                              >
                                <div>
                                  {/* Bed Header */}
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-extrabold text-sm font-mono text-slate-900">
                                      {bed.nomorBed}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badgeBg}`}>
                                      {statusText}
                                    </span>
                                  </div>

                                  {/* Occupant / Patient Info */}
                                  {patient ? (
                                    <div className="space-y-1 mt-1">
                                      <div className="font-semibold text-xs text-slate-900 line-clamp-1">
                                        {patient.namaPasien}
                                      </div>
                                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                                        <span className="font-mono font-medium">{formatRm(patient.noRm)}</span>
                                        <span>{patient.umur} th &bull; {patient.jenisKelamin}</span>
                                      </div>
                                      <div className="text-[10px] text-slate-600 truncate mt-1">
                                        {patient.diagnosaMasuk}
                                      </div>

                                      {patient.rencanaPulang && (
                                        <div className="mt-1.5 p-1 bg-amber-100/70 border border-amber-300 rounded text-[10px] font-semibold text-amber-900 flex items-center gap-1">
                                          <Clock className="w-3 h-3 text-amber-700 shrink-0" />
                                          <span>Rencana KRS: {patient.jamRencanaPulang || 'Hari Ini'}</span>
                                        </div>
                                      )}
                                      {patient.rencanaPindah && (
                                        <div className="mt-1.5 p-1 bg-amber-100/70 border border-amber-300 rounded text-[10px] font-semibold text-amber-900 flex items-center gap-1">
                                          <Clock className="w-3 h-3 text-amber-700 shrink-0" />
                                          <span>Transfer ke: {patient.ruanganTujuanPindah || 'ICU'}</span>
                                        </div>
                                      )}
                                    </div>
                                  ) : bed.status === 'BOOKING' ? (
                                    <div className="text-xs text-sky-900 py-1">
                                      <div className="font-medium">Ter-booking</div>
                                      <div className="text-[11px] text-sky-700 line-clamp-2 mt-0.5">
                                        {bed.bookingNote || 'Konfirmasi alokasi admisi...'}
                                      </div>
                                    </div>
                                  ) : bed.status === 'MAINTENANCE' ? (
                                    <div className="text-xs text-slate-600 py-1">
                                      <div className="font-medium text-slate-800">Sedang Diperbaiki</div>
                                      <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                                        {bed.catatanMaintenance || 'Perbaikan fasilitas'}
                                      </div>
                                    </div>
                                  ) : (
                                    /* Bed is KOSONG */
                                    <div className="py-2 text-center text-xs text-emerald-800">
                                      <span className="font-medium">Siap Digunakan</span>
                                      <div className="text-[11px] text-emerald-600 mt-0.5">
                                        Klik untuk alokasi pasien &rarr;
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Footer micro meta */}
                                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                                  <span>{km.namaKamar}</span>
                                  <span>{patient ? 'Dirawat' : 'Tersedia'}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
