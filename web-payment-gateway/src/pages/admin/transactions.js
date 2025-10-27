import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminNav from "../../components/AdminNav";

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!user) router.replace("/login");
    else {
      const userObj = JSON.parse(user);
      if (!userObj.isAdmin) router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    async function fetchTransactions() {
      const res = await fetch("/api/transactions?all=1");
      setTransactions(await res.json());
    }
    fetchTransactions();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-blue-100 dark:from-black dark:to-zinc-900 p-8">
      <AdminNav active="transactions" />
      <h1 className="text-2xl font-bold mb-6 text-blue-700 dark:text-zinc-50">Data Transaksi</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-800">
          <thead className="bg-blue-50 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-2">Tanggal</th>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((trx, i) => (
              <tr key={trx._id} className={i % 2 === 0 ? "bg-white dark:bg-zinc-950 hover:bg-blue-50 dark:hover:bg-zinc-900" : "bg-blue-50 dark:bg-zinc-900 hover:bg-blue-100 dark:hover:bg-zinc-800"}>
                <td className="px-4 py-2 whitespace-nowrap">{new Date(trx.createdAt).toLocaleString()}</td>
                <td className="px-4 py-2">{trx.user?.name || '-'}</td>
                <td className="px-4 py-2">Rp {trx.totalPrice.toLocaleString()}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${trx.status === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : trx.status === 'FAILED' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'}`}>{trx.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
