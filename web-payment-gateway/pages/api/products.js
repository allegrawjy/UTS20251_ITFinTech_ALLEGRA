import connectDB from '../../lib/mongodb';
import Product from '../../models/Product';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const products = await Product.find({ isActive: true });
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } 
  
  else if (req.method === 'POST') {
    try {
      const count = await Product.countDocuments();
      
      if (count === 0) {
        const defaultProducts = [
          {
            name: 'Nasi Goreng',
            description: 'Nasi goreng spesial ala resto',
            price: 25000,
            image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=200&fit=crop'
          },
          {
            name: 'Mie Ayam',
            description: 'Mie ayam dengan topping ayam manis',
            price: 20000,
            image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=200&fit=crop'
          },
          {
            name: 'Es Teh Manis',
            description: 'Segelas es teh manis dingin',
            price: 5000,
            image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=200&fit=crop'
          },
          {
            name: 'Ayam Bakar',
            description: 'Ayam bakar bumbu kecap manis',
            price: 30000,
            image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=300&h=200&fit=crop'
          },
          {
            name: 'Gado-Gado',
            description: 'Gado-gado segar dengan bumbu kacang',
            price: 18000,
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop'
          },
          {
            name: 'Soto Ayam',
            description: 'Soto ayam kuning dengan telur',
            price: 22000,
            image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=300&h=200&fit=crop'
          }
        ];
        
        await Product.insertMany(defaultProducts);
        const products = await Product.find({ isActive: true });
        res.status(200).json({ success: true, data: products });
      } else {
        const products = await Product.find({ isActive: true });
        res.status(200).json({ success: true, data: products });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}