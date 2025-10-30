import { connectDB } from "../../../lib/db";
import Transaction from "../../../models/transaction";

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

// Fungsi untuk kirim WhatsApp sukses pembayaran
async function sendPaymentSuccessWhatsApp(transaction) {
  try {
    const FONNTE_API_TOKEN = process.env.FONNTE_API_TOKEN;
    
    if (!FONNTE_API_TOKEN) {
      console.error('❌ FONNTE_API_TOKEN not configured');
      return;
    }

    // Ambil user data
    const user = transaction.user;
    
    if (!user?.whatsappNumber) {
      console.warn('⚠️ User tidak memiliki whatsappNumber');
      return;
    }

    const whatsapp = formatPhoneNumber(user.whatsappNumber);

    // Format item pesanan
    const orderDetails = transaction.items.map(item => 
      `* ${item.name} (${item.quantity}x) - Rp ${(item.price * item.quantity).toLocaleString('id-ID')}`
    ).join('\n');

    const message = `Halo ${user.name || user.username} 👋

Pembayaran kamu sudah kami terima! 🎉

Detail Pesanan:
${orderDetails}

Total: Rp ${transaction.totalPrice.toLocaleString('id-ID')}

ID Pesanan: #${transaction.external_id}

Pesanan kamu sedang kami proses. Terima kasih! ☕`;

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
    
    if (result.status) {
      console.log('✅ WhatsApp pembayaran sukses dikirim ke:', whatsapp);
      return { success: true };
    } else {
      console.error('❌ Gagal mengirim WhatsApp sukses:', result);
      return { success: false, error: result };
    }

  } catch (error) {
    console.error('❌ Error sending payment success WhatsApp:', error);
    return { success: false, error: error.message };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const { external_id, xenditInvoiceId } = req.body;

    if (!external_id && !xenditInvoiceId) {
      return res.status(400).json({ 
        error: 'external_id atau xenditInvoiceId harus disediakan' 
      });
    }

    console.log(`🔄 Syncing payment status for external_id: ${external_id}, xenditInvoiceId: ${xenditInvoiceId}`);

    // Cari transaksi berdasarkan external_id atau xenditInvoiceId
    const query = external_id 
      ? { external_id: external_id }
      : { xenditInvoiceId: xenditInvoiceId };

    const transaction = await Transaction.findOne(query).populate('user');

    if (!transaction) {
      return res.status(404).json({ 
        error: 'Transaction not found',
        searched: query
      });
    }

    // Jika sudah PAID, tidak perlu sync lagi, tapi kirim WhatsApp jika belum
    if (transaction.status === 'PAID') {
      console.log(`✅ Transaction ${transaction.external_id} already PAID`);
      
      // Kirim WhatsApp jika belum pernah dikirim (bisa cek dari timestamp atau flag)
      const whatsappResult = await sendPaymentSuccessWhatsApp(transaction);
      
      return res.json({
        success: true,
        status: 'PAID',
        message: 'Payment already confirmed',
        transaction: {
          external_id: transaction.external_id,
          status: transaction.status,
          totalPrice: transaction.totalPrice,
          paidAt: transaction.paidAt
        },
        whatsapp: whatsappResult
      });
    }

    // Ambil status terbaru dari Xendit
    const xenditInvoiceIdToCheck = transaction.xenditInvoiceId;
    
    if (!xenditInvoiceIdToCheck) {
      return res.status(400).json({ 
        error: 'Transaction tidak memiliki xenditInvoiceId untuk sync' 
      });
    }

    // Panggil Xendit API untuk cek status invoice
    const xenditResponse = await fetch(`https://api.xendit.co/v2/invoices/${xenditInvoiceIdToCheck}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(process.env.XENDIT_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      }
    });

    if (!xenditResponse.ok) {
      const errorText = await xenditResponse.text();
      console.error('❌ Xendit API error:', errorText);
      return res.status(500).json({ 
        error: 'Failed to sync with Xendit',
        details: errorText
      });
    }

    const invoiceData = await xenditResponse.json();
    console.log('📋 Xendit invoice status:', invoiceData.status);

    // Update status berdasarkan response Xendit
    const isPaid = invoiceData.status === "PAID" || invoiceData.status === "SETTLED";
    const isFailed = invoiceData.status === "EXPIRED" || invoiceData.status === "FAILED";
    const newStatus = isPaid ? "PAID" : isFailed ? "FAILED" : "PENDING";

    // Update transaction jika status berubah
    let whatsappResult = null;
    if (transaction.status !== newStatus) {
      transaction.status = newStatus;
      
      if (isPaid) {
        transaction.paidAt = invoiceData.paid_at ? new Date(invoiceData.paid_at) : new Date();
        // Kirim WhatsApp untuk pembayaran sukses
        whatsappResult = await sendPaymentSuccessWhatsApp(transaction);
      }
      
      await transaction.save();
      console.log(`✅ Transaction ${transaction.external_id} updated to ${newStatus}`);
    }

    return res.json({
      success: true,
      statusChanged: transaction.status !== newStatus,
      status: newStatus,
      transaction: {
        external_id: transaction.external_id,
        status: newStatus,
        totalPrice: transaction.totalPrice,
        paidAt: transaction.paidAt
      },
      xenditStatus: invoiceData.status,
      whatsapp: whatsappResult
    });

  } catch (error) {
    console.error('❌ Sync payment error:', error);
    return res.status(500).json({ 
      error: 'Failed to sync payment status',
      message: error.message 
    });
  }
}
