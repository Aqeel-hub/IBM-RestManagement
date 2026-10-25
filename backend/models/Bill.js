const mongoose = require('mongoose');
module.exports = mongoose.model('Bill', new mongoose.Schema({
  receiptNo: String,
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', unique: true },
  tableNumber: Number,
  items: [{ name: String, price: Number, qty: Number, _id: false }],
  subtotal: Number,
  discount: { type: Number, default: 0 },
  taxRate: Number,
  tax: Number,
  total: Number,
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cash', 'card', 'upi'] },
  biller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paidAt: Date,
}, { timestamps: true }));
