import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function SuccessPage() {
  const router = useRouter();
  const { external_id } = router.query;
  const [syncStatus, setSyncStatus] = useState('loading');
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    if (external_id) {
      console.log('🔄 Syncing payment for external_id:', external_id);
      
      // Sync payment status dengan Xendit dan kirim WhatsApp jika sukses
      fetch('/api/sync-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ external_id }),
      })
      .then(response => response.json())
      .then(data => {
        console.log('📋 Sync result:', data);
        
        if (data.success) {
          setSyncStatus('success');
          setPaymentInfo(data.transaction);
          
          if (data.status === 'PAID') {
            console.log('✅ Payment confirmed and WhatsApp sent');
          } else {
            console.log('⚠️ Payment not yet confirmed, status:', data.status);
          }
        } else {
          setSyncStatus('error');
          console.error('❌ Failed to sync payment:', data.error);
        }
      })
      .catch(error => {
        console.error('❌ Error syncing payment:', error);
        setSyncStatus('error');
      });
    }
  }, [external_id]);

  const renderContent = () => {
    switch (syncStatus) {
      case 'loading':
        return (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-4 text-gray-700 dark:text-gray-300">Memverifikasi Pembayaran...</h1>
            <p className="text-gray-600 dark:text-zinc-400">Mohon tunggu sebentar, kami sedang mengonfirmasi pembayaran Anda.</p>
          </>
        );
      
      case 'success':
        return (
          <>
            <div className="text-green-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-green-700 dark:text-green-300">Pembayaran Berhasil!</h1>
            <p className="text-lg text-gray-600 dark:text-zinc-400 mb-4">
              Terima kasih! Pembayaran Anda telah dikonfirmasi.
            </p>
            
            {paymentInfo && (
              <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg mb-4 text-left">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Detail Pesanan:</h3>
                <p className="text-sm text-gray-600 dark:text-zinc-400">ID Pesanan: #{paymentInfo.external_id}</p>
                <p className="text-sm text-gray-600 dark:text-zinc-400">Total: Rp {paymentInfo.totalPrice?.toLocaleString('id-ID')}</p>
                <p className="text-sm text-gray-600 dark:text-zinc-400">Status: {paymentInfo.status}</p>
              </div>
            )}
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                📱 Notifikasi WhatsApp telah dikirim dengan detail pesanan Anda.
              </p>
            </div>
          </>
        );
      
      case 'error':
        return (
          <>
            <div className="text-yellow-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-yellow-700 dark:text-yellow-300">Sedang Memproses...</h1>
            <p className="text-gray-600 dark:text-zinc-400 mb-4">
              Pembayaran Anda sedang diproses. Jika sudah melakukan pembayaran, silakan tunggu beberapa saat atau cek notifikasi WhatsApp Anda.
            </p>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-zinc-900">
      <div className="bg-white dark:bg-zinc-950 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        {renderContent()}
        
        <div className="mt-6 space-y-2">
          <a 
            href="/" 
            className="block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200"
          >
            Kembali ke Home
          </a>
          <a 
            href="/cart" 
            className="block text-blue-600 hover:underline text-sm"
          >
            Belanja Lagi
          </a>
        </div>
      </div>
    </div>
  );
}
