// /pages/api/checkout.js
import dbConnect from "@/lib/mongodb";
import Checkout from "@/models/checkout";
import Payment from "@/models/payment";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  await dbConnect();

  const { items, customerName, email, phone } = req.body || {};
  if (!items?.length) return res.status(400).json({ success: false, message: "Cart kosong" });

  const total = items.reduce((s, it) => s + it.price * it.qty, 0);
  const externalId = `order_${Date.now()}`;
  const key = process.env.XENDIT_SECRET_KEY;
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  // Buat invoice ke Xendit
  const invoicePayload = {
    external_id: externalId,
    amount: total,
    payer_email: email,
    description: `WEB_PaymentGateway - ${externalId}`,
    success_redirect_url: `${baseUrl}/payment/${externalId}`,
    failure_redirect_url: `${baseUrl}/payment/${externalId}`,
  };

  const resp = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${key}:`).toString("base64"),
    },
    body: JSON.stringify(invoicePayload),
  });

  const json = await resp.json();
  if (!resp.ok) {
    return res.status(500).json({ success: false, message: "Xendit error", detail: json });
  }

  // Simpan ke DB
  await Checkout.create({ items, total, status: "PENDING", customerName, email, phone, externalId, invoiceId: json.id });
  await Payment.create({ invoiceId: json.id, externalId, amount: total, status: json.status || "PENDING", raw: json });

  return res.json({
    success: true,
    externalId,
    invoiceId: json.id,
    invoiceUrl: json.invoice_url,
  });
}
