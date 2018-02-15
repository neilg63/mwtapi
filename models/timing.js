const mongoose = require('mongoose');

const TimingSchema = new mongoose.Schema({
  mode: {
    type: String,
    enum: ['parent', 'range','ignore'],
    required: true
  },
  min: {
    type: Number,
    default: 0,
    required: false
  },
  max: {
    type: Number,
    default: 0,
    required: false
  }
});

module.exports = TimingSchema;