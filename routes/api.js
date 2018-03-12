const express = require('express');
const router = express.Router();
const ApiController = require('../controllers/api_controller')

router.post('/login', function(req, res) {
	let params = req.params;
	ApiController.login(params)
		.then(data => {
			res.send(data);
		}).catch(e => {
			res.send(e);
		});
});

router.post('/register', function(req, res) {
	let params = req.params;
	ApiController.register(params)
		.then(data => {
			res.send(data);
		}).catch(e => {
			res.send(e);
		});
});

router.get('/assessments/:userId', function(req, res) {
	let params = req.params;
	ApiController.userAssessments(params)
		.then(data => {
			res.send(data);
		}).catch(e => {
			res.send(e);
		});
});

router.get('/assessments/:start?/:limit?', function(req, res) {
	let params = req.query, start = 0, limit = 100;
	if (req.params.start) {
		start = parseInt(req.params.start);
	}
	if (req.params.limit) {
		limit = parseInt(req.params.limit);
	}
	ApiController.listAssessments(params,start,limit)
		.then(data => {
			res.send(data);
		}).catch(e => {
			res.send(e);
		});
});

router.get('/assessment/:id/:userId', function(req, res) {
	let params = req.params;
	ApiController.getAssessment(params.id, params.userId)
		.then(assessment => {
			res.send(assessment);
		}).catch(e => {
			res.send(e);
		});
});

router.get('/categories', function(req, res) {
	let params = req.params;
	ApiController.listCategories()
		.then(cats => {
			res.send(cats);
		}).catch(e => {
			res.send(e);
		});
});

router.post('/mark', function(req, res) {
	ApiController.markQuestion(req.body)
		.then(data => {
			res.send(data);
		}).catch(e => {
			res.send(e);
		});
});

module.exports = router;