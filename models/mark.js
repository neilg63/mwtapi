const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const AnswerSchema = require('./answer');
const Assessment = require('./assessment');
const User = require('./user');
const MarkSectionSchema = require('./markSection');
const ObjId = mongoose.mongo.ObjectId;
const Mixed = Schema.Types.Mixed;

const MarkSchema = new mongoose.Schema({
  assessment:  {
    type: Mixed,
    required: true
  },
  sections:  {
    type: [MarkSectionSchema],
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

MarkSchema.statics.create = function(assessment, user) {
	let params = {
		assessment: assessment,
		created: new Date(),
		edited: new Date(),
		user: user,
		sections: []
	};
	let mark = new Mark(params);
	return mark.save();
}

MarkSchema.statics.new = async function(userId, assessmentId) {
	let assessment, user;
	await Assessment.findById(assessmentId)
		.then(data => {
			assessment = data
		});
	await User.findById(userId)
		.then(data => {
			user = data
		});

	let params = {
		assessment: assessment,
		created: new Date(),
		edited: new Date(),
		user: user
	};
	let mark = new Mark(params);
	mark.save();
	return mark;
}

MarkSchema.statics.calcQuestionPoints = function(data) {
	let points = 0, countMode = 'none';
	let mode = data.question.mode.toString();
	let hasData = data.options.length > 0;
	if (!hasData) {
		hasData = typeof data.value == 'string'
	}
  if (hasData) {
  	let numOpts = data.options.length;
  	
  	let aMode = 'all';
  	let countCorrect = false;
  	let invalidate = false;
  	if (data.question) {
  		

  		switch (mode) {
	  		case 'multiple_answer':
	  			switch (data.question.pointsMode) {
	  				case 'exact':
	  					aMode = 'zero_if_any_wrong';
	  					break;
	  				case 'partial_valid':
	  					aMode = 'points_to_max_correct';
	  					countCorrect = true;
	  					break;
	  			}
	  			countMode = 'options';
	  			break;
	  		case 'freetext_match':
	  			if (data.question.options.length > 0) {
	  				let op = data.question.options[0];
	  				let ps = op.text.split('#');
	  				if (ps.length>1) {
	  					let rgx = new RegExp(ps[0],ps[1]);
	  					let correct = rgx.test(data.value);
	  					if (correct) {
	  						countMode = 'question';
	  					}
	  				}
	  			}
	  			break;
	  		case 'sort':
	  			let sorted = data.question.options
	  				.sort((a,b) => a.number - b.number)
	  				.map(o => o._id.toString());
	  			let userSorted = data.options.map(o => o._id.toString());
	  			let numCorrect = 0, matchedIndex = -1;
	  			for (let j = 0; j < userSorted.length;j++) {
	  				matchedIndex = sorted.indexOf(userSorted[j]);
	  				if (matchedIndex == j) {
	  					numCorrect++;
	  				}
	  			}
	  			let correct = numCorrect == sorted.length;
	  			countPoints = false;
	  			if (correct) {
	  				countMode = 'question';
	  			}
	  			
	  			break;
	  		case 'matching_pairs':
	  			let i = 0, numMatched = 0, op0, op1, op2;
	  			for (; i < data.options.length;i++) {
	  				op0 = data.options[i];
	  				op1 = data.question.options.find(o => o._id.toString() == op0._id.toString())
	  				op2 = data.question.options.find(o => o._id.toString() == op0.matchedId.toString())
	  				if (op1.matches == op2.number) {
	  					numMatched++;
	  				}
	  			}
	  			if (numMatched === data.options.length) {
  					countMode = 'question';
  				}
	  			break;
	  		default:
	  			countMode = 'options';
	  			break;
	  	}
	  	if (countCorrect) {
	  		let correctOpts = data.question.options.filter(q => q.points > 0);
	  	}
  	}
  	if (countMode == 'options') {
			for (let i = 0, pts = 0; i < numOpts; i++) {
	  		if (data.options[i].points) {
	  			pts = data.options[i].points;
	  		} else {
	  			pts = 0;
	  		}
  			points += pts;
  			if (aMode == 'zero_if_any_wrong' && pts <= 0) {
  				invalidate = true;
  				break;
  			}
	  	}
	  	if (invalidate) {
  			points = 0;
  		}
  	} else if (countMode == 'question') {
  		if (data.question.points) {
				points = data.question.points	
			} else {
				points = data.question.maxPoints
			}
  	}
  }
  return points;
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
	}
	return nx - 1;
}

MarkSchema.methods.saveAnswer = function(data) {
	let params = {
		question: null,
		options: []
	};
	if (data.value) {
		params.value = data.value
	}
	if (!params.created) {
		params.created = new Date();	
	}
	params.edited = new Date();
	let sectionIndex = -1, sec;
	for (let i = 0; i < this.assessment.sections.length; i++) {
		sec = this.assessment.sections[i];
		if (sec.questions instanceof Array) {
			for (let j = 0; j < sec.questions.length; j++) {
				if (sec.questions[j]._id.toString() == data.questionId) {
					sectionIndex = this.sections.findIndex(s =>  s.questionSet.toString() == sec._id.toString() );
					if (sectionIndex < 0) {
						this.addSection(sec)
					}
					params.question = sec.questions[j];
					break;
				}
			}
		}
	}
	let opt;
	switch (data.question.mode) {
		case 'freetext_match':
			break;
		case 'matching_pairs':
			params.options = data.options;
			break;
		default:
			if (params.question.options && data.options) {
				for (let i = 0; i < data.options.length; i++) {
					if (typeof data.options[i] == 'string') {
						opt = params.question.options.find(o => o._id.toString() == data.options[i]);
						if (opt) {
							params.options.push(opt);
						}
					}
				}
			}
			break;
	}
	if (sectionIndex >= 0 && params.question) {
		let answerIndex = this.sections[sectionIndex].answers.findIndex(a => a.question.toString() == data.questionId.toString())
		
		if (sectionIndex >= 0 && sectionIndex < this.sections.length) {
			if (answerIndex < 0) {
				this.sections[sectionIndex].answers.push(params);
			}	else if (answerIndex >= 0 && this.sections[sectionIndex].answers.length > answerIndex) {
				this.sections[sectionIndex].answers[answerIndex] = params;
			}
		}
	}
	return this.save();
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
  let num = 0;
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