import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!user) {
      router.replace("/login");
      return;
    }
    const userObj = JSON.parse(user);
    if (!userObj.isAdmin) {
      router.replace("/");
    } else {
      setIsAdmin(true);
    }
  }, [router]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-blue-100 dark:from-black dark:to-zinc-900">
      <div className="bg-white dark:bg-zinc-950 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4 text-blue-700 dark:text-zinc-50">Admin Panel</h1>
        <p className="text-lg text-gray-600 dark:text-zinc-400 mb-6">Selamat datang, Admin!</p>
        <div className="flex flex-col gap-4 mb-4">
          <Link href="/admin/dashboard" className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">Dashboard Admin</Link>
          <Link href="/admin/products" className="bg-purple-600 text-white py-2 rounded font-semibold hover:bg-purple-700 transition">Kelola Produk</Link>
        </div>
        <a href="/" className="text-blue-600 hover:underline">Kembali ke Home</a>
      </div>
    </div>
  );
}
