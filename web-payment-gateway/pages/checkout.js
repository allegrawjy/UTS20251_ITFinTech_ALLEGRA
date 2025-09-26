import { useEffect, useState } from "react";

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(saved);
  }, []);

  const total = cart.reduce((s, it) => s + it.price * it.qty, 0);

  const goToPayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          customerName: "Customer Demo", // bisa diganti dengan form input nama
          email: "demo@example.com",     // bisa diganti dengan input user
          phone: "08123456789",          // bisa diganti dengan input user
        }),
      });

      const json = await res.json();
      if (!json.success) {
        alert("Gagal membuat invoice");
        setLoading(false);
        return;
      }

      // Redirect ke halaman pembayaran Xendit
      window.location.href = json.invoiceUrl;
    } catch (err) {
      console.error(err);
      alert("Terjadi error saat membuat pembayaran");
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh", padding: "40px 20px" }}>
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          background: "#fff",
          padding: 32,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: 24 }}>🧾 Checkout</h1>

        {cart.length === 0 ? (
          <p style={{ textAlign: "center", fontSize: 18, color: "#888" }}>
            Keranjang masih kosong
          </p>
        ) : (
          <>
            {/* Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
              <thead>
                <tr style={{ background: "#f1f3f5" }}>
                  <th style={{ textAlign: "left", padding: "12px 8px" }}>Item</th>
                  <th style={{ textAlign: "center", padding: "12px 8px" }}>Qty</th>
                  <th style={{ textAlign: "right", padding: "12px 8px" }}>Harga</th>
                  <th style={{ textAlign: "right", padding: "12px 8px" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((it) => (
                  <tr key={it._id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "12px 8px" }}>{it.name}</td>
                    <td style={{ textAlign: "center", padding: "12px 8px" }}>{it.qty}</td>
                    <td style={{ textAlign: "right", padding: "12px 8px" }}>
                      Rp{it.price.toLocaleString()}
                    </td>
                    <td style={{ textAlign: "right", padding: "12px 8px" }}>
                      Rp{(it.price * it.qty).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <h2 style={{ margin: 0 }}>Total</h2>
              <h2 style={{ margin: 0, color: "#d9480f" }}>Rp{total.toLocaleString()}</h2>
            </div>

            {/* Button */}
            <div style={{ textAlign: "center" }}>
              <button
                onClick={goToPayment}
                disabled={loading}
                style={{
                  background: "linear-gradient(90deg, #f59f00, #f76707)",
                  color: "white",
                  padding: "14px 28px",
                  fontSize: 16,
                  border: "none",
                  borderRadius: 8,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Memproses..." : "Lanjut ke Pembayaran →"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
