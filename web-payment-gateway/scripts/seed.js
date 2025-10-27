import mongoose from "mongoose";
import Product from "../models/Product.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

const products = [
  {
    name: "Nasi Goreng",
    description: "Nasi goreng spesial ala resto",
    price: 25000,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=200&fit=crop",
  },
  {
    name: "Mie Ayam",
    description: "Mie ayam dengan topping ayam manis",
    price: 20000,
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=200&fit=crop",
  },
  {
    name: "Es Teh Manis",
    description: "Segelas es teh manis dingin",
    price: 5000,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=200&fit=crop",
  },
  {
    name: "Ayam Bakar",
    description: "Ayam bakar bumbu kecap manis",
    price: 30000,
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=300&h=200&fit=crop",
  },
  {
    name: "Gado-Gado",
    description: "Gado-gado segar dengan bumbu kacang",
    price: 18000,
    image: "https://static.promediateknologi.id/crop/0x541:1920x1650/750x500/webp/photo/p1/828/2024/03/11/inna-safa-5SXubfLjTWY-unsplash-2672807430.jpg",
  },
  {
    name: "Soto Ayam",
    description: "Soto ayam kuning dengan telur",
    price: 22000,
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=300&h=200&fit=crop",
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    await Product.deleteMany({});
    console.log("🧹 Cleared old products");

    await Product.insertMany(products);
    console.log("🍽️ Inserted mock products successfully");

    mongoose.connection.close();
    console.log("🔌 Connection closed");
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    process.exit(1);
  }
}

seed();
