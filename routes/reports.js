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

router.get("/staticReport", async function (req, res, next) {
    // const io = req.app.get('socketio');
    // res.sendStatus(200);
    let filename = `${req.query.reportType}.xlsx`
    let pathToFile = undefined
    switch (req.query.reportType) {
        case "quaterlyKivunReport":
            await generateReport(req.query.month, filename)
            pathToFile = path.join(__dirname, `../reports/${filename}`)
            console.log(pathToFile)
            fs.exists(pathToFile, function (exists) {
                if (exists) {
                    res.sendFile(pathToFile)
                }
            })
            break

        case "allTrainees":
            await generateReportTrainees(req.query.month, filename)
            pathToFile = path.join(__dirname, `../reports/${filename}`)
            console.log(pathToFile)
            fs.exists(pathToFile, function (exists) {
                if (exists) {
                    res.sendFile(pathToFile)
                }
            })
            break

        case "allTutors":
            await generateReportTutors(req.query.month, filename)
            pathToFile = path.join(__dirname, `../reports/${filename}`)
            console.log(pathToFile)
            fs.exists(pathToFile, function (exists) {
                if (exists) {
                    res.sendFile(pathToFile)
                }
            })
            break
        default:
            next()
    }

})

router.get("/staticReport", function (req, res, next) {
    // const io = req.app.get('socketio');
    // res.sendStatus(200);

    req.query.reportName = `${req.query.reportType}_${req.query.month}`
    req.query.filename = `${req.query.reportName}.xlsx`
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
        console.log(pathToFile)
        fs.exists(pathToFile, function (exists) {
            if (exists) {
                res.sendFile(pathToFile)
            }
        })
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
