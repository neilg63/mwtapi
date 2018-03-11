const mongoose = require('mongoose');
const _ = require('lodash');
const TimingSchema = require('./timing');
const Explanation = require('./explanation');
const Category = require('./category');
const Question = require('./question');
const FeedbackSchema = require('./feedback');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const QuestionSetSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['test','survey','info']
  },
  topics:  {
    type: [ObjectId],
    ref: 'Topic',
    required: false
  },
  public: {
  	type: Boolean,
  	default: true
  },
  depth: {
  	type: Number,
  	default: 0
  },
  questions:  {
    type: [ObjectId],
    ref: 'Question',
    required: false
  },
  weight: {
    type: Number,
    default: 0,
    required: true
  },
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
  points: {
    type:Number,
    required: false
  },
  grades: {
  	type: [ObjectId],
  	ref: 'Grade',
  	required: false
  },
  scaleTypes: {
  	type: [ObjectId],
  	ref: 'ScaleType',
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
  limit: {
    type: Number,
    min: 0,
    max: 1000000,
    default: 0
  },
  timing: {
    type: TimingSchema,
    required: false
  },
  feedback: {
  	type: [FeedbackSchema],
  	required: false
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

QuestionSetSchema.virtual('numQuestions').get(function() {
  return this.questions.length;
});

QuestionSetSchema.methods.matchFeedback = function(criteria) {
  let fb = {}, mode = 'none', matched = false;
  if (this.feedback.length > 0) {
  	if (this.feedback.length > 1) {
  		if (typeof criteria == 'number') {
    		mode = 'points';
		  } else if (criteria instanceof Array) {
		  	mode = 'scales';
		  }
		  let item = {};
		  for (let i = 0; i < this.feedback.length; i++) {
		  	item = this.feedback[i];
		  	switch (mode) {
		  		case 'points':
		  			if (criteria >= item.min && (criteria < item.max || item.max <= 0)) {
		  				fb = item;
		  				matched = true;
		  			}
		  			break;
		  		case 'scales':
		  			// complex
		  			break;
		  	}
		  	if (matched) {
		  		break;
		  	}
		  }
  	} else {
  		fb = this.feedback[0];
  	}
  }
  return fb;
};

QuestionSetSchema.methods.addQuestion = function(params, user) {
	if (!params.created) {
		params.created = new Date();	
	}
	params.edited = new Date();	
	if (user !== undefined) {
		params.user = user;
	} else {
		params.user = this.user;
	}
	let question = Question.create(params, user);
	question.save();
	this.questions.push(question);
	return question;
}

QuestionSetSchema.methods.addFeedback = function(params) {
	let keys = Object.keys(params), k;
	let fb = {};
	for (let i = 0; i < keys.length; i++) {
		k = keys[i];
		switch (k) {
			case 'validity':
			case 'criteria':
			case 'min':
			case 'max':
				fb[k] = params[k];
				break;
			case 'text':
				if (typeof params[k] === "string") {
					let expl = new Explanation({
						text: params[k],
						user: this.user
					});
					expl.save();
					fb.explanation = expl;
				} else {
					fb.explanation = params[k];
				}
				break;
			default:
				break;
		}
	}
	this.feedback.push(fb);
	return fb;
}

QuestionSetSchema.statics.create = function(params, user) {
	if (!params) {
		params = {};
	}
	if (!params.created) {
		params.created = new Date();
	}
	if (!params.edited) {
		params.edited = new Date();
	}
	if (user !== undefined) {
		params.user = user;
	}
	return new QuestionSet(params);
}

QuestionSetSchema.statics.filterOptions = function(question,d) {
	let limitOpts = (question.limit > 0 && question.limit < d.numOptions);
	let invalidIds = [];
	for (let j = 0; j < d.numOptions; j++) {
		if (!_.isBoolean(question.options[j].valid)) {
			question.options[j].valid = question.options[j].points > 0;
		}
		if (!question.options[j].valid) {
			invalidIds.push(question.options[j]._id.toString());
		}
		d.options.push(QuestionSet.mapOption(question.options[j], question.mode));
	}
	if (question.random) {
		d.options = _.shuffle(d.options);
	}
	if (limitOpts) {
		let subtract = d.numOptions - question.limit,
			subtracted = 0;
		for (let k = d.numOptions-1; k >= 0; k--) {
			if (invalidIds.indexOf(d.options[k]._id) >= 0 && subtracted < subtract) {
				d.options.splice(k,1);
				subtracted++;
				if (subtracted >= subtract) {
					break;
				}
			}
		}
		d.numOptions = d.options.length;
	}
}

QuestionSetSchema.statics.mapOption = function(option,mode,reviewMode) {
	let	d = {
		_id: option._id.toString(),
		text: option.text
	};
	switch (mode) {
		case 'matching_pairs':
			d.isMatch = option.isMatch;
			if (!d.isMatch && option.number) {
				d.number = option.number;
			}
			break;
		case 'sort':
				d.rank = option.rank;
			break;
		case 'multiple_choice':
		case 'multiple_answer':
				d.selected = false;
			break;
	}
	if (reviewMode) {
		d.points = option.points;
		d.status = option.status;
		if (option.valid !== undefined) {
			d.valid = option.valid;
		}
	}
	return d;
}

QuestionSetSchema.statics.loadOne = function(id) {
	return QuestionSet.findById(id)
	.populate('topics')
	.populate('user')
	.populate({
		path: 'questions',
		model: 'Question',
		populate: [{
			path: 'feedback.explanation',
			model: 'explanation'	
		},{
			path: 'options.feedback.explanation',
			model: 'explanation'	
		}],
	}).populate({
		path: 'feedback.explanation',
		model: 'explanation'
	});
}

QuestionSetSchema.statics.mapQuestion = function(question) {
	let i = 0,
		json = JSON.parse(JSON.stringify(question)),
		keys = Object.keys(json),
		d = {}, key;
	for (; i < keys.length; i++) {
		key = keys[i];
		switch (key) {
			case "_id":
				d[key] = question[key].toString();
				break;
			case "text":
			case "mode":
			case "random":
			case "limit":
			case "points":
				d[key] = question[key];
				break;
			case "media":
				//d[key] = qSet[key].title;
				break;
			case "topics":
				//d[key] = qSet[key].title;
				break;
			case 'options':
				d.numOptions = question.options.length;
				if (d.numOptions) {
					d.options = [];
					let skipOptions = false;
					switch (question.mode) {
						case 'freetext_match':
							skipOptions = true;
							break;
					}
					if (!skipOptions) {
						QuestionSet.filterOptions(question, d);
					}
				}
				break;
		}
	}
	return d;
}

QuestionSetSchema.statics.mapSet = function(qSet, full) {
	let i = 0,
		json = JSON.parse(JSON.stringify(qSet)),
		keys = Object.keys(json),
		d = {}, key;
	for (; i < keys.length; i++) {
		key = keys[i];
		switch (key) {
			case "_id":
				d[key] = qSet[key].toString();
				break;
			case "text":
			case "title":
			case "random":
			case "limit":
				d[key] = qSet[key];
				break;
			case "topics":
				//d[key] = qSet[key].title;
				break;
			case "questions":
				if (full) {
					let numQ = qSet.questions.length;

					if (numQ > 0) {
						if (qSet.random) {
							qSet.questions = _.shuffle(qSet.questions);
							let lm = 2;
							if (qSet.limit > 0 && qSet.limit < numQ) {
								numQ = qSet.limit;
							}
						} else {
							qSet.questions = _.sortBy(qSet.questions,['weight']);
						}
						d.questions = [];
						for (let j = 0; j < numQ; j++) {
							d.questions.push(QuestionSet.mapQuestion(qSet.questions[j]));
						}
					}
				}
				break;
		}
	}
	d.numQuestions = qSet.numQuestions;
	return d;
}


const QuestionSet = mongoose.model('questionSet', QuestionSetSchema);
module.exports = QuestionSet;