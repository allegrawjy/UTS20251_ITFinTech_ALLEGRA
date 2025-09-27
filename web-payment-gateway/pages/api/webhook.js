// /pages/api/webhook.js
import dbConnect from "@/lib/mongodb";
import Checkout from "@/models/checkout";
import Payment from "@/models/payment";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const token = req.headers["x-callback-token"];
  const expectedToken =
    process.env.XENDIT_CALLBACK_TOKEN || process.env.XENDIT_WEBHOOK_TOKEN;

  if (token !== expectedToken) {
    console.log("❌ Invalid token:", token);
    return res.status(401).json({ success: false, message: "Invalid callback token" });
  }

  await dbConnect();

  const payload = req.body || {};
  console.log("📩 Webhook payload diterima:", JSON.stringify(payload, null, 2));

  const { id: invoiceId, external_id: externalId, status } = payload;

  if (!invoiceId || !externalId) {
    console.log("❌ Payload tidak lengkap:", payload);
    return res
      .status(400)
      .json({ success: false, message: "Bad payload (no invoiceId / externalId)" });
  }

  // Simpan ke collection Payment
  await Payment.updateOne(
    { invoiceId },
    { invoiceId, externalId, status, raw: payload },
    { upsert: true }
  );

  // Tentukan status
  const checkoutStatus =
    status === "PAID"
      ? "PAID"
      : status === "EXPIRED"
      ? "EXPIRED"
      : status === "CANCELLED"
      ? "CANCELLED"
      : "PENDING";

  // Update checkout berdasarkan externalId atau invoiceId
  const result = await Checkout.updateOne(
    { $or: [{ externalId }, { invoiceId }] },
    {
      status: checkoutStatus,
      invoiceId,
      paidAmount: payload.paid_amount || 0,
      paymentMethod: payload.payment_method || null,
      paidAt: payload.paid_at || null,
    }
  );

  console.log("✅ Update Checkout result:", result);

  return res.json({ success: true });
}