const mongoose = require('mongoose');
module.exports = mongoose.model('Table', new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  seats: { type: Number, default: 4 },
  status: { type: String, enum: ['free', 'occupied', 'billing'], default: 'free' },
}));
