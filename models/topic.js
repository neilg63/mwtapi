const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const TopicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  text: {
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

const Topic = mongoose.model('topic', TopicSchema);
module.exports = Topic;