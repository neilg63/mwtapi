const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const ExplanationSchema = new mongoose.Schema({
  text: {
    type: String,
    required: false,
    trim: true,
    minlength: 1
  },
  media: [{
    type: ObjectId,
    ref: 'Media'
  }],
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

const Explanation = mongoose.model('explanation', ExplanationSchema);
module.exports = Explanation;