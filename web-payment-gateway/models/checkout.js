// /models/Checkout.js
import mongoose from "mongoose";
const ItemSchema = new mongoose.Schema({
  productId: mongoose.Schema.Types.ObjectId,
  name: String,
  price: Number,
  qty: Number,
});
const CheckoutSchema = new mongoose.Schema(
  {
    items: [ItemSchema],
    total: Number,
    status: {
      type: String,
      enum: ["PENDING", "PAID", "EXPIRED", "CANCELLED"],
      default: "PENDING",
    },
    customerName: String,
    email: String,
    phone: String,
    externalId: String, // id pesanan kita (harus sama dgn external_id di Xendit)
    invoiceId: String,  // id invoice dari Xendit
  },
  { timestamps: true }
);
export default mongoose.models.Checkout || mongoose.model("Checkout", CheckoutSchema);
