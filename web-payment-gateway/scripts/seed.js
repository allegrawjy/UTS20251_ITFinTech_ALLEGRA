import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";

// load .env.local
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("⚠️ Please define the MONGODB_URI in .env.local");
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);

    await Product.deleteMany({}); // kosongin collection
    await Product.insertMany([
      { name: "Nasi Goreng", price: 25000, description: "Nasi goreng spesial ala resto" },
      { name: "Mie Ayam", price: 20000, description: "Mie ayam dengan topping ayam manis" },
      { name: "Es Teh Manis", price: 5000, description: "Segelas es teh manis dingin" },
    ]);

    console.log("✅ Data berhasil dimasukkan!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Gagal seeding:", err);
    process.exit(1);
  }
}

seed();
