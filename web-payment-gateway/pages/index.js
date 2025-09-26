import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setProducts(result.data);
        }
      });
  }, []);

  // tambah ke cart
  const addToCart = (product) => {
    const exist = cart.find((item) => item._id === product._id);
    if (exist) {
      setCart(
        cart.map((item) =>
          item._id === product._id
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  // lanjut ke checkout
  const goToCheckout = () => {
    router.push({
      pathname: "/checkout",
      query: { cart: JSON.stringify(cart) },
    });
  };

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>🍴 Menu Makanan</h1>
      
      {/* Daftar produk */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {products.map((p) => (
          <div
            key={p._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "20px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              transition: "0.3s",
            }}
          >
            <h2>{p.name}</h2>
            <p>{p.description}</p>
            <strong style={{ fontSize: "1.2rem" }}>Rp {p.price}</strong>
            <br />
            <button
              style={{
                marginTop: "10px",
                padding: "8px 15px",
                background: "green",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() => addToCart(p)}
            >
              Tambah
            </button>
          </div>
        ))}
      </div>

      {/* Keranjang */}
      {cart.length > 0 && (
        <div
          style={{
            marginTop: "40px",
            padding: "20px",
            border: "2px solid #000",
            borderRadius: "10px",
            display: "inline-block",
            textAlign: "left",
          }}
        >
          <h2>🛒 Keranjang</h2>
          <ul>
            {cart.map((item) => (
              <li key={item._id}>
                {item.name} x {item.qty} = Rp {item.price * item.qty}
              </li>
            ))}
          </ul>
          <button
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              background: "blue",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={goToCheckout}
          >
            Lanjut ke Checkout →
          </button>
        </div>
      )}
    </div>
  );
}
