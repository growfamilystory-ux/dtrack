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
} from './types';
import {
  INITIAL_CONFIG,
  INITIAL_ROOMS,
  INITIAL_KAMAR,
  INITIAL_BEDS,
  INITIAL_PATIENTS,
  INITIAL_MOVEMENTS,
  INITIAL_RECONCILIATION,
  INITIAL_AUDIT_LOGS,
} from './seedData';
import { generateLiveAlerts } from './alertEngine';

const STORAGE_KEYS = {
  CONFIG: 'dtrack_config_v1',
  ROOMS: 'dtrack_rooms_v1',
  KAMAR: 'dtrack_kamar_v1',
  BEDS: 'dtrack_beds_v1',
  PATIENTS: 'dtrack_patients_v1',
  MOVEMENTS: 'dtrack_movements_v1',
  RECONCILIATION: 'dtrack_reconciliation_v1',
  AUDIT: 'dtrack_audit_v1',
  DISMISSED_ALERTS: 'dtrack_dismissed_alerts_v1',
};

export interface AppDatabase {
  config: HospitalConfig;
  rooms: Ruangan[];
  kamar: Kamar[];
  beds: Bed[];
  patients: Patient[];
  movements: PatientMovement[];
  reconciliations: ReconciliationSession[];
  auditLogs: AuditLog[];
  alerts: AlertItem[];
}

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to write to localStorage for key: ${key}`, e);
  }
}

export function loadDatabase(): AppDatabase {
  const config = safeGet<HospitalConfig>(STORAGE_KEYS.CONFIG, INITIAL_CONFIG);
  const rooms = safeGet<Ruangan[]>(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
  const kamar = safeGet<Kamar[]>(STORAGE_KEYS.KAMAR, INITIAL_KAMAR);
  const beds = safeGet<Bed[]>(STORAGE_KEYS.BEDS, INITIAL_BEDS);
  const patients = safeGet<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
  const movements = safeGet<PatientMovement[]>(STORAGE_KEYS.MOVEMENTS, INITIAL_MOVEMENTS);
  const reconciliations = safeGet<ReconciliationSession[]>(
    STORAGE_KEYS.RECONCILIATION,
    INITIAL_RECONCILIATION
  );
  const auditLogs = safeGet<AuditLog[]>(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
  const dismissedAlertIds = safeGet<string[]>(STORAGE_KEYS.DISMISSED_ALERTS, []);

  // Compute live alerts and filter dismissed
  const allAlerts = generateLiveAlerts(beds, patients, rooms, movements, reconciliations, config.overcapacityThreshold);
  const activeAlerts = allAlerts.filter((a) => !dismissedAlertIds.includes(a.id));

  return {
    config,
    rooms,
    kamar,
    beds,
    patients,
    movements,
    reconciliations,
    auditLogs,
    alerts: activeAlerts,
  };
}

export function logAudit(
  user: string,
  role: UserRole,
  action: string,
  entity: AuditLog['entity'],
  dataSebelum: string,
  dataSesudah: string
): void {
  const auditLogs = safeGet<AuditLog[]>(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
  const now = new Date();
  const timestampStr = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })} WIB`;

  const newLog: AuditLog = {
    id: `AUD-${Date.now()}`,
    timestamp: timestampStr,
    user,
    role,
    action,
    entity,
    dataSebelum,
    dataSesudah,
  };

  const updatedLogs = [newLog, ...auditLogs].slice(0, 200); // keep last 200
  safeSet(STORAGE_KEYS.AUDIT, updatedLogs);
}

