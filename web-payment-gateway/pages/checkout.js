import { useRouter } from "next/router";

export default function Checkout() {
  const router = useRouter();
  const { cart } = router.query;
  const items = cart ? JSON.parse(cart) : [];

  const goToPayment = () => {
    router.push({
      pathname: "/payment",
      query: { cart: JSON.stringify(items) },
    });
  };

  const total = items.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>🧾 Checkout</h1>
      {items.length === 0 ? (
        <p>Keranjang kosong</p>
      ) : (
        <div>
          <ul style={{ textAlign: "left", display: "inline-block" }}>
            {items.map((item) => (
              <li key={item._id}>
                {item.name} x {item.qty} = Rp {item.price * item.qty}
              </li>
            ))}
          </ul>
          <h2>Total: Rp {total}</h2>
          <button
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "orange",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={goToPayment}
          >
            Lanjut ke Pembayaran →
          </button>
        </div>
      )}
    </div>
  );
}
