import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Payment() {
  const router = useRouter();
  const { cart } = router.query;
  const items = cart ? JSON.parse(cart) : [];

  const total = items.reduce((acc, item) => acc + item.price * item.qty, 0);

  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customerName: "Customer Demo", // bisa tambahin input di checkout form
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

      // redirect ke halaman pembayaran Xendit
      window.location.href = json.invoiceUrl;
    } catch (err) {
      console.error(err);
      alert("Terjadi error saat membuat pembayaran");
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>💳 Halaman Pembayaran</h1>

      {items.length === 0 ? (
        <p>Tidak ada pesanan untuk dibayar.</p>
      ) : (
        <div>
          <ul style={{ textAlign: "left", display: "inline-block" }}>
            {items.map((item) => (
              <li key={item._id}>
                {item.name} x {item.qty} = Rp {(item.price * item.qty).toLocaleString()}
              </li>
            ))}
          </ul>

          <h2 style={{ marginTop: "20px" }}>Total: Rp {total.toLocaleString()}</h2>

          <button
            style={{
              marginTop: "20px",
              padding: "12px 24px",
              background: "green",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
            }}
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? "Memproses..." : "Bayar Sekarang"}
          </button>
        </div>
      )}
    </div>
  );
}
