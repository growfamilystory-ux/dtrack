import { Bed, Patient, Ruangan, AlertItem, PatientMovement, ReconciliationSession } from './types';

export function generateLiveAlerts(
  beds: Bed[],
  patients: Patient[],
  rooms: Ruangan[],
  movements: PatientMovement[],
  reconciliations: ReconciliationSession[],
  overcapacityThreshold: number = 85
): AlertItem[] {
  const alerts: AlertItem[] = [];
  const currentTimeStr = '30 Sep 2026, 12:00 WIB';

  // 1. Over Kapasitas per Ruangan
  rooms.forEach((room) => {
    const roomBeds = beds.filter((b) => b.ruanganId === room.id);
    const occupied = roomBeds.filter((b) => b.status === 'TERISI' || b.status === 'AKAN_PULANG' || b.status === 'AKAN_PINDAH').length;
    const total = roomBeds.length;
    if (total > 0) {
      const percentage = Math.round((occupied / total) * 100);
      if (percentage >= 100) {
        alerts.push({
          id: `ALT-CAP-${room.id}`,
          kategori: 'Over Kapasitas',
          severity: 'HIGH',
          waktu: currentTimeStr,
          ruanganId: room.id,
          ruanganNama: room.namaRuangan,
          deskripsi: `Kapasitas ${room.namaRuangan} telah mencapai 100% (${occupied}/${total} bed). Tidak ada bed tersisa.`,
          status: 'AKTIF',
          rekomendasiAksi: 'Alihkan pasien baru ke ruangan cadangan atau percepat proses discharge pasien rencana pulang.',
          actionType: 'CEK_KONFLIK',
        });
      } else if (percentage >= overcapacityThreshold) {
        alerts.push({
          id: `ALT-CAP-WARN-${room.id}`,
          kategori: 'Over Kapasitas',
          severity: 'MEDIUM',
          waktu: currentTimeStr,
          ruanganId: room.id,
          ruanganNama: room.namaRuangan,
          deskripsi: `Peringatan kapasitas ${room.namaRuangan} mendekati ambang batas: ${percentage}% (${occupied}/${total} bed terisi).`,
          status: 'AKTIF',
          rekomendasiAksi: 'Monitor bed booking dan koordinasikan dengan admisi TPPRI.',
          actionType: 'CEK_KONFLIK',
        });
      }
    }
  });

  // 2. Pasien Rencana Pulang Hari Ini
  const patientsWillDischarge = patients.filter((p) => p.status === 'AKTIF' && p.rencanaPulang);
  patientsWillDischarge.forEach((p) => {
    const room = rooms.find((r) => r.id === p.ruanganId);
    alerts.push({
      id: `ALT-PULANG-${p.id}`,
      kategori: 'Rencana Pulang Hari Ini',
      severity: 'LOW',
      waktu: currentTimeStr,
      ruanganId: p.ruanganId,
      ruanganNama: room?.namaRuangan || p.ruanganId,
      pasienId: p.id,
      namaPasien: p.namaPasien,
      deskripsi: `${p.namaPasien} (${p.noRm}) di ${room?.namaRuangan || ''} terencana KRS/pulang pukul ${p.jamRencanaPulang || 'hari ini'}.`,
      status: 'AKTIF',
      rekomendasiAksi: 'Lakukan verifikasi rekam medis dan administrasi untuk membebaskan bed tepat waktu.',
      actionType: 'PULANG',
    });
  });

  // 3. Pasien Rencana Pindah Hari Ini
  const patientsWillTransfer = patients.filter((p) => p.status === 'AKTIF' && p.rencanaPindah);
  patientsWillTransfer.forEach((p) => {
    const room = rooms.find((r) => r.id === p.ruanganId);
    alerts.push({
      id: `ALT-PINDAH-${p.id}`,
      kategori: 'Rencana Pindah Hari Ini',
      severity: 'MEDIUM',
      waktu: currentTimeStr,
      ruanganId: p.ruanganId,
      ruanganNama: room?.namaRuangan || p.ruanganId,
      pasienId: p.id,
      namaPasien: p.namaPasien,
      deskripsi: `${p.namaPasien} (${p.noRm}) dijadwalkan mutasi menuju ${p.ruanganTujuanPindah || 'ruangan lain'}.`,
      status: 'AKTIF',
      rekomendasiAksi: 'Pastikan bed tujuan telah dipersiapkan dan perawat siap melakukan transfer serah terima.',
      actionType: 'VERIFIKASI_MUTASI',
    });
  });

  // 4. Data Belum Direkonsiliasi / Selisih
  const activeUnreconciled = patients.filter((p) => p.status === 'AKTIF' && p.statusRekonsiliasi === 'SELISIH');
  activeUnreconciled.forEach((p) => {
    const room = rooms.find((r) => r.id === p.ruanganId);
    alerts.push({
      id: `ALT-REC-SELISIH-${p.id}`,
      kategori: 'Data Tidak Sinkron',
      severity: 'HIGH',
      waktu: currentTimeStr,
      ruanganId: p.ruanganId,
      ruanganNama: room?.namaRuangan || p.ruanganId,
      pasienId: p.id,
      namaPasien: p.namaPasien,
      deskripsi: `Terdapat selisih pencatatan status/posisi pasien ${p.namaPasien} (${p.noRm}) saat rekonsiliasi bangsal.`,
      status: 'AKTIF',
      rekomendasiAksi: 'Klarifikasi posisi fisik pasien bersama perawat jaga dan cocokkan nomor bed.',
      actionType: 'REKONSILIASI',
    });
  });

  // Check reconciliation shift status
  const pendingShift = reconciliations.find((r) => r.status === 'Dalam Proses' || r.status === 'Selisih');
  if (pendingShift) {
    alerts.push({
      id: `ALT-SHIFT-REC-${pendingShift.id}`,
      kategori: 'Belum Direkonsiliasi',
      severity: 'MEDIUM',
      waktu: currentTimeStr,
      ruanganId: pendingShift.ruanganId,
      ruanganNama: pendingShift.ruanganNama,
      deskripsi: `Rekonsiliasi ${pendingShift.shift} di ${pendingShift.ruanganNama} berstatus "${pendingShift.status}". Belum tervalidasi lengkap.`,
      status: 'AKTIF',
      rekomendasiAksi: 'Selesaikan pencocokan data fisik dengan sistem dan bubuhkan verifikasi 3 pihak.',
      actionType: 'REKONSILIASI',
    });
  }

  // 5. Booking Mendekati Waktu Masuk
  const bookingBeds = beds.filter((b) => b.status === 'BOOKING');
  bookingBeds.forEach((b) => {
    const room = rooms.find((r) => r.id === b.ruanganId);
    alerts.push({
      id: `ALT-BOOK-${b.id}`,
      kategori: 'Booking Mendekati Masuk',
      severity: 'LOW',
      waktu: currentTimeStr,
      ruanganId: b.ruanganId,
      ruanganNama: room?.namaRuangan || b.ruanganId,
      deskripsi: `Bed ${b.nomorBed} (${room?.namaRuangan || ''}) ter-booking: ${b.bookingNote || 'Konfirmasi alokasi segera'}.`,
      status: 'AKTIF',
      rekomendasiAksi: 'Hubungi admisi atau instalasi asal rujukan untuk verifikasi kedatangan pasien.',
      actionType: 'ALOKASI_BED',
    });
  });

  // 6. Konflik Bed: Bed terisi tanpa pasien aktif
  const occupiedBeds = beds.filter((b) => b.status === 'TERISI');
  occupiedBeds.forEach((b) => {
    const matchedPatient = patients.find((p) => p.bedId === b.id && p.status === 'AKTIF');
    if (!matchedPatient) {
      const room = rooms.find((r) => r.id === b.ruanganId);
      alerts.push({
        id: `ALT-ORPHAN-BED-${b.id}`,
        kategori: 'Bed Terisi Tanpa Pasien',
        severity: 'HIGH',
        waktu: currentTimeStr,
        ruanganId: b.ruanganId,
        ruanganNama: room?.namaRuangan || b.ruanganId,
        deskripsi: `Bed ${b.nomorBed} berstatus TERISI di sistem, tetapi tidak terhubung dengan data pasien aktif manapun.`,
        status: 'AKTIF',
        rekomendasiAksi: 'Ubah status bed menjadi KOSONG atau hubungkan ke pasien yang baru masuk.',
        actionType: 'CEK_KONFLIK',
      });
    }
  });

  // 7. Mutasi belum diverifikasi
  const pendingMutations = movements.filter((m) => m.statusVerifikasi === 'Menunggu Verifikasi');
  pendingMutations.forEach((m) => {
    alerts.push({
      id: `ALT-MUT-VERIF-${m.id}`,
      kategori: 'Mutasi Belum Diverifikasi',
      severity: 'MEDIUM',
      waktu: currentTimeStr,
      deskripsi: `Mutasi ${m.namaPasien} (${m.noRm}) jenis "${m.jenisMutasi}" memerlukan konfirmasi penerimaan di ruangan tujuan.`,
      status: 'AKTIF',
      rekomendasiAksi: 'Perawat ruangan penerima wajib memverifikasi kondisi fisik pasien.',
      actionType: 'VERIFIKASI_MUTASI',
    });
  });

  return alerts;
}
