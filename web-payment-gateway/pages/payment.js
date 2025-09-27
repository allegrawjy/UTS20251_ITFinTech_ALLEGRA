import { useEffect, useState } from "react";

export default function Payment() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "Customer Demo",
    email: "demo@example.com", 
    phone: "08123456789"
  });

  useEffect(() => {
    // Load data dari localStorage yang dikirim dari checkout
    const paymentDataString = localStorage.getItem("paymentData");
    if (paymentDataString) {
      const paymentData = JSON.parse(paymentDataString);
      setItems(paymentData.items || []);
      setCustomerInfo({
        name: paymentData.customerName || "Customer Demo",
        email: paymentData.email || "demo@example.com",
        phone: paymentData.phone || "08123456789"
      });
    } else {
      // Fallback ke mock data jika tidak ada data
      const mockItems = [
        { _id: "1", name: "Nasi Goreng", price: 25000, qty: 1 },
        { _id: "2", name: "Mie Ayam", price: 20000, qty: 2 },
        { _id: "3", name: "Es Teh Manis", price: 5000, qty: 1 }
      ];
      setItems(mockItems);
    }
  }, []);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Hit API untuk membuat invoice Xendit
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items,
          customerName: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          total: total
        }),
      });
      
      const json = await res.json();
      
      if (!json.success) {
        alert(`Gagal membuat invoice: ${json.message}`);
        setLoading(false);
        return;
      }
      
      // REDIRECT KE XENDIT PAYMENT PAGE
      console.log('Redirecting to Xendit:', json.invoiceUrl);
      window.location.href = json.invoiceUrl;
      
    } catch (err) {
      console.error('Payment Error:', err);
      alert("Terjadi error saat menghubungi payment gateway. Pastikan API sudah running.");
      setLoading(false);
    }
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <div style={{ 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      minHeight: "100vh", 
      padding: "40px 20px" 
    }}>
      <div
        style={{
          maxWidth: 500,
          margin: "0 auto",
          background: "#fff",
          padding: 40,
          borderRadius: 20,
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          marginBottom: 32,
          borderBottom: "2px solid #f0f0f0",
          paddingBottom: 20
        }}>
          <button 
            onClick={goBack}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              marginRight: 16,
              color: "#666",
              padding: 8,
              borderRadius: 8,
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
            💳 Payment
          </h1>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
            <p style={{ fontSize: 18, color: "#888", margin: 0 }}>
              Tidak ada pesanan untuk dibayar
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
              Kembali
            </button>
          </div>
        ) : (
          <>
            {/* Order Summary */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ 
                fontSize: 18, 
                fontWeight: "600",
                marginBottom: 20,
                color: "#333"
              }}>
                📋 Ringkasan Pesanan
              </h3>
              
              <div style={{
                background: "#f8f9fa",
                borderRadius: 12,
                padding: 20,
                marginBottom: 24
              }}>
                {items.map((item, index) => (
                  <div
                    key={item._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 0",
                      borderBottom: index < items.length - 1 ? "1px solid #dee2e6" : "none",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "600", color: "#333", marginBottom: 2 }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: 14, color: "#666" }}>
                        {item.qty} x Rp {item.price.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ fontWeight: "600", color: "#333" }}>
                      Rp {(item.price * item.qty).toLocaleString()}
                    </div>
                  </div>
                ))}
                
                {/* Totals */}
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "2px solid #dee2e6" }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    marginBottom: 8,
                    fontSize: 14
                  }}>
                    <span style={{ color: "#666" }}>Subtotal</span>
                    <span style={{ color: "#333" }}>Rp {subtotal.toLocaleString()}</span>
                  </div>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    marginBottom: 12,
                    fontSize: 14
                  }}>
                    <span style={{ color: "#666" }}>Pajak (10%)</span>
                    <span style={{ color: "#333" }}>Rp {tax.toLocaleString()}</span>
                  </div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 18,
                    fontWeight: "bold"
                  }}>
                    <span style={{ color: "#333" }}>Total</span>
                    <span style={{ color: "#e67e22" }}>
                      Rp {total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ 
                fontSize: 18, 
                fontWeight: "600",
                marginBottom: 20,
                color: "#333"
              }}>
                👤 Informasi Pelanggan
              </h3>
              
              <div style={{
                background: "#f8f9fa",
                borderRadius: 12,
                padding: 20,
              }}>
                <div style={{ marginBottom: 12 }}>
                  <strong style={{ color: "#333" }}>Nama:</strong> 
                  <span style={{ marginLeft: 8, color: "#666" }}>{customerInfo.name}</span>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong style={{ color: "#333" }}>Email:</strong> 
                  <span style={{ marginLeft: 8, color: "#666" }}>{customerInfo.email}</span>
                </div>
                <div>
                  <strong style={{ color: "#333" }}>Phone:</strong> 
                  <span style={{ marginLeft: 8, color: "#666" }}>{customerInfo.phone}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ 
                fontSize: 18, 
                fontWeight: "600",
                marginBottom: 20,
                color: "#333"
              }}>
                💰 Metode Pembayaran
              </h3>
              
              <div style={{
                background: "#f8f9fa",
                borderRadius: 12,
                padding: 20,
                textAlign: "center"
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏦</div>
                <div style={{ fontWeight: "600", color: "#333", marginBottom: 4 }}>
                  Xendit Payment Gateway
                </div>
                <div style={{ fontSize: 14, color: "#666" }}>
                  Bank Transfer, E-Wallet, Credit Card
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <div style={{ textAlign: "center" }}>
              <button
                onClick={handlePayment}
                disabled={loading}
                style={{
                  background: loading 
                    ? "#6c757d" 
                    : "linear-gradient(135deg, #28a745, #20c997)",
                  color: "white",
                  padding: "16px 32px",
                  fontSize: 18,
                  fontWeight: "bold",
                  border: "none",
                  borderRadius: 12,
                  cursor: loading ? "not-allowed" : "pointer",
                  width: "100%",
                  transition: "all 0.3s",
                  boxShadow: loading 
                    ? "none" 
                    : "0 4px 12px rgba(40, 167, 69, 0.3)",
                  transform: loading ? "none" : "translateY(0)",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 16px rgba(40, 167, 69, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 12px rgba(40, 167, 69, 0.3)";
                  }
                }}
              >
                {loading ? (
                  <>
                    <span style={{ 
                      display: "inline-block",
                      width: 20,
                      height: 20,
                      border: "3px solid #fff",
                      borderTop: "3px solid transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                      marginRight: 10
                    }}></span>
                    Memproses Pembayaran...
                  </>
                ) : (
                  <>
                    🚀 Bayar Sekarang - Rp {total.toLocaleString()}
                  </>
                )}
              </button>
              
              {loading && (
                <p style={{ 
                  marginTop: 16, 
                  fontSize: 14, 
                  color: "#666",
                  fontStyle: "italic" 
                }}>
                  Mohon tunggu, sedang menghubungkan ke payment gateway...
                </p>
              )}
            </div>

            {/* Security Notice */}
            <div style={{
              marginTop: 24,
              padding: 16,
              background: "#e3f2fd",
              borderRadius: 8,
              border: "1px solid #bbdefb"
            }}>
              <div style={{ display: "flex", alignItems: "center", fontSize: 14 }}>
                <span style={{ marginRight: 8 }}>🔒</span>
                <span style={{ color: "#1565c0" }}>
                  Pembayaran Anda diamankan dengan enkripsi SSL 256-bit
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}