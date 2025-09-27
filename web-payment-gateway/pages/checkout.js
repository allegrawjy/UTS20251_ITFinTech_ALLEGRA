const payNow = async () => {
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart,
        total: cart.reduce((s, it) => s + it.price * it.qty, 0),
      }),
    });

    const j = await res.json();
    if (j.success && j.invoice?.invoice_url) {
      window.location.href = j.invoice.invoice_url; // redirect ke Xendit
    } else {
      alert("Gagal membuat invoice");
    }
  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
  }
};

<button onClick={payNow}>Continue to Payment</button>
