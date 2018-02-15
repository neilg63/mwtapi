const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ScaleSchema = new mongoose.Schema({
  tag: {
    type: String,
    trim: true,
    required: false
  },
  value: {
    type: Number,
    default: 0
  }
});

module.exports = ScaleSchema;