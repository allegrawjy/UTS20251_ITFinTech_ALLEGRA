import { useEffect, useState } from "react";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Mock data untuk demo (ganti dengan fetch API Anda)
    const mockProducts = [
      {
        _id: "1",
        name: "Nasi Goreng",
        description: "Nasi goreng spesial ala resto",
        price: 25000,
        image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=200&fit=crop"
      },
      {
        _id: "2", 
        name: "Mie Ayam",
        description: "Mie ayam dengan topping ayam manis",
        price: 20000,
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=200&fit=crop"
      },
      {
        _id: "3",
        name: "Es Teh Manis", 
        description: "Segelas es teh manis dingin",
        price: 5000,
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=200&fit=crop"
      },
      {
        _id: "4",
        name: "Ayam Bakar",
        description: "Ayam bakar bumbu kecap manis",
        price: 30000,
        image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=300&h=200&fit=crop"
      },
      {
        _id: "5",
        name: "Gado-Gado",
        description: "Gado-gado segar dengan bumbu kacang",
        price: 18000,
        image: "https://static.promediateknologi.id/crop/0x541:1920x1650/750x500/webp/photo/p1/828/2024/03/11/inna-safa-5SXubfLjTWY-unsplash-2672807430.jpg"
      },
      {
        _id: "6",
        name: "Soto Ayam",
        description: "Soto ayam kuning dengan telur",
        price: 22000,
        image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=300&h=200&fit=crop"
      }
    ];
    
    setProducts(mockProducts);

    // Load cart dari state (dalam environment ini tidak bisa pakai localStorage)
    const savedCart = [];
    setCart(savedCart);
  }, []);

  const saveCart = (next) => {
    setCart(next);
    // localStorage.setItem("cart", JSON.stringify(next)); // Tidak bisa digunakan di environment ini
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

  const handleCheckout = () => {
    if (totalItems > 0) {
      // Simpan cart ke localStorage untuk diakses di halaman checkout
      localStorage.setItem("cart", JSON.stringify(cart));
      // Navigasi ke halaman checkout (di Next.js gunakan router.push('/checkout'))
      window.location.href = "/checkout";
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      {/* Header dengan cart badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 28, color: "#f3f3f3ff" }}>🍽️ ALL'S GOOD FOOD</h2>
        <div onClick={handleCheckout} style={{ position: "relative", cursor: "pointer", fontSize: 24 }}>
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
                fontWeight: "bold"
              }}
            >
              {totalItems}
            </span>
          )}
        </div>
      </div>

      <p style={{ textAlign: "center", fontSize: 16, color: "#666", marginBottom: 30 }}>
        Silakan pilih menu favoritmu
      </p>

      {/* Grid produk */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24,
          marginTop: 24,
        }}
      >
        {products.map((p) => (
          <div
            key={p._id}
            style={{
              border: "1px solid #e0e0e0",
              borderRadius: 16,
              padding: 20,
              textAlign: "center",
              background: "#fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
            }}
          >
            <img
              src={p.image || "/placeholder.png"}
              alt={p.name}
              style={{
                width: "100%",
                height: 160,
                objectFit: "cover",
                borderRadius: 12,
                marginBottom: 12,
              }}
            />
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6, color: "#333" }}>
              {p.name}
            </div>
            <div style={{ color: "#666", fontSize: 14, marginBottom: 12, lineHeight: 1.4 }}>
              {p.description || "Deskripsi singkat menu"}
            </div>
            <div style={{ color: "#e67e22", fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>
              Rp {p.price.toLocaleString()}
            </div>

            {/* Tombol Add vs Counter */}
            {qty(p._id) === 0 ? (
              <button
                onClick={() => add(p)}
                style={{
                  background: "linear-gradient(45deg, #ff6b35, #f7931e)",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 20px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: 14,
                  transition: "all 0.2s",
                  boxShadow: "0 2px 8px rgba(255, 107, 53, 0.3)"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.05)";
                  e.target.style.boxShadow = "0 4px 12px rgba(255, 107, 53, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                  e.target.style.boxShadow = "0 2px 8px rgba(255, 107, 53, 0.3)";
                }}
              >
                Add +
              </button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <button 
                  onClick={() => dec(p)} 
                  style={{ 
                    padding: "6px 12px",
                    background: "#f8f9fa",
                    border: "1px solid #dee2e6",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#dc3545"
                  }}
                >
                  -
                </button>
                <span style={{ 
                  minWidth: 30,
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: 16,
                  color: "#333"
                }}>
                  {qty(p._id)}
                </span>
                <button 
                  onClick={() => add(p)} 
                  style={{ 
                    padding: "6px 12px",
                    background: "#f8f9fa",
                    border: "1px solid #dee2e6", 
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#28a745"
                  }}
                >
                  +
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      {totalItems > 0 && (
        <div style={{
          position: "fixed",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#333",
          color: "white",
          padding: "12px 24px",
          borderRadius: 25,
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          cursor: "pointer",
          zIndex: 1000
        }}
        onClick={handleCheckout}
        >
          🛒 {totalItems} item(s) - Rp {cart.reduce((total, item) => total + (item.price * item.qty), 0).toLocaleString()}
          <span style={{ marginLeft: 10, fontSize: 12 }}>Tap to checkout</span>
        </div>
      )}
    </div>
  );
}