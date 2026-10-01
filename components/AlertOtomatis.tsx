'use client';

import React, { useState, useMemo } from 'react';
import { AlertItem, AlertSeverity, AlertCategory } from '@/lib/types';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  ShieldAlert,
  ArrowRight,
  XCircle,
  Eye,
} from 'lucide-react';

interface AlertOtomatisProps {
  alerts: AlertItem[];
  onDismissAlert: (alertId: string) => void;
  onOpenAdmission: () => void;
  onOpenMutation: (patientId?: string) => void;
  onOpenDischarge: (patientId?: string) => void;
  onOpenReconciliation: () => void;
  onSelectPatient: (patientId: string) => void;
  onSelectBed: (bedId: string) => void;
}

export const AlertOtomatis: React.FC<AlertOtomatisProps> = ({
  alerts,
  onDismissAlert,
  onOpenAdmission,
  onOpenMutation,
  onOpenDischarge,
  onOpenReconciliation,
  onSelectPatient,
  onSelectBed,
}) => {
  const [severityFilter, setSeverityFilter] = useState<'ALL' | AlertSeverity>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const catMatch = a.kategori.toLowerCase().includes(q);
        const descMatch = a.deskripsi.toLowerCase().includes(q);
        const roomMatch = a.ruanganNama?.toLowerCase().includes(q);
        const patMatch = a.namaPasien?.toLowerCase().includes(q);
        return catMatch || descMatch || roomMatch || patMatch;
      }
      return true;
    });
  }, [alerts, severityFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: alerts.length,
      high: alerts.filter((a) => a.severity === 'HIGH').length,
      medium: alerts.filter((a) => a.severity === 'MEDIUM').length,
      low: alerts.filter((a) => a.severity === 'LOW').length,
    };
  }, [alerts]);

  const handleAction = (alert: AlertItem) => {
    if (alert.actionType === 'ALOKASI_BED') {
      onOpenAdmission();
    } else if (alert.actionType === 'VERIFIKASI_MUTASI') {
      onOpenMutation(alert.pasienId);
    } else if (alert.actionType === 'PULANG') {
      onOpenDischarge(alert.pasienId);
    } else if (alert.actionType === 'REKONSILIASI') {
      onOpenReconciliation();
    } else if (alert.pasienId) {
      onSelectPatient(alert.pasienId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner and Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              Panel Alert Otomatis Rumah Sakit
            </h2>
            <p className="text-xs text-slate-500">
              Deteksi otomatis kondisi over kapasitas, ketidaksinkronan data sensus, konflik bed, dan rencana kepulangan pasien
            </p>
          </div>

          {/* Severity tabs */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setSeverityFilter('ALL')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                severityFilter === 'ALL'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua ({counts.all})
            </button>
            <button
              onClick={() => setSeverityFilter('HIGH')}
              className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1 ${
                severityFilter === 'HIGH'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
              HIGH ({counts.high})
            </button>
            <button
              onClick={() => setSeverityFilter('MEDIUM')}
              className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1 ${
                severityFilter === 'MEDIUM'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              MEDIUM ({counts.medium})
            </button>
            <button
              onClick={() => setSeverityFilter('LOW')}
              className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1 ${
                severityFilter === 'LOW'
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
              LOW ({counts.low})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="pt-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari alert berdasarkan kategori, deskripsi, ruangan, atau nama pasien..."
            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <div className="font-semibold text-slate-800 text-sm">Tidak Ada Alert Aktif</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Seluruh kapasitas bed, sensus pasien, dan status rekonsiliasi terpantau aman dan sinkron.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            let borderStyle = 'border-l-4 border-l-rose-600 bg-white border-slate-200';
            let badgeStyle = 'bg-rose-100 text-rose-800 font-bold';

            if (alert.severity === 'MEDIUM') {
              borderStyle = 'border-l-4 border-l-amber-500 bg-white border-slate-200';
              badgeStyle = 'bg-amber-100 text-amber-800 font-bold';
            } else if (alert.severity === 'LOW') {
              borderStyle = 'border-l-4 border-l-sky-500 bg-white border-slate-200';
              badgeStyle = 'bg-sky-100 text-sky-800 font-bold';
            }

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${borderStyle}`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${badgeStyle}`}>
                      {alert.severity}
                    </span>
                    <strong className="text-slate-900 text-xs">{alert.kategori}</strong>
                    {alert.ruanganNama && (
                      <span className="text-slate-500 text-[11px] font-medium">
                        &bull; {alert.ruanganNama}
                      </span>
                    )}
                    <span className="text-slate-400 text-[11px] ml-auto md:ml-0 font-mono">
                      {alert.waktu}
                    </span>
                  </div>

                  <p className="text-slate-700 text-xs leading-relaxed">{alert.deskripsi}</p>

                  <div className="text-[11px] text-slate-500 pt-0.5">
                    <span className="font-semibold text-slate-700">Rekomendasi Tindakan:</span>{' '}
                    {alert.rekomendasiAksi}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                  <button
                    onClick={() => handleAction(alert)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors"
                  >
                    <span>Lakukan Tindakan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDismissAlert(alert.id)}
                    className="px-2.5 py-1.5 rounded border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs transition-colors"
                    title="Tandai Diatasi"
                  >
                    Atasi
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
