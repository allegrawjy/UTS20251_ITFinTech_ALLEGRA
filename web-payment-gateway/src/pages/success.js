import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SuccessPage() {
  const router = useRouter();
  const { transactionId } = router.query;

  useEffect(() => {
    if (transactionId) {
      // Kirim WhatsApp saat page load
      fetch('/api/send-success-wa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('WhatsApp sent successfully');
        } else {
          console.error('Failed to send WhatsApp:', data.message);
        }
      })
      .catch(error => {
        console.error('Error sending WhatsApp:', error);
      });
    }
  }, [transactionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-zinc-900">
      <div className="bg-white dark:bg-zinc-950 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4 text-green-700 dark:text-green-300">Pembayaran Berhasil!</h1>
        <p className="text-lg text-gray-600 dark:text-zinc-400 mb-4">Terima kasih, pesanan Anda telah diproses.</p>
        <a href="/" className="text-blue-600 hover:underline">Kembali ke Home</a>
      </div>
    </div>
  );
}
