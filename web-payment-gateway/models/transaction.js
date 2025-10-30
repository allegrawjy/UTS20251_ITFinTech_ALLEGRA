import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  }
});

const TransactionSchema = new mongoose.Schema({
  external_id: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [ItemSchema],
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["PENDING", "PAID", "FAILED", "EXPIRED", "CANCELLED"],
    default: "PENDING"
  },
  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID", "SETTLED", "FAILED", "EXPIRED", "CANCELLED"],
    default: "PENDING"
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date
  },
  xenditInvoiceId: {
    type: String
  },
  xenditPaymentId: {
    type: String
  },
  invoiceUrl: {
    type: String
  },
  customerName: {
    type: String
  },
  customerEmail: {
    type: String
  },
  customerPhone: {
    type: String
  }
}, {
  timestamps: true
});

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

export default Transaction;