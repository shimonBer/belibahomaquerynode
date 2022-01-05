var MongoClient = require("mongodb").MongoClient
var ObjectId = require("mongodb").ObjectId
const lib = require("lodash")
const XLSX = require("xlsx")
const fs = require("fs")
var path = require("path")
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ path: "../../.env" })
}
const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
]

let book = undefined

function formatDateToReadableFormat(date) {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

const addSheetToXlsxFile = (report, sheetName) => {
    return new Promise((resolve, reject) => {
        const sheet = XLSX.utils.aoa_to_sheet(report)
        XLSX.utils.book_append_sheet(book, sheet, sheetName)
        resolve()
    })
}

const saveSheeToFile = (filename) => {
    return new Promise((resolve, reject) => {
        // if (!fs.existsSync(`../../reports`)) {
        //     fs.mkdirSync(`../../reports`)
        // }
        let pathToFile = path.join(__dirname, `../../reports/${filename}`)
        XLSX.writeFile(book, pathToFile)

        resolve()
    })
}
let monngoAddress = process.env.ADDRESS

let client = undefined
let reporters_allowed_cities = [
    "ירושלים",
    "ירושליים",
    "גבעת זאב",
    "קרית יערים",
    "קריית יערים",
    "תל סטון",
    "תל ציון",
]

let fields_for_reporters =
    "fname lname id realAddress email phoneA needsHelpIn studyYear institute mainStudy isRegisteredToKivun realAddress"
let fields_for_nonn_reporters =
    "fname lname email needsHelpIn institute realAddress"

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
        .find(conditionns, fields)
        .toArray()
    return trainees
}

