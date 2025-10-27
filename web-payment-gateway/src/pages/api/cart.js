import { useEffect, useState } from "react";
import { ArrowLeft, Trash2, Plus, Minus } from "lucide-react";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem("cart");
      
      if (storedCart) {
        try {
          const parsedCart = JSON.parse(storedCart);
          setCart(parsedCart);
        } catch (e) {
          console.error("Error parsing cart:", e);
          setCart([]);
        }
      }
    }
  }, []);

  function updateQuantity(id, qty) {
    setCart((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, quantity: Math.max(1, qty) } : item
      )
    );
  }

  function removeItem(id) {
    setCart((prev) => prev.filter((item) => item._id !== id));
  }

  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, mounted]);

  const subtotal = cart.reduce((a, c) => a + c.price * c.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  if (!mounted) {
    return null;
  }

  async function handleCheckout() {
    const storedCart = localStorage.getItem("cart");
    const storedUser = localStorage.getItem("user");
    if (!storedCart || !storedUser) {
      alert("Anda harus login dan memiliki produk di keranjang!");
      return;
    }
    const cartArr = JSON.parse(storedCart);
    const userObj = JSON.parse(storedUser);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: cartArr, user: userObj }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Checkout gagal");
      window.location.href = data.invoiceUrl;
    } catch (err) {
      alert("Checkout gagal: " + err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">Keranjang kosong</p>
              <button
                onClick={() => window.history.back()}
                className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition"
              >
                Mulai Belanja
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-6 mb-8">
                {cart.map((item) => (
                  <div key={item._id} className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg mb-1">
                        {item.name}
                      </h3>
                      <p className="text-gray-500 text-sm mb-3">
                        Rp {item.price.toLocaleString()}
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="w-12 text-center font-semibold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => removeItem(item._id)}
                          className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Item Total */}
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-800">
                        Rp {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">Rp {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Pajak (10%)</span>
                  <span className="font-semibold">Rp {tax.toLocaleString()}</span>
                </div>
                <div className="h-px bg-gray-200"></div>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-800">Total</span>
                  <span className="text-2xl font-bold text-amber-600">
                    Rp {total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-amber-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-amber-700 transition shadow-lg shadow-amber-200"
              >
                Continue to Payment →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}