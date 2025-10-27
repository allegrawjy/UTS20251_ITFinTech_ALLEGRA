import connectDB from '../../../lib/db';
import Transaction from '../../../models/transaction';
import User from '../../../models/user';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    if (req.query.analytics === '1') {
      // Analitik
      const transactions = await Transaction.find({ status: 'PAID' });
      const totalSales = transactions.reduce((sum, trx) => sum + trx.totalPrice, 0);
      const totalOrders = transactions.length;
      // Hitung user unik
      const userIds = new Set(transactions.map(trx => trx.user.toString()));
      const totalUsers = userIds.size;
      return res.json({ totalSales, totalOrders, totalUsers });
    }
    if (req.query.all === '1') {
      // Semua transaksi untuk datatable
      const transactions = await Transaction.find({}).populate('user');
      return res.json(transactions);
    }
    return res.status(400).json({ message: 'Invalid query' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { cart, user } = req.body;
  if (!cart || !user) {
    return res.status(400).json({ message: 'Missing cart or user' });
  }

  // Hitung total harga
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Simpan transaksi ke database
  const transaction = await Transaction.create({
    user: user._id,
    items: cart.map(item => ({
      product: item._id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
    })),
    totalPrice,
    status: 'PENDING',
  });

  // Integrasi Xendit
  const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
  const successUrl = process.env.SUCCESS_URL || 'http://localhost:3000/success';
  const failureUrl = process.env.FAILURE_URL || 'http://localhost:3000/failure';

  try {
    const response = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64'),
      },
      body: JSON.stringify({
        external_id: transaction._id.toString(),
        payer_email: user.email,
        description: 'Pembayaran Allegra Foodies',
        amount: totalPrice,
        success_redirect_url: successUrl,
        failure_redirect_url: failureUrl,
      }),
    });
    const invoice = await response.json();
    if (!invoice.invoice_url) throw new Error(invoice.message || 'Gagal membuat invoice Xendit');

    // Simpan invoice url ke transaksi
    transaction.invoiceUrl = invoice.invoice_url;
    await transaction.save();

    return res.status(200).json({ invoiceUrl: invoice.invoice_url });
  } catch (err) {
    return res.status(500).json({ message: 'Gagal integrasi Xendit', error: err.message });
  }
}
