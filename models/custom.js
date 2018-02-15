const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const Mixed = Schema.Types.Mixed;

const CustomSchema = new mongoose.Schema({
  validity: {
    type: String,
    enum: ['info','correct','partial','incorrect','subjective']
  },
  text: {
    type: String,
    required: false,
    trim: true
  },
  value: {
  	type: Mixed,
  	required: false
  },
  edited: {
     type: Date,
     required: false
  }
});

const Custom = mongoose.model('custom', CustomSchema);
module.exports = Custom;