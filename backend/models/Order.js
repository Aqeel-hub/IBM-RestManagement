const mongoose = require('mongoose');
const itemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name: String,
  price: Number,
  qty: { type: Number, min: 1 },
}, { _id: false });

// open -> billing (waiter sent it to the biller) -> billed (bill generated)
module.exports = mongoose.model('Order', new mongoose.Schema({
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  waiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [itemSchema],
  note: String,
  status: { type: String, enum: ['open', 'billing', 'billed'], default: 'open' },
}, { timestamps: true }));
