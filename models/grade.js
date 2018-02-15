const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const GradeSchema = new mongoose.Schema({
  weight: {
    type: Number,
    default: 0,
    required: true
  },
  short: {
    type: String,
    required: false,
    trim: true,
    minlength: 1
  },
  long: {
    type: String,
    required: false,
    trim: true,
    minlength: 1
  },
  user: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  created: {
    type: Date,
    required: false,
  },
  edited: {
     type: Date,
     required: false
  }
});

const Grade = mongoose.model('category', GradeSchema);
module.exports = Grade;