const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ScaleTypeSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: false
  },
  tag: {
    type: String,
    trim: true,
    required: false
  },
  mode: {
    type: String,
    enum: ['integer','float']
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 0
  }
});

const ScaleType = mongoose.model('scaleType', ScaleTypeSchema);
module.exports = ScaleType;