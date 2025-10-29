import connectDB from '../../../lib/db';
import Transaction from '../../../models/transaction';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { transactionId } = req.body;

  if (!transactionId) {
    return res.status(400).json({ message: 'Transaction ID required' });
  }

  await connectDB();

  try {
    const transaction = await Transaction.findById(transactionId).populate('user');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Kirim WhatsApp notifikasi sukses
    await sendPaymentSuccessNotification(transaction);

    return res.status(200).json({ success: true, message: 'WhatsApp sent' });
  } catch (error) {
    console.error('Error sending success WhatsApp:', error);
    return res.status(500).json({ message: 'Failed to send WhatsApp' });
  }
}

// Fungsi kirim WhatsApp (sama seperti di webhook)
async function sendPaymentSuccessNotification(transaction) {
  try {
    const FONNTE_API_TOKEN = process.env.FONNTE_API_TOKEN;
    const user = transaction.user;

    if (!FONNTE_API_TOKEN) {
      console.error('❌ FONNTE_API_TOKEN not configured');
      return;
    }

    if (!user || !user.whatsappNumber) {
      console.error('❌ User or WhatsApp number not found');
      return;
    }

    // Format nomor WhatsApp
    let whatsapp = user.whatsappNumber.replace(/\D/g, '');
    if (whatsapp.startsWith('0')) {
      whatsapp = '62' + whatsapp.substring(1);
    }
    if (!whatsapp.startsWith('62')) {
      whatsapp = '62' + whatsapp;
    }

    console.log('📱 Formatted WhatsApp number:', whatsapp);

    // Pesan sesuai request
    const message = `Pesanan Anda di ALL'S GOOD FOOD berhasil! ID Transaksi: ${transaction._id}. Terima kasih telah berbelanja.`;

    console.log('📤 Sending message:', message);

    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': FONNTE_API_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: whatsapp,
        message,
        countryCode: '62'
      }),
    });

    const result = await response.json();

    console.log('📬 Fonnte API response:', result);

    if (result.status) {
      console.log('✅ WhatsApp berhasil dikirim ke:', whatsapp);
    } else {
      console.error('❌ WhatsApp gagal dikirim:', result);
    }

    return result;
  } catch (error) {
    console.error('❌ Error sending WhatsApp notification:', error);
  }
}
