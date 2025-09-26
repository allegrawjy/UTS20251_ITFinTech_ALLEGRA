import { useEffect, useState } from "react";

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(saved);
  }, []);

  const saveCart = (next) => {
    setCart(next);
    localStorage.setItem("cart", JSON.stringify(next));
  };

  const inc = (id) => {
    const next = [...cart];
    const i = next.findIndex((it) => it._id === id);
    if (i > -1) {
      next[i].qty += 1;
      saveCart(next);
    }
  };

  const dec = (id) => {
    const next = [...cart];
    const i = next.findIndex((it) => it._id === id);
    if (i > -1 && next[i].qty > 1) {
      next[i].qty -= 1;
      saveCart(next);
    }
  };

  const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const tax = Math.round(subtotal * 0.1); // contoh 10% tax
  const total = subtotal + tax;

  const goToPayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          customerName: "Customer Demo",
          email: "demo@example.com",
          phone: "08123456789",
        }),
      });

      const json = await res.json();
      if (!json.success) {
        alert("Gagal membuat invoice");
        setLoading(false);
        return;
      }
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
          maxWidth: 600,
          margin: "0 auto",
          background: "#fff",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: 24 }}>🧾 Checkout</h1>

        {cart.length === 0 ? (
          <p style={{ textAlign: "center", fontSize: 18, color: "#888" }}>Keranjang masih kosong</p>
        ) : (
          <>
            {cart.map((it) => (
              <div
                key={it._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                <div>
                  <div style={{ fontWeight: "bold" }}>{it.name}</div>
                  <div>Rp{it.price.toLocaleString()}</div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => dec(it._id)}>-</button>
                  <span>{it.qty}</span>
                  <button onClick={() => inc(it._id)}>+</button>
                </div>

                <div style={{ fontWeight: "600" }}>
                  Rp{(it.price * it.qty).toLocaleString()}
                </div>
              </div>
            ))}

            {/* Subtotal, Tax, Total */}
            <div style={{ marginTop: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span>Subtotal</span>
                <b>Rp{subtotal.toLocaleString()}</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span>Tax (10%)</span>
                <b>Rp{tax.toLocaleString()}</b>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 18,
                  marginTop: 12,
                }}
              >
                <span>Total</span>
                <b style={{ color: "#d9480f" }}>Rp{total.toLocaleString()}</b>
              </div>
            </div>

            {/* Button */}
            <div style={{ textAlign: "center", marginTop: 24 }}>
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
                {loading ? "Memproses..." : "Continue to Payment →"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
