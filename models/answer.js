const mongoose = require('mongoose');
const OptionSchema = require('./option');
const Media = require('./media');
const Question = require('./question');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const Mixed = Schema.Types.Mixed;

const AnswerSchema = new mongoose.Schema({
  question: {
  	type: ObjectId,
  	ref: 'Question',
  	required: true
  },
  options: {
  	type: [OptionSchema],
  	required: false
  },
  value: {
  	type: Mixed,
  	required: false
  },
  notes: {
    type: String,
    required: false,
    trim: true
  },
  media: {
    type: ObjectId,
	  ref: 'Media',
	  required: false
  },
  time: {
    type: Number,
    required: false
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

/*AnswerSchema.statics.create = function(params) {
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
  return new Answer(params);
}*/

/*
* Revise to take account of multiple answer rules
*/
AnswerSchema.virtual('points').get(function(question) {
  return Mark.calcQuestionPoints(this);
});

AnswerSchema.virtual('scaleSets').get(function() {
  let scales = [];
  if (this.options.length > 0) {
  	for (let i = 0; i < this.options.length; i++) {
  		if (this.options.scales.length>0) {
  			scales.push(this.options.scales);
  		}
  	}
  }
  return scales;
});

AnswerSchema.virtual('scales').get(function() {
  let scales = [], numIndices = 0, max = 0;
  if (this.options.length > 0) {
  	for (let i = 0; i < this.options.length; i++) {
  		if (i === 0) {
  			numIndices = this.options[i].scales.length;
  		}
  		max = this.options[i].scales.length;
  		if (max>0) {
  			if (max > numIndices) {
  				max = numIndices;
  			}
  			for (let j = 0; j < max; j++) {
  				if (j < scales.length) {
  					scales[j] = this.options[i].scales[j];	
  				} else {
  					scales[j] += this.options[i].scales[j];	
  				}
  			}
  		}
  	}
  }
  return scales;
});

calcMaxDeviance = (correct = [], attempt = []) => {
	var maxDeviance = (arrLength = 0) => {
		let deviance = 0,
			maxRange = Math.floor(arrLength/2);
		for (let i = 0; i < arrLength; i++) {
			deviance += Math.abs(i - maxRange) * 2;
		}
		return deviance;
	}
	let deviance = 0, num;
	for (let i = 0; i < correct.length; i++) {
		num = correct[i];
		deviance += Math.abs(i - attempt.indexOf(num));
	}

	return 1 - Math.pow(deviance/maxDeviance(correct.length),0.5);
}

module.exports = AnswerSchema;