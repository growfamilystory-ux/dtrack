export const GAS_CODE_GS = `/**
 * =========================================================================
 * D-TRACK – Dashboard Tracking Bed & Patient Movement (SIMUTASIS)
 * Google Apps Script Backend (Code.gs)
 * Zona Waktu: Asia/Jakarta (WIB)
 * =========================================================================
 */

var SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
var TIMEZONE = "Asia/Jakarta";

function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
    .setTitle('D-TRACK – Dashboard Tracking Bed & Patient Movement')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/** Inisialisasi Otomatis Sheet Database Rumah Sakit */
function setupDatabaseSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var requiredSheets = [
    { name: "USERS", headers: ["ID", "Username", "Nama", "Role", "Email", "Status", "CreatedAt"] },
    { name: "ROOMS", headers: ["ID", "NamaRuangan", "Kode", "Kelas", "Gedung", "Lantai", "PJRuangan", "KapasitasMaksimal"] },
    { name: "ROOMS_BEDS", headers: ["ID", "NomorBed", "KamarID", "RuanganID", "Status", "PatientID", "Catatan", "UpdatedAt"] },
    { name: "PATIENTS", headers: ["ID", "NoRM", "NamaPasien", "NIK", "JK", "TanggalMasuk", "JamMasuk", "RuanganID", "KamarID", "BedID", "DokterPJ", "Diagnosa", "Status", "RencanaPulang", "StatusRekonsiliasi"] },
    { name: "MOVEMENTS", headers: ["ID", "WaktuMutasi", "PasienID", "NamaPasien", "NoRM", "DariRuangan", "DariBed", "KeRuangan", "KeBed", "JenisMutasi", "Alasan", "Petugas", "Timestamp"] },
    { name: "RECONCILIATIONS", headers: ["ID", "Tanggal", "Shift", "RuanganID", "PetugasRuangan", "PetugasAdmisi", "PetugasRM", "PasienSistem", "PasienAktual", "Selisih", "Status", "Catatan", "WaktuSelesai"] },
    { name: "ALERTS", headers: ["ID", "Kategori", "Severity", "Waktu", "RuanganID", "Deskripsi", "Status", "ActionType"] },
    { name: "AUDIT_LOG", headers: ["ID", "TimestampWIB", "User", "Role", "Action", "Entity", "DataSebelum", "DataSesudah"] },
    { name: "SETTINGS", headers: ["Key", "Value", "Keterangan"] }
  ];

  requiredSheets.forEach(function(sDef) {
    var sheet = ss.getSheetByName(sDef.name);
    if (!sheet) {
      sheet = ss.insertSheet(sDef.name);
      sheet.appendRow(sDef.headers);
      sheet.getRange(1, 1, 1, sDef.headers.length).setFontWeight("bold").setBackground("#e2e8f0");
    }
  });

  return { success: true, message: "Database sheets D-TRACK berhasil disiapkan!" };
}

/** Ambil Seluruh Data Dashboard untuk Frontend */
function getInitialData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return {
    rooms: readSheetData(ss.getSheetByName("ROOMS")),
    beds: readSheetData(ss.getSheetByName("ROOMS_BEDS")),
    patients: readSheetData(ss.getSheetByName("PATIENTS")),
    movements: readSheetData(ss.getSheetByName("MOVEMENTS")),
    reconciliations: readSheetData(ss.getSheetByName("RECONCILIATIONS")),
    auditLogs: readSheetData(ss.getSheetByName("AUDIT_LOG"))
  };
}

/** Mutasi Pasien Antar Bed / Ruangan */
function processMutation(payload) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetBeds = ss.getSheetByName("ROOMS_BEDS");
    var sheetPatients = ss.getSheetByName("PATIENTS");
    var sheetMovements = ss.getSheetByName("MOVEMENTS");
    var sheetAudit = ss.getSheetByName("AUDIT_LOG");
    var nowWib = Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd HH:mm:ss");

    // 1. Validasi Target Bed
    // 2. Ubah Bed Lama -> KOSONG
    // 3. Ubah Bed Baru -> TERISI
    // 4. Catat ke MOVEMENTS & AUDIT_LOG
    var movId = "MOV-" + Utilities.formatDate(new Date(), TIMEZONE, "yyyyMMdd-HHmmss");
    sheetMovements.appendRow([
      movId, nowWib, payload.pasienId, payload.namaPasien, payload.noRm,
      payload.dariRuangan, payload.dariBed, payload.keRuangan, payload.keBed,
      payload.jenisMutasi, payload.alasan, payload.petugas, nowWib
    ]);

    return { success: true, message: "Mutasi berhasil diproses!" };
  } catch(e) {
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function readSheetData(sheet) {
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var rowObj = {};
    for (var j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = data[i][j];
    }
    rows.push(rowObj);
  }
  return rows;
}
`;

