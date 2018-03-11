const mongoose = require('mongoose');
const _ = require('lodash');
const TimingSchema = require('./timing');
const OptionSchema = require('./option');
const FeedbackSchema = require('./feedback');
const Explanation = require('./explanation');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const ObjId = mongoose.mongo.ObjectId;

const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  media: {
  	type: [ObjectId],
	  ref: 'Media',
	  required: false
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
  options: {
  	type: [OptionSchema],
  	required: false
  },
  num_custom_options: {
    type: Number,
    required: false,
    default: 0
  },
  random: {
    type: Boolean,
    default: false,
    required: true,
  },
  limit: {
    type: Number,
    min: 0,
    max: 1000000,
    default: 0,
    required: false
  },
  timing: {
    type:TimingSchema,
    required: false
  },
  points: {
    type:Number,
    required: false
  },
  scaleType: {
  	type: ObjectId,
  	ref: 'ScaleType',
  	required: false
  },
  pointsMode: {
    type:String,
    enum: ['exact', 'valid_only','deduct_invalid','partial_valid','fuzzy'],
    required: false
  },
  feedback: {
  	type: [FeedbackSchema],
  	required: false
  },
  seconds: {
    type:Number,
    required: false
  },
  required: {
    type: Boolean,
    default: true
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

QuestionSchema.virtual('hasTiming').get(function() {
  let hasTiming = false;
  if (this.timing) {
  	if (this.timing.mode) {
  		hasTiming = this.timing.mode != 'ignore';	
  	}
  }
  return hasTiming;
});

QuestionSchema.virtual('maxPoints').get(function() {
  let max = 0;
  if (typeof this.points == 'number') {
    max = parseFloat(this.points);
  } else {
    let max = this.options.map(o => {
      if (o.points) {
        return o.points;
      } else {
        return 0;
      }
    }).reduce((prev,curr) => prev + curr);
    if (max < 1) {
      max = 1;
    }
    return max;
  }
  return max;
});

QuestionSchema.methods.addFeedback = function(params, optionIndex) {
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

	if (optionIndex !== undefined && typeof optionIndex === 'number') {

		if (optionIndex >= 0 && this.options.length > optionIndex) {			
			this.options[optionIndex].feedback = fb;
		} 
	} else {
		this.feedback.push(fb);
	}
}

QuestionSchema.statics.create = function(params, user) {
  if (!params) {
    params = {};
  }
  if (!params.options) {
    params.options = [];
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
  return new Question(params);
}


QuestionSchema.methods.addOption = function(params, user) {
	let keys = Object.keys(params), k;
	let op={}, fb = {};
	for (let i = 0; i < keys.length; i++) {
		k = keys[i];
		switch (k) {
			case 'validity':
			case 'text':
			case 'data':
			case 'weight':
			case 'points':
			case 'status':
			case 'scales':
      case 'matches':
      case 'number':
				op[k] = params[k];
				break;
			case 'feedback':
				switch (params.status) {
					case "correct":
					case "incorrect":
					case "partial":
						fb.validity = params.status;
						break;
					default:
						fb.validity = "all";
						break;
				}
				if (typeof params[k] === "string") {
					let expl = new Explanation({
						text: params[k],
						user: this.user
					});
					expl.save();
					fb.explanation = expl;
				} else if (typeof params[k] == 'object') {
					if (params[k].explanation) {
						if (typeof params[k].explanation == 'object') {
							fb.explanation = params[k];
						}
					}
				}
				op.feedback = fb;
				break;
			default:
				break;
		}	
	}
	if (op.text || op.media) {
		this.options.push(op);
	}
}

QuestionSchema.methods.getOptionById = function(id) {
  if (!typeof id == 'string' && id !== undefined) {
    id = id.toString();
  }
  let option = _.find(this.options,(opt) => {
    return opt._id == id;
  });
  if (option) {
    return option;
  }
}

const Question = mongoose.model('Question', QuestionSchema);
module.exports = Question;