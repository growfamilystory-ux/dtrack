'use client';

import React from 'react';
import {
  LayoutDashboard,
  BedDouble,
  Users,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  FileSpreadsheet,
  Database,
  Settings,
  Hospital,
  ChevronRight,
} from 'lucide-react';

export type NavigationMenu =
  | 'dashboard'
  | 'petabed'
  | 'pasien'
  | 'mutasi'
  | 'rekonsiliasi'
  | 'alert'
  | 'manajemen'
  | 'laporan'
  | 'master'
  | 'pengaturan';

interface SidebarProps {
  currentMenu: NavigationMenu;
  onSelectMenu: (menu: NavigationMenu) => void;
  alertCount: number;
  unreconciledCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentMenu,
  onSelectMenu,
  alertCount,
  unreconciledCount,
  isOpenMobile,
  onCloseMobile,
}) => {
  const menuItems: { id: NavigationMenu; label: string; icon: React.ReactNode; badge?: number | string; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Utama',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'petabed',
      label: 'Peta Bed (Bed Map)',
      icon: <BedDouble className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'pasien',
      label: 'Monitoring Pasien Aktif',
      icon: <Users className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'mutasi',
      label: 'Mutasi Pasien',
      icon: <ArrowRightLeft className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'rekonsiliasi',
      label: 'Rekonsiliasi (3 Shift)',
      icon: <CheckCircle2 className="w-4 h-4 shrink-0" />,
      badge: unreconciledCount > 0 ? unreconciledCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    },
    {
      id: 'alert',
      label: 'Panel Alert Otomatis',
      icon: <AlertTriangle className="w-4 h-4 shrink-0" />,
      badge: alertCount > 0 ? alertCount : undefined,
      badgeColor: 'bg-rose-500 text-white font-bold',
    },
    {
      id: 'manajemen',
      label: 'Dashboard Manajemen',
      icon: <BarChart3 className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'laporan',
      label: 'Laporan & Ekspor',
      icon: <FileSpreadsheet className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'master',
      label: 'Master Data',
      icon: <Database className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'pengaturan',
      label: 'Pengaturan & GAS Hub',
      icon: <Settings className="w-4 h-4 shrink-0" />,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand identity */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Hospital className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-wider flex items-center gap-1.5">
                D-TRACK
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-500/30">
                  SIMUTASIS
                </span>
              </div>
              <div className="text-[11px] text-slate-400 leading-tight">Bed &amp; Movement Control</div>
            </div>
          </div>
        </div>

        {/* Menu list */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Menu Operasional
          </div>

          {menuItems.slice(0, 6).map((item) => {
            const isActive = currentMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectMenu(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-300 border-l-3 border-emerald-500 pl-2.5 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={isActive ? 'text-emerald-400' : 'text-slate-400'}>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${item.badgeColor || 'bg-slate-700 text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="px-3 pt-3 pb-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Analitik &amp; Konfigurasi
          </div>

          {menuItems.slice(6).map((item) => {
            const isActive = currentMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectMenu(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-300 border-l-3 border-emerald-500 pl-2.5 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={isActive ? 'text-emerald-400' : 'text-slate-400'}>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Shift reconciliation reminder footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold text-slate-300">Jadwal Rekonsiliasi:</span>
            <span className="font-mono text-emerald-400">3x Sehari</span>
          </div>
          <div className="text-slate-400 flex items-center gap-2 text-[10px]">
            <span className="text-slate-300 font-medium">08.00</span> &bull;{' '}
            <span className="text-amber-400 font-medium">14.00</span> &bull;{' '}
            <span className="text-slate-300 font-medium">20.00 WIB</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight pt-1">
            Kolaborasi: Ruangan, Admisi, Rekam Medis.
          </p>
        </div>
      </aside>
    </>
  );
};
