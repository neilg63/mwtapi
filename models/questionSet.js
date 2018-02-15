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
  category:  {
    type: ObjectId,
    ref: 'Category',
    required: false
  },
  topics:  {
    type: [ObjectId],
    ref: 'Category',
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
  sections:  {
    type: [ObjectId],
    ref: 'QuestionSet',
    required: false
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

QuestionSetSchema.virtual('hasSections').get(function() {
  let hasSections = true;
  if (this.sections) {
    if (this.sections instanceof Array) {
    	hasSections = this.sections.length > 0;
    }
  }
  return hasSections;
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

QuestionSetSchema.methods.addSection = function(params) {
	params.depth = this.depth + 1;
	let questionSet = QuestionSet.create(params,this.user);
	this.sections.push(questionSet);
	questionSet.save();
	return questionSet;
}

let QuestionSetLoadOne = function(id) {
	return QuestionSet.findById(id)
		.populate('category')
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

let QuestionSetMapSet = (qSet, full) => {
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
			case "category":
				d[key] = qSet[key].title;
				d.category_id = qSet[key]._id;
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
							d.questions.push(QuestionSetMapQ(qSet.questions[j]));
						}
					}
				}
				break;
			case 'sections':
				if (qSet.depth < 1) {
					d.numSections = qSet.sections.length;
					if (d.numSections) {
						d.sections = [];
						for (let j = 0; j < d.numSections; j++) {
							d.sections.push(QuestionSetMapSet(qSet.sections[j], full));
						}
						if (qSet.random) {
							d.sections = _.shuffle(d.sections);
						}
					}
				}
				break;
		}
	}
	d.numQuestions = qSet.depth < 1? qSet.numQuestions : qSet.questions.length;
	return d;
}

let QuestionSetMapQ = (question) => {
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
						QuestionSetFilterOptions(question, d);
					}
				}
				break;
		}
	}
	return d;
}

let QuestionSetFilterOptions = (question,d) => {
	let limitOpts = (question.limit > 0 && question.limit < d.numOptions);
	let invalidIds = [];
	for (let j = 0; j < d.numOptions; j++) {
		if (!_.isBoolean(question.options[j].valid)) {
			question.options[j].valid = question.options[j].points > 0;
		}
		if (!question.options[j].valid) {
			invalidIds.push(question.options[j]._id.toString());
		}
		d.options.push(QuestionSetMapOption(question.options[j], question.mode));
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

let QuestionSetMapOption = (option,mode,reviewMode) => {
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

QuestionSetSchema.statics.loadFull = async function(id) {
	let qs = {};
	await QuestionSetLoadOne(id)
		.then(qSet => qs = qSet);
	let numSecs = qs.sections.length;
  if (numSecs > 0) {
  	qs.numQuestions = qs.questions.length;
  	for (let i = 0; i < numSecs; i++) {
  		await QuestionSetLoadOne(qs.sections[i])
				.then(section => {
					qs.sections[i] = section;
					qs.numQuestions += section.questions.length;
				})
				.catch(e => {});
  	}
  }
	return qs;
};

QuestionSetSchema.statics.mapSet = function(qSet,full) {
	return QuestionSetMapSet(qSet, full);
}

QuestionSetSchema.statics.loadMany = async function(criteria, start, limit) {
	if (typeof criteria != 'object') {
		criteria = {};
	}
	criteria.depth = 0;

	let qSets = [];
	await QuestionSet.find(criteria)
		.limit(limit)
		.skip(start)
		.populate('category')
		.populate('topics')
		.populate('sections')
		.populate('user')
		.then(qss => qSets = qss);
	let numSets = qSets.length, 
	numSecs = 0,
	qs;
  if (numSets > 0) {
  	for (let i = 0; i < numSets; i++) {
			qs = qSets[i];
			qs.numQuestions = qs.questions.length;
			numSecs = qs.sections.length;

	  	for (let j = 0; j < numSecs; j++) {
	  		await QuestionSet.findById(qs.sections[j])
					.then(section => {
						qs.numQuestions += section.questions.length;
					})
					.catch(e => {});
	  	}
	  }
  }
	return qSets;
};


const QuestionSet = mongoose.model('questionSet', QuestionSetSchema);
module.exports = QuestionSet;