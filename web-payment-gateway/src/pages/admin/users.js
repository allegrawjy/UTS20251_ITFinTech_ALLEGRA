import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminNav from "../../components/AdminNav";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
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
    async function fetchUsers() {
      const res = await fetch("/api/users?all=1");
      setUsers(await res.json());
    }
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-blue-100 dark:from-black dark:to-zinc-900 p-8">
      <AdminNav active="users" />
      <h1 className="text-2xl font-bold mb-6 text-blue-700 dark:text-zinc-50">Data User</h1>
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
  );
}
