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
AnswerSchema.virtual('points').get(function() {
  let points = 0, countPoints = true;
  if (this.options.length > 0) {
  	let numOpts = this.options.length;
  	
  	let aMode = 'all';
  	let countCorrect = false;
  	let invalidate = false;
  	if (this.question) {
  		switch (this.question.mode) {
	  		case 'multiple_answer':
	  			switch (this.question.pointsMode) {
	  				case 'exact':
	  					aMode = 'zero_if_any_wrong';
	  					break;
	  				case 'partial_valid':
	  					aMode = 'points_to_max_correct';
	  					countCorrect = true;
	  					break;
	  			}
	  			break;
	  		case 'freetext_match':
	  			countPoints = false;
	  			if (this.options.length > 0 && typeof this.value == 'string') {
	  				let op = this.options[0];
	  				let ps = op.text.split('#');
	  				if (ps.length>1) {
	  					let rgx = new RegExp(ps[0],ps[1]);
	  					countPoints = rgx.test(this.value);
	  				}
	  			}
	  			break;
	  	}
	  	if (countCorrect) {
	  		let correctOpts = this.question.options.filter(q => q.points > 0);
	  	}
  	}
  	if (countPoints) {
			for (let i = 0; i < numOpts; i++) {
	  		if (this.options[i].points) {
	  			if (aMode == 'zero_if_any_wrong' && points <= 0) {
	  				invalidate = true;
	  				break;
	  			}
	  			points += this.options[i].points;
	  		}
	  	}
  	}
  }
  return points;
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

module.exports = AnswerSchema;