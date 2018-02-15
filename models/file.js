const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const FileSchema = new mongoose.Schema({
  uri: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  filesize: {
    type: Number,
    default: 0,
    required: false
  },
  local: {
    type: Boolean,
    default: true
  },
  dimensions: {
    type: [Number],
    required: false
  }
});

module.exports = FileSchema;