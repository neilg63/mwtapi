const assert = require('assert');
const _ = require('lodash');
const Permission = require('../models/permission');
const Role = require('../models/role');
const User = require('../models/user');


let findUsers = () => {
	return User.find({})
		.sort({identifier: 1})
		.populate({
			path: 'roles',
			model: 'role',
			populate: {
				path: 'permissions',
				model: 'permission'
			}
		});
}

describe('Reading users out of the database', () => {


	it('Create dummy users and check first user identifier is mark1', (done) => {
		findUsers()
			.then(users => {
				assert(users.length === 2);
				assert(users[0].identifier == "mark1");
				done();
		})
		.catch(error => console.log(error));

	});

	it('Create dummy users and check first user has 1 role as a member', (done) => {
		findUsers()
			.then(users => {
				assert(users[0].roles.length > 0);
				assert(users[0].roles[0].identifier == "member");
				done();
			})
			.catch(error => console.log(error));

	});

	it('Create dummy users and check the first user has permission to access questions', (done) => {
		findUsers()
			.then(users => {
				assert(users[0].roles[0].permissions.length  > 0);
				assert(users[0].roles[0].permissions[0].identifier  == "access_questions");
				done();
			})
			.catch(error => console.log(error));

	});

});