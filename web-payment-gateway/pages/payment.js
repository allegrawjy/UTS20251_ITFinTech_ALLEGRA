import { useRouter } from "next/router";

export default function Payment() {
  const router = useRouter();
  const { cart } = router.query;
  const items = cart ? JSON.parse(cart) : [];

  const total = items.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handlePayment = () => {
    // Simulasi pembayaran sukses
    router.push({
      pathname: "/success",
      query: { cart: JSON.stringify(items), total },
    });
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
                {item.name} x {item.qty} = Rp {item.price * item.qty}
              </li>
            ))}
          </ul>

          <h2 style={{ marginTop: "20px" }}>Total: Rp {total}</h2>

          <button
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "green",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={handlePayment}
          >
            Bayar Sekarang
          </button>
        </div>
      )}
    </div>
  );
}
