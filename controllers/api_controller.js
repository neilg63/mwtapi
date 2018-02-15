const _ = require('lodash');
const QuestionSet = require("../models/questionSet");
const Category = require("../models/category");
const User = require("../models/user");

const ApiController = {

	async listQuestionSets(params,start,limit) {
		let qSets = [];
		if (!start) {
			start = 0;
		}
		if (!limit) {
			limit = 100;
		}
		if (!params) {
			params = {};
		}
		
		await QuestionSet.loadMany(params, start, limit)
			.then(qss => qSets = qss);
		let data = [];
		for (let i = 0; i < qSets.length; i++) {
			data.push(QuestionSet.mapSet(qSets[i]))
		}
		return data;
	},

	async getQuestionSet(id) {
		let questionSet = {};
		await QuestionSet.loadFull(id)
			.then(qs => {
				questionSet = QuestionSet.mapSet(qs, true);
			});
		return questionSet;
	},

	async listCategories(limit,skip) {
		let cats = {};
		await Category.listAll()
			.then(cs => {
				cats = cs
			});
		return cats;
	}

}

module.exports = ApiController;