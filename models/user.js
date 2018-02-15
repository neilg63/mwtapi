const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const UserSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    trim: true,
    minlength: 5
  },
  displayName: {
  	type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  loginMode: {
    type: String,
    enum: ['local','google','facebook','twitter','yahoo'],
  },
  roles: {
  	type: [ObjectId],
  	ref: 'Role'
  },
  marks: {
  	type: [ObjectId],
  	ref: "Mark",
  	required: false
  },
  password: {
  	type: String,
  	required: false,
  	minlength: 6,
  	maxlength: 16
  },
  user: {
    type: ObjectId,
    ref: 'User',
    required: false
  },
  status: {
    type: Number,
    enum: [0,1,2],
    default: 0
  },
  login: {
    type: Date,
    required: false,
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

const User = mongoose.model('User', UserSchema);
module.exports = User;