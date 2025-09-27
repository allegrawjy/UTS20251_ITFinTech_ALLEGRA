// /models/Payment.js
import mongoose from "mongoose";
const PaymentSchema = new mongoose.Schema(
  {
    invoiceId: String,
    externalId: String,
    amount: Number,
    currency: { type: String, default: "IDR" },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "EXPIRED", "CANCELLED"],
      default: "PENDING",
    },
    raw: Object, // simpan payload webhook
  },
  { timestamps: true }
);
export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);