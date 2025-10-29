// File: src/pages/api/transactions.js
import connectDB from '../../../lib/db';
import Transaction from '../../../models/transaction';
import User from '../../../models/user';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    if (req.query.analytics === '1') {
      // Analitik
      const transactions = await Transaction.find({ status: 'PAID' });
      const totalSales = transactions.reduce((sum, trx) => sum + trx.totalPrice, 0);
      const totalOrders = transactions.length;
      // Hitung user unik
      const userIds = new Set(transactions.map(trx => trx.user.toString()));
      const totalUsers = userIds.size;
      return res.json({ totalSales, totalOrders, totalUsers });
    }
    if (req.query.all === '1') {
      // Semua transaksi untuk datatable
      const transactions = await Transaction.find({}).populate('user');
      return res.json(transactions);
    }
    return res.status(400).json({ message: 'Invalid query' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { cart, user } = req.body;
  
  // Validasi
  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ message: 'Cart tidak valid atau kosong' });
  }
  
  if (!user || !user._id || !user.whatsappNumber) {
    return res.status(400).json({ message: 'Data user tidak lengkap' });
  }

  // Hitung total harga
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // Pajak 10%
  const totalPrice = subtotal + tax;

  try {
    // 1. Simpan transaksi ke database dengan status PENDING
    const transaction = await Transaction.create({
      user: user._id,
      items: cart.map(item => ({
        product: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image || '',
      })),
      totalPrice,
      status: 'PENDING',
    });

    console.log('✅ Transaction created:', {
      id: transaction._id,
      status: transaction.status,
      totalPrice: totalPrice
    });

    // 2. Buat invoice Xendit
    const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
    const successUrl = `${process.env.SUCCESS_URL || 'http://localhost:3000/success'}?transactionId=${transaction._id}`;
    const failureUrl = process.env.FAILURE_URL || 'http://localhost:3000/failure';

    const xenditResponse = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64'),
      },
      body: JSON.stringify({
        external_id: transaction._id.toString(),
        payer_email: user.email || 'noreply@allegra.com',
        description: 'Pembayaran ALL\'S GOOD FOOD',
        amount: totalPrice,
        success_redirect_url: successUrl,
        failure_redirect_url: failureUrl,
        customer: {
          given_names: user.name || user.username,
          mobile_number: user.whatsappNumber,
        },
      }),
    });

    const invoice = await xenditResponse.json();
    
    if (!xenditResponse.ok || !invoice.invoice_url) {
      throw new Error(invoice.message || 'Gagal membuat invoice Xendit');
    }

    console.log('✅ Xendit invoice created:', invoice.id);

    // 3. Update transaksi dengan invoice URL
    transaction.invoiceUrl = invoice.invoice_url;
    transaction.xenditInvoiceId = invoice.id;
    await transaction.save();

    // 4. Kirim notifikasi WhatsApp pertama
    await sendWhatsAppNotification(user, cart, invoice, transaction, totalPrice);

    // 5. Return response
    return res.status(200).json({ 
      success: true,
      invoiceUrl: invoice.invoice_url,
      transactionId: transaction._id,
      message: 'Transaksi berhasil dibuat'
    });

  } catch (err) {
    console.error('❌ Error creating transaction:', err);
    
    return res.status(500).json({ 
      message: 'Gagal memproses transaksi', 
      error: err.message 
    });
  }
}

// Fungsi helper untuk format nomor WhatsApp
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

// Fungsi untuk kirim WhatsApp pertama (saat checkout)
async function sendWhatsAppNotification(user, cart, invoice, transaction, totalPrice) {
  try {
    const FONNTE_API_TOKEN = process.env.FONNTE_API_TOKEN;
    
    if (!FONNTE_API_TOKEN) {
      console.error('❌ FONNTE_API_TOKEN not configured');
      return;
    }

    const whatsapp = formatPhoneNumber(user.whatsappNumber);
    
    const orderDetails = cart.map(item => 
      `• ${item.name} (${item.quantity}x) - Rp ${(item.price * item.quantity).toLocaleString()}`
    ).join('\n');

    const message = `Halo ${user.name || user.username} 👋

Pesanan kamu sudah kami terima! ✅

*Detail Pesanan:*
${orderDetails}

*Total: Rp ${totalPrice.toLocaleString()}*

Silakan selesaikan pembayaran melalui link berikut:
${invoice.invoice_url}

ID Pesanan: #${transaction._id}

Terima kasih! ☕`;

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
      console.log('✅ WhatsApp pertama berhasil dikirim ke:', whatsapp);
    } else {
      console.error('❌ Gagal mengirim WhatsApp:', result);
    }

    return result;
  } catch (error) {
    console.error('❌ Error sending WhatsApp:', error);
  }
}