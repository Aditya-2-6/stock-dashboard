const mongoose = require('mongoose');

const HoldingSchema = new mongoose.Schema({
  ticker: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 }
});

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // New Field
  holdings: [HoldingSchema]
});

module.exports = mongoose.model('User', UserSchema);