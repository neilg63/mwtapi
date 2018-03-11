const mongoose = require('mongoose');
const assert = require('assert');
const _ = require('lodash');
const Category = require('../models/category');
const Assessment = require('../models/assessment');
const QuestionSet = require('../models/questionSet');
const Question = require('../models/question');
const Mark = require('../models/mark');
const FeedbackSchema = require('../models/feedback');
const Explanation = require('../models/explanation');
const User = require('../models/user');

let createQuestions = (user) => {

	let cat1 = new Category({
		title: "General Knowledge",
		weight: 0,
		user: user,
		created: new Date()
	});

	let ass1 = Assessment.create({
		category: cat1,
		weight: 0,
		title: 'Geography',
		text: 'Test your general knowledge about geography',
		mode: "test",
		points: 100,
		random: true,
		limit: 20
	}, user);

	let qs1 = ass1.addSection({
		weight: 0,
		title: 'World Geography',
		text: 'Test your general knowledge about World geography',
		mode: "test",
		points: 25,
		random: true,
		limit: 20
	});


	let q1 = qs1.addQuestion({
		text: 'What is the capital of Australia?',
		mode: 'multiple_choice',
		weight: 0,
		limit: 0,
		random: true
	});

	q1.addOption({
		weight: 0,
		text: "Sydney",
		points: 0,
		status: "incorrect"
	});

	q1.addOption({
		weight: 1,
		text: "Canberra",
		points: 1,
		status: "correct"
	});

	q1.addOption({
		weight: 2,
		text: "Brisbane",
		points: 0,
		status: "incorrect"
	});

	q1.addOption({
		weight: 3,
		text: "Melbourne",
		points: 0,
		status: "incorrect"
	});

	q1.addFeedback({
		validity: "all",
		text: "Good try"
	});

	q1.addFeedback({
		validity: "all",
		text: "It's the biggest city but not the capital"
	},0);

	let q2 = qs1.addQuestion({
		text: 'Which countries are in Africa?',
		mode: 'multiple_answer',
		pointsMode: 'exact',
		weight: 1,
		limit: 6,
		random: true
	});

	q2.addOption({
		weight: 0,
		text: "Ecaudor",
		points: 0,
		status: "incorrect"
	});

	q2.addOption({
		weight: 1,
		text: "Laos",
		points: 0,
		status: "incorrect"
	});

	q2.addOption({
		weight: 2,
		text: "Kenya",
		points: 1,
		status: "correct"
	});

	q2.addOption({
		weight: 3,
		text: "Honduras",
		points: 0,
		status: "incorrect"
	});

	q2.addOption({
		weight: 4,
		text: "Benin",
		points: 1,
		status: "correct"
	});

	q2.addOption({
		weight: 1,
		text: "Angola",
		points: 1,
		status: "correct"
	});

	q2.addOption({
		text: "Norway",
		status: "incorrect",
		points: 0,
		weight: 6,
		feedback: "It's in Northern Europe"
	});

	

	let q3 = qs1.addQuestion({
		text: 'Can you breath on the moon unaided?',
		mode: 'boolean',
		weight: 2,
		limit: 0
	});

	q3.addOption({
		weight: 0,
		text: "Yes",
		valid: false,
		points: 0,
		status: "incorrect"
	});

	q3.addOption({
		weight: 1,
		text: "No",
		valid: true,
		points: 2,
		status: "correct"
	});
	

	ass1.addFeedback({
		min: 0,
		max: 49.999,
		validity: "range",
		text: "Better luck next time"
	});
	ass1.addFeedback({
		min: 50,
		max: -1,
		validity: "range",
		text: "Well done!"
	});

	let qs2 = ass1.addSection({
		weight: 0,
		title: 'Scottish Geography',
		text: 'Test your general knowledge about Scottish landmarks',
		mode: "test",
		points: 25,
		random: true,
		limit: 20
	});

	let q4 = qs2.addQuestion({
		text: 'What is the most populous city in Scotland?',
		mode: 'multiple_choice',
		weight: 2,
		limit: 0
	});

	q4.addOption({
		weight: 0,
		text: "Dundee",
		valid: false,
		points: 0,
		status: "incorrect"
	});

	q4.addOption({
		weight: 1,
		text: "Edinburgh",
		valid: false,
		points: 0,
		status: "incorrect"
	});

	q4.addOption({
		weight: 2,
		text: "Glasgow",
		valid: true,
		points: 0,
		status: "correct"
	});

	q4.addOption({
		weight: 3,
		text: "Aberdeen",
		valid: false,
		points: 0,
		status: "incorrect"
	});

	let q5 = qs2.addQuestion({
		text: "What is the tallest mountain in Scotland?",
		mode: 'freetext_match',
		weight: 3
	});

	q5.addOption({
		text: "^ben\\s*nevis$#i",
		valid: true,
		points: 3,
		status: "correct"
	});

	let q6 = qs2.addQuestion({
		text: "Match these animals with geographic regions",
		mode: 'matching_pairs',
		weight: 4
	});

	q6.addOption({
		text: "Penguin",
		points: 1,
		number: 1
	});

	q6.addOption({
		text: "Antarctica",
		matches: 1
	});
	q6.addOption({
		text: "Polar Bear",
		points: 1,
		number: 2
	});
	q6.addOption({
		text: "Greenland",
		matches: 2
	});

	q6.addOption({
		text: "Lion",
		points: 1,
		number: 2
	});

	q6.addOption({
		text: "Africa",
		matches: 2
	});

	q6.addOption({
		text: "Kangaroo",
		points: 1,
		number: 3
	});

	q6.addOption({
		text: "Australia",
		matches: 3
	});

	let q7 = qs2.addQuestion({
		text: "Sort these countries in order of physical size",
		mode: 'sort',
		weight: 5,
		random: true
	});

	q7.addOption({
		text: "Japan",
		number: 3,
		weight: 0,
	});

	q7.addOption({
		text: "Algeria",
		number: 2,
		weight: 1
	});

	q7.addOption({
		text: "Russia",
		number: 1,
		weight: 2
	});

	q7.addOption({
		text: "Bangladesh",
		number: 5,
		weight: 3
	});

	q7.addOption({
		text: "Italy",
		number: 4,
		weight: 4
	});

	return Promise.all([cat1.save(),ass1.save()]);
}

