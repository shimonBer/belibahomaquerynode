const express = require('express');
const mongoose = require("mongoose");
const tutorsGenerator = require("./report_makers/queryTutorHours");
const kivunAGenerator = require("./report_makers/queryKivunA");
const kivunBGenerator = require("./report_makers/queryKivunB");
const kivunCGenerator = require("./report_makers/queryKivunC");
const { AuthControllerRouter, tokenVerifier } = require('./auth/authController');
const asyncMiddleware = require("./middleware/middleware");
const bodyParser = require('body-parser');
const accessControls = require('./auth/accessControls');
const cors = require('cors');
const { connectionstring } = require('./config');


const address =  process.env.address || connectionstring;

const app = express();

app.use(cors({origin: '*'}));
app.use(accessControls);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api/auth', AuthControllerRouter);
app.use(tokenVerifier);


app.get("/reports/queryTutorsHours", function(req, res, next) {
    req.query.reporter = tutorsGenerator;
    next();
})


app.get("/reports/queryKivunA", function(req, res, next) {
    req.query.reporter = kivunAGenerator;
    next();
})

app.get("/reports/queryKivunB", function(req, res, next) {
    req.query.reporter = kivunBGenerator;
    next();
})

app.get("/reports/queryKivunC", function(req, res, next) {
    req.query.reporter = kivunCGenerator;
    next();
})


app.get("/reports/*", asyncMiddleware, function(req, res) {
    res.send(res.locals.report);
})


const port = process.env.PORT || 3000;

app.listen(port, async() => {
    console.log('listening on port ' + port);
    await mongoose
      .connect(address,  { useUnifiedTopology: true, useNewUrlParser: true })
      .then(() => console.log("Connected to MongoDB..."))
      .catch(err => console.error("Could not connect to MongoDB...", err));
})