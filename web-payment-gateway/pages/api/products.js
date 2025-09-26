import dbConnect from "../../lib/mongodb";
import Product from "../../models/Product";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    const products = await Product.find();
    return res.status(200).json({ success: true, data: products });
  }

  if (req.method === "POST") {
    const product = await Product.create(req.body);
    return res.status(201).json({ success: true, data: product });
  }

  res.status(405).json({ error: "Method not allowed" });
}
