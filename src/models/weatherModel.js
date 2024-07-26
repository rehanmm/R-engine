const mongoose  = require("mongoose");

const weatherSchema = new mongoose.Schema({
    city: String,
    main: String,
    temp: Number,
    feels_like: Number,
    dt: Number,
  });

module.exports=mongoose.model('Weather',weatherSchema);