// 1. ADMISSION: Pasien Masuk
export function admitPatient(
  patientData: Omit<Patient, 'id' | 'status' | 'statusRekonsiliasi'>,
  user: string,
  role: UserRole
): { success: boolean; message: string; patient?: Patient } {
  const db = loadDatabase();
  const targetBed = db.beds.find((b) => b.id === patientData.bedId);

  if (!targetBed) {
    return { success: false, message: 'Bed tujuan tidak ditemukan!' };
  }
  if (targetBed.status === 'TERISI') {
    return { success: false, message: `Bed ${targetBed.nomorBed} sedang terisi oleh pasien lain.` };
  }
  if (targetBed.status === 'MAINTENANCE') {
    return { success: false, message: `Bed ${targetBed.nomorBed} sedang dalam perbaikan (Maintenance).` };
  }

  // Check unique active RM
  const existingPatient = db.patients.find(
    (p) => p.noRm.trim().toLowerCase() === patientData.noRm.trim().toLowerCase() && p.status === 'AKTIF'
  );
  if (existingPatient) {
    return {
      success: false,
      message: `Pasien dengan No. RM ${patientData.noRm} (${existingPatient.namaPasien}) masih tercatat aktif di rawat inap!`,
    };
  }

  const patientId = `PAT-${Date.now()}`;
  const newPatient: Patient = {
    ...patientData,
    id: patientId,
    status: 'AKTIF',
    statusRekonsiliasi: 'BELUM_DICOCOKKAN',
  };

  // Update Bed to TERISI
  const updatedBeds = db.beds.map((b) =>
    b.id === targetBed.id
      ? { ...b, status: 'TERISI' as const, patientId: newPatient.id, bookingNote: undefined, updatedAt: new Date().toISOString() }
      : b
  );

  const updatedPatients = [newPatient, ...db.patients];

  // Record Movement
  const targetRoom = db.rooms.find((r) => r.id === newPatient.ruanganId);
  const targetKamar = db.kamar.find((k) => k.id === newPatient.kamarId);
  const now = new Date();
  const timeStr = `${newPatient.tanggalMasuk} ${newPatient.jamMasuk}:00`;

  const newMovement: PatientMovement = {
    id: `MOV-${Date.now()}`,
    waktuMutasi: timeStr,
    pasienId: newPatient.id,
    namaPasien: newPatient.namaPasien,
    noRm: newPatient.noRm,
    dariRuanganId: 'IGD',
    dariRuanganNama: 'Instalasi Gawat Darurat (IGD) / Poliklinik',
    dariKamarId: '-',
    dariKamarNama: '-',
    dariBedId: '-',
    dariNomorBed: '-',
    keRuanganId: newPatient.ruanganId,
    keRuanganNama: targetRoom?.namaRuangan || newPatient.ruanganId,
    keKamarId: newPatient.kamarId,
    keKamarNama: targetKamar?.namaKamar || newPatient.kamarId,
    keBedId: newPatient.bedId,
    keNomorBed: targetBed.nomorBed,
    jenisMutasi: 'Masuk Rawat Inap',
    alasanMutasi: `Alokasi Rawat Inap baru: ${newPatient.diagnosaMasuk}`,
    petugas: user,
    rolePetugas: role,
    statusVerifikasi: 'Terverifikasi',
    timestamp: now.toISOString(),
  };

  const updatedMovements = [newMovement, ...db.movements];

  safeSet(STORAGE_KEYS.BEDS, updatedBeds);
  safeSet(STORAGE_KEYS.PATIENTS, updatedPatients);
  safeSet(STORAGE_KEYS.MOVEMENTS, updatedMovements);

  logAudit(
    user,
    role,
    'Pasien Masuk (Admission)',
    'PATIENT',
    `Bed ${targetBed.nomorBed}: ${targetBed.status}`,
    `Bed ${targetBed.nomorBed}: TERISI (${newPatient.namaPasien}, ${newPatient.noRm})`
  );

  return { success: true, message: `Pasien ${newPatient.namaPasien} berhasil dialokasikan ke Bed ${targetBed.nomorBed}.`, patient: newPatient };
}

