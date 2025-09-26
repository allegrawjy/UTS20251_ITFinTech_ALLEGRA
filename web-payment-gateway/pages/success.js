import { useRouter } from "next/router";

export default function Success() {
  const router = useRouter();
  const { cart, total } = router.query;
  const items = cart ? JSON.parse(cart) : [];

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>🎉 Pembayaran Berhasil</h1>

      {items.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <ul style={{ textAlign: "left", display: "inline-block" }}>
            {items.map((item) => (
              <li key={item._id}>
                {item.name} x {item.qty} = Rp {item.price * item.qty}
              </li>
            ))}
          </ul>
          <h2 style={{ marginTop: "20px" }}>Total Dibayar: Rp {total}</h2>
        </div>
      )}

      <button
        style={{
          marginTop: "30px",
          padding: "10px 20px",
          background: "blue",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={() => router.push("/")}
      >
        Kembali ke Menu
      </button>
    </div>
  );
}
