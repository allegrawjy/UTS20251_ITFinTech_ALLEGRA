import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminNav from "@/components/AdminNav";

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({ name: "", price: "", image: "", description: "" });
    const [editing, setEditing] = useState(null);
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
        fetchProducts();
    }, []);

    async function fetchProducts() {
        const res = await fetch("/api/products");
        setProducts(await res.json());
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const method = editing ? "PUT" : "POST";
        const url = editing ? `/api/products?id=${editing}` : "/api/products";
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        if (res.ok) {
            setForm({ name: "", price: "", image: "", description: "" });
            setEditing(null);
            fetchProducts();
        }
    }

    async function handleDelete(id) {
        if (!confirm("Hapus produk ini?")) return;
        await fetch(`/api/products?id=${id}`, { method: "DELETE" });
        fetchProducts();
    }

    function handleEdit(product) {
        setForm({ name: product.name, price: product.price, image: product.image, description: product.description });
        setEditing(product._id);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-blue-100 dark:from-black dark:to-zinc-900 p-8">
            <AdminNav active="products" />
            <h1 className="text-2xl font-bold mb-6 text-blue-700 dark:text-zinc-50">Kelola Produk</h1>
            <form onSubmit={handleSubmit} className="mb-8 bg-white dark:bg-zinc-950 p-6 rounded-lg shadow flex flex-col gap-4 max-w-lg">
                <input type="text" placeholder="Nama" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="px-4 py-2 border rounded" />
                <input type="number" placeholder="Harga" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required className="px-4 py-2 border rounded" />
                <input type="text" placeholder="Image URL" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} required className="px-4 py-2 border rounded" />
                <textarea placeholder="Deskripsi" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="px-4 py-2 border rounded" />
                <button type="submit" className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">{editing ? "Update" : "Tambah"} Produk</button>
                {editing && <button type="button" className="bg-gray-400 text-white py-2 rounded font-semibold hover:bg-gray-500 transition" onClick={() => { setEditing(null); setForm({ name: "", price: "", image: "", description: "" }); }}>Batal Edit</button>}
            </form>
            <div className="overflow-x-auto">
                <table className="w-full text-sm rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-800">
                    <thead className="bg-blue-50 dark:bg-zinc-900">
                        <tr>
                            <th className="px-4 py-2">Nama</th>
                            <th className="px-4 py-2">Harga</th>
                            <th className="px-4 py-2">Image</th>
                            <th className="px-4 py-2">Deskripsi</th>
                            <th className="px-4 py-2">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p, i) => (
                            <tr key={p._id} className={i % 2 === 0 ? "bg-white dark:bg-zinc-950 hover:bg-blue-50 dark:hover:bg-zinc-900" : "bg-blue-50 dark:bg-zinc-900 hover:bg-blue-100 dark:hover:bg-zinc-800"}>
                                <td className="px-4 py-2 font-medium">{p.name}</td>
                                <td className="px-4 py-2">Rp {p.price.toLocaleString()}</td>
                                <td className="px-4 py-2"><img src={p.image} alt={p.name} className="h-12 w-12 object-contain rounded" /></td>
                                <td className="px-4 py-2">{p.description}</td>
                                <td className="px-4 py-2 flex gap-2">
                                    <button className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition" onClick={() => handleEdit(p)}>Edit</button>
                                    <button className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition" onClick={() => handleDelete(p._id)}>Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