// 2. MUTATION: Pindah Ruangan / Kamar / Bed
export function mutatePatient(
  patientId: string,
  targetRuanganId: string,
  targetKamarId: string,
  targetBedId: string,
  alasanMutasi: string,
  user: string,
  role: UserRole
): { success: boolean; message: string } {
  const db = loadDatabase();
  const patient = db.patients.find((p) => p.id === patientId && p.status === 'AKTIF');
  if (!patient) {
    return { success: false, message: 'Pasien tidak ditemukan atau sudah tidak aktif.' };
  }

  const oldBed = db.beds.find((b) => b.id === patient.bedId);
  const targetBed = db.beds.find((b) => b.id === targetBedId);

  if (!targetBed) {
    return { success: false, message: 'Bed tujuan tidak ditemukan.' };
  }
  if (targetBed.id === patient.bedId) {
    return { success: false, message: 'Bed tujuan sama dengan bed saat ini.' };
  }
  if (targetBed.status === 'TERISI') {
    return { success: false, message: `Bed tujuan ${targetBed.nomorBed} sedang terisi.` };
  }
  if (targetBed.status === 'MAINTENANCE') {
    return { success: false, message: `Bed tujuan ${targetBed.nomorBed} dalam perbaikan.` };
  }

  const oldRoom = db.rooms.find((r) => r.id === patient.ruanganId);
  const oldKamar = db.kamar.find((k) => k.id === patient.kamarId);
  const targetRoom = db.rooms.find((r) => r.id === targetRuanganId);
  const targetKamar = db.kamar.find((k) => k.id === targetKamarId);

  let mutationType: PatientMovement['jenisMutasi'] = 'Pindah Bed';
  if (patient.ruanganId !== targetRuanganId) {
    mutationType = 'Pindah Ruangan';
  } else if (patient.kamarId !== targetKamarId) {
    mutationType = 'Pindah Kamar';
  }

  // 1. Update old bed -> KOSONG
  // 2. Update target bed -> TERISI
  const updatedBeds = db.beds.map((b) => {
    if (b.id === oldBed?.id) {
      return { ...b, status: 'KOSONG' as const, patientId: null, updatedAt: new Date().toISOString() };
    }
    if (b.id === targetBed.id) {
      return { ...b, status: 'TERISI' as const, patientId: patient.id, bookingNote: undefined, updatedAt: new Date().toISOString() };
    }
    return b;
  });

  // Update Patient
  const updatedPatients = db.patients.map((p) => {
    if (p.id === patient.id) {
      return {
        ...p,
        ruanganId: targetRuanganId,
        kamarId: targetKamarId,
        bedId: targetBedId,
        rencanaPindah: false,
        ruanganTujuanPindah: undefined,
        statusRekonsiliasi: 'BELUM_DICOCOKKAN' as const,
      };
    }
    return p;
  });

  const now = new Date();
  const timeStr = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;

  const newMovement: PatientMovement = {
    id: `MOV-${Date.now()}`,
    waktuMutasi: timeStr,
    pasienId: patient.id,
    namaPasien: patient.namaPasien,
    noRm: patient.noRm,
    dariRuanganId: patient.ruanganId,
    dariRuanganNama: oldRoom?.namaRuangan || patient.ruanganId,
    dariKamarId: patient.kamarId,
    dariKamarNama: oldKamar?.namaKamar || patient.kamarId,
    dariBedId: patient.bedId,
    dariNomorBed: oldBed?.nomorBed || '-',
    keRuanganId: targetRuanganId,
    keRuanganNama: targetRoom?.namaRuangan || targetRuanganId,
    keKamarId: targetKamarId,
    keKamarNama: targetKamar?.namaKamar || targetKamarId,
    keBedId: targetBedId,
    keNomorBed: targetBed.nomorBed,
    jenisMutasi: mutationType,
    alasanMutasi,
    petugas: user,
    rolePetugas: role,
    statusVerifikasi: 'Terverifikasi',
    timestamp: now.toISOString(),
  };

  const updatedMovements = [newMovement, ...db.movements];

  safeSet(STORAGE_KEYS.BEDS, updatedBeds);
  safeSet(STORAGE_KEYS.PATIENTS, updatedPatients);
  safeSet(STORAGE_KEYS.MOVEMENTS, updatedMovements);

  logAudit(
    user,
    role,
    `Mutasi Pasien (${mutationType})`,
    'MUTATION',
    `${patient.namaPasien} di ${oldRoom?.namaRuangan || ''} Bed ${oldBed?.nomorBed || ''}`,
    `Pindah ke ${targetRoom?.namaRuangan || ''} Bed ${targetBed.nomorBed}. Bed lama otomatis KOSONG.`
  );

  return {
    success: true,
    message: `Mutasi berhasil. ${patient.namaPasien} dipindahkan ke ${targetRoom?.namaRuangan} Bed ${targetBed.nomorBed}.`,
  };
}

