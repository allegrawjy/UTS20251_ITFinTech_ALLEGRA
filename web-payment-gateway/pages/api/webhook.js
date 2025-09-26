// /pages/api/webhook.js
import dbConnect from "@/lib/mongodb";
import Checkout from "@/models/checkout";
import Payment from "@/models/payment";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // Ambil token dari header Xendit
  const token = req.headers["x-callback-token"];

  // Bandingkan dengan env (mau CALLBACK atau WEBHOOK, keduanya dicek)
  const expectedToken =
    process.env.XENDIT_CALLBACK_TOKEN || process.env.XENDIT_WEBHOOK_TOKEN;

  if (token !== expectedToken) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid callback token" });
  }

  await dbConnect();

  // Payload invoice dari Xendit
  const payload = req.body || {};
  const { id: invoiceId, external_id: externalId, status } = payload;

  if (!invoiceId || !externalId) {
    return res
      .status(400)
      .json({ success: false, message: "Bad payload (no invoiceId / externalId)" });
  }

  // Update Payment
  await Payment.updateOne(
    { externalId },
    { invoiceId, status: status || "PENDING", raw: payload },
    { upsert: true }
  );

  // Update Checkout status (PAID → LUNAS)
  const checkoutStatus =
    status === "PAID"
      ? "PAID"
      : status === "EXPIRED"
      ? "EXPIRED"
      : status === "CANCELLED"
      ? "CANCELLED"
      : "PENDING";

  await Checkout.updateOne({ externalId }, { status: checkoutStatus });

  return res.json({ success: true });
}