export const GAS_INDEX_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>D-TRACK – Dashboard Tracking Bed & Patient Movement</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <?!= include('CSS'); ?>
</head>
<body class="bg-light">
  <!-- D-TRACK Modular App Shell -->
  <div id="app" class="d-flex">
    <!-- Sidebar -->
    <nav id="sidebar" class="bg-dark text-white p-3">
      <div class="sidebar-brand fw-bold mb-4">
        <i class="bi bi-hospital me-2 text-primary"></i> D-TRACK
        <div class="text-xs text-secondary font-monospace">SIMUTASIS v1.0</div>
      </div>
      <ul class="nav nav-pills flex-column mb-auto">
        <li class="nav-item"><a href="#" class="nav-link active" onclick="navigate('dashboard')"><i class="bi bi-speedometer2 me-2"></i> Dashboard</a></li>
        <li><a href="#" class="nav-link text-white" onclick="navigate('petabed')"><i class="bi bi-grid-3x3-gap me-2"></i> Peta Bed</a></li>
        <li><a href="#" class="nav-link text-white" onclick="navigate('pasien')"><i class="bi bi-people me-2"></i> Pasien Aktif</a></li>
        <li><a href="#" class="nav-link text-white" onclick="navigate('mutasi')"><i class="bi bi-arrow-left-right me-2"></i> Mutasi Pasien</a></li>
        <li><a href="#" class="nav-link text-white" onclick="navigate('rekonsiliasi')"><i class="bi bi-check2-circle me-2"></i> Rekonsiliasi 3 Shift</a></li>
        <li><a href="#" class="nav-link text-white" onclick="navigate('alert')"><i class="bi bi-bell me-2"></i> Alert Otomatis</a></li>
      </ul>
    </nav>
    <!-- Content Area -->
    <main class="flex-grow-1 p-4">
      <div id="main-content">Memuat data rumah sakit...</div>
    </main>
  </div>
  <?!= include('JS'); ?>
</body>
</html>
`;

export const GAS_CSS_HTML = `<style>
  :root {
    --bed-empty: #10b981;
    --bed-occupied: #f43f5e;
    --bed-discharging: #f59e0b;
    --bed-booking: #0284c7;
    --bed-maint: #64748b;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #1e293b;
  }
  .bed-card {
    border-radius: 6px;
    border: 1px solid #cbd5e1;
    padding: 10px;
    transition: all 0.15s ease-in-out;
  }
  .bed-card.kosong { border-top: 4px solid var(--bed-empty); background: #f0fdf4; }
  .bed-card.terisi { border-top: 4px solid var(--bed-occupied); background: #fff1f2; }
  .bed-card.akan_pulang { border-top: 4px solid var(--bed-discharging); background: #fefce8; }
  .bed-card.booking { border-top: 4px solid var(--bed-booking); background: #f0f9ff; }
  .bed-card.maintenance { border-top: 4px solid var(--bed-maint); background: #f8fafc; }
</style>
`;

export const GAS_JS_HTML = `<script>
  function navigate(viewName) {
    document.getElementById('main-content').innerHTML = '<div class="alert alert-info">Menampilkan halaman ' + viewName + '...</div>';
  }
  function loadHospitalData() {
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler(function(data) {
          console.log('Data D-TRACK termuat:', data);
        })
        .getInitialData();
    }
  }
  window.onload = loadHospitalData;
</script>
`;
