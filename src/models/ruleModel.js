const mongoose  = require("mongoose");

const ruleSchema = new mongoose.Schema({
  name:String,
  ruleString: {
    type: [String],
    // required: [true, "please provide a title"],
    trim: true,
    // maxlength: [20, "title cannot be more than 100 characters"],
  },
  AST: {
    type: String,
    // required: [true, "please give"],
    trim: true
  },
  params:String
},{
  timestamps:true
});

module.exports=mongoose.model('Rule',ruleSchema);