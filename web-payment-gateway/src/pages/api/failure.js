export default function FailurePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-blue-100 dark:from-red-900 dark:to-zinc-900">
      <div className="bg-white dark:bg-zinc-950 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-700 dark:text-red-300">Pembayaran Gagal!</h1>
        <p className="text-lg text-gray-600 dark:text-zinc-400 mb-4">Transaksi gagal atau dibatalkan. Silakan coba lagi.</p>
        <a href="/cart" className="text-blue-600 hover:underline">Kembali ke Keranjang</a>
      </div>
    </div>
  );
}
