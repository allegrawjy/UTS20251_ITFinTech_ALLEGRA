import { connectDB } from "../../../../lib/db";
import Transaction from "../../../../models/transaction";

// Helper function untuk format nomor WhatsApp
function formatPhoneNumber(phone) {
  let cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  
  if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  
  return cleaned;
}

export default async function handler(req, res) {
  // Hanya terima POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validasi token callback dari Xendit
    const tokenHeader = req.headers['x-callback-token'];
    const secretToken = process.env.XENDIT_CALLBACK_TOKEN;
    
    console.log('Token dari header:', tokenHeader);
    console.log('Secret token dari env:', secretToken);
    
    if (!secretToken) {
      console.error('XENDIT_CALLBACK_TOKEN belum di-set di .env');
      return res.status(500).json({ error: "Server misconfiguration" });
    }
    
    if (tokenHeader !== secretToken) {
      console.error('Invalid Xendit callback token:', tokenHeader);
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Connect ke database
    await connectDB();

    // Ambil data dari request body
    const paymentData = req.body;
    
    console.log('Received webhook from Xendit:', paymentData);

    // Proses payment berdasarkan status
    const { external_id, status, id: payment_id } = paymentData;

    if (!external_id) {
      console.error('external_id tidak ditemukan di webhook data');
      return res.status(400).json({ error: 'Invalid webhook data' });
    }

    // Cari transaksi berdasarkan external_id
    const transaction = await Transaction.findOne({ orderId: external_id });

    if (!transaction) {
      console.error('Transaction not found:', external_id);
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Update status transaksi
    transaction.paymentStatus = status;
    transaction.xenditPaymentId = payment_id;
    
    if (status === 'PAID' || status === 'SETTLED') {
      transaction.isPaid = true;
      transaction.paidAt = new Date();
      
      // TODO: Kirim notifikasi WhatsApp di sini jika diperlukan
      // await sendPaymentSuccessWhatsApp(transaction);
    }

    await transaction.save();

    console.log('Transaction updated successfully:', transaction);

    // Return response sukses
    return res.status(200).json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}