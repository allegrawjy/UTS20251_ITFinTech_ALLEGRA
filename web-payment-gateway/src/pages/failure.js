import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function FailurePage() {
  const router = useRouter();
  const { external_id } = router.query;
  const [syncStatus, setSyncStatus] = useState('loading');
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    if (external_id) {
      console.log('🔄 Checking payment status for external_id:', external_id);
      
      // Check payment status untuk memastikan apakah benar-benar gagal atau mungkin sukses terlambat
      fetch('/api/sync-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ external_id }),
      })
      .then(response => response.json())
      .then(data => {
        console.log('📋 Payment check result:', data);
        
        if (data.success) {
          setSyncStatus('checked');
          setPaymentInfo(data.transaction);
          
          // Jika ternyata PAID, redirect ke success
          if (data.status === 'PAID') {
            console.log('🎉 Payment actually succeeded, redirecting to success...');
            router.push(`/success?external_id=${external_id}`);
            return;
          }
        } else {
          setSyncStatus('error');
        }
      })
      .catch(error => {
        console.error('❌ Error checking payment:', error);
        setSyncStatus('error');
      });
    } else {
      setSyncStatus('no_id');
    }
  }, [external_id, router]);

  const renderContent = () => {
    switch (syncStatus) {
      case 'loading':
        return (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-4 text-gray-700 dark:text-gray-300">Memeriksa Status Pembayaran...</h1>
            <p className="text-gray-600 dark:text-zinc-400">Mohon tunggu, kami sedang memverifikasi status pembayaran Anda.</p>
          </>
        );
      
      case 'checked':
        return (
          <>
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-red-700 dark:text-red-300">Pembayaran Gagal!</h1>
            <p className="text-lg text-gray-600 dark:text-zinc-400 mb-4">
              Pembayaran tidak berhasil atau dibatalkan.
            </p>
            
            {paymentInfo && (
              <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg mb-4 text-left">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Detail Pesanan:</h3>
                <p className="text-sm text-gray-600 dark:text-zinc-400">ID Pesanan: #{paymentInfo.external_id}</p>
                <p className="text-sm text-gray-600 dark:text-zinc-400">Total: Rp {paymentInfo.totalPrice?.toLocaleString('id-ID')}</p>
                <p className="text-sm text-gray-600 dark:text-zinc-400">Status: {paymentInfo.status}</p>
              </div>
            )}
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                💡 Jika Anda yakin sudah melakukan pembayaran, silakan tunggu beberapa menit atau hubungi customer service.
              </p>
            </div>
          </>
        );
      
      case 'no_id':
      case 'error':
      default:
        return (
          <>
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-red-700 dark:text-red-300">Pembayaran Gagal!</h1>
            <p className="text-lg text-gray-600 dark:text-zinc-400 mb-4">
              Transaksi gagal atau dibatalkan. Silakan coba lagi.
            </p>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-blue-100 dark:from-red-900 dark:to-zinc-900">
      <div className="bg-white dark:bg-zinc-950 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        {renderContent()}
        
        <div className="mt-6 space-y-2">
          <a 
            href="/cart" 
            className="block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200"
          >
            Coba Lagi
          </a>
          <a 
            href="/" 
            className="block text-blue-600 hover:underline text-sm"
          >
            Kembali ke Home
          </a>
        </div>
      </div>
    </div>
  );
}
