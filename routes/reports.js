const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const generateXlsxFile = require('../middleware/xlsxGenerator');
const uploadFileToCloudStroage = require('../middleware/googleStorage');
const generateReportMiddleware = require('../middleware/generateReport');
const { setValueRedis, client } = require('../middleware/redis'); 
const tutorsGenerator = require("../report_makers/queryTutorHours");
const kivunAGenerator = require("../report_makers/queryKivunA");
const kivunBGenerator = require("../report_makers/queryKivunB");
const kivunCGenerator = require("../report_makers/queryKivunC");

const reportGenerators = {
    queryTutorsHours: tutorsGenerator,
    queryKivunA: kivunAGenerator,
    queryKivunB: kivunBGenerator,
    queryKivunC: kivunCGenerator
}

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get("/staticReport", function(req, res, next) {
    req.query.reportName = `${req.query.reportType}_${req.query.month}`;
    client.get(req.query.reportName, function(err, value) {
        if(value){
            res.send({downloadURL: value});
        } else {
            if(err){
                console.log(err);
                return;
            }
            req.query.filename = `${req.query.reportName}.xlsx`;
            req.query.reporter = reportGenerators[req.query.reportType];
            next();
        }
    });
})

router.get("/*", generateReportMiddleware, generateXlsxFile, uploadFileToCloudStroage, setValueRedis, function(req, res) {
    res.send({downloadURL: req.query.downloadURL});
})

  module.exports = {
    reportRouter: router,
  }