// 3. DISCHARGE: Pasien Pulang
export function dischargePatient(
  patientId: string,
  caraKeluar: Patient['caraKeluar'],
  catatan: string,
  user: string,
  role: UserRole
): { success: boolean; message: string } {
  const db = loadDatabase();
  const patient = db.patients.find((p) => p.id === patientId && p.status === 'AKTIF');
  if (!patient) {
    return { success: false, message: 'Pasien tidak ditemukan atau sudah keluar.' };
  }

  const bed = db.beds.find((b) => b.id === patient.bedId);
  const room = db.rooms.find((r) => r.id === patient.ruanganId);
  const kamar = db.kamar.find((k) => k.id === patient.kamarId);

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  // Update Bed -> KOSONG
  const updatedBeds = db.beds.map((b) => {
    if (b.id === patient.bedId) {
      return { ...b, status: 'KOSONG' as const, patientId: null, updatedAt: now.toISOString() };
    }
    return b;
  });

  // Update Patient -> PULANG
  const updatedPatients = db.patients.map((p) => {
    if (p.id === patient.id) {
      return {
        ...p,
        status: (caraKeluar === 'Meninggal' ? 'MENINGGAL' : 'PULANG') as Patient['status'],
        rencanaPulang: false,
        tanggalKeluar: dateStr,
        jamKeluar: timeStr,
        caraKeluar,
        catatan: catatan ? `${p.catatan || ''} | Pulang: ${catatan}` : p.catatan,
      };
    }
    return p;
  });

  const newMovement: PatientMovement = {
    id: `MOV-${Date.now()}`,
    waktuMutasi: `${dateStr} ${timeStr}:00`,
    pasienId: patient.id,
    namaPasien: patient.namaPasien,
    noRm: patient.noRm,
    dariRuanganId: patient.ruanganId,
    dariRuanganNama: room?.namaRuangan || patient.ruanganId,
    dariKamarId: patient.kamarId,
    dariKamarNama: kamar?.namaKamar || patient.kamarId,
    dariBedId: patient.bedId,
    dariNomorBed: bed?.nomorBed || '-',
    keRuanganId: 'HOME',
    keRuanganNama: caraKeluar === 'Meninggal' ? 'Pemulasaraan Jenazah' : 'Pulang Ke Rumah',
    keKamarId: '-',
    keKamarNama: '-',
    keBedId: '-',
    keNomorBed: '-',
    jenisMutasi: caraKeluar === 'Meninggal' ? 'Meninggal' : 'Pulang',
    alasanMutasi: `KRS: ${caraKeluar || 'Atas Persetujuan Dokter'}. ${catatan}`,
    petugas: user,
    rolePetugas: role,
    statusVerifikasi: 'Terverifikasi',
    timestamp: now.toISOString(),
  };

  const updatedMovements = [newMovement, ...db.movements];

  safeSet(STORAGE_KEYS.BEDS, updatedBeds);
  safeSet(STORAGE_KEYS.PATIENTS, updatedPatients);
  safeSet(STORAGE_KEYS.MOVEMENTS, updatedMovements);

  logAudit(
    user,
    role,
    'Pasien Pulang / Discharge',
    'PATIENT',
    `Pasien ${patient.namaPasien} (${patient.noRm}) aktif di Bed ${bed?.nomorBed || ''}`,
    `Status PULANG (${caraKeluar}). Bed ${bed?.nomorBed || ''} otomatis KOSONG.`
  );

  return {
    success: true,
    message: `Pasien ${patient.namaPasien} telah dipulangkan. Bed ${bed?.nomorBed || ''} telah bebas & berstatus KOSONG.`,
  };
}

// 4. BED STATUS OVERRIDE
export function updateBedStatus(
  bedId: string,
  newStatus: Bed['status'],
  note: string,
  user: string,
  role: UserRole
): { success: boolean; message: string } {
  const db = loadDatabase();
  const bed = db.beds.find((b) => b.id === bedId);
  if (!bed) return { success: false, message: 'Bed tidak ditemukan.' };

  const oldStatus = bed.status;
  const updatedBeds = db.beds.map((b) => {
    if (b.id === bedId) {
      return {
        ...b,
        status: newStatus,
        catatanMaintenance: newStatus === 'MAINTENANCE' ? note : b.catatanMaintenance,
        bookingNote: newStatus === 'BOOKING' ? note : b.bookingNote,
        updatedAt: new Date().toISOString(),
      };
    }
    return b;
  });

  safeSet(STORAGE_KEYS.BEDS, updatedBeds);

  logAudit(
    user,
    role,
    'Ubah Status Bed',
    'BED',
    `Bed ${bed.nomorBed}: ${oldStatus}`,
    `Bed ${bed.nomorBed}: ${newStatus} (${note || 'Diperbarui'})`
  );

  return { success: true, message: `Status Bed ${bed.nomorBed} berhasil diubah menjadi ${newStatus}.` };
}

