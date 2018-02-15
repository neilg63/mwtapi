const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const api = require('./routes/api');

mongoose.Promise = global.Promise;

if (process.env.NODE_ENV !== "test")  {
	mongoose.connect('mongodb://localhost/mwt_test');
}


app.use(bodyParser.json());

app.use('/api', api);

app.use((err, req, res, next) => {
	res.status(424).send({error: err.message});
});

module.exports = app;