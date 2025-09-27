export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { items, total } = req.body; // dari checkout page

    const resp = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(process.env.XENDIT_SECRET_KEY + ":").toString("base64"),
      },
      body: JSON.stringify({
        external_id: "order-" + Date.now(),
        amount: total,
        description: "Pembayaran ALL'S GOOD FOOD",
        currency: "IDR",
        items: items.map((it) => ({
          name: it.name,
          price: it.price,
          quantity: it.qty,
        })),
      }),
    });

    const invoice = await resp.json();
    return res.status(200).json({ success: true, invoice });
  } catch (err) {
    console.error("Checkout error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
