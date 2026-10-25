const mongoose = require('mongoose');
module.exports = mongoose.model('MenuItem', new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  available: { type: Boolean, default: true },
}, { timestamps: true }));
