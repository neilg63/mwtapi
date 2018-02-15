const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const AnswerSchema = require('./answer');
const MarkSectionSchema = require('./markSection');
const ObjId = mongoose.mongo.ObjectId;

const MarkSchema = new mongoose.Schema({
  questionSet:  {
    type: ObjectId,
    ref: 'QuestionSet',
    required: true
  },
  sections:  {
    type: [MarkSectionSchema],
    required: false
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

MarkSchema.statics.create = function(questionSet, user) {
	let params = {
		questionSet: questionSet,
		created: new Date(),
		edited: new Date(),
		user: user
	};
	let mark = new Mark(params);
	mark.save();
	return mark;
}

MarkSchema.methods.addAnswer = function(params,sectionIndex) {
	let nx = 0;
	if (params === undefined) {
		params = {};
	}
	if (!params.created) {
		params.created = new Date();	
	}
	params.edited = new Date();
	if (typeof sectionIndex == 'number') {
		if (sectionIndex >= 0 && sectionIndex < this.sections.length) {
			nx = this.sections[sectionIndex].answers.push(params);
		}
	} else {
		nx = this.answers.push(params);
	}
	return nx - 1;
}

MarkSchema.methods.addSection = function(questionSet) {
	let section = {
		questionSet: questionSet
	};
	let nx = this.sections.push(section);
	return nx - 1;
}

MarkSchema.virtual('points').get(function() {
  let points = 0;
  if (this.answers.length > 0) {
  	for (let i = 0; i < this.answers.length; i++) {
  		if (this.answers[i].points) {
  			points += this.answers[i].points;
  		}
  	}
  }
  if (this.sections.length > 0) {
  	for (i = 0; i < this.sections.length; i++) {
  		if (this.sections[i].points) {
  			points += this.sections[i].points;
  		}
  	}
  }
  return points;
});


MarkSchema.virtual('numAnswers').get(function() {
  let num = this.answers.length;
  if (this.sections.length > 0) {
  	for (let i = 0; i < this.sections.length; i++) {
  		if (this.sections[i].answers) {
  			num += this.sections[i].answers.length;	
  		}
  	}
  }
  return num;
});

MarkSchema.virtual('scales').get(function() {
  let scales = [];
  if (this.options.length > 0) {
  	if (this.options[0].scales.length>0) {
  		scales = this.options[0].scales;
  	}
  }
  return scales;
});


const Mark = mongoose.model('Mark', MarkSchema);
module.exports = Mark;