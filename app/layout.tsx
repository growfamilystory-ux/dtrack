import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'D-TRACK – Dashboard Tracking Bed & Patient Movement',
  description: 'Sistem kendali digital monitoring ketersediaan tempat tidur, mutasi pasien, rekonsiliasi 3-shift, alert kapasitas dan indikator pelayanan rumah sakit (SIMUTASIS).',
  openGraph: {
    title: 'D-TRACK – Dashboard Tracking Bed & Patient Movement',
    description: 'Sistem kendali digital monitoring ketersediaan tempat tidur, mutasi pasien, rekonsiliasi 3-shift, alert kapasitas dan indikator pelayanan rumah sakit (SIMUTASIS).',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'D-TRACK – Dashboard Tracking Bed & Patient Movement',
    description: 'Sistem kendali digital monitoring ketersediaan tempat tidur, mutasi pasien, rekonsiliasi 3-shift, alert kapasitas dan indikator pelayanan rumah sakit (SIMUTASIS).',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
