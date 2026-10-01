'use client';

import React, { useState, useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  Bed,
  Patient,
  Ruangan,
  Kamar,
  PatientMovement,
  ReconciliationSession,
  HospitalConfig,
  AuditLog,
  UserRole,
  AlertItem,
} from '@/lib/types';
import {
  loadDatabase,
  admitPatient,
  mutatePatient,
  dischargePatient,
  updateBedStatus,
  saveReconciliation,
  dismissAlert,
  resetDatabaseToDemo,
  exportDatabaseJson,
  importDatabaseJson,
} from '@/lib/storage';
import { calculateIndicators } from '@/lib/hospitalMath';
import { Header } from '@/components/Header';
import { Sidebar, NavigationMenu } from '@/components/Sidebar';
import { DashboardUtama } from '@/components/DashboardUtama';
import { PetaBed } from '@/components/PetaBed';
import { PasienAktif } from '@/components/PasienAktif';
import { MutasiPasien } from '@/components/MutasiPasien';
import { Rekonsiliasi } from '@/components/Rekonsiliasi';
import { AlertOtomatis } from '@/components/AlertOtomatis';
import { DashboardManajemen } from '@/components/DashboardManajemen';
import { Laporan } from '@/components/Laporan';
import { MasterData } from '@/components/MasterData';
import { Pengaturan } from '@/components/Pengaturan';
import { AdmissionModal } from '@/components/modals/AdmissionModal';
import { MutationModal } from '@/components/modals/MutationModal';
import { DischargeModal } from '@/components/modals/DischargeModal';
import { PatientDetailModal } from '@/components/modals/PatientDetailModal';
import { BedDetailModal } from '@/components/modals/BedDetailModal';
import { TvModeModal } from '@/components/modals/TvModeModal';
import { ToastContainer, ToastMessage } from '@/components/Toast';
import { Menu } from 'lucide-react';

let toastCounter = 0;

