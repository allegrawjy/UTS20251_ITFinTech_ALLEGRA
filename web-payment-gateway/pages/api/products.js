// /pages/api/products.js
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    const data = await Product.find().lean();
    return res.json({ success: true, data });
  }

  if (req.method === "POST") {
    // Seed dengan 9 menu + gambar
    const sample = [
      { name: "Ayam Pop", price: 25000, image: "/menu/ayam-pop.jpg" },
      { name: "Rendang", price: 30000, image: "/menu/rendang.jpg" },
      { name: "Gulai Tunjang", price: 28000, image: "/menu/gulai-tunjang.jpg" },
    ];
    await Product.deleteMany({});
    const data = await Product.insertMany(sample);
    return res.json({ success: true, data });
  }

  return res.status(405).end();
}
