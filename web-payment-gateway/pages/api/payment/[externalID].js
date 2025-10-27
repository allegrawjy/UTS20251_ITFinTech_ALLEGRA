// /pages/api/payments/[externalId].js
import dbConnect from "@/lib/mongodb";
import Payment from "@/models/payment";
import Checkout from "@/models/checkout";

export default async function handler(req, res) {
  const { externalId } = req.query;
  await dbConnect();

  const payment = await Payment.findOne({ externalId }).lean();
  const checkout = await Checkout.findOne({ externalId }).lean();

  return res.json({
    success: true,
    externalId,
    status: payment?.status || checkout?.status || "PENDING",
    total: checkout?.total || payment?.amount || 0,
  });
}