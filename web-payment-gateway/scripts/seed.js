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
      {
        name: "Nasi Goreng",
        price: 25000,
        description: "Nasi goreng spesial ala resto",
        image:
          "https://images.unsplash.com/photo-1604908177522-4327d25c5bbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      },
      {
        name: "Mie Ayam",
        price: 20000,
        description: "Mie ayam dengan topping ayam manis",
        image:
          "https://images.unsplash.com/photo-1626081339840-8ee06d325a56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      },
      {
        name: "Es Teh Manis",
        price: 5000,
        description: "Es Teh Manis Solo",
        image:
          "https://images.unsplash.com/photo-1587740896339-713fae348b3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      },
    ]);

    console.log("✅ Data berhasil dimasukkan!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Gagal seeding:", err);
    process.exit(1);
  }
}

seed();
