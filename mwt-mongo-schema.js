const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SchemaTypes = Schema.Types;

const TimingSchema = new mongoose.Schema({
  mode: {
    type: String,
    enum: ['parent', 'range','ignore'],
    required: true
  },
  min: {
    type: Number,
    default: 0,
    required: false
  },
  max: {
    type: Number,
    default: 0,
    required: false
  }
});

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

const FeedbackSchema = new mongoose.Schema({
  min: {
    type:Number,
    default: 0,
    required: false
  },
  max: {
    type:Number,
    default: 0,
    required: false
  },
  validity: {
    type: String,
    enum: ['all','correct','partial','incorrect','range']
  },
  text: {
    type: String,
    required: false,
    trim: true,
    minlength: 1
  },
  media: {
    type: MediaSchema,
    required: false
  },
  user: {
    type: SchemaTypes.ObjectId,
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


let CategorySchema = new mongoose.Schema({
  parent:  {
    type: SchemaTypes.ObjectId,
    ref: 'Category',
    required: false
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  weight: {
    type: Number,
    default: 0,
    required: true
  },
  text: {
    type: String,
    required: false,
    trim: true,
    minlength: 1
  },
  user: {
    type: SchemaTypes.ObjectId,
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

let TopicSchema = new mongoose.Schema({
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
    type: SchemaTypes.ObjectId,
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

let QuestionSetSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['test','survey','info']
  },
  category:  {
    type: SchemaTypes.ObjectId,
    ref: 'Category',
    required: false
  },
  topics:  {
    type: [SchemaTypes.ObjectId],
    ref: 'Category',
    required: false
  },
  parent:  {
    type: SchemaTypes.ObjectId,
    ref: 'QuestionSet',
    required: false
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  weight: {
    type: Number,
    default: 0,
    required: true
  },
  text: {
    type: String,
    required: false,
    trim: true,
    minlength: 1
  },
  points: {
    type:Number,
    required: false
  },
  required: {
    type: Boolean,
    default: true
  },
  random: {
    type: Boolean,
    required: true,
  },
  timing: {
    type: TimingSchema,
    required: true
  },
  feedback: [FeedbackSchema],
  user: {
    type: SchemaTypes.ObjectId,
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

let QuestionSchema = new mongoose.Schema({
  questionSet:  {
    type: SchemaTypes.ObjectId,
    ref: 'QuestionSet',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  weight: {
    type: Number,
    default: 0,
    required: true
  },
  mode: {
    type:String,
    enum: [
      'multiple_choice',
      'multiple_choice_freetext',
      'multiple_answer',
      'multiple_answer_freetext',
      'boolean',
      'matching_pairs',
      'sort',
      'value_assign',
      'data_match',
      'gapfill_select',
      'gapfill_match',
      'gapfill_freetext',
      'freetext_match',
      'freetext_mark',
    ],
    required: true
  },
  num_custom_options: {
    type: Number,
    required: false,
    default: 0
  },
  random: {
    type: Boolean,
    required: true,
  },
  limitOptions: {
    type: Number,
    min: 1,
    max: 2048
  },
  timing: {
    type:TimingSchema,
    required: true
  },
  points: {
    type:Number,
    required: false
  },
  pointsMode: {
    type:String,
    enum: ['exact', 'valid_only','exclude_invalid','fuzzy'],
    required: false
  },
  feedback: [FeedbackSchema],
  seconds: {
    type:Number,
    required: false
  },
  required: {
    type: Boolean,
    default: true
  },
  user: {
    type: SchemaTypes.ObjectId,
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

let OptionSchema = new mongoose.Schema({
  question:  {
    type: SchemaTypes.ObjectId,
    ref: 'Question',
    required: true
  },
  weight: {
    type:Number,
    default: 0,
    required: true
  },
  text: {
    type: String,
    required: false,
    trim: true,
    minlength: 1
  },
  data: {
    type: SchemaType.Mixed,
    required: false
  },
  media: {
    type: [{
      type: SchemaTypes.objectId,
      ref: 'Media'
    }],
    required: false
  },
  points: {
    type:Number,
    required: false
  },
  valid: {
    type: Boolean,
    required: true
  },
  user: {
    type: SchemaTypes.ObjectId,
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



const AnswerSchema = new mongoose.Schema({
  question:  {
    type: SchemaTypes.ObjectId,
    ref: 'Question',
    required: true
  },
  points: {
    type:Number,
    required: false
  },
  validity: {
    type: String,
    enum: ['info','correct','partial','incorrect','subjective']
  },
  text: {
    type: String,
    required: false,
    trim: true
  },
  media: {
    type: MediaSchema,
    required: false
  },
  time: {
    type: Number,
    required: false
  },
  user: {
    type: SchemaTypes.ObjectId,
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

const MarkSchema = new mongoose.Schema({
  questionSet:  {
    type: SchemaTypes.ObjectId,
    ref: 'QuestionSet',
    required: true
  },
  points: {
    type:Number,
    required: false
  },
  validity: {
    type: String,
    enum: ['pass','fail','incomplete','subjective']
  },
  grade: {
    type: String,
    required: false    
  },
  time: {
    type: Number,
    required: false
  },
  notes: {
    type: String,
    required: false,
    trim: true
  },
  user: {
    type: SchemaTypes.ObjectId,
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
