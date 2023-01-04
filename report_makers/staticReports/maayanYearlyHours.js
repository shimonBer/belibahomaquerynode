var MongoClient = require("mongodb").MongoClient
var ObjectId = require("mongodb").ObjectId
const XLSX = require("xlsx")
var path = require("path")
const lib = require("lodash")

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

async function getUsers(conditionns, fields) {
    const tutors = await client
        .db("test")
        .collection("users")
        .find({ program: { $in: [ "maayanbamidbarhebrew", "maayanbamidbararabic" ]} })
        .toArray()
    return tutors
}

async function generateTutors(filename, year) {
    let traineesTable = [
        [
            "First Name",
            "Last Name",
            "id",
            "email",
            "Total hours " + year
            
        ],
    ]

    await connnectClient()
   

    let users = await getUsers({})
    let allReports = await await client
    .db("test")
    .collection("maayanbamidbarreports")
    .find({date : {
        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
        $lt: new Date(`${year}-12-31T00:00:00.000Z`),
    }})
    .toArray()

    users.forEach((user) => {

        let relevant = allReports.filter(
            (report) =>
                report.user_id.toString() == user._id.toString()
        )
        let total = lib.sumBy(relevant, (val) => {
            return val.studyTime
        })
       
        traineesTable.push([
            user.fname,
            
            user.lname,
            user.id,
            user.email,
            total
        ])
    })

    await generateXlsxFile(traineesTable, filename)

    return
}

// generateTutors().then(() => console.log())
module.exports = generateTutors
