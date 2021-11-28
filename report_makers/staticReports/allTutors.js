var MongoClient = require("mongodb").MongoClient
var ObjectId = require("mongodb").ObjectId
const lib = require("lodash")
const XLSX = require("xlsx")

const generateXlsxFile = (report, filename) => {
    return new Promise((resolve, reject) => {
        const book = XLSX.utils.book_new()

        const sheet = XLSX.utils.aoa_to_sheet(report)
        XLSX.utils.book_append_sheet(book, sheet, "sheet1")
        XLSX.writeFile(book, `reports/${filename}.xlsx`)
        resolve()
    })
}
let monngoAddress =
    "mongodb+srv://ariekfiri:CLZR4KxsjdTTGbz@cluster0-dmeus.gcp.mongodb.net/test?retryWrites=true&w=majority"

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

async function getTutors(conditionns, fields) {
    const tutors = await client
        .db("test")
        .collection("tutors")
        .find(conditionns)
        .toArray()
    return tutors
}

async function main(startDate, finishDate) {
    let traineesTable = [
        [
            "First Name",
            "Last Name",
            "mobile",
            "email",
            "address-as-in-id",
            "address",
            "academic plan",
            "Institution",
            "Main study",
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


        traineesTable.push([
            trainee.fname,
            trainee.lname,
            trainee.phoneA,
            trainee.email,
            trainee.realAddress && (trainee.realAddress.street +
                " , " +
                trainee.realAddress.neighborhood +
                " , " +
                trainee.realAddress.city),
                trainee.currentAddress && (trainee.currentAddress.street +
                " , " +
                trainee.currentAddress.neighborhood +
                " , " +
                trainee.currentAddress.city),
            trainee.academicPlan,

            institute,
            mainnStudy,
        ])
    })

    await generateXlsxFile(traineesTable, "allTutors")

    return
}

main().then(() => console.log())
