// /pages/api/createInvoice.js
import dbConnect from "@/lib/mongodb";
import Checkout from "@/models/checkout";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { cart, total, customerName, email } = req.body;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ success: false, error: "Cart is empty" });
    }

    // Simpan checkout awal (status masih pending)
    const checkout = await Checkout.create({
      amount: total,
      items: cart,
      customerName: customerName || "Customer Demo",
      customerEmail: email || "demo@example.com",
      status: "PENDING",
    });

    // Buat invoice ke Xendit
    const response = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(process.env.XENDIT_SECRET_KEY + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_id: checkout._id.toString(), // pakai ID Mongo sebagai external_id
        amount: total,
        description: "Pembayaran order di web_paymentgateway",
        currency: "IDR",
        customer: {
          given_names: checkout.customerName,
          email: checkout.customerEmail,
        },
        success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?orderId=${checkout._id}`,
        failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-failed?orderId=${checkout._id}`,
        items: cart.map(item => ({
          name: item.name,
          quantity: item.qty,
          price: item.price,
        })),
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Xendit error: ${text}`);
    }

    const invoice = await response.json();

    // Update checkout dengan invoice ID dari Xendit
    checkout.xenditInvoiceId = invoice.id;
    await checkout.save();

    return res.status(200).json({
      success: true,
      invoiceUrl: invoice.invoice_url,
    });

  } catch (err) {
    console.error("❌ Create invoice error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
