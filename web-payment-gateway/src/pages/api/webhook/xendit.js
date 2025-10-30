import connectDB from '../../../../lib/db';
import Transaction from '../../../../models/transaction';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-callback-token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ✅ Handle GET request untuk verifikasi webhook
  if (req.method === 'GET') {
    console.log("✅ GET request - Webhook verification");
    return res.status(200).json({ 
      message: 'Xendit webhook endpoint is ready',
      status: 'ok' 
    });
  }

  // ✅ Handle POST request untuk menerima webhook dari Xendit
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method not allowed" });
  }

  console.log("=== XENDIT WEBHOOK RECEIVED ===");
  console.log("METHOD:", req.method);
  console.log("HEADERS:", req.headers);
  console.log("BODY:", req.body);

  await connectDB();

  try {
    const payload = req.body;
    const callbackToken = req.headers["x-callback-token"];
    const XENDIT_CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN;

    // Verifikasi callback token
    if (XENDIT_CALLBACK_TOKEN && callbackToken !== XENDIT_CALLBACK_TOKEN) {
      console.error("❌ Invalid callback token");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const invoiceStatus = payload.status; // PAID, SETTLED, EXPIRED, FAILED
    const externalId = payload.external_id;

    if (!externalId) {
      console.error("❌ Missing external_id in webhook payload");
      return res.status(400).json({ message: "Missing external_id" });
    }

    console.log(`🔍 Looking for transaction with external_id: ${externalId}`);

    // Cari transaksi berdasarkan external_id
    const transaction = await Transaction.findOne({ external_id: externalId }).populate("user");

    if (!transaction) {
      console.error("❌ Transaction not found:", externalId);
      return res.status(404).json({ message: "Transaction not found" });
    }

    console.log(`✅ Transaction found: ${transaction._id}`);

    // Map status dari Xendit ke status internal
    const statusMap = {
      PAID: "PAID",
      SETTLED: "PAID",
      COMPLETED: "PAID",
      PENDING: "PENDING",
      EXPIRED: "EXPIRED",
      FAILED: "FAILED",
    };

    const newStatus = statusMap[invoiceStatus] || "FAILED";
    const oldStatus = transaction.status;

    // Update status
    transaction.status = newStatus;
    if (newStatus === "PAID") {
      transaction.paidAt = new Date();
    }

    await transaction.save();

    console.log(`✅ Status updated: ${oldStatus} → ${newStatus}`);

    // Kirim WhatsApp notification kalau status berubah jadi PAID
    if (newStatus === "PAID" && oldStatus !== "PAID") {
      console.log("📱 Sending WhatsApp payment success notification...");
      await sendPaymentSuccessNotification(transaction);
    }

    return res.status(200).json({ 
      success: true,
      message: "Webhook processed successfully"
    });

  } catch (err) {
    console.error("❌ Webhook error:", err);
    return res.status(500).json({ 
      message: "Server error",
      error: err.message 
    });
  }
}

// Fungsi kirim WhatsApp notification untuk payment success
async function sendPaymentSuccessNotification(transaction) {
  try {
    const token = process.env.FONNTE_API_TOKEN;
    const user = transaction.user;
    
    if (!token) {
      console.error('❌ FONNTE_API_TOKEN not configured');
      return;
    }

    if (!user?.whatsappNumber) {
      console.error('❌ User WhatsApp number not found');
      return;
    }

    // Format nomor WhatsApp
    let whatsapp = user.whatsappNumber.replace(/\D/g, "");
    if (whatsapp.startsWith("0")) {
      whatsapp = "62" + whatsapp.substring(1);
    }
    if (!whatsapp.startsWith("62")) {
      whatsapp = "62" + whatsapp;
    }

    // Buat detail items
    const itemsList = transaction.items.map(item => 
      `• ${item.name} (${item.quantity}x)`
    ).join('\n');

    const message = `🎉 *PEMBAYARAN BERHASIL!*

Terima kasih ${user.name || user.username}! Pembayaran Anda telah dikonfirmasi.

*Detail Pesanan:*
${itemsList}

*Total Bayar:* Rp ${transaction.totalPrice.toLocaleString()}
*ID Transaksi:* ${transaction.external_id}
*Status:* ✅ LUNAS

Pesanan Anda segera kami proses.

Terima kasih telah berbelanja di ALL'S GOOD FOOD! 🙌☕`;

    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: whatsapp,
        message,
        countryCode: "62",
      }),
    });

    const result = await response.json();
    
    if (result.status) {
      console.log("✅ WhatsApp payment success notification sent to:", whatsapp);
    } else {
      console.error("❌ Failed to send WhatsApp:", result);
    }

    return result;
  } catch (error) {
    console.error("❌ Error sending WhatsApp notification:", error);
  }
}