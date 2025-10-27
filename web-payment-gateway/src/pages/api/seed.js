import connectDB from '../../../lib/db';
import User from '../../../models/user';
import Product from '../../../models/product';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  await connectDB();

//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }

  try {
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';

    let admin = await User.findOne({ email: adminEmail });
    if (admin) {
      const adminObj = admin.toObject();
      delete adminObj.password;
      return res.status(200).json({ message: 'Admin already exists', admin: adminObj });
    }

    const hashed = await bcrypt.hash(adminPassword, 10);
    admin = await User.create({
      name: 'Admin',
      email: adminEmail,
      password: hashed,
      whatsappNumber: process.env.SEED_ADMIN_WHATSAPP || '6281234567890',
      isAdmin: true,
    });

    const adminObj = admin.toObject();
    delete adminObj.password;

    // Product seeding
    const productsCount = await Product.countDocuments();
    let productsSeeded = false;
    if (productsCount === 0) {
      const sampleProducts = [
        {
          name: 'Nasi Goreng Spesial',
          slug: 'nasi-goreng-spesial',
          category: 'Makanan',
          image: '/file.svg',
          brand: 'Warung Nusantara',
          price: 25000,
          countInStock: 50,
          description: 'Nasi goreng dengan topping lengkap dan rasa mantap.',
          rating: 4.8,
          numReviews: 12,
          featured: true,
        },
        {
          name: 'Ayam Bakar Taliwang',
          slug: 'ayam-bakar-taliwang',
          category: 'Makanan',
          image: '/file.svg',
          brand: 'Lombok Resto',
          price: 35000,
          countInStock: 30,
          description: 'Ayam bakar khas Lombok dengan sambal pedas.',
          rating: 4.7,
          numReviews: 8,
          featured: false,
        },
        {
          name: 'Es Teh Manis',
          slug: 'es-teh-manis',
          category: 'Minuman',
          image: '/file.svg',
          brand: 'Minuman Segar',
          price: 8000,
          countInStock: 100,
          description: 'Es teh manis segar untuk menemani makan Anda.',
          rating: 4.5,
          numReviews: 5,
          featured: false,
        },
      ];
      await Product.insertMany(sampleProducts);
      productsSeeded = true;
    }

    return res.status(201).json({ message: 'Seeding complete', admin: adminObj, productsSeeded });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Seeding failed' });
  }
}
