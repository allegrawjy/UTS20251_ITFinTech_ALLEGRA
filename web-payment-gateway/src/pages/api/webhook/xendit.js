// File: src/pages/api/webhook.js
import connectDB from '../../../lib/db';
import Transaction from '../../../models/transaction';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-callback-token');

  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('=== Webhook Received ===');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('========================');

  // Handle GET (untuk test)
  if (req.method === 'GET') {
    return res.status(200).json({ message: 'Webhook endpoint active' });
  }

  // Handle POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectDB();

  try {
    const payload = req.body;
    const callbackToken = req.headers['x-callback-token'];
    const XENDIT_CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN;
    
    console.log('Token validation:', {
      received: callbackToken ? 'exists' : 'missing',
      expected: XENDIT_CALLBACK_TOKEN ? 'configured' : 'not configured'
    });
    
    // Validasi token (skip jika tidak di-set)
    if (XENDIT_CALLBACK_TOKEN && callbackToken !== XENDIT_CALLBACK_TOKEN) {
      console.error('❌ Invalid callback token');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Ambil transaction ID dari external_id
    const transactionId = payload.external_id;
    const status = payload.status;
    
    console.log('📦 Processing webhook:', { transactionId, status });

    if (!transactionId) {
      console.error('❌ No external_id in payload');
      return res.status(400).json({ message: 'Missing external_id' });
    }

    // Cari transaksi
    const transaction = await Transaction.findById(transactionId).populate('user');
    
    if (!transaction) {
      console.error('❌ Transaction not found:', transactionId);
      return res.status(404).json({ message: 'Transaction not found' });
    }

    console.log('✅ Transaction found:', {
      id: transaction._id,
      currentStatus: transaction.status,
      user: transaction.user?.name || transaction.user?.username,
      whatsapp: transaction.user?.whatsappNumber
    });

    // Update status
    const oldStatus = transaction.status;
    transaction.status = status;
    
    if (status === 'PAID' || status === 'SETTLED') {
      transaction.paidAt = new Date();
    }
    
    await transaction.save();

    console.log('✅ Status updated:', { from: oldStatus, to: status });

    // Kirim WhatsApp untuk PAID atau SETTLED
    if ((status === 'PAID' || status === 'SETTLED') && (oldStatus !== 'PAID' && oldStatus !== 'SETTLED')) {
      console.log('📱 Sending WhatsApp notification...');
      await sendPaymentSuccessNotification(transaction);
    } else {
      console.log('ℹ️ No notification needed for status:', status);
    }

    return res.status(200).json({ 
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}

// Fungsi kirim WhatsApp kedua (setelah payment sukses)
async function sendPaymentSuccessNotification(transaction) {
  try {
    const FONNTE_API_TOKEN = process.env.FONNTE_API_TOKEN;
    const user = transaction.user;

    console.log('Checking notification requirements:', {
      hasFonnteToken: !!FONNTE_API_TOKEN,
      hasUser: !!user,
      hasWhatsapp: !!user?.whatsappNumber
    });

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
      console.log('✅ WhatsApp kedua berhasil dikirim ke:', whatsapp);
    } else {
      console.error('❌ WhatsApp gagal dikirim:', result);
    }

    return result;
  } catch (error) {
    console.error('❌ Error sending WhatsApp notification:', error);
  }
}