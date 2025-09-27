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
      const sample = [
        { name: "Ayam Pop", price: 25000, image: "https://assets.unileversolutions.com/v1/883086.jpg", description: "Ayam lembut dengan kuah gurih" },
        { name: "Rendang", price: 30000, image: "https://soyummyrecipes.com/wp-content/uploads/2020/04/Beef-rendang-1-1.jpg.webp", description: "Daging sapi bumbu rempah" },
        { name: "Gulai Tunjang", price: 28000, image: "https://www.topwisata.info/wp-content/uploads/2023/08/Gulai-Tunjang.webp", description: "Gulai kaki sapi khas Minang" },
      ];
      const data = await Product.insertMany(sample);
      return res.json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: "Method Not Allowed" });
}
