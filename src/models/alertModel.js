const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  city: String,
  message: String,
});

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;