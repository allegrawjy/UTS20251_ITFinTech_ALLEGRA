import dbConnect from "../../lib/mongodb";
import Checkout from "../../models/checkout";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await dbConnect();

    // Data webhook dari Xendit
    const event = req.body;

    // contoh payload webhook: event.data.id, event.data.status
    if (event.data && event.data.status === "PAID") {
      const checkoutId = event.data.reference_id; // reference_id dikirim saat create invoice
      await Checkout.findByIdAndUpdate(checkoutId, { status: "LUNAS" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
