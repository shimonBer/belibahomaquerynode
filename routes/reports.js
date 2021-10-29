const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const generateXlsxFile = require('../middleware/xlsxGenerator');
const uploadFileToCloudStroage = require('../middleware/googleStorage');
const generateReportMiddleware = require('../middleware/generateReport');
const { setValueRedis, client } = require('../middleware/redis'); 
const tutorsGenerator = require("../report_makers/staticReports/queryTutorHours");
const kivunAGenerator = require("../report_makers/staticReports/queryKivunA");
const MedavhimGenerator = require("../report_makers/staticReports/queryMedavhim");
const kivunBGenerator = require("../report_makers/staticReports/queryKivunB");
const kivunCGenerator = require("../report_makers/staticReports/queryKivunC");
const generalParticipentsGenerator = require("../report_makers/staticReports/queryGeneralParticipents");
const generalParticipentsServedGenerator = require("../report_makers/staticReports/queryGeneralParticipentsServed");
const allMonthsHoursGenerator = require("../report_makers/staticReports/queryMonthlyHours");



const reportGenerators = {
    queryTutorsHours: tutorsGenerator,
    queryKivunA: kivunAGenerator,
    queryMedavhim: MedavhimGenerator,
    queryKivunB: kivunBGenerator,
    queryKivunC: kivunCGenerator,
    queryGeneralParticipents: generalParticipentsGenerator,
    queryGeneralParticipentsServed: generalParticipentsServedGenerator,
    queryAllMonthsHoursGenerator: allMonthsHoursGenerator
}

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// router.get("/staticReport", function(req, res, next) {
//     req.query.reportName = `${req.query.reportType}_${req.query.month}`;
//     client.get(req.query.reportName, function(err, value) {
//         if(value){
//             res.send({downloadURL: value});
//         } else {
//             if(err){
//                 console.log(err);
//                 return;
//             }
//             req.query.filename = `${req.query.reportName}.xlsx`;
//             req.query.reporter = reportGenerators[req.query.reportType];
//             next();
//         }
//     });
// })

router.get("/staticReport", function(req, res, next) {
    // const io = req.app.get('socketio');
    res.sendStatus(200);
  
    req.query.reportName = `${req.query.reportType}_${req.query.month}`;
    req.query.filename = `${req.query.reportName}.xlsx`;
    req.query.reporter = reportGenerators[req.query.reportType];
    next();
})

router.get("/reportNames", function(req, res) {
    res.send(Object.keys(reportGenerators));

})

// router.get("/*", generateReportMiddleware, generateXlsxFile, uploadFileToCloudStroage, setValueRedis, function(req, res) {
//     res.send({downloadURL: req.query.downloadURL});
// })

router.get("/*", generateReportMiddleware, generateXlsxFile, uploadFileToCloudStroage, function(req, res) {
    // res.send({downloadURL: req.query.downloadURL});
    const io = req.app.get('socketio');
    io.emit("finishReport", {downloadURL: req.query.downloadURL});

})

  module.exports = {
    reportRouter: router,
  }