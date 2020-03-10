const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const generateReportMiddleware = require('../middleware/generateReport');
const tutorsGenerator = require("../report_makers/queryTutorHours");
const kivunAGenerator = require("../report_makers/queryKivunA");
const kivunBGenerator = require("../report_makers/queryKivunB");
const kivunCGenerator = require("../report_makers/queryKivunC");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get("/queryTutorsHours", function(req, res, next) {
    req.query.reporter = tutorsGenerator;
    next();
})


router.get("/queryKivunA", function(req, res, next) {
    req.query.reporter = kivunAGenerator;
    next();
})

router.get("/queryKivunB", function(req, res, next) {
    req.query.reporter = kivunBGenerator;
    next();
})

router.get("/queryKivunC", function(req, res, next) {
    req.query.reporter = kivunCGenerator;
    next();
})


router.get("/*", generateReportMiddleware, function(req, res) {
    res.send(res.locals.report);
})



  module.exports = {
    reportRouter: router,
  }