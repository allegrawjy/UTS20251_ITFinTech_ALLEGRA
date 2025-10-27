import Link from "next/link";

export default function AdminNav({ active }) {
    return (
        <nav className="flex gap-4 mb-8">
            <Link href="/admin/dashboard">
                <span className={`px-4 py-2 rounded font-semibold transition cursor-pointer ${active === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-blue-100 dark:hover:bg-blue-900'}`}>Dashboard</span>
            </Link>
            <Link href="/admin/products">
                <span className={`px-4 py-2 rounded font-semibold transition cursor-pointer ${active === 'products' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-purple-100 dark:hover:bg-purple-900'}`}>Produk</span>
            </Link>
            <Link href="/admin/users">
                <span className={`px-4 py-2 rounded font-semibold transition cursor-pointer ${active === 'users' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-green-100 dark:hover:bg-green-900'}`}>User</span>
            </Link>
            <Link href="/admin/transactions">
                <span className={`px-4 py-2 rounded font-semibold transition cursor-pointer ${active === 'transactions' ? 'bg-yellow-600 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-yellow-100 dark:hover:bg-yellow-900'}`}>Transaksi</span>
            </Link>
            <button
                onClick={() => {
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('user');
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                    }
                }}
                className={`px-4 py-2 rounded font-semibold transition cursor-pointer ${active === 'logout' ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-red-100 dark:hover:bg-red-900'}`}
            >
                Logout
            </button>
        </nav>
    );
}
