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
      const sample = [
        { 
          name: "Nasi Goreng", 
          price: 25000, 
          image: "https://images.unsplash.com/photo-1617196033954-3a9d27d44c6a", 
          description: "Nasi goreng spesial ala resto" 
        },
        { 
          name: "Mie Ayam", 
          price: 20000, 
          image: "https://images.unsplash.com/photo-1617191517304-2b7d8f8a8a0f", 
          description: "Mie ayam dengan topping ayam manis" 
        },
        { 
          name: "Es Teh Manis", 
          price: 5000, 
          image: "https://images.unsplash.com/photo-1527169402691-feff5539e52c", 
          description: "Segelas es teh manis dingin" 
        },
      ];
      const data = await Product.insertMany(sample);
      return res.json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: "Method Not Allowed" });
}
