const mongoose = require('mongoose');
const Explanation = require('./explanation');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const Mixed = Schema.Types.Mixed;

const FeedbackSchema = new mongoose.Schema({
  min: {
    type:Number,
    default: 0,
    required: false
  },
  max: {
    type:Number,
    default: 0,
    required: false
  },
  criteria: {
  	type: Mixed,
  	required: false
  },
  validity: {
    type: String,
    enum: ['all','correct','partial','incorrect','range']
  },
  explanation: {
    type: ObjectId,
    ref: 'Explanation'
  }
});


module.exports = FeedbackSchema;