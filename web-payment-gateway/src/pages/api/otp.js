import { useState } from "react";
import { useRouter } from "next/router";

export default function OTPPage() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const email = typeof window !== "undefined" ? localStorage.getItem("pendingEmail") : "";

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users?action=verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP salah");
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.removeItem("pendingEmail");
      if (data.user.isAdmin) router.replace("/admin");
      else router.replace("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-blue-100 dark:from-black dark:to-zinc-900">
      <form onSubmit={handleVerify} className="bg-white dark:bg-zinc-950 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-blue-700 dark:text-zinc-50">Verifikasi OTP</h1>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <input
          type="text"
          placeholder="Masukkan OTP"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          required
          className="w-full mb-6 px-4 py-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
        >
          {loading ? "Loading..." : "Verifikasi"}
        </button>
      </form>
    </div>
  );
}
