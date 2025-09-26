import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  // Load products & cart
  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(j => {
        if (j.success) setProducts(j.data);
        if (j.data?.length === 0) {
          // auto seed kalau kosong
          fetch("/api/products", { method: "POST" })
            .then(() => fetch("/api/products").then(r => r.json()).then(j => setProducts(j.data)));
        }
      });

    const saved = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(saved);
  }, []);

  const saveCart = (next) => {
    setCart(next);
    localStorage.setItem("cart", JSON.stringify(next));
  };

  const add = (p) => {
    const next = [...cart];
    const i = next.findIndex(it => it._id === p._id);
    if (i === -1) next.push({ _id: p._id, name: p.name, price: p.price, qty: 1 });
    else next[i].qty += 1;
    saveCart(next);
  };

  const dec = (p) => {
    const next = [...cart];
    const i = next.findIndex(it => it._id === p._id);
    if (i > -1) {
      next[i].qty -= 1;
      if (next[i].qty <= 0) next.splice(i, 1);
      saveCart(next);
    }
  };

  const qty = (id) => cart.find(it => it._id === id)?.qty || 0;
  const total = cart.reduce((s, it) => s + it.price * it.qty, 0);

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>🍽️ ALL'S GOOD FOOD</h1>
      <p style={{ textAlign: "center" }}>Silakan pilih menu favoritmu</p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 20,
        marginTop: 24
      }}>
        {products.map(p => (
          <div key={p._id} style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 16,
            textAlign: "center",
            background: "#fff",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
          }}>
            <img src={p.image || "/placeholder.png"} alt={p.name}
              style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />
            <div style={{ fontWeight: 700, fontSize: 18 }}>{p.name}</div>
            <div style={{ color: "#666", marginBottom: 8 }}>Rp{p.price.toLocaleString()}</div>
            <div>
              <button onClick={() => dec(p)} style={{ padding: "4px 10px" }}>-</button>
              <span style={{ margin: "0 12px", fontWeight: 600 }}>{qty(p._id)}</span>
              <button onClick={() => add(p)} style={{ padding: "4px 10px" }}>+</button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart summary */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#fff", borderTop: "1px solid #eee",
        padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <b>{cart.length} item</b> | Total: Rp{total.toLocaleString()}
        </div>
        <Link href="/checkout">
          <button disabled={!cart.length} style={{
            background: "orange", color: "#fff", padding: "10px 20px",
            border: "none", borderRadius: 6, cursor: "pointer"
          }}>Go to Checkout →</button>
        </Link>
      </div>
    </div>
  );
}
