const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PermissionSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    trim: true,
    minlength: 5
  },
  title: {
  	type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  description: {
    type: String,
    required: false,
    default: "",
    trim: true
  }
});

const Permission = mongoose.model('permission', PermissionSchema);
module.exports = Permission;