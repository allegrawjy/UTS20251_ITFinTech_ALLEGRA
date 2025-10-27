import connectDB from '../../../lib/db';
import User from '../../../models/user';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  await connectDB();

  // OTP cache (global, untuk demo; gunakan Redis/DB untuk production)
  const otpCache = global.otpCache || (global.otpCache = {});

  if (req.method === 'POST') {
    const { action } = req.query;

    if (action === 'register') {
      const { name, email, password, whatsappNumber } = req.body;
      if (!name || !email || !password || !whatsappNumber) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email,
        password: hashed,
        whatsappNumber,
        isAdmin: false,
      });

      const userObj = user.toObject();
      delete userObj.password;
      return res.status(201).json(userObj);
    }

    if (action === 'login') {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const matched = await bcrypt.compare(password, user.password);
      if (!matched) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const userObj = user.toObject();
      delete userObj.password;
      return res.json(userObj);
    }

    if (action === 'send-otp') {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email wajib diisi' });
      }
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      // Simpan OTP ke cache
      otpCache[email] = otp;
      // Kirim OTP via Fonnte
      const FONNTE_API_TOKEN = process.env.FONNTE_API_TOKEN;
      const whatsapp = user.whatsappNumber;
      const message = `Kode OTP Allegra Foodies Anda: ${otp}`;
      await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': FONNTE_API_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ target: whatsapp, message }),
      });
      return res.status(200).json({ message: 'OTP dikirim ke WhatsApp' });
    }

    if (action === 'verify-otp') {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ message: 'Email dan OTP wajib diisi' });
      }
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }
      if (!otpCache[email]) {
        return res.status(404).json({ message: 'OTP tidak ditemukan atau sudah kadaluarsa' });
      }
      if (otpCache[email] !== otp) {
        return res.status(401).json({ message: 'OTP salah' });
      }
      delete otpCache[email];
      user.isVerified = true;
      await user.save();
      return res.status(200).json({ message: 'OTP valid', user });
    }

    return res.status(400).json({ message: 'Unknown action. Use ?action=register or ?action=login' });
  }

  if (req.method === 'GET') {
    if (req.query.all === '1') {
      const users = await User.find({});
      return res.json(users);
    }
    return res.status(400).json({ message: 'Invalid query' });
  }

  res.status(405).json({ message: 'Method not allowed. Use POST' });
}
