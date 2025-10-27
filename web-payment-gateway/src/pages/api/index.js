import { useEffect, useState, useRef } from "react";
import { ShoppingCart, User, LogOut, ChevronDown, Plus, Minus } from "lucide-react";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    loadCartFromStorage();
    loadUserData();
  }, []);

  // Fetch products from API
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }
    fetchProducts();
  }, []);

  // Load user data dari localStorage
  function loadUserData() {
    if (typeof window === 'undefined') return;
    
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (e) {
        console.error("Error parsing user data:", e);
        setUser(null);
      }
    }
  }

  function loadCartFromStorage() {
    if (typeof window === 'undefined') return;
    
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        const cartArr = JSON.parse(storedCart);
        setCart(cartArr);
        updateCartCount(cartArr);
      } catch (e) {
        console.error("Error parsing cart:", e);
        setCart([]);
      }
    }
  }

  function updateCartCount(cartArr = cart) {
    const totalItems = cartArr.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(totalItems);
  }

  function saveCartToStorage(cartArr) {
    if (typeof window === 'undefined') return;
    localStorage.setItem("cart", JSON.stringify(cartArr));
  }

  function getProductQuantity(productId) {
    const item = cart.find((item) => item._id === productId);
    return item ? item.quantity : 0;
  }

  function addToCart(product) {
    const exist = cart.find((item) => item._id === product._id);
    let newCart;
    
    if (exist) {
      newCart = cart.map((item) =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }
    
    setCart(newCart);
    updateCartCount(newCart);
    saveCartToStorage(newCart);
  }

  function updateQuantity(productId, change) {
    const newCart = cart.map((item) => {
      if (item._id === productId) {
        const newQuantity = item.quantity + change;
        return { ...item, quantity: Math.max(0, newQuantity) };
      }
      return item;
    }).filter(item => item.quantity > 0);
    
    setCart(newCart);
    updateCartCount(newCart);
    saveCartToStorage(newCart);
  }

  // Fungsi logout
  function handleLogout() {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    setUser(null);
    setDropdownOpen(false);
    
    alert("Berhasil logout!");
    window.location.href = "/login";
  }

  // Close dropdown ketika klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function getInitials(name) {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      {/* Header */}
      <header className="w-full py-4 px-6 flex justify-between items-center bg-gray-950 shadow-lg border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="font-bold text-2xl text-white">
            🍜 Allegra Foodies
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Keranjang Button */}
          <button 
            onClick={() => window.location.href = "/cart"}
            className="relative bg-amber-600 text-white px-4 py-2 rounded-full hover:bg-amber-700 transition font-semibold flex items-center gap-2 shadow-lg"
          >
            <ShoppingCart size={20} />
            <span>Keranjang</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>

          {/* User Dropdown */}
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 transition rounded-full px-3 py-2 shadow-md"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {getInitials(user.name)}
                </div>
                <span className="text-sm font-semibold text-white hidden sm:block">
                  {user.name}
                </span>
                <ChevronDown 
                  size={16} 
                  className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {getInitials(user.name)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    
                    {/* Role Badge */}
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isAdmin 
                          ? 'bg-purple-900 text-purple-300'
                          : 'bg-blue-900 text-blue-300'
                      }`}>
                        {user.isAdmin ? 'Admin' : 'User'}
                      </span>
                      
                      {user.isVerified && (
                        <span className="ml-2 inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-900 text-green-300">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left hover:bg-gray-700 transition flex items-center gap-3 text-red-400"
                    >
                      <LogOut size={18} />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Login Button jika belum login */}
          {!user && (
            <button 
              onClick={() => window.location.href = "/login"}
              className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-full hover:from-purple-600 hover:to-blue-700 transition font-semibold flex items-center gap-2 shadow-lg"
            >
              <User size={18} />
              Login
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-white">
          Menu Spesial Kami
        </h1>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const qty = getProductQuantity(product._id);
              
              return (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h2 className="font-bold text-xl mb-2 text-gray-800">
                      {product.name}
                    </h2>
                    <p className="text-sm text-gray-500 mb-3">
                      {product.description || product.category}
                    </p>
                    <p className="font-bold text-2xl text-amber-600 mb-4">
                      Rp {product.price.toLocaleString()}
                    </p>

                    {/* Add Button or Quantity Control */}
                    {qty === 0 ? (
                      <button
                        onClick={() => addToCart(product)}
                        className="w-full bg-amber-600 text-white py-3 rounded-xl font-semibold hover:bg-amber-700 transition shadow-md flex items-center justify-center gap-2"
                      >
                        Add +
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-gray-100 rounded-xl p-2">
                        <button
                          onClick={() => updateQuantity(product._id, -1)}
                          className="w-10 h-10 flex items-center justify-center bg-white hover:bg-gray-200 rounded-lg transition shadow-sm"
                        >
                          <Minus className="w-5 h-5 text-gray-700" />
                        </button>
                        <span className="font-bold text-xl text-gray-800 min-w-[40px] text-center">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(product._id, 1)}
                          className="w-10 h-10 flex items-center justify-center bg-amber-600 hover:bg-amber-700 rounded-lg transition shadow-sm"
                        >
                          <Plus className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Cart Summary */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-50 border border-gray-700">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} />
            <span className="font-semibold">{cartCount} item(s)</span>
          </div>
          <span className="text-amber-400 font-bold">
            Rp {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}
          </span>
          <button 
            onClick={() => window.location.href = "/cart"}
            className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-full font-semibold transition"
          >
            Tap to checkout
          </button>
        </div>
      )}
    </div>
  );
}