'use client';

import React, { useState, useEffect } from 'react';
import { Ruangan, Bed, Patient, AlertItem, HospitalIndicators } from '@/lib/types';
import { X, Tv, Clock, AlertTriangle, BedDouble, Activity, ShieldAlert } from 'lucide-react';

interface TvModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitalName: string;
  rooms: Ruangan[];
  beds: Bed[];
  patients: Patient[];
  alerts: AlertItem[];
  indicators: HospitalIndicators;
}

export const TvModeModal: React.FC<TvModeModalProps> = ({
  isOpen,
  onClose,
  hospitalName,
  rooms,
  beds,
  patients,
  alerts,
  indicators,
}) => {
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Jakarta',
        }) + ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col p-6 overflow-hidden select-none">
      {/* Top TV Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400">
            <Tv className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white uppercase">{hospitalName}</h1>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                LIVE MONITORING
              </span>
            </div>
            <p className="text-xs text-slate-400">
              D-TRACK (SIMUTASIS) &bull; Sistem Kendali Digital Ketersediaan Bed &amp; Pergerakan Pasien
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs text-slate-400">WAKTU SISTEM (JAKARTA)</div>
            <div className="text-2xl font-mono font-bold text-emerald-400 tracking-wider flex items-center gap-1.5 justify-end">
              <Clock className="w-5 h-5 text-slate-400" />
              {timeString}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Keluar TV Mode (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 py-4 shrink-0">
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 uppercase font-semibold">TOTAL BED</span>
          <div className="text-3xl font-extrabold text-white mt-1">{indicators.totalBed}</div>
          <span className="text-[11px] text-slate-500">Kapasitas RS</span>
        </div>

        <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-600/40 text-center">
          <span className="text-xs text-emerald-400 uppercase font-semibold">BED KOSONG</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1">{indicators.bedKosong}</div>
          <span className="text-[11px] text-emerald-500">Siap Alokasi</span>
        </div>

        <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-600/40 text-center">
          <span className="text-xs text-rose-400 uppercase font-semibold">BED TERISI</span>
          <div className="text-3xl font-extrabold text-rose-400 mt-1">{indicators.bedTerisi}</div>
          <span className="text-[11px] text-rose-400">{indicators.pasienAktif} Pasien Aktif</span>
        </div>

        <div className="p-4 rounded-lg bg-sky-950/40 border border-sky-600/40 text-center">
          <span className="text-xs text-sky-400 uppercase font-semibold">BOOKING MASUK</span>
          <div className="text-3xl font-extrabold text-sky-400 mt-1">{indicators.bedBooking}</div>
          <span className="text-[11px] text-sky-500">Rujukan / Jadwal</span>
        </div>

        <div className="p-4 rounded-lg bg-amber-950/40 border border-amber-600/40 text-center">
          <span className="text-xs text-amber-400 uppercase font-semibold">RENCANA PULANG</span>
          <div className="text-3xl font-extrabold text-amber-400 mt-1">{indicators.bedAkanPulang}</div>
          <span className="text-[11px] text-amber-500">KRS Hari Ini</span>
        </div>

        <div className="p-4 rounded-lg bg-indigo-950/40 border border-indigo-600/40 text-center">
          <span className="text-xs text-indigo-300 uppercase font-semibold">OCCUPANCY RATE</span>
          <div className="text-3xl font-extrabold text-indigo-400 mt-1">{indicators.occupancyRate}%</div>
          <span className="text-[11px] text-indigo-400">BOR: {indicators.bor ?? '-'}%</span>
        </div>
      </div>

      {/* Ward Cards Grid */}
      <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-2">
        {rooms.map((room) => {
          const roomBeds = beds.filter((b) => b.ruanganId === room.id);
          const total = roomBeds.length;
          const occupied = roomBeds.filter((b) => b.status === 'TERISI' || b.status === 'AKAN_PULANG' || b.status === 'AKAN_PINDAH').length;
          const empty = roomBeds.filter((b) => b.status === 'KOSONG').length;
          const booking = roomBeds.filter((b) => b.status === 'BOOKING').length;
          const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;

          return (
            <div
              key={room.id}
              className={`p-4 rounded-lg border bg-slate-900 flex flex-col justify-between ${
                pct >= 90 ? 'border-rose-600/70 shadow-rose-950/30 shadow-lg' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">{room.namaRuangan}</h3>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {room.kelas}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Keterisian:</span>
                  <strong className={pct >= 90 ? 'text-rose-400' : 'text-emerald-400'}>
                    {occupied} / {total} Bed ({pct}%)
                  </strong>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 mt-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      pct >= 90 ? 'bg-rose-500' : pct >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                {/* Bed mini blocks */}
                <div className="grid grid-cols-4 gap-1.5 mt-3">
                  {roomBeds.map((b) => {
                    let bg = 'bg-emerald-600 text-white';
                    let label = 'K';
                    if (b.status === 'TERISI') {
                      bg = 'bg-rose-600 text-white';
                      label = 'T';
                    } else if (b.status === 'AKAN_PULANG') {
                      bg = 'bg-amber-500 text-slate-950 font-bold';
                      label = 'P';
                    } else if (b.status === 'AKAN_PINDAH') {
                      bg = 'bg-amber-400 text-slate-950 font-bold';
                      label = 'M';
                    } else if (b.status === 'BOOKING') {
                      bg = 'bg-sky-600 text-white';
                      label = 'B';
                    } else if (b.status === 'MAINTENANCE') {
                      bg = 'bg-slate-700 text-slate-400';
                      label = 'X';
                    }

                    return (
                      <div
                        key={b.id}
                        className={`text-center py-1 rounded text-[11px] font-mono font-bold ${bg}`}
                        title={`Bed ${b.nomorBed}: ${b.status}`}
                      >
                        {b.nomorBed.replace('B-', '').replace('VIP-', 'V')}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="text-emerald-400 font-semibold">{empty} Kosong</span>
                {booking > 0 && <span className="text-sky-400 font-semibold">{booking} Booking</span>}
                <span>PJ: {room.pjRuangan.split(',')[0]}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Ticker for Urgent Alerts */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-600/30 text-rose-400 border border-rose-500/50 font-bold shrink-0">
            <AlertTriangle className="w-3.5 h-3.5" />
            ALERT SYSTEM
          </div>
          <div className="truncate text-slate-300 text-xs">
            {alerts.length > 0
              ? alerts.map((a) => `${a.severity}: [${a.kategori}] ${a.deskripsi}`).join('  |  ')
              : 'Seluruh operasional tempat tidur dan pergerakan pasien saat ini terpantau normal dan sinkron.'}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Kosong
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Terisi
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Pulang/Pindah
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> Booking
          </span>
        </div>
      </div>
    </div>
  );
};