generateReport = async (startDate, finishDate,  filename) => {
    book = XLSX.utils.book_new()
    let dir = "./reports"

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
    // let [year, baseMonth] = startDate.split("-")
    let startMonth = parseInt(startDate.split("-")[1])
    // let finishMonth = startMonth + 2
    // let finishDate = `${year}-${finishMonth}`

    let traineeTutorMapping = {}

    let reportersTable = [
        [
            "Name",
            "ID",
            "email",
            "address",
            "mobile",
            "needs-help-in",
            "Institution",
            "Main-study",
            "study-year",
            "Tutor-name",
            "Tutor-mobile",
            startMonth + "-month-study-hours",
            startMonth + 1 + "-month--study-hours",
            startMonth + 2 + "-month--study-hours",
            "total-hours",
        ],
    ]

    await connnectClient()
    let tutors = await client.db("test").collection("tutors").find({}).toArray()
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
    let conndition_for_reporters = {
        institute: { $ne: new ObjectId("5d6f643b3acdb6001790e08f") },
    }
    let reportersTrainees = await getTrainess(
        conndition_for_reporters,
        fields_for_reporters
    )

    reportersTrainees = reportersTrainees.filter(
        (trainee) =>
            reporters_allowed_cities.includes(trainee.realAddress.city) ||
            trainee.isRegisteredToKivun == true
    )
    let reports = await client
        .db("test")
        .collection("reports")
        .find({
            date: {
                $gte: new Date(startDate + "-01"),
                $lt: new Date(finishDate + "-31"),
            },
        })
        .toArray()

    reportersTrainees.forEach((trainee) => {
        let report = reports.find((report) => {
            return (
                report.trainee_id &&
                report.tutor_id &&
                report.trainee_id.toString() == trainee._id.toString()
            )
        })
        if (report) {
            let tutor = tutors.find((tutor) => {
                return (
                    tutor._id &&
                    tutor._id.toString() == report.tutor_id.toString()
                )
            })
            if (tutor) {
                traineeTutorMapping[trainee.id] = {
                    name: tutor.fname + " " + tutor.lname,
                    phone: tutor.phoneA,
                }
            } else {
                traineeTutorMapping[trainee.id] = {
                    name: "No Tutor",
                    phone: "No Tutor",
                }
            }
        }
    })

    let traineesAndReportsPerMonthDetailed = reportersTrainees.map(
        (reporter) => {
            return {
                [reporter.id]: {
                    [startMonth]: reports.filter((report) => {
                        return (
                            report.trainee_id &&
                            report.trainee_id.toString() ==
                                reporter._id.toString() &&
                            report.date.getMonth() + 1 == startMonth
                        )
                    }),
                    [startMonth + 1]: reports.filter(
                        (report) =>
                            report.trainee_id &&
                            report.trainee_id.toString() ==
                                reporter._id.toString() &&
                            report.date.getMonth() + 1 == startMonth + 1
                    ),
                    [startMonth + 2]: reports.filter(
                        (report) =>
                            report.trainee_id &&
                            report.trainee_id.toString() ==
                                reporter._id.toString() &&
                            report.date.getMonth() + 1 == startMonth + 2
                    ),
                },
            }
        }
    )
    traineesAndReportsPerMonthSumed = traineesAndReportsPerMonthDetailed.map(
        (trainee) => {
            let [id, obj] = Object.entries(trainee)[0]
            let first = parseInt(
                lib.sumBy(obj[startMonth], (val) => {
                    return val.studyTime
                })
            )
            let second = parseInt(
                lib.sumBy(obj[startMonth + 1], (val) => {
                    return val.studyTime
                })
            )
            let third = parseInt(
                lib.sumBy(obj[startMonth + 2], (val) => {
                    return val.studyTime
                })
            )
            if (first + second + third > 0) {
                return {
                    [id]: {
                        [startMonth]: first,
                        [startMonth + 1]: second,
                        [startMonth + 2]: third,
                        all: first + second + third,
                    },
                }
            }
        }
    )
    let traineesAndReportsPerMonthSumedAsObj = Object.assign(
        {},
        ...traineesAndReportsPerMonthSumed.filter((elem) => elem)
    )
    let allIds = Object.keys(traineesAndReportsPerMonthSumedAsObj)
    reportersTrainees = reportersTrainees.filter((trainee) =>
        allIds.includes(trainee.id)
    )
    reportersTrainees.forEach((trainee) => {
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

        reportersTable.push([
            trainee.fname + " " + trainee.lname,
            trainee.id,
            trainee.email,
            trainee.realAddress.street +
                " , " +
                trainee.realAddress.neighborhood +
                " , " +
                trainee.realAddress.city,
            trainee.phoneA,
            trainee.needsHelpIn.replace(/(\r\n|\n|\r)/gm, ""),
            institute,
            mainnStudy,
            mainnStudy.trim() == "מכינה" ? mainnStudy : trainee.studyYear,
            traineeTutorMapping[trainee.id] &&
                traineeTutorMapping[trainee.id].name,
            traineeTutorMapping[trainee.id] &&
                traineeTutorMapping[trainee.id].phone,
            traineesAndReportsPerMonthSumedAsObj[trainee.id][startMonth],
            traineesAndReportsPerMonthSumedAsObj[trainee.id][startMonth + 1],
            traineesAndReportsPerMonthSumedAsObj[trainee.id][startMonth + 2],
            traineesAndReportsPerMonthSumedAsObj[trainee.id].all,
        ])
    })
    await addSheetToXlsxFile(reportersTable, "reporters")

    // detailed report

    let reportsByMonth = {
        [startMonth]: reports.filter((report) => {
            return (
                // report.trainee_id &&
                // report.trainee_id.toString() == reporter._id.toString() &&
                report.date.getMonth() + 1 == startMonth
            )
        }),
        [startMonth + 1]: reports.filter(
            (report) =>
                // report.trainee_id &&
                // report.trainee_id.toString() == reporter._id.toString() &&
                report.date.getMonth() + 1 == startMonth + 1
        ),
        [startMonth + 2]: reports.filter(
            (report) =>
                // report.trainee_id &&
                // report.trainee_id.toString() == reporter._id.toString() &&
                report.date.getMonth() + 1 == startMonth + 2
        ),
    }
    Object.keys(reportsByMonth).forEach((month) => {
        reportsByMonth[month] = reportersTrainees.map((reporter) => {
            let reports = reportsByMonth[month].filter((report) => {
                return (
                    report.trainee_id &&
                    report.trainee_id.toString() == reporter._id.toString()
                )
            })
            let total = lib.sumBy(reports, (val) => {
                return val.studyTime
            })
            if (total > 0) {
                return {
                    [reporter.fname + " " + reporter.lname]: {
                        reports,
                        total,
                    },
                }
            }
        })
    })

    let sortFunction = function (a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(a[1]) - new Date(b[1])
    }
    Object.keys(reportsByMonth).forEach((month) => {
        reportsByMonth[month] = reportsByMonth[month].filter((report) => report)
    })
    Object.keys(reportsByMonth).forEach((month) => {
        reportsByMonth[month] = Object.assign({}, ...reportsByMonth[month])
    })

    let detailedReport1 = [],
        detailedReport2 = [],
        detailedReport3 = []

    Object.keys(reportsByMonth[startMonth]).forEach((name) => {
        detailedReport1.push([name])
        let detailed = reportsByMonth[startMonth][name].reports.map(
            (report) => {
                return [
                    report.from + "-" + report.to,
                    days[report.date.getDay()],
                    formatDateToReadableFormat(report.date),
                ]
            }
        )
        detailed.sort(sortFunction)
        detailedReport1.push(...detailed)
        detailedReport1.push([
            "total for this month: " + reportsByMonth[startMonth][name].total,
        ])
        detailedReport1.push([])
    })

    Object.keys(reportsByMonth[startMonth + 1]).forEach((name) => {
        detailedReport2.push([name])
        let detailed = reportsByMonth[startMonth + 1][name].reports.map(
            (report) => {
                return [
                    report.from + "-" + report.to,
                    formatDateToReadableFormat(report.date),
                ]
            }
        )
        detailed.sort(sortFunction)

        detailedReport2.push(...detailed)
        detailedReport2.push([
            "total for this month: " +
                reportsByMonth[startMonth + 1][name].total,
        ])
        detailedReport2.push([])
    })

    Object.keys(reportsByMonth[startMonth + 2]).forEach((name) => {
        detailedReport3.push([name])
        let detailed = reportsByMonth[startMonth + 2][name].reports.map(
            (report) => {
                return [
                    report.from + "-" + report.to,
                    formatDateToReadableFormat(report.date),
                ]
            }
        )
        detailed.sort(sortFunction)

        detailedReport3.push(...detailed)
        detailedReport3.push([
            "total for this month: " +
                reportsByMonth[startMonth + 2][name].total,
        ])
        detailedReport3.push([])
    })

    await addSheetToXlsxFile(
        detailedReport1,
        "detailed-report-month-" + startMonth.toString()
    )
    await addSheetToXlsxFile(
        detailedReport2,
        "detailed-report-month-" + (startMonth + 1).toString()
    )
    await addSheetToXlsxFile(
        detailedReport3,
        "detailed-report-month-" + (startMonth + 2).toString()
    )

    // Non reporters report
    let nonReportersTrainess = await getTrainess(
        { "realAddress.city": "ירושלים" },
        fields_for_nonn_reporters
    )
    let nonReportersTrainessFiltered = nonReportersTrainess.filter(
        (nonReporter) => {
            let allReportsPerNonReporter = reports.filter((report) => {
                return (
                    report.trainee_id &&
                    report.trainee_id.toString() == nonReporter._id.toString()
                )
            })
            return (
                parseInt(
                    lib.sumBy(allReportsPerNonReporter, (val) => {
                        return val.studyTime
                    })
                ) > 0
            )
        }
    )
    nonReportersTrainessFiltered = nonReportersTrainessFiltered.filter(
        (reporter) => !allIds.includes(reporter.id)
    )
    let nnonReportersTable = [
        ["Name", "email", "Institution", "needs-help-in", "Non-report-reason"],
    ]
    nonReportersTrainessFiltered.forEach((trainee) => {
        let institute = ""
        let instituteRes = institutes.find(
            (institute) =>
                institute._id.toString() == trainee.institute.toString()
        )
        if (instituteRes) {
            institute = instituteRes.name
        }

        nnonReportersTable.push([
            trainee.fname + " " + trainee.lname,
            trainee.email,
            institute,
            trainee.needsHelpIn.replace(/(\r\n|\n|\r)/gm, ""),
            institute ==
            "האוניברסיטה העברית - מכון מגיד - המכינה החרדית של האוניברסיטה העברית"
                ? "לומד במכינה החרדית של האוניברסיטה העברית, שמדווחת לחוד למרכז כיוון"
                : "על אף שלומד ופעיל באזור ירושלים, לפי תעודת הזהות שלו אינו תושב אחד הישובים המזכים אותו בשירותיו של מרכז כיוון",
        ])
    })
    await addSheetToXlsxFile(nnonReportersTable, "non-reporters")
    await saveSheeToFile(filename)
}

module.exports = generateReport
// generateReport("2021-10", "generateQuaterlyKivun").then(() => console.log())
