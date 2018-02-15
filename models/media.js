const mongoose = require('mongoose');
const FileSchema = require('./file');
const Schema = mongoose.Schema;
/*const ObjectId = Schema.Types.ObjectId;*/

const MediaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image','vector','video','audio','richtext'],
    required: true
  },
  files: [FileSchema],
  embeddable: {
    type: Boolean,
    required: true
  },
  duration: {
    type: Number,
    required: false
  }
});

MediaSchema.virtual('uri').get(function() {
  let uri = "";
  if (this.files.length > 0) {
    uri = this.files[0].uri;
  }
  return uri;
});

MediaSchema.virtual('file').get(function() {
  let file = {};
  if (this.files.length > 0) {
    file = this.files[0];
  }
  return file;
});

const Media = mongoose.model('media', MediaSchema);

module.exports = Media;