// 5. RECONCILIATION
export function saveReconciliation(
  sessionData: ReconciliationSession,
  user: string,
  role: UserRole
): { success: boolean; message: string } {
  const db = loadDatabase();
  const existingIndex = db.reconciliations.findIndex((r) => r.id === sessionData.id);

  let updatedList: ReconciliationSession[];
  if (existingIndex >= 0) {
    updatedList = [...db.reconciliations];
    updatedList[existingIndex] = sessionData;
  } else {
    updatedList = [sessionData, ...db.reconciliations];
  }

  // If marked Selesai Diverifikasi, reconcile matching active patients
  if (sessionData.status === 'Selesai Diverifikasi') {
    const updatedPatients = db.patients.map((p) => {
      if (sessionData.ruanganId === 'ALL' || p.ruanganId === sessionData.ruanganId) {
        return { ...p, statusRekonsiliasi: 'SESUAI' as const };
      }
      return p;
    });
    safeSet(STORAGE_KEYS.PATIENTS, updatedPatients);
  }

  safeSet(STORAGE_KEYS.RECONCILIATION, updatedList);

  logAudit(
    user,
    role,
    `Rekonsiliasi Shift ${sessionData.shift}`,
    'RECONCILIATION',
    `Status Sebelum: ${existingIndex >= 0 ? db.reconciliations[existingIndex].status : 'Baru'}`,
    `Status Sesudah: ${sessionData.status} (Selisih: ${sessionData.selisih})`
  );

  return { success: true, message: `Rekonsiliasi shift ${sessionData.shift} berhasil disimpan!` };
}

// 6. DISMISS ALERT
export function dismissAlert(alertId: string): void {
  const dismissed = safeGet<string[]>(STORAGE_KEYS.DISMISSED_ALERTS, []);
  if (!dismissed.includes(alertId)) {
    safeSet(STORAGE_KEYS.DISMISSED_ALERTS, [...dismissed, alertId]);
  }
}

// 7. RESET DEMO
export function resetDatabaseToDemo(): void {
  safeSet(STORAGE_KEYS.CONFIG, INITIAL_CONFIG);
  safeSet(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
  safeSet(STORAGE_KEYS.KAMAR, INITIAL_KAMAR);
  safeSet(STORAGE_KEYS.BEDS, INITIAL_BEDS);
  safeSet(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
  safeSet(STORAGE_KEYS.MOVEMENTS, INITIAL_MOVEMENTS);
  safeSet(STORAGE_KEYS.RECONCILIATION, INITIAL_RECONCILIATION);
  safeSet(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
  safeSet(STORAGE_KEYS.DISMISSED_ALERTS, []);
}

// 8. EXPORT / IMPORT
export function exportDatabaseJson(): string {
  const db = loadDatabase();
  return JSON.stringify(db, null, 2);
}

export function importDatabaseJson(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.beds && parsed.patients && parsed.rooms) {
      if (parsed.config) safeSet(STORAGE_KEYS.CONFIG, parsed.config);
      if (parsed.rooms) safeSet(STORAGE_KEYS.ROOMS, parsed.rooms);
      if (parsed.kamar) safeSet(STORAGE_KEYS.KAMAR, parsed.kamar);
      if (parsed.beds) safeSet(STORAGE_KEYS.BEDS, parsed.beds);
      if (parsed.patients) safeSet(STORAGE_KEYS.PATIENTS, parsed.patients);
      if (parsed.movements) safeSet(STORAGE_KEYS.MOVEMENTS, parsed.movements);
      if (parsed.reconciliations) safeSet(STORAGE_KEYS.RECONCILIATION, parsed.reconciliations);
      if (parsed.auditLogs) safeSet(STORAGE_KEYS.AUDIT, parsed.auditLogs);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
