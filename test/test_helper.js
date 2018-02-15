const mongoose = require('mongoose');
const _ = require('lodash');
const Permission = require('../models/permission');
const Role = require('../models/role');
const User = require('../models/user');

let createPermissions = (done) => {
	let p1 = new Permission({
		identifier: 'access_questions',
		title: 'Access questions',
	});
	let p2 = new Permission({
		identifier: 'edit_questions',
		title: 'Edit questions',
	});
	Promise.all([p1.save(), p2.save()])
		.then(permissions => createRoles(permissions, done))
		.catch(done);
}

let createRoles = (permissions, done) => {
	let p1 = matchReference(permissions,'access_questions'),
	p2 = matchReference(permissions,'edit_questions');

	let r1 = new Role({
		identifier: 'member',
		displayName: 'Member',
		status: 2,
		permissions: [p1]
	});
	let r2 = new Role({
		identifier: 'editor',
		displayName: 'Editor',
		status: 2,
		permissions: [p1,p2]
	});
	Promise.all([r1.save(), r2.save()])
		.then(roles => createUsers(roles, done))
		.catch(done);
}

let matchReference = (refs, identifier) => {
	if (refs instanceof Array) {
		return _.find(refs,{identifier: identifier});
	}
}

let createUsers = (roles, done) => {
	let r1 = matchReference(roles,'member'),
	r2 = matchReference(roles,'editor');
	let u1 = new User({
		identifier: 'mark1',
		displayName: 'Mark One',
		loginMode: 'facebook',
		status: 2,
		roles: [r1]
	});
	let u2 = new User({
		identifier: 'sarah2',
		displayName: 'Sarah Two',
		loginMode: 'google',
		status: 2,
		roles: [r2]
	});
	Promise.all([u1.save(), u2.save()])
		.then(() => done())
		.catch(() => done());
}


beforeEach(done => {
	mongoose.connect('mongodb://localhost/mwt_test');
	mongoose.connection
		.once('open', () => done())
		.on("error", err => {
			console.warn("Warning", err);
		});
});

beforeEach(done => {

	const {permissions} = mongoose.connection.collections;
	if (permissions) {
		permissions.drop()
			.then(() => done())
			.catch(error => {
				done();
			});
	} else {
		done();
	}
});

beforeEach(done => {

	const {roles} = mongoose.connection.collections;
	if (roles) {
		roles.drop()
			.then(() => done())
			.catch(error => {
				done();
			});
	} else {
		done();
	}
});

beforeEach(done => {

	const {users} = mongoose.connection.collections;
	if (users) {
		users.drop()
			.then(() => createPermissions(done))
			.catch(error => {
				createPermissions(done);
			});
	} else {
		createPermissions(done);
	}
});

