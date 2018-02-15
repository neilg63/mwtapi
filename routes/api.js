const express = require('express');
const router = express.Router();
const ApiController = require('../controllers/api_controller')

router.get('/qsets/:start?/:limit?', function(req, res) {
	let params = req.query, start = 0, limit = 100;
	if (req.params.start) {
		start = parseInt(req.params.start);
	}
	if (req.params.limit) {
		limit = parseInt(req.params.limit);
	}
	ApiController.listQuestionSets(params,start,limit)
		.then(qSets => {
			res.send(qSets);
		}).catch(e => {
			res.send(e);
		});
});

router.get('/qset/:id', function(req, res) {
	let params = req.params;
	ApiController.getQuestionSet(params.id)
		.then(qSets => {
			res.send(qSets);
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

module.exports = router;