// pages/api/products.js
import connectDB from "../../../lib/db";
import Product from "../../../models/Product";

export default async function handler(req, res) {
  try {
    await connectDB();

    if (req.method === "GET") {
      const products = await Product.find({});
      return res.status(200).json(products);
    }

    if (req.method === "POST") {
      const { name, price, image, description } = req.body;
      if (!name || !price || !image) {
        return res
          .status(400)
          .json({ message: "Field wajib: name, price, image" });
      }
      const product = await Product.create({ name, price, image, description });
      return res.status(201).json(product);
    }

    if (req.method === "PUT") {
      const { id } = req.query;
      const { name, price, image, description } = req.body;
      const product = await Product.findByIdAndUpdate(
        id,
        { name, price, image, description },
        { new: true }
      );
      if (!product)
        return res.status(404).json({ message: "Produk tidak ditemukan" });
      return res.json(product);
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      const product = await Product.findByIdAndDelete(id);
      if (!product)
        return res.status(404).json({ message: "Produk tidak ditemukan" });
      return res.json({ message: "Produk dihapus" });
    }

    res.status(405).json({ message: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error("❌ API /products error:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
