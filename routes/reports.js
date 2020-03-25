const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const generateXlsxFile = require('../middleware/xlsxGenerator');
const uploadFileToCloudStroage = require('../middleware/googleStorage');
const generateReportMiddleware = require('../middleware/generateReport');
const tutorsGenerator = require("../report_makers/queryTutorHours");
const kivunAGenerator = require("../report_makers/queryKivunA");
const kivunBGenerator = require("../report_makers/queryKivunB");
const kivunCGenerator = require("../report_makers/queryKivunC");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get("/queryTutorsHours", function(req, res, next) {
    req.query.filename = 'queryTutorsHours';
    req.query.reporter = tutorsGenerator;
    next();
})


router.get("/queryKivunA", function(req, res, next) {
    req.query.filename = 'queryKivunA';
    req.query.reporter = kivunAGenerator;
    next();
})

router.get("/queryKivunB", function(req, res, next) {
    req.query.filename = 'queryKivunB';
    req.query.reporter = kivunBGenerator;
    next();
})

router.get("/queryKivunC", function(req, res, next) {
    req.query.filename = 'queryKivunC';
    req.query.reporter = kivunCGenerator;
    next();
})


router.get("/*", generateReportMiddleware, generateXlsxFile, uploadFileToCloudStroage, function(req, res) {
    res.send({filename: req.query.fullFilename});
})

  module.exports = {
    reportRouter: router,
  }