export default function HomePage() {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // App Database State
  const [dbState, setDbState] = useState(() => loadDatabase());
  const [lastUpdated, setLastUpdated] = useState<string>('12:00:00 WIB');

  // Navigation and Role
  const [currentMenu, setCurrentMenu] = useState<NavigationMenu>('dashboard');
  const [currentUser, setCurrentUser] = useState<string>('Ns. Ratna Dewi, S.Kep');
  const [currentRole, setCurrentRole] = useState<UserRole>('Perawat Ruangan');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals State
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [admissionPreselectedBedId, setAdmissionPreselectedBedId] = useState<string | null>(null);

  const [isMutationOpen, setIsMutationOpen] = useState(false);
  const [mutationPreselectedPatientId, setMutationPreselectedPatientId] = useState<string | null>(null);

  const [isDischargeOpen, setIsDischargeOpen] = useState(false);
  const [dischargePreselectedPatientId, setDischargePreselectedPatientId] = useState<string | null>(null);

  const [isPatientDetailOpen, setIsPatientDetailOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const [isBedDetailOpen, setIsBedDetailOpen] = useState(false);
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);

  const [isTvModeOpen, setIsTvModeOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage['type'], title: string, message: string) => {
    toastCounter += 1;
    const id = `toast-${toastCounter}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToastHandler = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Reload database from storage
  const refreshData = useCallback(() => {
    const db = loadDatabase();
    setDbState(db);

    const now = new Date();
    setLastUpdated(
      now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Jakarta',
      }) + ' WIB'
    );
  }, []);

  const { config, rooms, kamar, beds, patients, movements, reconciliations, auditLogs, alerts } = dbState;

  // Adjust current user display name when role is changed
  const handleChangeRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'Perawat Ruangan') setCurrentUser('Ns. Ratna Dewi, S.Kep');
    else if (role === 'Admisi / TPPRI') setCurrentUser('Sdr. Dimas Kurniawan, A.Md.RMIK');
    else if (role === 'Rekam Medis') setCurrentUser('Sdri. Anisa Putri, S.ST');
    else if (role === 'Manajemen / Direksi') setCurrentUser('dr. H. Hendrawan, MARS');
    else if (role === 'Administrator') setCurrentUser('Admin SIMUTASIS');
    addToast('info', 'Peran Pengguna Diubah', `Anda saat ini bertindak sebagai: ${role}`);
  };

  // Hospital indicators
  const indicators = useMemo(() => {
    return calculateIndicators(beds, patients, movements, 30);
  }, [beds, patients, movements]);

  // Handlers
  const handleAdmit = (patientData: Omit<Patient, 'id' | 'status' | 'statusRekonsiliasi'>) => {
    const res = admitPatient(patientData, currentUser, currentRole);
    if (res.success) {
      refreshData();
      addToast('success', 'Pasien Berhasil Masuk', res.message);
    } else {
      addToast('error', 'Gagal Alokasi Pasien', res.message);
    }
  };

  const handleMutate = (
    patientId: string,
    targetRuanganId: string,
    targetKamarId: string,
    targetBedId: string,
    alasanMutasi: string
  ) => {
    const res = mutatePatient(patientId, targetRuanganId, targetKamarId, targetBedId, alasanMutasi, currentUser, currentRole);
    if (res.success) {
      refreshData();
      addToast('success', 'Mutasi Berhasil Dilakukan', res.message);
    } else {
      addToast('error', 'Gagal Memproses Mutasi', res.message);
    }
  };

  const handleDischarge = (
    patientId: string,
    caraKeluar: Patient['caraKeluar'],
    catatan: string
  ) => {
    const res = dischargePatient(patientId, caraKeluar, catatan, currentUser, currentRole);
    if (res.success) {
      refreshData();
      addToast('success', 'Pasien Berhasil Dipulangkan', res.message);
    } else {
      addToast('error', 'Gagal Memulangkan Pasien', res.message);
    }
  };

  const handleUpdateBedStatus = (bedId: string, newStatus: Bed['status'], note: string) => {
    const res = updateBedStatus(bedId, newStatus, note, currentUser, currentRole);
    if (res.success) {
      refreshData();
      addToast('success', 'Status Bed Diperbarui', res.message);
    } else {
      addToast('error', 'Gagal Memperbarui Bed', res.message);
    }
  };

  const handleSaveReconciliation = (session: ReconciliationSession) => {
    const res = saveReconciliation(session, currentUser, currentRole);
    if (res.success) {
      refreshData();
      addToast('success', 'Rekonsiliasi Tersimpan', res.message);
    }
  };

  const handleDismissAlert = (alertId: string) => {
    dismissAlert(alertId);
    refreshData();
    addToast('info', 'Alert Diatasi', 'Peringatan telah ditandai selesai.');
  };

  const handleResetDemo = () => {
    resetDatabaseToDemo();
    refreshData();
    addToast('warning', 'Database Direset', 'Seluruh data telah dikembalikan ke dataset demonstrasi awal.');
  };

  const handleExportJson = () => {
    const jsonStr = exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `D-TRACK_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    addToast('success', 'Ekspor Berhasil', 'File cadangan JSON database berhasil diunduh.');
  };

  const handleImportJson = (json: string) => {
    const ok = importDatabaseJson(json);
    if (ok) {
      refreshData();
      addToast('success', 'Pemulihan Sukses', 'Database berhasil dipulihkan dari file JSON.');
    } else {
      addToast('error', 'Gagal Memulihkan', 'Format file JSON tidak valid untuk database D-TRACK.');
    }
  };

  // Open helper modal methods
  const openBedDetail = (bedId: string) => {
    setSelectedBedId(bedId);
    setIsBedDetailOpen(true);
  };

  const openPatientDetail = (patientId: string) => {
    setSelectedPatientId(patientId);
    setIsPatientDetailOpen(true);
  };

  const openAdmissionWithBed = (bedId: string) => {
    setAdmissionPreselectedBedId(bedId);
    setIsAdmissionOpen(true);
  };

  const openMutationWithPatient = (patientId?: string) => {
    setMutationPreselectedPatientId(patientId || null);
    setIsMutationOpen(true);
  };

  const openDischargeWithPatient = (patientId?: string) => {
    setDischargePreselectedPatientId(patientId || null);
    setIsDischargeOpen(true);
  };

  // Toggle discharge plan on patient directly
  const handleToggleDischargePlan = (patientId: string, willDischarge: boolean) => {
    const updated = patients.map((p) =>
      p.id === patientId
        ? {
            ...p,
            rencanaPulang: willDischarge,
            tanggalRencanaPulang: willDischarge ? '2026-09-30' : undefined,
            jamRencanaPulang: willDischarge ? '14:00' : undefined,
          }
        : p
    );
    try {
      localStorage.setItem('dtrack_patients_v1', JSON.stringify(updated));
      refreshData();
      addToast(
        'info',
        willDischarge ? 'Rencana Pulang Ditandai' : 'Rencana Pulang Dibatalkan',
        `Status pasien telah diperbarui.`
      );
    } catch (e) {
      console.error(e);
    }
  };

  // Selected patient & bed object for modals
  const activeSelectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) || null,
    [patients, selectedPatientId]
  );

  const activeSelectedBed = useMemo(
    () => beds.find((b) => b.id === selectedBedId) || null,
    [beds, selectedBedId]
  );
  const activeSelectedBedRoom = useMemo(
    () => rooms.find((r) => r.id === activeSelectedBed?.ruanganId) || null,
    [rooms, activeSelectedBed]
  );
  const activeSelectedBedKamar = useMemo(
    () => kamar.find((k) => k.id === activeSelectedBed?.kamarId) || null,
    [kamar, activeSelectedBed]
  );
  const activeSelectedBedPatient = useMemo(
    () => patients.find((p) => p.bedId === activeSelectedBed?.id && p.status === 'AKTIF') || null,
    [patients, activeSelectedBed]
  );

  if (!isClient) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-mono text-xs">
        Memuat D-TRACK SIMUTASIS...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-800 flex flex-col font-sans antialiased">
      {/* Top Application Header */}
      <Header
        hospitalName={config.namaRumahSakit || 'RS Umum Daerah Medika Husada'}
        currentUser={currentUser}
        currentRole={currentRole}
        onChangeRole={handleChangeRole}
        alerts={alerts}
        lastUpdated={lastUpdated}
        onRefresh={refreshData}
        onOpenAdmission={() => {
          setAdmissionPreselectedBedId(null);
          setIsAdmissionOpen(true);
        }}
        onOpenMutation={() => {
          setMutationPreselectedPatientId(null);
          setIsMutationOpen(true);
        }}
        onOpenDischarge={() => {
          setDischargePreselectedPatientId(null);
          setIsDischargeOpen(true);
        }}
        onOpenReconciliation={() => setCurrentMenu('rekonsiliasi')}
        onOpenTvMode={() => setIsTvModeOpen(true)}
        onNavigateToAlerts={() => setCurrentMenu('alert')}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile menu hamburger toggle bar */}
        <div className="lg:hidden fixed bottom-4 left-4 z-40">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-3 rounded-full bg-slate-900 text-white shadow-lg flex items-center justify-center"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar */}
        <Sidebar
          currentMenu={currentMenu}
          onSelectMenu={setCurrentMenu}
          alertCount={alerts.length}
          unreconciledCount={indicators.dataBelumRekonsiliasi}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-16 lg:pb-6">
          <div className="max-w-7xl mx-auto">
            {currentMenu === 'dashboard' && (
              <DashboardUtama
                rooms={rooms}
                kamar={kamar}
                beds={beds}
                patients={patients}
                movements={movements}
                reconciliations={reconciliations}
                alerts={alerts}
                indicators={indicators}
                onNavigate={setCurrentMenu}
                onOpenAdmission={() => {
                  setAdmissionPreselectedBedId(null);
                  setIsAdmissionOpen(true);
                }}
                onOpenMutation={() => {
                  setMutationPreselectedPatientId(null);
                  setIsMutationOpen(true);
                }}
                onOpenDischarge={() => {
                  setDischargePreselectedPatientId(null);
                  setIsDischargeOpen(true);
                }}
                onOpenReconciliation={() => setCurrentMenu('rekonsiliasi')}
                onSelectBed={openBedDetail}
                onSelectPatient={openPatientDetail}
              />
            )}

            {currentMenu === 'petabed' && (
              <PetaBed
                rooms={rooms}
                kamar={kamar}
                beds={beds}
                patients={patients}
                onSelectBed={openBedDetail}
                onSelectPatient={openPatientDetail}
                onOpenAdmissionWithBed={openAdmissionWithBed}
              />
            )}

            {currentMenu === 'pasien' && (
              <PasienAktif
                patients={patients}
                rooms={rooms}
                kamar={kamar}
                beds={beds}
                onSelectPatient={openPatientDetail}
                onOpenMutation={openMutationWithPatient}
                onOpenDischarge={openDischargeWithPatient}
              />
            )}

            {currentMenu === 'mutasi' && (
              <MutasiPasien
                movements={movements}
                rooms={rooms}
                onOpenMutationModal={() => {
                  setMutationPreselectedPatientId(null);
                  setIsMutationOpen(true);
                }}
                onSelectPatient={openPatientDetail}
              />
            )}

            {currentMenu === 'rekonsiliasi' && (
              <Rekonsiliasi
                reconciliations={reconciliations}
                rooms={rooms}
                beds={beds}
                patients={patients}
                movements={movements}
                currentUser={currentUser}
                currentRole={currentRole}
                onSaveSession={handleSaveReconciliation}
                onSelectPatient={openPatientDetail}
              />
            )}

            {currentMenu === 'alert' && (
              <AlertOtomatis
                alerts={alerts}
                onDismissAlert={handleDismissAlert}
                onOpenAdmission={() => {
                  setAdmissionPreselectedBedId(null);
                  setIsAdmissionOpen(true);
                }}
                onOpenMutation={openMutationWithPatient}
                onOpenDischarge={openDischargeWithPatient}
                onOpenReconciliation={() => setCurrentMenu('rekonsiliasi')}
                onSelectPatient={openPatientDetail}
                onSelectBed={openBedDetail}
              />
            )}

            {currentMenu === 'manajemen' && (
              <DashboardManajemen
                rooms={rooms}
                beds={beds}
                patients={patients}
                movements={movements}
                indicators={indicators}
              />
            )}

            {currentMenu === 'laporan' && (
              <Laporan
                patients={patients}
                movements={movements}
                beds={beds}
                rooms={rooms}
                reconciliations={reconciliations}
                alerts={alerts}
                indicators={indicators}
                hospitalName={config.namaRumahSakit || 'RS Umum Daerah Medika Husada'}
              />
            )}

            {currentMenu === 'master' && (
              <MasterData
                rooms={rooms}
                kamar={kamar}
                beds={beds}
                currentUser={currentUser}
                currentRole={currentRole}
                onAddRoom={(r) => {
                  const updated = [...rooms, r];
                  setDbState((prev) => ({ ...prev, rooms: updated }));
                  localStorage.setItem('dtrack_rooms_v1', JSON.stringify(updated));
                  addToast('success', 'Ruangan Ditambahkan', `${r.namaRuangan} berhasil disimpan.`);
                }}
                onAddBed={(b) => {
                  const updated = [...beds, b];
                  setDbState((prev) => ({ ...prev, beds: updated }));
                  localStorage.setItem('dtrack_beds_v1', JSON.stringify(updated));
                  addToast('success', 'Bed Ditambahkan', `Bed ${b.nomorBed} siap digunakan.`);
                }}
                onDeleteBed={(bId) => {
                  const updated = beds.filter((b) => b.id !== bId);
                  setDbState((prev) => ({ ...prev, beds: updated }));
                  localStorage.setItem('dtrack_beds_v1', JSON.stringify(updated));
                  addToast('info', 'Bed Dihapus', 'Tempat tidur telah dihapus dari master.');
                }}
              />
            )}

            {currentMenu === 'pengaturan' && (
              <Pengaturan
                config={config}
                auditLogs={auditLogs}
                onUpdateConfig={(newCfg) => {
                  setDbState((prev) => ({ ...prev, config: newCfg }));
                  localStorage.setItem('dtrack_config_v1', JSON.stringify(newCfg));
                  addToast('success', 'Konfigurasi Tersimpan', 'Data rumah sakit telah diperbarui.');
                }}
                onResetDemo={handleResetDemo}
                onExportJson={handleExportJson}
                onImportJson={handleImportJson}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <AdmissionModal
        isOpen={isAdmissionOpen}
        onClose={() => setIsAdmissionOpen(false)}
        rooms={rooms}
        kamar={kamar}
        beds={beds}
        currentRole={currentRole}
        currentUser={currentUser}
        onAdmit={handleAdmit}
        preselectedBedId={admissionPreselectedBedId}
      />

      <MutationModal
        isOpen={isMutationOpen}
        onClose={() => setIsMutationOpen(false)}
        patients={patients}
        rooms={rooms}
        kamar={kamar}
        beds={beds}
        currentUser={currentUser}
        currentRole={currentRole}
        preselectedPatientId={mutationPreselectedPatientId}
        onMutate={handleMutate}
      />

      <DischargeModal
        isOpen={isDischargeOpen}
        onClose={() => setIsDischargeOpen(false)}
        patients={patients}
        rooms={rooms}
        beds={beds}
        currentUser={currentUser}
        currentRole={currentRole}
        preselectedPatientId={dischargePreselectedPatientId}
        onDischarge={handleDischarge}
      />

      <PatientDetailModal
        isOpen={isPatientDetailOpen}
        onClose={() => setIsPatientDetailOpen(false)}
        patient={activeSelectedPatient}
        rooms={rooms}
        kamar={kamar}
        beds={beds}
        movements={movements}
        currentRole={currentRole}
        onOpenMutation={openMutationWithPatient}
        onOpenDischarge={openDischargeWithPatient}
        onToggleDischargePlan={handleToggleDischargePlan}
      />

      <BedDetailModal
        isOpen={isBedDetailOpen}
        onClose={() => setIsBedDetailOpen(false)}
        bed={activeSelectedBed}
        room={activeSelectedBedRoom}
        kamar={activeSelectedBedKamar}
        patient={activeSelectedBedPatient}
        currentUser={currentUser}
        currentRole={currentRole}
        onUpdateBedStatus={handleUpdateBedStatus}
        onAdmitToBed={openAdmissionWithBed}
        onViewPatient={openPatientDetail}
      />

      <TvModeModal
        isOpen={isTvModeOpen}
        onClose={() => setIsTvModeOpen(false)}
        hospitalName={config.namaRumahSakit || 'RS Umum Daerah Medika Husada'}
        rooms={rooms}
        beds={beds}
        patients={patients}
        alerts={alerts}
        indicators={indicators}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToastHandler} />
    </div>
  );
}
