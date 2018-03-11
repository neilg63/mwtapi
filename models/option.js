const mongoose = require('mongoose');
const TimingSchema = require('./timing');
const ScaleSchema = require('./scale');
const FeedbackSchema = require('./feedback');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const Mixed = Schema.Types.Mixed;

let OptionSchema = new mongoose.Schema({
  weight: {
    type:Number,
    default: 0,
    required: true
  },
  status: {
    type: String,
    enum: ['subjective','correct','partial','incorrect'],
    default: "subjective"
  },
  text: {
    type: String,
    required: false,
    trim: true,
    minlength: 1
  },
  valid: {
  	type: Boolean,
  	required: false
  },
  data: {
    type: Mixed,
    required: false
  },
  media: {
    type: ObjectId,
    ref: 'Media',
    required: false
  },
  feedback: {
  	type: FeedbackSchema,
  	required: false
  },
  points: {
    type:Number,
    required: false
  },
  scales: {
  	type: [ScaleSchema],
  	required: false
  },
  number: {
    type:Number,
    required: false
  },
  matches: {
    type:Number,
    required: false
  },
  matchedId: {
  	type: String,
    required: false
  },
  matchedLabel: {
  	type: String,
    required: false,
    trim: true
  }
});


OptionSchema.virtual('isMatch').get(function() {
  let hasMatch = false;
  if (this.matches) {
  	if (typeof this.matches == 'number' && this.matches > 0) {
  		hasMatch = true;
  	}
  }
  return hasMatch;
});

OptionSchema.virtual('true').get(function() {
  let isTrue = false;
  if (this.valid === true) {
  	isTrue = true
  } else if (this.valid !== false) {
  	this.valid = /(yes|true|correct)/.test(this.text.toString().toLowerCase());
  }
  return isTrue;
});

OptionSchema.virtual('rank').get(function() {
  return parseInt(this.number);
});

module.exports = OptionSchema;