const mongoose = require('mongoose');
const _ = require('lodash');
const TimingSchema = require('./timing');
const Explanation = require('./explanation');
const Category = require('./category');
const QuestionSet = require('./questionSet');
const Question = require('./question');
const FeedbackSchema = require('./feedback');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const AssessmentSchema = new mongoose.Schema({
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
  sections:  {
    type: [ObjectId],
    ref: 'QuestionSet',
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

AssessmentSchema.virtual('hasSections').get(function() {
  let hasSections = true;
  if (this.sections) {
    if (this.sections instanceof Array) {
    	hasSections = this.sections.length > 0;
    }
  }
  return hasSections;
});

AssessmentSchema.virtual('numQuestions').get(function() {
  let num = 0;
  if (this.sections) {
    if (this.sections instanceof Array) {
    	for (let i = 0; i < this.sections.length > 0; i++) {
    		if (this.sections[i].questions) {
    			num += this.sections[i].questions.length;	
    		}
    	}
    }
  }
  return num;
});

AssessmentSchema.methods.matchFeedback = function(criteria) {
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

AssessmentSchema.methods.addFeedback = function(params) {
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

AssessmentSchema.methods.addSection = function(params) {
	params.depth = this.depth + 1;
	let questionSet = QuestionSet.create(params,this.user);
	this.sections.push(questionSet);
	questionSet.save();
	return questionSet;
}

let AssessmentLoadOne = function(id) {
	return Assessment.findById(id)
		.populate('category')
		.populate('topics')
		.populate('user')
		.populate({
			path: 'feedback.explanation',
			model: 'explanation'
		});
}

let AssessmentMapSet = (assessment, full) => {
	let i = 0,
		json = JSON.parse(JSON.stringify(assessment)),
		keys = Object.keys(json),
		d = {}, key;
	for (; i < keys.length; i++) {
		key = keys[i];
		switch (key) {
			case "_id":
				d[key] = assessment[key].toString();
				break;
			case "text":
			case "title":
			case "random":
			case "limit":
				d[key] = assessment[key];
				break;
			case "category":
				d[key] = assessment[key].title;
				d.category_id = assessment[key]._id;
				break;
			case "topics":
				//d[key] = qSet[key].title;
				break;
			case 'sections':
				d.numSections = assessment.sections.length;
				if (d.numSections) {
					d.sections = [];
					for (let j = 0; j < d.numSections; j++) {
						d.sections.push(QuestionSet.mapSet(assessment.sections[j], full));
					}
					if (assessment.random) {
						d.sections = _.shuffle(d.sections);
					}
				}
				break;
		}
	}
	d.numQuestions = assessment.numQuestions;
	return d;
}

AssessmentSchema.statics.create = function(params, user) {
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
	return new Assessment(params);
}

AssessmentSchema.statics.loadFull = async function(id) {
	let assessment = {};
	await AssessmentLoadOne(id)
		.then(ass => assessment = ass);
	let numSecs = assessment.sections.length;
  if (numSecs > 0) {
  	for (let i = 0; i < numSecs; i++) {
  		await QuestionSet.loadOne(assessment.sections[i])
				.then(section => {
					assessment.sections[i] = section;
				})
				.catch(e => {});
  	}
  }
	return assessment;
};

AssessmentSchema.statics.mapSet = function(assessment,full) {
	return AssessmentMapSet(assessment, full);
}

AssessmentSchema.statics.loadMany = async function(criteria, start, limit) {
	if (typeof criteria != 'object') {
		criteria = {};
	}
	if (!limit) {
		limit = 100;
	}
	if (!start) {
		start = 0;
	}
	let assessments = [];
	await Assessment.find()
		.limit(limit)
		.skip(start)
		.populate('category')
		.populate('topics')
		.populate({
			path: 'sections',
			model: 'questionSet'
		})
		.populate('user')
		.then(ass => assessments = ass);
	return assessments;
};


const Assessment = mongoose.model('assessment', AssessmentSchema);
module.exports = Assessment;