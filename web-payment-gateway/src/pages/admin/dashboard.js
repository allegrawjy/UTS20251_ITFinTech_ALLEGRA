import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AdminNav from "../../components/AdminNav";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({ totalSales: 0, totalOrders: 0, totalUsers: 0 });
  const [salesData, setSalesData] = useState({ labels: [], totals: [] });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Auth check
    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!user) router.replace("/login");
    else {
      const userObj = JSON.parse(user);
      if (!userObj.isAdmin) router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const [prodRes, trxRes, userRes, analyticRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/transactions?all=1"),
        fetch("/api/users?all=1"),
        fetch("/api/transactions?analytics=1"),
      ]);
      const productsData = await prodRes.json();
      const transactionsData = await trxRes.json();
      const usersData = await userRes.json();
      const analyticsData = await analyticRes.json();
      setProducts(productsData);
      setTransactions(transactionsData);
      setUsers(usersData);
      setAnalytics(analyticsData);

      // Grafik penjualan per hari
      const salesByDate = {};
      transactionsData.forEach(t => {
        const date = new Date(t.createdAt).toLocaleDateString();
        salesByDate[date] = (salesByDate[date] || 0) + t.totalPrice;
      });
      setSalesData({ labels: Object.keys(salesByDate), totals: Object.values(salesByDate) });
      setLoading(false);
    }
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-blue-100 dark:from-black dark:to-zinc-900 p-8">
      <AdminNav active="dashboard" />
      <h1 className="text-3xl font-bold mb-8 text-blue-700 dark:text-zinc-50">Admin Dashboard</h1>
      {loading ? <div>Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Analytics & Charts */}
          <div className="bg-white dark:bg-zinc-950 rounded-lg shadow p-6 flex flex-col gap-4 col-span-1 md:col-span-2 lg:col-span-3">
            <h2 className="text-xl font-bold mb-2">Data Analitik</h2>
            <div>Total Penjualan: <span className="font-bold text-green-600">Rp {analytics.totalSales}</span></div>
            <div>Total Order: <span className="font-bold text-blue-600">{analytics.totalOrders}</span></div>
            <div>Total User: <span className="font-bold text-purple-600">{analytics.totalUsers}</span></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <h3 className="font-semibold mb-2">Grafik Bar Penjualan</h3>
                <Bar data={{ labels: salesData.labels, datasets: [{ label: 'Penjualan', data: salesData.totals, backgroundColor: '#3b82f6' }] }} />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Grafik Line Penjualan</h3>
                <Line data={{ labels: salesData.labels, datasets: [{ label: 'Penjualan', data: salesData.totals, borderColor: '#10b981', backgroundColor: '#d1fae5' }] }} />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Grafik Pie Order</h3>
                <Pie data={{ labels: salesData.labels, datasets: [{ label: 'Order', data: salesData.totals, backgroundColor: salesData.labels.map((_, i) => `hsl(${i * 40},70%,70%)`) }] }} />
              </div>
            </div>
          </div>
          {/* Products CRUD */}
          <div className="bg-white dark:bg-zinc-950 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-2">Produk</h2>
            <Link href="/admin/products" className="text-blue-600 hover:underline">Kelola Produk</Link>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-800">
                <thead className="bg-blue-50 dark:bg-zinc-900">
                  <tr>
                    <th className="px-4 py-2 text-left">Nama</th>
                    <th className="px-4 py-2 text-left">Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={p._id} className={i % 2 === 0 ? "bg-white dark:bg-zinc-950" : "bg-blue-50 dark:bg-zinc-900"}>
                      <td className="px-4 py-2 font-medium">{p.name}</td>
                      <td className="px-4 py-2">Rp {p.price.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Transactions Table */}
          <div className="bg-white dark:bg-zinc-950 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-2">Transaksi</h2>
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
          {/* Users Table */}
          <div className="bg-white dark:bg-zinc-950 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-2">User</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-800">
                <thead className="bg-blue-50 dark:bg-zinc-900">
                  <tr>
                    <th className="px-4 py-2">Nama</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">WhatsApp</th>
                    <th className="px-4 py-2">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u._id} className={i % 2 === 0 ? "bg-white dark:bg-zinc-950 hover:bg-blue-50 dark:hover:bg-zinc-900" : "bg-blue-50 dark:bg-zinc-900 hover:bg-blue-100 dark:hover:bg-zinc-800"}>
                      <td className="px-4 py-2 font-medium">{u.name}</td>
                      <td className="px-4 py-2">{u.email}</td>
                      <td className="px-4 py-2">{u.whatsappNumber}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.isAdmin ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'}`}>{u.isAdmin ? 'Admin' : 'User'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
