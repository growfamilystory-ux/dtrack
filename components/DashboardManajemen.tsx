'use client';

import React, { useState, useMemo } from 'react';
import {
  Ruangan,
  Bed,
  Patient,
  PatientMovement,
  HospitalIndicators,
} from '@/lib/types';
import { calculateIndicators } from '@/lib/hospitalMath';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Calendar,
  Building2,
  Users,
  BedDouble,
  CheckCircle2,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface DashboardManajemenProps {
  rooms: Ruangan[];
  beds: Bed[];
  patients: Patient[];
  movements: PatientMovement[];
  indicators: HospitalIndicators;
}

export const DashboardManajemen: React.FC<DashboardManajemenProps> = ({
  rooms,
  beds,
  patients,
  movements,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30); // 7, 30, 90 days
  const [selectedClass, setSelectedClass] = useState<string>('ALL');

  // Filtered beds/patients by class if selected
  const filteredRooms = useMemo(() => {
    if (selectedClass === 'ALL') return rooms;
    return rooms.filter((r) => r.kelas === selectedClass);
  }, [rooms, selectedClass]);

  const filteredBeds = useMemo(() => {
    const roomIds = filteredRooms.map((r) => r.id);
    return beds.filter((b) => roomIds.includes(b.ruanganId));
  }, [beds, filteredRooms]);

  const filteredPatients = useMemo(() => {
    const roomIds = filteredRooms.map((r) => r.id);
    return patients.filter((p) => roomIds.includes(p.ruanganId));
  }, [patients, filteredRooms]);

  const currentIndicators = useMemo(() => {
    return calculateIndicators(filteredBeds, filteredPatients, movements, selectedPeriod);
  }, [filteredBeds, filteredPatients, movements, selectedPeriod]);

  // Classes for filter
  const allClasses = useMemo(() => {
    const set = new Set(rooms.map((r) => r.kelas));
    return Array.from(set);
  }, [rooms]);

  // Ward comparison
  const wardComparisons = useMemo(() => {
    return filteredRooms.map((r) => {
      const roomBeds = filteredBeds.filter((b) => b.ruanganId === r.id);
      const total = roomBeds.length;
      const occupied = roomBeds.filter((b) => b.status === 'TERISI' || b.status === 'AKAN_PULANG' || b.status === 'AKAN_PINDAH').length;
      const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;
      return {
        id: r.id,
        nama: r.namaRuangan,
        kelas: r.kelas,
        total,
        occupied,
        pct,
      };
    });
  }, [filteredRooms, filteredBeds]);

  // Trend data points for hospital stay
  const trendDays = useMemo(() => {
    return [
      { day: 'Senin', bor: 78, adm: 8, dis: 6 },
      { day: 'Selasa', bor: 81, adm: 11, dis: 7 },
      { day: 'Rabu', bor: 84, adm: 9, dis: 8 },
      { day: 'Kamis', bor: 82, adm: 10, dis: 9 },
      { day: 'Jumat', bor: 79, adm: 7, dis: 12 },
      { day: 'Sabtu', bor: 76, adm: 5, dis: 10 },
      { day: 'Minggu', bor: 75, adm: 6, dis: 5 },
    ];
  }, []);

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="bg-slate-900 text-white rounded-lg p-5 border border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-semibold text-sky-400 uppercase tracking-wider">
              EXECUTIVE MANAGEMENT DASHBOARD
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-xs text-slate-300">Direksi &amp; Komite Mutu Rumah Sakit</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1">
            Indikator Pelayanan &amp; Efisiensi Tempat Tidur
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Monitoring parameter standar Kementerian Kesehatan: BOR, LOS, TOI, BTO, rasio turn-over pasien, dan tren utilisasi bangsal rawat inap.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
          <button
            onClick={() => setSelectedPeriod(7)}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              selectedPeriod === 7 ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            7 Hari
          </button>
          <button
            onClick={() => setSelectedPeriod(30)}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              selectedPeriod === 30 ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            30 Hari (Bulanan)
          </button>
          <button
            onClick={() => setSelectedPeriod(90)}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              selectedPeriod === 90 ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Triwulan (90 Hari)
          </button>
        </div>
      </div>

      {/* Class filter ribbon */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Filter Kelas Perawatan:</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedClass('ALL')}
              className={`px-2.5 py-1 rounded transition-colors ${
                selectedClass === 'ALL'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua Kelas
            </button>
            {allClasses.map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedClass === cls
                    ? 'bg-emerald-700 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          Periode Analisis: <strong>{currentIndicators.calculatedPeriod}</strong> &bull; Kapasitas: {currentIndicators.totalBed} Bed
        </div>
      </div>

      {/* 4 Standard Depkes Indicators Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* BOR */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">BOR (Bed Occupancy Rate)</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
              Ideal 60 - 85%
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {currentIndicators.bor !== null ? `${currentIndicators.bor}%` : 'N/A'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Persentase pemakaian tempat tidur dalam periode {selectedPeriod} hari.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Kategori:</span>
            <strong className="text-emerald-700 font-semibold">Terkontrol / Optimal</strong>
          </div>
        </div>

        {/* ALOS */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">ALOS (Average Length of Stay)</span>
            <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded font-bold">
              Ideal 4 - 5 Hari
            </span>
          </div>
          <div className="text-3xl font-extrabold text-sky-700 mt-2">
            {currentIndicators.losRataRata !== null ? `${currentIndicators.losRataRata} Hari` : 'N/A'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Rata-rata lama seorang pasien dirawat inap sebelum KRS.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Kategori:</span>
            <strong className="text-sky-700 font-semibold">Sesuai Standar Klinis</strong>
          </div>
        </div>

        {/* TOI */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">TOI (Turn Over Interval)</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
              Ideal 1 - 3 Hari
            </span>
          </div>
          <div className="text-3xl font-extrabold text-amber-600 mt-2">
            {currentIndicators.toi !== null ? `${currentIndicators.toi} Hari` : 'N/A'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Rata-rata hari tempat tidur kosong sampai terisi kembali.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Kategori:</span>
            <strong className="text-amber-700 font-semibold">Efisiensi Tinggi</strong>
          </div>
        </div>

        {/* BTO */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">BTO (Bed Turn Over)</span>
            <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-bold">
              Ideal 40 - 50x / Th
            </span>
          </div>
          <div className="text-3xl font-extrabold text-indigo-600 mt-2">
            {currentIndicators.bto !== null ? `${currentIndicators.bto} Kali` : 'N/A'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Frekuensi pemakaian tempat tidur per periode perhitungan.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Perputaran Bed:</span>
            <strong className="text-indigo-700 font-semibold">Cukup Aktif</strong>
          </div>
        </div>
      </div>

      {/* Charts & Ward Performance Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend Bar Chart */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Tren Utilisasi BOR Mingguan</h3>
              <p className="text-xs text-slate-500">Persentase keterisian dan dinamika pasien masuk/keluar</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" /> % BOR
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block" /> Pasien Masuk
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" /> Pasien KRS
              </span>
            </div>
          </div>

          {/* Clean SVG Bar & Line Chart */}
          <div className="h-56 w-full flex items-end justify-between gap-3 pt-4 pb-2 border-b border-slate-200 px-2">
            {trendDays.map((t, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                {/* Value tooltip label */}
                <span className="text-[10px] font-mono font-bold text-slate-700">{t.bor}%</span>

                {/* Bars group */}
                <div className="w-full flex items-end justify-center gap-1 h-36">
                  {/* BOR bar */}
                  <div
                    className="w-4 bg-emerald-600 hover:bg-emerald-500 rounded-t transition-all"
                    style={{ height: `${(t.bor / 100) * 100}%` }}
                    title={`BOR: ${t.bor}%`}
                  />
                  {/* Admisi bar */}
                  <div
                    className="w-2.5 bg-sky-500 hover:bg-sky-400 rounded-t transition-all"
                    style={{ height: `${(t.adm / 15) * 100}%` }}
                    title={`Masuk: ${t.adm} Pasien`}
                  />
                  {/* Pulang bar */}
                  <div
                    className="w-2.5 bg-amber-500 hover:bg-amber-400 rounded-t transition-all"
                    style={{ height: `${(t.dis / 15) * 100}%` }}
                    title={`KRS: ${t.dis} Pasien`}
                  />
                </div>

                {/* Day label */}
                <span className="text-[11px] font-medium text-slate-600 mt-1">{t.day}</span>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Rata-rata BOR Mingguan: 79.3%</span>
            <span>Target Rumah Sakit: 75.0% - 85.0%</span>
          </div>
        </div>

        {/* Ward Occupancy Comparison Ranking */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Peringkat Utilisasi per Ruangan</h3>
              <p className="text-xs text-slate-500">Evaluasi ruangan dengan beban kapasitas tertinggi</p>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {wardComparisons.length} Ruangan
            </span>
          </div>

          <div className="space-y-3 max-h-56 overflow-y-auto">
            {wardComparisons
              .sort((a, b) => b.pct - a.pct)
              .map((w, index) => (
                <div key={w.id} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 w-4">{index + 1}.</span>
                      <strong className="text-slate-800">{w.nama}</strong>
                      <span className="text-[10px] text-slate-500 px-1.5 py-0.2 bg-slate-100 rounded">
                        {w.kelas}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      {w.occupied}/{w.total} ({w.pct}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        w.pct >= 90 ? 'bg-rose-600' : w.pct >= 75 ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${w.pct}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px] leading-relaxed">
            <strong>Catatan Evaluasi Operasional:</strong> Ruang ICU dan Teratai Kelas 3 berada pada batas atas kapasitas (&ge;85%). Disarankan melakukan akselerasi proses verifikasi discharge dan penyiapan bed cadangan.
          </div>
        </div>
      </div>
    </div>
  );
};
