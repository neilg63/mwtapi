const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const RoleSchema = new mongoose.Schema({
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
  remoteLogin: {
    type: Boolean,
    default: false
  },
  permissions: [{
    type: SchemaTypes.ObjectId,
    ref: 'Permission'
  }]
});

const Role = mongoose.model('role', RoleSchema);
module.exports = Role;