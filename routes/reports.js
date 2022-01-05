const express = require("express")
const router = express.Router()
const bodyParser = require("body-parser")
const generateXlsxFile = require("../middleware/xlsxGenerator")
// const uploadFileToCloudStroage = require('../middleware/googleStorage');
const generateReportMiddleware = require("../middleware/generateReport")
// const { setValueRedis, client } = require('../middleware/redis');
const tutorsGenerator = require("../report_makers/staticReports/queryTutorHours")
const kivunAGenerator = require("../report_makers/staticReports/queryKivunA")
const kivunBGenerator = require("../report_makers/staticReports/queryKivunB")
const kivunCGenerator = require("../report_makers/staticReports/queryKivunC")
const generalParticipentsGenerator = require("../report_makers/staticReports/queryGeneralParticipents")
const generalParticipentsServedGenerator = require("../report_makers/staticReports/queryGeneralParticipentsServed")
const allMonthsHoursGenerator = require("../report_makers/staticReports/queryMonthlyHours")
const generateReport = require("../report_makers/staticReports/generateQuaterlyKivunReports")
const generateReportTrainees = require("../report_makers/staticReports/allTrainees")
const generateReportTutors = require("../report_makers/staticReports/allTutors")
var uuid = require("uuid")

var path = require("path")
var fs = require("fs")

const reportGenerators = {
    queryTutorsHours: tutorsGenerator,
    queryKivunA: kivunAGenerator,
    queryKivunB: kivunBGenerator,
    queryKivunC: kivunCGenerator,
    queryGeneralParticipents: generalParticipentsGenerator,
    queryGeneralParticipentsServed: generalParticipentsServedGenerator,
    queryAllMonthsHoursGenerator: allMonthsHoursGenerator,
}

let reportDict = {}

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

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

router.get("/staticReport/get", function (req, res, next) {
    // const io = req.app.get('socketio');
    // res.sendStatus(200);

    let reportId = req.query.reportId
    let pathToFile = reportDict[reportId]
    console.log(pathToFile)
    fs.exists(pathToFile, function (exists) {
        if (exists) {
            res.sendFile(pathToFile)
        } else {
            res.send("Not ready")
        }
    })
})

router.get("/staticReport", async function (req, res, next) {
    // const io = req.app.get('socketio');
    // res.sendStatus(200);
    let reportId = undefined
    let filename = undefined
    let reportName = undefined

    switch (req.query.reportType) {
        case "quaterlyKivunReport":
            reportId = uuid.v4()
            reportName = `${req.query.reportType}_${req.query.from}_${req.query.to}`
            filename = `${reportName}.xlsx`
            reportDict[reportId] = path.join(
                __dirname,
                `../reports/${filename}`
            )
            res.send(reportId)
            await generateReport(req.query.from, req.query.to, filename)

            break

        case "allTrainees":
            reportId = uuid.v4()
            reportName = `${req.query.reportType}_${req.query.from}_${req.query.to}`
            filename = `${reportName}.xlsx`
            reportDict[reportId] = path.join(
                __dirname,
                `../reports/${filename}`
            )
            res.send(reportId)
            await generateReportTrainees(filename)

            break

        case "allTutors":
            reportId = uuid.v4()
            reportName = `${req.query.reportType}_${req.query.from}_${req.query.to}`
            filename = `${reportName}.xlsx`
            reportDict[reportId] = path.join(
                __dirname,
                `../reports/${filename}`
            )
            res.send(reportId)
            await generateReportTutors(filename)

            break
        default:
            next()
    }
})

router.get("/staticReport", function (req, res, next) {
    // const io = req.app.get('socketio');
    // res.sendStatus(200);

    let reportId = uuid.v4()
    let reportName = `${req.query.reportType}_${req.query.from}_${req.query.to}`
    let filename = `${reportName}.xlsx`
    reportDict[reportId] = path.join(__dirname, `../reports/${filename}`)
    res.send(reportId)

    req.query.reportName = `${req.query.reportType}_${req.query.month}`
    req.query.filename = filename
    req.query.reporter = reportGenerators[req.query.reportType]
    next()
})

router.get(
    "/*",
    generateReportMiddleware,
    generateXlsxFile,
    function (req, res) {
        let pathToFile = path.join(
            __dirname,
            `../reports/${req.query.filename}`
        )
        // console.log(pathToFile)
        // fs.exists(pathToFile, function (exists) {
        //     if (exists) {
        //         res.sendFile(pathToFile)
        //     }
        // })
    }
)

router.get("/reportNames", function (req, res) {
    res.send(Object.keys(reportGenerators))
})

// router.get("/*", generateReportMiddleware, generateXlsxFile, uploadFileToCloudStroage, setValueRedis, function(req, res) {
//     res.send({downloadURL: req.query.downloadURL});
// })

module.exports = {
    reportRouter: router,
}
