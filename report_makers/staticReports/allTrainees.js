var MongoClient = require("mongodb").MongoClient
var ObjectId = require("mongodb").ObjectId
const lib = require("lodash")
const XLSX = require("xlsx")
const formatDate = require("../../util/helpFunction").formatDate
var fs = require('fs');
var path = require("path")
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ path: "../../.env" })
}
const generateXlsxFile = (report, filename) => {
    return new Promise((resolve, reject) => {
        const book = XLSX.utils.book_new()

        const sheet = XLSX.utils.aoa_to_sheet(report)
        XLSX.utils.book_append_sheet(book, sheet, "sheet1")
        // if (!fs.existsSync(`../../reports`)){
        //     fs.mkdirSync(`../../reports`);
        // }
        let pathToFile = path.join(__dirname, `../../reports/${filename}.xlsx`)
        XLSX.writeFile(book, pathToFile)
        resolve()
    })
}


let monngoAddress = process.env.ADDRESS
let client = undefined

let fields_for_reporters =
    "fname lname id realAddress email phoneA needsHelpIn studyYear institute mainStudy isRegisteredToKivun realAddress"

async function connnectClient() {
    client = new MongoClient(monngoAddress, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    await client.connect()
}

async function getTrainess(conditionns, fields) {
    const trainees = await client
        .db("test")
        .collection("trainees")
        .find(conditionns)
        .toArray()
    return trainees
}

async function generateTrainees(month) {
    let traineesTable = [
        [
            "First Name",
            "Last Name",
            "ID",
            "mobile",
            "mobile2",
            "email",
            "address-as-in-id",
            "address",
            "Institution",
            "Main-study",
            "Degree / Mechina",

            "activityArea",
            "birthDate",
            "englishLevel",
            "isActive",
            "isDropped",
            "isFinnishPreparatory",
            "isFoundJob",
            "isGraduated",
            "isHaveAnotherDegree",
            "isInMagid",
            "isJobInStudyFelid",
            "isLearnedInYeshiva",
            "isLiveInSelectedCities",
            "isNeedAdditionalRelation",
            "isRegisteredToKivun",
            "isServed",
            "leavingReason",
            "maritalStatus",
            "mathLevel",
            "needsHelpIn",
            "notes",
            "physicsLevel",
            "previousDegree",
            "previousProfession",
            "religiousStatus",
            "religiousText",
            "studyYear",
            "WantDetailsAbout",
            "workStatus",
            "workTitle",
            "yeshivaTimes",
            "Sign-date",
        ],
    ]

    await connnectClient()
    const institutes = await client
        .db("test")
        .collection("institutes")
        .find({})
        .toArray()
    const mainStudy = await client
        .db("test")
        .collection("academicdetails")
        .find({})
        .toArray()

    const activityAreas = await client
        .db("test")
        .collection("areas")
        .find({})
        .toArray()

    // reporters report

    let trainees = await getTrainess({})

    trainees.forEach((trainee) => {
        let institute = "",
            mainnStudy = "",
            activityArea = ""
        let instituteRes = institutes.find(
            (institute) =>
                institute._id.toString() == trainee.institute.toString()
        )
        if (instituteRes) {
            institute = instituteRes.name
        }
        let mainStudyRes = mainStudy.find(
            (study) => study._id.toString() == trainee.mainStudy.toString()
        )
        if (mainStudyRes) {
            mainnStudy = mainStudyRes.name
        }

        let activityAreaRes = activityAreas.find(
            (area) => area._id.toString() == trainee.activityArea.toString()
        )
        if (activityAreaRes) {
            activityArea = activityAreaRes.name
        }

        traineesTable.push([
            trainee.fname,
            trainee.lname,
            trainee.id,
            trainee.phoneA,
            trainee.phoneB,
            trainee.email,
            trainee.realAddress.street +
                " , " +
                trainee.realAddress.neighborhood +
                " , " +
                trainee.realAddress.city,
            trainee.currentAddress.street +
                " , " +
                trainee.currentAddress.neighborhood +
                " , " +
                trainee.currentAddress.city,

            institute,
            mainnStudy,
            mainnStudy.trim() == "מכינה" ? mainnStudy : "תואר",
            activityArea,
            trainee.birthDate,
            trainee.englishLevel,
            trainee.isActive,
            trainee.isDropped,
            trainee.isFinnishPreparatory,
            trainee.isFoundJob,
            trainee.isGraduated,
            trainee.isHaveAnotherDegree,
            trainee.isInMagid,
            trainee.isJobInStudyFelid,
            trainee.isLearnedInYeshiva,
            trainee.isLiveInSelectedCities,
            trainee.isNeedAdditionalRelation,
            trainee.isRegisteredToKivun,
            trainee.isServed,
            trainee.leavingReason,
            trainee.maritalStatus,
            trainee.mathLevel,
            trainee.needsHelpIn,
            trainee.notes,
            trainee.physicsLevel,
            trainee.previousDegree,
            trainee.previousProfession,
            trainee.religiousStatus,
            trainee.religiousText,
            trainee.studyYear,
            trainee.WantDetailsAbout,
            trainee.workStatus,
            trainee.workTitle,
            trainee.yeshivaTimes,
            formatDate(trainee._id.getTimestamp()),
        ])
    })

    await generateXlsxFile(traineesTable, "allTrainees")

    return
}

module.exports = generateTrainees
// generateTrainees().then(() => console.log())
