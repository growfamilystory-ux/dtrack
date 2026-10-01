'use client';

import React, { useMemo } from 'react';
import {
  Bed,
  Patient,
  Ruangan,
  Kamar,
  PatientMovement,
  ReconciliationSession,
  AlertItem,
  HospitalIndicators,
} from '@/lib/types';
import {
  BedDouble,
  Users,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Building2,
  Calendar,
} from 'lucide-react';

interface DashboardUtamaProps {
  rooms: Ruangan[];
  kamar: Kamar[];
  beds: Bed[];
  patients: Patient[];
  movements: PatientMovement[];
  reconciliations: ReconciliationSession[];
  alerts: AlertItem[];
  indicators: HospitalIndicators;
  onNavigate: (view: any) => void;
  onOpenAdmission: () => void;
  onOpenMutation: () => void;
  onOpenDischarge: () => void;
  onOpenReconciliation: () => void;
  onSelectBed: (bedId: string) => void;
  onSelectPatient: (patientId: string) => void;
}

export const DashboardUtama: React.FC<DashboardUtamaProps> = ({
  rooms,
  kamar,
  beds,
  patients,
  movements,
  reconciliations,
  alerts,
  indicators,
  onNavigate,
  onOpenAdmission,
  onOpenMutation,
  onOpenDischarge,
  onOpenReconciliation,
  onSelectBed,
  onSelectPatient,
}) => {
  // Ward occupancy calculations
  const wardStats = useMemo(() => {
    return rooms.map((room) => {
      const roomBeds = beds.filter((b) => b.ruanganId === room.id);
      const total = roomBeds.length;
      const occupied = roomBeds.filter(
        (b) => b.status === 'TERISI' || b.status === 'AKAN_PULANG' || b.status === 'AKAN_PINDAH'
      ).length;
      const empty = roomBeds.filter((b) => b.status === 'KOSONG').length;
      const booking = roomBeds.filter((b) => b.status === 'BOOKING').length;
      const discharging = roomBeds.filter((b) => b.status === 'AKAN_PULANG').length;
      const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;
      return {
        ...room,
        total,
        occupied,
        empty,
        booking,
        discharging,
        percentage: pct,
      };
    });
  }, [rooms, beds]);

  // Recent movements today
  const recentMovements = useMemo(() => {
    return movements.slice(0, 5);
  }, [movements]);

  // Priority alerts
  const priorityAlerts = useMemo(() => {
    return alerts.slice(0, 4);
  }, [alerts]);

  return (
    <div className="space-y-6">
      {/* Executive Welcome & Key Announcement Banner */}
      <div className="bg-slate-900 text-white rounded-lg p-5 border border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
              PUSAT KENDALI OPERASIONAL RAWAT INAP
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-xs text-slate-300">SIMUTASIS (D-TRACK)</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1">
            Dashboard Tracking Bed &amp; Patient Movement
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Single source of truth pemantauan status tempat tidur, pergerakan pasien antar-ruangan, rekonsiliasi harian 3 shift, dan early warning alert kapasitas rumah sakit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('petabed')}
            className="px-3.5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <BedDouble className="w-4 h-4" />
            <span>Lihat Peta Bed</span>
          </button>
          <button
            onClick={onOpenReconciliation}
            className="px-3.5 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Cek Rekonsiliasi</span>
          </button>
        </div>
      </div>

      {/* 10 Operational Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Bed */}
        <div
          onClick={() => onNavigate('petabed')}
          className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Tempat Tidur</span>
            <BedDouble className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1.5">{indicators.totalBed}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Kapasitas operasional aktif</div>
        </div>

        {/* Bed Kosong (🟩 Hijau) */}
        <div
          onClick={() => onNavigate('petabed')}
          className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
              Bed Kosong
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">HIJAU</span>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1.5">{indicators.bedKosong}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Siap dialokasikan segera</div>
        </div>

        {/* Bed Terisi (🟥 Merah) */}
        <div
          onClick={() => onNavigate('pasien')}
          className="p-3.5 rounded-lg bg-rose-50/60 border border-rose-200 shadow-xs hover:border-rose-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-rose-800 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
              Bed Terisi
            </span>
            <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-bold">MERAH</span>
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-1.5">{indicators.bedTerisi}</div>
          <div className="text-[11px] text-rose-700 mt-0.5">{indicators.pasienAktif} Pasien Rawat Inap</div>
        </div>

        {/* Booking Masuk (🟦 Biru) */}
        <div
          onClick={() => onNavigate('petabed')}
          className="p-3.5 rounded-lg bg-sky-50/60 border border-sky-200 shadow-xs hover:border-sky-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-sky-800 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-600 inline-block" />
              Booking Masuk
            </span>
            <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded font-bold">BIRU</span>
          </div>
          <div className="text-2xl font-bold text-sky-700 mt-1.5">{indicators.bedBooking}</div>
          <div className="text-[11px] text-sky-700 mt-0.5">Rujukan IGD &amp; Poliklinik</div>
        </div>

        {/* Akan Pulang / Pindah (🟨 Kuning) */}
        <div
          onClick={() => onNavigate('pasien')}
          className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200 shadow-xs hover:border-amber-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-amber-800 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              Rencana KRS / Pindah
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">KUNING</span>
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1.5">
            {indicators.bedAkanPulang + indicators.bedAkanPindah}
          </div>
          <div className="text-[11px] text-amber-700 mt-0.5">
            {indicators.bedAkanPulang} KRS &bull; {indicators.bedAkanPindah} Pindah
          </div>
        </div>

        {/* Occupancy Rate */}
        <div
          onClick={() => onNavigate('manajemen')}
          className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Occupancy Rate</span>
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 mt-1.5">{indicators.occupancyRate}%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Standar ideal Depkes: 60 - 85%</div>
        </div>

        {/* Pasien Aktif */}
        <div
          onClick={() => onNavigate('pasien')}
          className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pasien Aktif</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1.5">{indicators.pasienAktif}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Tercatat di bangsal perawatan</div>
        </div>

        {/* Mutasi Hari Ini */}
        <div
          onClick={() => onNavigate('mutasi')}
          className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Mutasi Hari Ini</span>
            <ArrowRightLeft className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-sky-700 mt-1.5">{indicators.mutasiHariIni}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Perpindahan bed &amp; ruangan</div>
        </div>

        {/* Data Belum Direkonsiliasi */}
        <div
          onClick={() => onNavigate('rekonsiliasi')}
          className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Perlu Rekonsiliasi</span>
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1.5">{indicators.dataBelumRekonsiliasi}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Pasien berstatus belum dicocokkan</div>
        </div>

        {/* Alert Aktif */}
        <div
          onClick={() => onNavigate('alert')}
          className="p-3.5 rounded-lg bg-rose-50/40 border border-rose-200 shadow-xs hover:border-rose-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-rose-800 text-xs font-semibold">
            <span>Alert Operasional</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-1.5">{alerts.length}</div>
          <div className="text-[11px] text-rose-700 mt-0.5">
            {alerts.filter((a) => a.severity === 'HIGH').length} Prioritas Tinggi (High)
          </div>
        </div>
      </div>

      {/* Main Visualizations Row: Ward Distribution & Occupancy Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ward Occupancy Progress Distribution (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Distribusi Ketersediaan Bed per Ruangan</h3>
                <p className="text-xs text-slate-500">
                  Pemantauan kapasitas real-time dan identifikasi potensi overcapacity
                </p>
              </div>
              <button
                onClick={() => onNavigate('petabed')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
              >
                Peta Lengkap <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {wardStats.map((ward) => (
                <div key={ward.id} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{ward.namaRuangan}</span>
                      <span className="text-[11px] text-slate-400">({ward.gedung})</span>
                      {ward.percentage >= 90 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-200">
                          OVERCAPACITY
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-[11px]">
                        Kosong: <strong className="text-emerald-700 font-semibold">{ward.empty}</strong>
                      </span>
                      <span className="font-mono font-semibold text-slate-700">
                        {ward.occupied}/{ward.total} Bed ({ward.percentage}%)
                      </span>
                    </div>
                  </div>

                  {/* Multi-segment progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-300 ${
                        ward.percentage >= 90
                          ? 'bg-rose-600'
                          : ward.percentage >= 75
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, ward.percentage)}%` }}
                      title={`${ward.occupied} bed terisi (${ward.percentage}%)`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Aman (&lt;75%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Waspada (75-89%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" /> Kritis (&ge;90%)
              </span>
            </div>
            <span>Ambang batas alert: 85%</span>
          </div>
        </div>

        {/* Hospital Occupancy Donut & Indicator Quick Stat (1 column) */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Tingkat Keterisian (BOR)</h3>
            <p className="text-xs text-slate-500">Rasio hunian tempat tidur rumah sakit</p>

            {/* Donut graphic representation */}
            <div className="flex flex-col items-center justify-center my-6">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#e2e8f0"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  {/* Occupied Segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={indicators.occupancyRate >= 85 ? '#e11d48' : '#059669'}
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={
                      2 * Math.PI * 40 - (indicators.occupancyRate / 100) * (2 * Math.PI * 40)
                    }
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>

                <div className="absolute text-center">
                  <div className="text-3xl font-extrabold text-slate-900 leading-none">
                    {indicators.occupancyRate}%
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-1 uppercase">OCCUPANCY</div>
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 mt-4 text-xs">
                <div className="p-2 rounded bg-slate-50 border border-slate-200 text-center">
                  <span className="text-slate-500 text-[11px]">Rata-rata LOS</span>
                  <div className="font-bold text-slate-900 text-sm">{indicators.losRataRata ?? 4.2} Hari</div>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200 text-center">
                  <span className="text-slate-500 text-[11px]">Interval TOI</span>
                  <div className="font-bold text-slate-900 text-sm">{indicators.toi ?? 1.8} Hari</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Indikator Mutu BOR:</span>
            <span className="text-xs font-bold text-emerald-700">{indicators.bor ?? indicators.occupancyRate}%</span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Mutations & Priority Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Patient Movements */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-sky-600" />
              <h3 className="font-bold text-slate-900 text-sm">Pergerakan Pasien Terkini (Hari Ini)</h3>
            </div>
            <button
              onClick={() => onNavigate('mutasi')}
              className="text-xs text-sky-700 hover:text-sky-800 font-medium flex items-center gap-1"
            >
              Semua Mutasi <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentMovements.length === 0 ? (
              <p className="text-slate-400 py-4 text-center">Belum ada pergerakan pasien tercatat hari ini.</p>
            ) : (
              recentMovements.map((m) => (
                <div key={m.id} className="py-2.5 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900">{m.namaPasien}</strong>
                      <span className="font-mono text-[11px] text-slate-500 font-semibold">{m.noRm}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                        {m.jenisMutasi}
                      </span>
                    </div>
                    <div className="text-slate-600 text-[11px] mt-0.5">
                      <span>{m.dariRuanganNama} [Bed: {m.dariNomorBed}]</span>
                      <span className="text-slate-400 mx-1">&rarr;</span>
                      <span className="font-semibold text-slate-800">
                        {m.keRuanganNama} [Bed: {m.keNomorBed}]
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono text-slate-400 block">
                      {m.waktuMutasi.split(' ')[1] || m.waktuMutasi} WIB
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">{m.statusVerifikasi}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Priority Operational Alerts */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h3 className="font-bold text-slate-900 text-sm">Peringatan Operasional Prioritas</h3>
            </div>
            <button
              onClick={() => onNavigate('alert')}
              className="text-xs text-rose-700 hover:text-rose-800 font-medium flex items-center gap-1"
            >
              Semua Alert ({alerts.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {priorityAlerts.length === 0 ? (
              <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                Semua data tersinkronisasi dan tidak ada alert aktif.
              </div>
            ) : (
              priorityAlerts.map((a) => (
                <div
                  key={a.id}
                  className={`p-3 rounded-lg border flex items-start justify-between gap-3 ${
                    a.severity === 'HIGH'
                      ? 'bg-rose-50/70 border-rose-200'
                      : a.severity === 'MEDIUM'
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-sky-50/70 border-sky-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          a.severity === 'HIGH'
                            ? 'bg-rose-600 text-white'
                            : a.severity === 'MEDIUM'
                            ? 'bg-amber-500 text-slate-900'
                            : 'bg-sky-600 text-white'
                        }`}
                      >
                        {a.severity}
                      </span>
                      <strong className="text-slate-900">{a.kategori}</strong>
                      {a.ruanganNama && <span className="text-slate-500 text-[11px]">({a.ruanganNama})</span>}
                    </div>
                    <p className="text-slate-700 text-[11px] leading-snug mt-1">{a.deskripsi}</p>
                  </div>

                  <button
                    onClick={() => onNavigate('alert')}
                    className="shrink-0 px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded font-medium text-[11px] transition-colors shadow-2xs"
                  >
                    Tindakan
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
