import { NextResponse } from "next/server";
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

async function processPayment(body) {
  try {
    await connectDB();
    const { external_id, status, paid_at, id: xenditInvoiceId } = body;

    if (!external_id) {
      console.warn("⚠️ Webhook missing external_id");
      return;
    }

    console.log(`📌 Processing webhook for external_id: ${external_id}`);

    // Normalize Xendit statuses
    const isPaid = status === "PAID" || status === "SETTLED";
    const isFailed = status === "EXPIRED" || status === "FAILED" || status === "CANCELLED";
    const normalized = isPaid ? "PAID" : isFailed ? "FAILED" : "PENDING";

    // ✅ PERBAIKAN: Cari berdasarkan external_id, BUKAN _id
    const transaction = await Transaction.findOneAndUpdate(
      { external_id: external_id }, // 👈 Gunakan external_id dari Xendit
      {
        status: normalized,
        paidAt: isPaid ? (paid_at ? new Date(paid_at) : new Date()) : undefined,
        xenditInvoiceId: xenditInvoiceId || undefined, // Update xenditInvoiceId jika ada
      },
      { new: true }
    ).populate('user'); // Populate user untuk dapat data langsung

    if (!transaction) {
      console.log(`⚠️ Transaction dengan external_id ${external_id} tidak ditemukan di DB`);
      return;
    }

    console.log(`✅ Transaction ${transaction._id} (${external_id}) updated to ${normalized}`);

    // Send WhatsApp notification berdasarkan status
    if (normalized === "PAID") {
      await sendPaymentSuccessWhatsApp(transaction);
    } else if (normalized === "FAILED") {
      await sendPaymentFailedWhatsApp(transaction);
    }

  } catch (err) {
    console.error("❌ DB processing error:", err);
    throw err; // Re-throw untuk ditangkap di handler utama
  }
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
      `• ${item.name} (${item.quantity}x) - Rp ${(item.price * item.quantity).toLocaleString('id-ID')}`
    ).join('\n');

    const message = `Halo ${user.name || user.username} 👋

Pembayaran kamu sudah kami terima! 🎉✅

*Detail Pesanan:*
${orderDetails}

*Total Dibayar: Rp ${transaction.totalPrice.toLocaleString('id-ID')}*

ID Transaksi: #${transaction.external_id}

Pesanan kamu sedang kami proses dan akan segera dikirim. Terima kasih sudah berbelanja! ☕🛍️`;

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
    } else {
      console.error('❌ Gagal mengirim WhatsApp sukses:', result);
    }

  } catch (error) {
    console.error('❌ Error sending payment success WhatsApp:', error);
  }
}

// Fungsi untuk kirim WhatsApp gagal pembayaran
async function sendPaymentFailedWhatsApp(transaction) {
  try {
    const FONNTE_API_TOKEN = process.env.FONNTE_API_TOKEN;
    
    if (!FONNTE_API_TOKEN) {
      console.error('❌ FONNTE_API_TOKEN not configured');
      return;
    }

    const user = transaction.user;
    
    if (!user?.whatsappNumber) {
      console.warn('⚠️ User tidak memiliki whatsappNumber');
      return;
    }

    const whatsapp = formatPhoneNumber(user.whatsappNumber);

    const message = `Halo ${user.name || user.username} 👋

Pembayaran untuk pesanan kamu tidak berhasil atau sudah kadaluarsa. 😔

ID Transaksi: #${transaction.external_id}
Total: Rp ${transaction.totalPrice.toLocaleString('id-ID')}

Jika kamu masih ingin melanjutkan pesanan, silakan lakukan checkout ulang melalui website kami.

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
      console.log('✅ WhatsApp pembayaran gagal dikirim ke:', whatsapp);
    } else {
      console.error('❌ Gagal mengirim WhatsApp gagal:', result);
    }

  } catch (error) {
    console.error('❌ Error sending payment failed WhatsApp:', error);
  }
}

export async function POST(req) {
  try {
    // Validasi token callback dari Xendit
    const tokenHeader = req.headers['x-callback-token'];
    const secretToken = process.env.XENDIT_CALLBACK_TOKEN;

    if (!secretToken) {
      console.error("❌ XENDIT_CALLBACK_TOKEN belum di-set di .env");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    if (tokenHeader !== secretToken) {
      console.error("❌ Invalid Xendit callback token:", tokenHeader);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse webhook body
    const body = await req.json();
    console.log("📩 Xendit Webhook received:", JSON.stringify(body, null, 2));

    // Process payment
    await processPayment(body);

    // Return success response to Xendit
    return NextResponse.json({ 
      message: "Webhook processed successfully",
      received: true 
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    
    // Tetap return 200 agar Xendit tidak retry terus-menerus
    return NextResponse.json({ 
      message: "Webhook received but processing failed",
      error: error.message 
    }, { status: 200 });
  }
}