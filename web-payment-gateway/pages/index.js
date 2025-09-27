import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
  const loadProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const j = await res.json();

      if (j.success && j.data.length > 0) {
        setProducts(j.data);
      } else {
        // FIX: pakai /api/products, bukan /api/seed
        await fetch("/api/products", { method: "POST" });
        const seeded = await fetch("/api/products").then((r) => r.json());
        if (seeded.success) setProducts(seeded.data);
      }
    } catch (err) {
      console.error("Fetch products error:", err);
    }
  };

  loadProducts();

  const saved = JSON.parse(localStorage.getItem("cart") || "[]");
  setCart(saved);
}, []);


  const saveCart = (next) => {
    setCart(next);
    localStorage.setItem("cart", JSON.stringify(next));
  };

  const add = (p) => {
    const next = [...cart];
    const i = next.findIndex((it) => it._id === p._id);
    if (i === -1) {
      next.push({ _id: p._id, name: p.name, price: p.price, qty: 1 });
    } else {
      next[i].qty += 1;
    }
    saveCart(next);
  };

  const dec = (p) => {
    const next = [...cart];
    const i = next.findIndex((it) => it._id === p._id);
    if (i > -1) {
      next[i].qty -= 1;
      if (next[i].qty <= 0) next.splice(i, 1);
      saveCart(next);
    }
  };

  const qty = (id) => cart.find((it) => it._id === id)?.qty || 0;
  const totalItems = cart.reduce((s, it) => s + it.qty, 0);

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      {/* Header dengan cart badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>🍽️ ALL'S GOOD FOOD</h2>
        <Link href="/checkout">
          <div style={{ position: "relative", cursor: "pointer" }}>
            🛒
            {totalItems > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -8,
                  right: -12,
                  background: "red",
                  color: "white",
                  borderRadius: "50%",
                  padding: "2px 6px",
                  fontSize: 12,
                }}
              >
                {totalItems}
              </span>
            )}
          </div>
        </Link>
      </div>

      <p style={{ textAlign: "center" }}>Silakan pilih menu favoritmu</p>

      {/* Grid produk */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
          marginTop: 24,
        }}
      >
        {products.map((p) => (
          <div
            key={p._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 16,
              textAlign: "center",
              background: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
          >
            <img
              src={p.image || "/placeholder.png"}
              alt={p.name}
              style={{
                width: "100%",
                height: 150,
                objectFit: "cover",
                borderRadius: 8,
                marginBottom: 8,
              }}
            />
            <div style={{ fontWeight: 700, fontSize: 18 }}>{p.name}</div>
            <div style={{ color: "#666", fontSize: 14, marginBottom: 4 }}>
              {p.description || "Deskripsi singkat menu"}
            </div>
            <div style={{ color: "#333", marginBottom: 12 }}>
              Rp{p.price.toLocaleString()}
            </div>

            {/* Tombol Add vs Counter */}
            {qty(p._id) === 0 ? (
              <button
                onClick={() => add(p)}
                style={{
                  background: "orange",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 12px",
                  cursor: "pointer",
                }}
              >
                Add +
              </button>
            ) : (
              <div>
                <button onClick={() => dec(p)} style={{ padding: "4px 10px" }}>
                  -
                </button>
                <span style={{ margin: "0 12px", fontWeight: 600 }}>{qty(p._id)}</span>
                <button onClick={() => add(p)} style={{ padding: "4px 10px" }}>
                  +
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
