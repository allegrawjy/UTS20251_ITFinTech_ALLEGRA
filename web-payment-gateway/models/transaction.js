// File: models/transaction.js
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true },
        image: { type: String },
      },
    ],
    totalPrice: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['PAID', 'SETTLED', 'PENDING', 'FAILED', 'EXPIRED'],
      required: true,
      default: 'PENDING',
    },
    invoiceUrl: { type: String },
    xenditInvoiceId: { type: String },
    paidAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
export default Transaction;