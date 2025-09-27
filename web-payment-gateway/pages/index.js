// /pages/api/products.js
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const data = await Product.find().lean();
      return res.json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (req.method === "POST") {
    try {
      await Product.deleteMany({});
      const data = await Product.insertMany(sample);
      return res.json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: "Method Not Allowed" });
}
