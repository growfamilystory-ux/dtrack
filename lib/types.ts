export type BedStatus = 'KOSONG' | 'TERISI' | 'AKAN_PULANG' | 'AKAN_PINDAH' | 'BOOKING' | 'MAINTENANCE';

export type PatientStatus = 'AKTIF' | 'BOOKING' | 'PULANG' | 'DIRUJUK' | 'MENINGGAL';

export type MutationType =
  | 'Masuk Rawat Inap'
  | 'Pindah Ruangan'
  | 'Pindah Kamar'
  | 'Pindah Bed'
  | 'Pulang'
  | 'Meninggal'
  | 'Rujuk Eksternal';

export type UserRole =
  | 'Perawat Ruangan'
  | 'Admisi / TPPRI'
  | 'Rekam Medis'
  | 'Manajemen / Direksi'
  | 'Administrator';

export type AlertSeverity = 'HIGH' | 'MEDIUM' | 'LOW';

export type AlertCategory =
  | 'Over Kapasitas'
  | 'Belum Direkonsiliasi'
  | 'Data Tidak Sinkron'
  | 'Konflik Bed'
  | 'Pasien Tanpa Bed'
  | 'Bed Terisi Tanpa Pasien'
  | 'Mutasi Belum Diverifikasi'
  | 'Booking Mendekati Masuk'
  | 'Rencana Pulang Hari Ini'
  | 'Rencana Pindah Hari Ini';

export interface Bed {
  id: string; // e.g. "BED-MEL-01-A"
  nomorBed: string; // e.g. "B01"
  kamarId: string;
  ruanganId: string;
  status: BedStatus;
  patientId?: string | null;
  bookingNote?: string;
  catatanMaintenance?: string;
  updatedAt: string;
}

export interface Kamar {
  id: string; // e.g. "KAMAR-MEL-01"
  namaKamar: string; // e.g. "Kamar 101"
  ruanganId: string;
  kelas: string;
  totalBed: number;
}

export interface Ruangan {
  id: string; // e.g. "R-MELATI"
  namaRuangan: string; // e.g. "Ruang Melati"
  kodeRuangan: string; // e.g. "MEL"
  kelas: string; // e.g. "Kelas 1", "VIP", "ICU"
  gedung: string;
  lantai: number;
  pjRuangan: string;
  kapasitasMaksimal: number;
}

export interface Patient {
  id: string; // e.g. "PAT-20260930-001"
  noRm: string; // e.g. "RM-482910"
  namaPasien: string;
  nik?: string;
  jenisKelamin: 'L' | 'P';
  tanggalLahir: string;
  umur: number;
  jaminan: 'BPJS Kesehatan' | 'Asuransi Swasta' | 'Umum / Mandiri';
  tanggalMasuk: string; // YYYY-MM-DD
  jamMasuk: string; // HH:mm
  ruanganId: string;
  kamarId: string;
  bedId: string;
  dokterPj: string;
  diagnosaMasuk: string;
  status: PatientStatus;
  rencanaPulang: boolean;
  tanggalRencanaPulang?: string;
  jamRencanaPulang?: string;
  rencanaPindah: boolean;
  ruanganTujuanPindah?: string;
  tanggalKeluar?: string;
  jamKeluar?: string;
  caraKeluar?: 'Atas Persetujuan Dokter' | 'Permintaan Sendiri' | 'Rujuk' | 'Meninggal';
  statusRekonsiliasi: 'SESUAI' | 'BELUM_DICOCOKKAN' | 'SELISIH';
  catatan?: string;
}

export interface PatientMovement {
  id: string;
  waktuMutasi: string; // ISO or YYYY-MM-DD HH:mm:ss
  pasienId: string;
  namaPasien: string;
  noRm: string;
  dariRuanganId: string;
  dariRuanganNama: string;
  dariKamarId: string;
  dariKamarNama: string;
  dariBedId: string;
  dariNomorBed: string;
  keRuanganId: string;
  keRuanganNama: string;
  keKamarId: string;
  keKamarNama: string;
  keBedId: string;
  keNomorBed: string;
  jenisMutasi: MutationType;
  alasanMutasi: string;
  petugas: string;
  rolePetugas: UserRole;
  statusVerifikasi: 'Terverifikasi' | 'Menunggu Verifikasi';
  timestamp: string;
}

export interface ReconciliationSession {
  id: string;
  tanggal: string; // YYYY-MM-DD
  shift: '08.00 WIB' | '14.00 WIB' | '20.00 WIB';
  ruanganId: string;
  ruanganNama: string;
  petugasRuangan: string;
  petugasAdmisi: string;
  petugasRekamMedis: string;
  pasienSistem: number;
  pasienAktual: number;
  bedSistem: number;
  bedAktual: number;
  selisih: number;
  status: 'Belum' | 'Dalam Proses' | 'Sesuai' | 'Selisih' | 'Selesai Diverifikasi';
  catatan: string;
  waktuPenyelesaian?: string;
  discrepancies?: string[];
}

export interface AlertItem {
  id: string;
  kategori: AlertCategory;
  severity: AlertSeverity;
  waktu: string;
  ruanganId?: string;
  ruanganNama?: string;
  pasienId?: string;
  namaPasien?: string;
  deskripsi: string;
  status: 'AKTIF' | 'DIATASI' | 'DIABAIKAN';
  rekomendasiAksi: string;
  actionType?: 'ALOKASI_BED' | 'VERIFIKASI_MUTASI' | 'REKONSILIASI' | 'PULANG' | 'CEK_KONFLIK';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  entity: 'PATIENT' | 'BED' | 'MUTATION' | 'RECONCILIATION' | 'ROOM' | 'SETTING';
  dataSebelum: string;
  dataSesudah: string;
}

export interface HospitalConfig {
  namaRumahSakit: string;
  namaFaskesSub: string;
  kodeFaskes: string;
  alamat: string;
  telepon: string;
  zonaWaktu: string;
  shiftRekonsiliasi: string[];
  autoAlertEnabled: boolean;
  overcapacityThreshold: number; // percentage, e.g. 85%
}

export interface HospitalIndicators {
  totalBed: number;
  bedTerisi: number;
  bedKosong: number;
  bedBooking: number;
  bedAkanPulang: number;
  bedAkanPindah: number;
  bedMaintenance: number;
  occupancyRate: number; // percentage
  pasienAktif: number;
  mutasiHariIni: number;
  dataBelumRekonsiliasi: number;
  alertAktif: number;
  bor: number | null; // Bed Occupancy Rate (%)
  losRataRata: number | null; // Length of Stay (Hari)
  toi: number | null; // Turn Over Interval (Hari)
  bto: number | null; // Bed Turn Over (Pasien/Bed)
  calculatedPeriod: string;
}
