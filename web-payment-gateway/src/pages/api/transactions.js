

import { connectDB } from "../../../lib/db";
import Transaction from "../../../models/transaction";
import User from "../../../models/user";
import webhookHandler from "./webhook/xendit";

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

// Fungsi untuk kirim WhatsApp saat checkout berhasil
async function sendCheckoutWhatsApp(transaction, invoiceUrl) {
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

Pesanan kamu sudah kami terima! ✅

Detail Pesanan:
${orderDetails}

Total: Rp ${transaction.totalPrice.toLocaleString('id-ID')}

Silakan selesaikan pembayaran melalui link berikut:
${invoiceUrl}

ID Pesanan: #${transaction.external_id}

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
      console.log('✅ WhatsApp checkout dikirim ke:', whatsapp);
    } else {
      console.error('❌ Gagal mengirim WhatsApp checkout:', result);
    }

  } catch (error) {
    console.error('❌ Error sending checkout WhatsApp:', error);
  }
}

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const { all, analytics } = req.query;

      if (analytics === "1") {
        // Return analytics data
        const totalTransactions = await Transaction.countDocuments();
        const paidTransactions = await Transaction.countDocuments({ status: "PAID" });
        const totalRevenue = await Transaction.aggregate([
          { $match: { status: "PAID" } },
          { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);

        return res.json({
          totalTransactions,
          paidTransactions,
          totalRevenue: totalRevenue[0]?.total || 0
        });
      }

      if (all === "1") {
        // Return all transactions
        const transactions = await Transaction.find()
          .populate('user', 'name username email')
          .sort({ createdAt: -1 });
        return res.json(transactions);
      }

      return res.status(400).json({ error: "Invalid query parameters" });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return res.status(500).json({ error: "Failed to fetch transactions" });
    }
  }

  if (req.method === "POST") {
    // Check if this is a Xendit webhook (has external_id, status) or cart checkout (has cart, user)
    const { external_id, status, cart, user } = req.body;

    if (external_id && status) {
      // This is a Xendit webhook
      return webhookHandler(req, res);
    } else if (cart && user) {
      // This is a cart checkout
      return handleCheckout(req, res);
    } else {
      return res.status(400).json({ error: "Invalid request data" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

async function handleCheckout(req, res) {
  try {
    const { cart, user } = req.body;

    // Validate user exists
    const existingUser = await User.findById(user._id || user.id);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate total
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create transaction
    const external_id = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const transaction = new Transaction({
      external_id,
      user: existingUser._id,
      items: cart.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalPrice,
      status: "PENDING",
      customerName: existingUser.name || existingUser.username,
      customerEmail: existingUser.email,
      customerPhone: existingUser.whatsappNumber
    });

    await transaction.save();

    // Create Xendit invoice
    const xenditResponse = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(process.env.XENDIT_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_id: external_id,
        amount: totalPrice,
        currency: 'IDR',
        customer: {
          given_names: existingUser.name || existingUser.username,
          email: existingUser.email
        },
        success_redirect_url: `${process.env.SUCCESS_URL || 'http://localhost:3000/success'}?external_id=${external_id}`,
        failure_redirect_url: `${process.env.FAILURE_URL || 'http://localhost:3000/failure'}?external_id=${external_id}`,
        invoice_duration: 86400 // 24 hours
      })
    });

    if (!xenditResponse.ok) {
      const errorData = await xenditResponse.text();
      throw new Error(`Xendit API error: ${errorData}`);
    }

    const invoiceData = await xenditResponse.json();

    // Update transaction with Xendit invoice data
    transaction.xenditInvoiceId = invoiceData.id;
    transaction.invoiceUrl = invoiceData.invoice_url;
    await transaction.save();

    // Populate user data for WhatsApp
    await transaction.populate('user');

    // Send WhatsApp notification for checkout
    await sendCheckoutWhatsApp(transaction, invoiceData.invoice_url);

    return res.json({
      success: true,
      invoiceUrl: invoiceData.invoice_url,
      transactionId: transaction._id
    });

  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({ 
      error: "Checkout failed", 
      message: error.message 
    });
  }
}