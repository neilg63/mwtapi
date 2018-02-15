const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const AnswerSchema = require('./answer');

const MarkSectionSchema = new mongoose.Schema({
  questionSet:  {
    type: ObjectId,
    ref: 'QuestionSet',
    required: true
  },
  answers:  {
    type: [AnswerSchema],
    required: false
  },
  grade: {
  	type: String,
  	required: false,
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
  created: {
    type: Date,
    required: false,
  },
  edited: {
     type: Date,
     required: false
  }
});

MarkSectionSchema.methods.addAnswer = function(params) {
	if (params === undefined) {
		params = {};
	}
	if (!params.created) {
		params.created = new Date();	
	}
	params.edited = new Date();
	return this.answers.push(params);
}


MarkSectionSchema.virtual('points').get(function() {
  let points = 0;
  if (this.answers.length > 0) {
  	for (let i = 0; i < this.answers.length; i++) {
  		if (this.answers[i].points) {
  			points += this.answers[i].points;
  		}
  	}
  }
  return points;
});

MarkSectionSchema.virtual('scales').get(function() {
  let scales = [];
  if (this.options.length > 0) {
  	if (this.options[0].scales.length>0) {
  		scales = this.options[0].scales;
  	}
  }
  return scales;
});

module.exports = MarkSectionSchema;