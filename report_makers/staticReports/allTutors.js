var MongoClient = require("mongodb").MongoClient
var ObjectId = require("mongodb").ObjectId
const lib = require("lodash")
const XLSX = require("xlsx")
var path = require("path")

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ path: "../../.env" })
}

const formatDate = require("../../util/helpFunction").formatDate
const getHour = require("../../util/helpFunction").getHour
const generateXlsxFile = (report, filename) => {
    return new Promise((resolve, reject) => {
        const book = XLSX.utils.book_new()

        const sheet = XLSX.utils.aoa_to_sheet(report)
        XLSX.utils.book_append_sheet(book, sheet, "sheet1")
        // if (!fs.existsSync(`../../reports`)){
        //     fs.mkdirSync(`../../reports`);
        // }
        let pathToFile = path.join(__dirname, `../../reports/${filename}`)
        XLSX.writeFile(book, pathToFile)
        resolve()
    })
}
let monngoAddress = process.env.ADDRESS

let client = undefined

const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
]

let fields_for_reporters =
    "fname lname id realAddress email phoneA needsHelpIn studyYear institute mainStudy isRegisteredToKivun realAddress"

async function connnectClient() {
    client = new MongoClient(monngoAddress, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    await client.connect()
}

async function getTutors(conditionns, fields) {
    const tutors = await client
        .db("test")
        .collection("tutors")
        .find(conditionns)
        .toArray()
    return tutors
}

async function generateTutors(filename) {
    let traineesTable = [
        [
            "First Name",
            "Last Name",
            "ID",
            "mobile",
            "email",
            "address-as-in-id",
            "address",
            "academic plan",
            "scholarship",
            "Institution",
            "Main study",
            "activityArea",
            "additionalTopics",
            "englishLevel",
            "isActive",
            "isApproved",
            "isCityScholarship",
            "isFinnishPreparatory",
            "isForAcademicPoints",
            "isFoundJob",
            "isFromUniformToStudies",
            "isGraduated",
            "isImpact",
            "isJobInStudyFelid",
            "isNeedAdditionalRelation",
            "isShachak",
            "maritalStatus",
            "mathLevel",
            "notes",
            "physicsLevel",
            "religiousStatus",
            "religiousText",
            "scholarshipTimes",
            "studyYear",
            "stuffNotes",
            "unavailableTimes",
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

    let tutors = await getTutors({})

    tutors.forEach((trainee) => {
        let institute = "",
            mainnStudy = ""
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
        let unavailableTimes = ""
        if (trainee.unavailableTimes) {
            trainee.unavailableTimes.forEach((time) => {
                unavailableTimes =
                    unavailableTimes +
                    `${days[time.day - 1]}: ${getHour(
                        time.Time.start
                    )} - ${getHour(time.Time.end)}, `
            })
        }

        let typeOfScholar = ""
        if (trainee.isCityScholarship) {
            typeOfScholar = "City Scholarship"
        } else {
            if (trainee.isImpact) {
                typeOfScholar = "Impact"
            } else {
                if (trainee.isShachak) {
                    typeOfScholar = "Shachak"
                } else {
                    if (trainee.isForAcademicPoints) {
                        typeOfScholar = "Academic Points"
                    } else {
                        if (trainee.isFromUniformToStudies) {
                            typeOfScholar = "From Uniform To Studies"
                        } else {
                            typeOfScholar = "Other"
                        }
                    }
                }
            }
        }

        traineesTable.push([
            trainee.fname,
            trainee.lname,
            trainee.id,
            trainee.phoneA,
            trainee.email,
            trainee.realAddress &&
                trainee.realAddress.street +
                    " , " +
                    trainee.realAddress.neighborhood +
                    " , " +
                    trainee.realAddress.city,
            trainee.currentAddress &&
                trainee.currentAddress.street +
                    " , " +
                    trainee.currentAddress.neighborhood +
                    " , " +
                    trainee.currentAddress.city,
            trainee.academicPlan,
            typeOfScholar,
            institute,
            mainnStudy,
            activityArea,
            trainee.additionalTopics,
            trainee.englishLevel,
            trainee.isActive,
            trainee.isApproved,
            trainee.isCityScholarship,
            trainee.isFinnishPreparatory,
            trainee.isForAcademicPoints,
            trainee.isFoundJob,
            trainee.isFromUniformToStudies,
            trainee.isGraduated,
            trainee.isImpact,
            trainee.isJobInStudyFelid,
            trainee.isNeedAdditionalRelation,
            trainee.isShachak,
            trainee.maritalStatus,
            trainee.mathLevel,
            trainee.notes,
            trainee.physicsLevel,
            trainee.religiousStatus,
            trainee.religiousText,
            trainee.scholarshipTimes,
            trainee.studyYear,
            trainee.stuffNotes,
            unavailableTimes,
            formatDate(trainee._id.getTimestamp()),
        ])
    })

    await generateXlsxFile(traineesTable, filename)

    return
}

// generateTutors().then(() => console.log())
module.exports = generateTutors