let createMark = (assessment,user) => {
	
	let qs = assessment.sections[0].questions;
	let op1 = qs[0].options[1];

	let op2a = qs[1].options[6];
	let op2b = qs[1].options[5];
	let op3 = qs[2].options[1];

	let mark = new Mark({
		assessment: assessment,
		user: user
	});

	let qs1 = assessment.sections[0];

	let ms1Index = mark.addSection(qs1);

	mark.addAnswer({
		question: qs[0],
		options: [op1]
	},ms1Index);

	mark.addAnswer({
		question: qs[1],
		options: [op2a, op2b]
	},ms1Index);

	mark.addAnswer({
		question: qs[2],
		options: [op3]
	},ms1Index);

	let qs2 = assessment.sections[1];

	let ms2Index = mark.addSection(qs2);
	

	let op4 = qs2.questions[0].options[0];
	mark.addAnswer({
		question: qs2.questions[0],
		options: [op4]
	}, ms2Index);

	let op5 = qs2.questions[1].options[0];
	mark.addAnswer({
		question: qs2.questions[1],
		options: [op5],
		value: 'Ben Nevis'
	}, ms2Index);
	return Promise.all([mark.save()]);
}

let matchReference = (refs, field, value) => {
	if (refs instanceof Array) {
		return _.find(refs,{field: value});
	}
}


let findQuestions = () => {
	return Question.find({})
		.sort({weight:1})
		.populate({
			path: 'feedback',
			model: 'feedback'
		});
}

async function findAssessment() {
	let assm = {};
	await Assessment.findOne({})
		.then(out => assm = out);
	return Assessment.loadFull(ass._id);
}

describe('Creating and reading questions', () => {

	let ass1 = {};

	let questions = [];
	let mark = {};

	before(done => {
		require('events').EventEmitter.prototype._maxListeners = 32;
		const {questions,questionsets,assessments,explanations, answers, marks,categories} = mongoose.connection.collections;
		if (questions) {
			questions.drop()
				.then(_ => questionsets.drop())
				.then(_ => assessments.drop())
				.then(_ => explanations.drop())
				.then(_ => marks.drop())
				.then(_ => categories.drop())
				.then(_ => done())
				.catch(error => {
					done();
				});
		} else {
			done();
		}
	});

	it('Create a dummy question and add two options', (done) => {
		User.find().then(users=> {
				createQuestions(users[1])
				.then(items => {
					findAssessment()
					.then(ass => {
						ass1 = ass;
						createMark(ass1, users[0]).then(_ => {
							Mark.find({})
								.populate([{
									path: 'sections.answers.question',
									model: 'Question'
								}])
								.then(marks => {
									if (marks.length> 0) {
										mark = marks[0];
									}
								});
						});
						assert(ass1.sections.length === 2);			
						done();	
					});
			})
			.catch(error => console.log(error));
		});
	});

	it("has 7 questions", (done) => {
		assert(ass1.numQuestions === 7);
		done();
	});

	it("The question set has two feedback instances.", (done) => {
		assert(ass1.feedback.length === 2);
		done();
	});

	it("The question set feedback is 'Well done!' for scores over 50.", (done) => {
		let fb = ass1.matchFeedback(100);
		assert(fb.explanation.text == "Well done!");
		done();
	});

	it("first question is multiple choice", (done) => {
		assert(ass1.sections[0].questions[0].mode === "multiple_choice");
		done();
	});

	it("first question has feedback with an explanation", (done) => {
		assert(ass1.sections[0].questions[0].feedback.length > 0);
		assert(ass1.sections[0].questions[0].feedback[0].explanation.text == "Good try");
		done();
	});

	it("first question has 4 options and first is Sydney with a feedback explanation", (done) => {
		assert(ass1.sections[0].questions[0].options.length === 4);
		assert(ass1.sections[0].questions[0].options[0].text === 'Sydney');
		assert(ass1.sections[0].questions[0].options[0].feedback.explanation.text.length > 5);
		done();
	});

	it("second question is multiple answer with 7 options", (done) => {
		assert(ass1.sections[0].questions[1].mode === "multiple_answer");
		assert(ass1.sections[0].questions[1].options.length === 7);	
		done();
	});

	it("The 7th option of the second question has a feedback explanation", (done) => {
		assert(ass1.sections[0].questions[1].options[6].feedback.explanation.text.length > 3);	
		done();
	});

	it("The test has been marked with 5 answers", (done) => {
		assert(mark.numAnswers === 5);	
		done();
	});

	it("The first answer is correct and yields 1 point", (done) => {
		assert(mark.sections[0].answers[0].points === 1);
		done();
	});

	it("The second answer is invalidated as 1 option is incorrect", (done) => {
		assert(mark.sections[0].answers[1].points === 0);
		done();
	});

	it("The test yields 6 points", (done) => {
		assert(mark.points == 6);
		done();
	});

	it("The test has a second subsection with at least 1 question", (done) => {		
		assert(ass1.sections[1].questions.length > 0);
		assert(ass1.sections[1].questions[0].options[1].text == "Edinburgh");
		let q1 = ass1.sections[1].questions[0];
		let op2 = q1.getOptionById(q1.options[1]._id)
		done();
	});

});