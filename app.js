const express = require('express');
const mongoose = require("mongoose");
const path = require('path');
const tutorsGenerator = require("./report_makers/queryTutorHours");
const kivunAGenerator = require("./report_makers/queryKivunA");
const kivunBGenerator = require("./report_makers/queryKivunB");
const kivunCGenerator = require("./report_makers/queryKivunC");
const {AuthControllerRouter, tokenVerifier} = require('./auth/authController');
const asyncMiddleware = require("./middleware/middleware");
const bodyParser = require('body-parser');
const accessControls = require('./auth/accessControls');
var cors = require('cors');


const address =  process.env.address || "mongodb+srv://ariekfiri:CLZR4KxsjdTTGbz@cluster0-dmeus.gcp.mongodb.net/test?retryWrites=true&w=majority";

const app = express();

app.use(cors({origin: '*'}));
app.use(accessControls);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api/auth', AuthControllerRouter);
app.use(tokenVerifier);


const createDownload = (req, res) => {
    const month = req.query.month;
    const filename = req.query.filename;
    res.sendFile(path.resolve(path.join(__dirname, `./reports/${month}-${filename}`)), function(err){
        if(err) {
            console.log(err);
        }else{
            console.log('successfully sent the file');
        }
    });

}
app.get("/reports/queryTutorsHours", function(req, res, next) {
    req.query.reporter = tutorsGenerator;
    req.query.filename = 'tutors.csv';
    next();
})


app.get("/reports/queryKivunA", function(req, res, next) {
    req.query.reporter = kivunAGenerator;
    req.query.filename = 'kivunA.csv';
    next();
})

app.get("/reports/queryKivunB", function(req, res, next) {
    req.query.reporter = kivunBGenerator;
    req.query.filename = 'kivunB.csv';
    next();
})

app.get("/reports/queryKivunC", function(req, res, next) {
    req.query.reporter = kivunCGenerator;
    req.query.filename = 'kivunC.csv';
    next();
})


app.get("/reports/*", asyncMiddleware, function(req, res) {
    createDownload(req, res);
})


const port = process.env.PORT || 3000;

app.listen(port, async() => {
    console.log('listening on port ' + port);
    await mongoose
      .connect(address,  { useUnifiedTopology: true, useNewUrlParser: true })
      .then(() => console.log("Connected to MongoDB..."))
      .catch(err => console.error("Could not connect to MongoDB...", err));
})