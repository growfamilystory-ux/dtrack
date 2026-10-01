'use client';

import React, { useState, useEffect } from 'react';
import { UserRole, AlertItem } from '@/lib/types';
import {
  Bell,
  RefreshCw,
  Clock,
  Tv,
  UserPlus,
  ArrowRightLeft,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  hospitalName: string;
  currentUser: string;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  alerts: AlertItem[];
  lastUpdated: string;
  onRefresh: () => void;
  onOpenAdmission: () => void;
  onOpenMutation: () => void;
  onOpenDischarge: () => void;
  onOpenReconciliation: () => void;
  onOpenTvMode: () => void;
  onNavigateToAlerts: () => void;
}

const ROLES: UserRole[] = [
  'Perawat Ruangan',
  'Admisi / TPPRI',
  'Rekam Medis',
  'Manajemen / Direksi',
  'Administrator',
];

export const Header: React.FC<HeaderProps> = ({
  hospitalName,
  currentUser,
  currentRole,
  onChangeRole,
  alerts,
  lastUpdated,
  onRefresh,
  onOpenAdmission,
  onOpenMutation,
  onOpenDischarge,
  onOpenReconciliation,
  onOpenTvMode,
  onNavigateToAlerts,
}) => {
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');
  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Jakarta',
        }) + ' WIB'
      );
      setDateString(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          timeZone: 'Asia/Jakarta',
        })
      );
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const highAlertsCount = alerts.filter((a) => a.severity === 'HIGH').length;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs text-slate-800">
      {/* Top operational bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-slate-900 text-white text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-white flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              D-TRACK
            </span>
            <span className="text-slate-400 font-normal">|</span>
            <span className="text-slate-300 font-medium">Dashboard Tracking Bed &amp; Patient Movement (SIMUTASIS)</span>
          </div>
          <span className="hidden md:inline-block text-slate-500 font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {hospitalName}
          </span>
        </div>

        {/* Live Clock & Sync indicator */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
            <Radio className="w-3.5 h-3.5" />
            <span>Tersinkronisasi Lokal &bull; GAS Ready</span>
          </div>

          <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{dateString}</span>
            <span className="font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded">{timeString || '12:00:00 WIB'}</span>
          </div>
        </div>
      </div>

      {/* Main Action Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 gap-3">
        {/* Quick action operational buttons */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <button
            onClick={onOpenAdmission}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs shadow-xs transition-colors shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Pasien Masuk</span>
          </button>

          <button
            onClick={onOpenMutation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-700 hover:bg-sky-800 text-white font-medium text-xs shadow-xs transition-colors shrink-0"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Mutasi Pasien</span>
          </button>

          <button
            onClick={onOpenDischarge}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-xs transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Pasien Pulang</span>
          </button>

          <button
            onClick={onOpenReconciliation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-xs transition-colors shrink-0"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Rekonsiliasi 3-Shift</span>
          </button>
        </div>

        {/* Right side controls: Role Switcher, Alerts, Refresh, TV Mode */}
        <div className="flex items-center gap-2.5 ml-auto">
          {/* Refresh button with timestamp */}
          <div className="hidden lg:flex flex-col items-end text-[11px] text-slate-500 mr-1">
            <span>Terakhir diperbarui:</span>
            <span className="font-mono text-slate-700 font-medium">{lastUpdated}</span>
          </div>

          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="p-1.5 rounded border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Refresh Data Sistem"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          {/* TV Mode toggle */}
          <button
            onClick={onOpenTvMode}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs transition-colors"
            title="Buka Mode Layar TV Bangsal"
          >
            <Tv className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">TV Mode</span>
          </button>

          {/* Alert Bell with dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAlertMenu(!showAlertMenu)}
              className="relative p-1.5 rounded border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors"
              title="Notifikasi Peringatan"
            >
              <Bell className="w-4 h-4" />
              {alerts.length > 0 && (
                <span
                  className={`absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white ${
                    highAlertsCount > 0 ? 'bg-rose-600 animate-pulse' : 'bg-amber-600'
                  }`}
                >
                  {alerts.length}
                </span>
              )}
            </button>

            {showAlertMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden text-xs">
                <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Peringatan Operasional ({alerts.length})</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowAlertMenu(false);
                      onNavigateToAlerts();
                    }}
                    className="text-[11px] text-emerald-400 hover:underline"
                  >
                    Lihat Semua &rarr;
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {alerts.length === 0 ? (
                    <div className="p-4 text-center text-slate-500">Tidak ada alert aktif saat ini.</div>
                  ) : (
                    alerts.slice(0, 5).map((a) => (
                      <div key={a.id} className="p-2.5 hover:bg-slate-50">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              a.severity === 'HIGH'
                                ? 'bg-rose-100 text-rose-800'
                                : a.severity === 'MEDIUM'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-sky-100 text-sky-800'
                            }`}
                          >
                            {a.severity}
                          </span>
                          <span className="text-[10px] text-slate-400">{a.waktu.split(',')[1] || a.waktu}</span>
                        </div>
                        <div className="font-semibold text-slate-800 mt-1">{a.kategori}</div>
                        <p className="text-slate-600 text-[11px] leading-snug mt-0.5">{a.deskripsi}</p>
                      </div>
                    ))
                  )}
                </div>

                {alerts.length > 5 && (
                  <button
                    onClick={() => {
                      setShowAlertMenu(false);
                      onNavigateToAlerts();
                    }}
                    className="w-full py-2 text-center bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium border-t border-slate-200"
                  >
                    Buka {alerts.length - 5} Alert Lainnya &rarr;
                  </button>
                )}
              </div>
            )}
          </div>

          {/* User Profile & Role Switcher */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-none">{currentUser}</div>
              <div className="text-[11px] text-emerald-700 font-medium mt-0.5">{currentRole}</div>
            </div>

            <div className="relative">
              <select
                value={currentRole}
                onChange={(e) => onChangeRole(e.target.value as UserRole)}
                className="text-xs font-medium px-2 py-1 border border-slate-300 rounded bg-white text-slate-700 focus:outline-hidden hover:bg-slate-50 cursor-pointer"
                title="Ganti Peran Aktif Pengguna"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
