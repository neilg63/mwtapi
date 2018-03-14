const _ = require('lodash');
const Assessment = require("../models/assessment");
const QuestionSet = require("../models/questionSet");
const Question = require("../models/question");
const Category = require("../models/category");
const Explanation = require("../models/explanation");
const Mark = require("../models/mark");
const User = require("../models/user");

const ApiController = {

	async login(params) {
		let data = {};
		return data;
	},

	async register(params) {
		let data = {};
		return data;
	},

	async userAssessments() {
		let data = {};
		return data;
	},

	async listAssessments(params,start,limit) {
		let assessments = [];
		if (!start) {
			start = 0;
		}
		if (!limit) {
			limit = 100;
		}
		if (!params) {
			params = {};
		}
		
		await Assessment.loadMany(params, start, limit)
			.then(ass => assessments = ass);
		let data = [];

		for (let i = 0; i < assessments.length; i++) {
			data.push(Assessment.mapSet(assessments[i]))
		}
		return data;
	},

	async getAssessment(id,userId) {
		let assessment = {}, mappedData = {}, user = {};
		// fetch user from userId param
		await User.findById(userId, (err,data) => {
			if (!err) {
				user = data;
			}
		});
		// load constructed assessment and
		// store as presented to the user
		await Assessment.loadFull(id)
			.then(ass => {
				assessment = ass.toObject();
				mappedData = Assessment.mapSet(ass, true);
			});
			// create a mark object with an embedded 
			// assembled assessement
		await Mark.create(assessment,user)
			.then(data => {
				mappedData.markId = data._id
			});
		return mappedData;
	},

	async getFullAssessment(id) {
		let assessment = {};
		// load constructed assessment and
		// store as presented to the user
		await Assessment.loadFull(id)
			.then(ass => {
				assessment = ass.toObject();
			});
		return assessment;
	},

	async listCategories(limit,skip) {
		let cats = {};
		await Category.listAll()
			.then(cs => {
				cats = cs
			});
		return cats;
	},

	async markQuestion(data) {
		let mark, error, 
		result = { valid: false},
		answer = {},
		question;
		await Mark.findById(data.markId).then(out => {
			mark = out;
		})
		.catch(e => {
			error = e;
		});
		await Question.findById(data.questionId).
			populate([{
			path: 'feedback.explanation',
			model: 'explanation'	
			},{
				path: 'options.feedback.explanation',
				model: 'explanation'	
		}]).then(out => {
			question = out;
		})
		.catch(e => {
			error = e;
		});
		if (mark.assessment) {
			if (mark.assessment.sections) {
				data.question = question
				await mark.saveAnswer(data)
					.then(out => {
						if (out.sections instanceof Array) {
							let i=0, j=0, sec;
							for (; i< out.sections.length; i++) {
								sec = out.sections[i];

								if (sec.answers instanceof Array) {
									for (j = 0; j < sec.answers.length; j++) {
										if (sec.answers[j].question.toString() == data.questionId.toString()) {
											answer = sec.answers[j];
											result = answer.toObject();
											result.valid = true;
											break;
										}
									}
								}
								if (result.valid) {
									break;
								}
							}
						}
					})
					.catch(e => result = e);
			}
		}
		if (result.valid) {
			answer.question = question
			result.points = Mark.calcQuestionPoints(answer)
			result.maxPoints = question.maxPoints
		}
		return result;
	},

	async explanation(id) {
		let explanation = {text: ''}
		await Explanation.findById(id)
			.then(data => {
				explanation = data
			});
		return explanation
	}

}

module.exports = ApiController;