const mongoose = require('mongoose');

const weatherSummarySchema = new mongoose.Schema({
  _id: {
    city: String,
    date: String,
  },
  avgTemp: Number,
  maxTemp: Number,
  minTemp: Number,
  dominantCondition: String,
});

const WeatherSummary = mongoose.model('WeatherSummary', weatherSummarySchema);

module.exports = WeatherSummary;