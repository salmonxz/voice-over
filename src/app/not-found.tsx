import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-950 text-white p-4">
      <h2 className="text-xl font-bold mb-2">Halaman Tidak Ditemukan</h2>
      <p className="text-xs text-slate-400 mb-4">Halaman yang Anda cari tidak tersedia.</p>
      <Link href="/" className="text-xs text-cyan-400 underline">
        Kembali ke Studio
      </Link>
    </div>
  );
}
