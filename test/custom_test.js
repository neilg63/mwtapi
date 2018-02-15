const assert = require('assert');
const mongoose = require('mongoose');
const Custom = require('../models/custom');

let createCustom = () => {
	let m1 = new Custom({
		validity: 'correct',
		text: 'Antartica',
		edited: new Date()
	});
	let m2 = new Custom({
		validity: 'incorrect',
		value: [38.45,303.33],
		edited: new Date()
	});
	let m3 = new Custom({
		validity: 'subjective',
		value: true,
		edited: new Date()
	});
	let m4 = new Custom({
		validity: 'subjective',
		value: {height:45.3,width:67.98},
		edited: new Date()
	});
	let m5 = new Custom({
		validity: 'subjective',
		value: 48446.30474,
		edited: new Date()
	});

	let m6 = new Custom({
		validity: 'incorrect',
		value: "Some text",
		edited: new Date()
	});

	return Promise.all([m1.save(), m2.save(), m3.save(), m4.save(), m5.save(), m6.save()]);
}

describe('Create and read custom items', () => {

	beforeEach(done => {
		const {customs} = mongoose.connection.collections;
		if (customs) {
			customs.drop()
				.then(() => done())
				.catch(error => {
					done();
				});
		} else {
			done();
		}
	});

	it('Create custom items', (done) => {
		createCustom()
			.then(_ => {
				Custom.find({})
				.then(items => {
					assert(items.length === 6);
					done();
				})
				.catch(error => console.log(error));
			})
			.catch(error => console.log(error));
		
	});


});