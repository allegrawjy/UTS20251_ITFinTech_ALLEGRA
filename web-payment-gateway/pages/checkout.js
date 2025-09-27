import { useEffect, useState } from "react";

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulasi load data dari halaman sebelumnya
    const mockCart = [
      { _id: "1", name: "Nasi Goreng", price: 25000, qty: 1 },
      { _id: "2", name: "Mie Ayam", price: 20000, qty: 2 },
      { _id: "3", name: "Es Teh Manis", price: 5000, qty: 1 }
    ];
    setCart(mockCart);

    // Listen untuk data dari halaman utama
    const handleNavigation = (event) => {
      if (event.detail && event.detail.cart) {
        setCart(event.detail.cart);
      }
    };
    

    window.addEventListener('navigate-to-checkout', handleNavigation);
    return () => window.removeEventListener('navigate-to-checkout', handleNavigation);
  }, []);

  const saveCart = (next) => {
    setCart(next);
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
  const tax = Math.round(subtotal * 0.1); // 10% tax
  const total = subtotal + tax;

  const goToPayment = async () => {
    setLoading(true);
    
    try {
      // Di aplikasi nyata, ini akan hit API /api/checkout
      // Untuk demo, kita langsung navigasi ke payment dengan data cart
      
      // Simpan data untuk halaman payment
      const paymentData = {
        items: cart,
        customerName: "Customer Demo",
        email: "demo@example.com", 
        phone: "08123456789",
        subtotal: subtotal,
        tax: tax,
        total: total
      };
      
      // Simpan ke localStorage untuk diakses di halaman payment
      localStorage.setItem("paymentData", JSON.stringify(paymentData));
      
      // Navigasi ke halaman payment (di Next.js: router.push('/payment'))
      setTimeout(() => {
        window.location.href = "/payment";
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error(err);
      alert("Terjadi error saat membuat pembayaran");
      setLoading(false);
    }
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh", padding: "40px 20px" }}>
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          background: "#fff",
          padding: 32,
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          marginBottom: 32,
          borderBottom: "2px solid #f0f0f0",
          paddingBottom: 16
        }}>
          <button 
            onClick={goBack}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              marginRight: 16,
              color: "#666"
            }}
          >
            ←
          </button>
          <h1 style={{ 
            fontSize: 28, 
            fontWeight: "bold",
            margin: 0,
            color: "#333"
          }}>
            🧾 Checkout
          </h1>
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
            <p style={{ fontSize: 18, color: "#888", margin: 0 }}>
              Keranjang masih kosong
            </p>
            <button 
              onClick={goBack}
              style={{
                marginTop: 20,
                background: "#6c757d",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14
              }}
            >
              Kembali Belanja
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div style={{ marginBottom: 32 }}>
              {cart.map((it, index) => (
                <div
                  key={it._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 0",
                    borderBottom: index < cart.length - 1 ? "1px solid #eee" : "none",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: "600", 
                      fontSize: 16,
                      color: "#333",
                      marginBottom: 4
                    }}>
                      {it.name}
                    </div>
                    <div style={{ 
                      color: "#666", 
                      fontSize: 14 
                    }}>
                      Rp {it.price.toLocaleString()}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 12,
                    margin: "0 20px"
                  }}>
                    <button 
                      onClick={() => dec(it._id)}
                      style={{
                        width: 32,
                        height: 32,
                        border: "1px solid #ddd",
                        background: "#f8f9fa",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#dc3545",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      -
                    </button>
                    <span style={{
                      minWidth: 24,
                      textAlign: "center",
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#333"
                    }}>
                      {it.qty}
                    </span>
                    <button 
                      onClick={() => inc(it._id)}
                      style={{
                        width: 32,
                        height: 32,
                        border: "1px solid #ddd",
                        background: "#f8f9fa",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#28a745",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      +
                    </button>
                  </div>

                  {/* Item Total */}
                  <div style={{ 
                    fontWeight: "600",
                    fontSize: 16,
                    color: "#333",
                    minWidth: 100,
                    textAlign: "right"
                  }}>
                    Rp {(it.price * it.qty).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={{ 
              backgroundColor: "#f8f9fa", 
              padding: 24, 
              borderRadius: 12,
              marginBottom: 32
            }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                marginBottom: 12,
                fontSize: 15
              }}>
                <span style={{ color: "#666" }}>Subtotal</span>
                <span style={{ fontWeight: "600", color: "#333" }}>
                  Rp {subtotal.toLocaleString()}
                </span>
              </div>
              
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                marginBottom: 16,
                fontSize: 15
              }}>
                <span style={{ color: "#666" }}>Pajak (10%)</span>
                <span style={{ fontWeight: "600", color: "#333" }}>
                  Rp {tax.toLocaleString()}
                </span>
              </div>
              
              <div style={{
                borderTop: "2px solid #dee2e6",
                paddingTop: 16,
                display: "flex",
                justifyContent: "space-between",
                fontSize: 18,
              }}>
                <span style={{ fontWeight: "bold", color: "#333" }}>Total</span>
                <span style={{ 
                  fontWeight: "bold", 
                  color: "#d9480f",
                  fontSize: 20
                }}>
                  Rp {total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <div style={{ textAlign: "center" }}>
              <button
                onClick={goToPayment}
                disabled={loading}
                style={{
                  background: loading 
                    ? "#6c757d" 
                    : "linear-gradient(135deg, #f59f00, #f76707)",
                  color: "white",
                  padding: "16px 32px",
                  fontSize: 16,
                  fontWeight: "bold",
                  border: "none",
                  borderRadius: 12,
                  cursor: loading ? "not-allowed" : "pointer",
                  width: "100%",
                  maxWidth: 300,
                  transition: "all 0.3s",
                  boxShadow: loading 
                    ? "none" 
                    : "0 4px 12px rgba(247, 103, 7, 0.3)",
                  transform: loading ? "none" : "translateY(0)",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 16px rgba(247, 103, 7, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 12px rgba(247, 103, 7, 0.3)";
                  }
                }}
              >
                {loading ? (
                  <>
                    <span style={{ 
                      display: "inline-block",
                      width: 16,
                      height: 16,
                      border: "2px solid #fff",
                      borderTop: "2px solid transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                      marginRight: 8
                    }}></span>
                    Memproses...
                  </>
                ) : (
                  "Continue to Payment →"
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* CSS for loading animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}