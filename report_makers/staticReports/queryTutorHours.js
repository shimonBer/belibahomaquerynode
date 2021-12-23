const fs = require("fs")
const lib = require("lodash")
var mongoose = require("mongoose")
const Reporter = require("../Reporter")
const getMonthsUntil = require("../../util/helpFunction").getMonthsUntil
const getMonthsForFullYear =
    require("../../util/helpFunction").getMonthsForFullYear
const { Tutor, Report } = require("../../models/models")

class Tutors extends Reporter {
    constructor(client, month) {
        super(client, month, "tutors.csv")
        this.bigTable = []
        this.months = getMonthsForFullYear(month)
    }
    createData = () => {
        return new Promise(async (resolve) => {
            // const trainees = await this.client
            //     .db("test")
            //     .collection("trainees")
            //     .find({ isServed: true }, "fname lname institute isServed")
            //     .toArray()
            resolve()
        })
    }

    createReport = () => {
        return new Promise(async (resolve) => {
            const tutors = await this.client
                .db("test")
                .collection("tutors")
                .find({ isActive: true }, "fname lname isImpact phoneA")
                .toArray()
            Promise.all(tutors.map((tutor) => this.getFullHours(tutor))).then(
                (result) => {
                    this.bigTable = result
                    const headers = ["Full name", "ID", "Mobile", "scholarType"]
                    this.months.forEach((month) => {
                        headers.push(
                            month + "-studying",
                            month + "-chevruta",
                            month + "-total"
                        )
                    })
                    headers.push(
                        "Total studying hours",
                        "Total chevruta hours",
                        "Total hours"
                    )

                    this.bigTable.unshift(headers)

                    resolve(this.bigTable)
                }
            )
        })
    }

    getFullHours = (tutor) => {
        return new Promise(async (resolve) => {
            const results = await Promise.all(
                this.months.map((month) => this.getOneMonthHours(tutor, month))
            )
            let totalTeaching = 0
            let total = 0
            const finalArr = []
            results.forEach((arr) => {
                totalTeaching += arr[0]
                total += arr[1]
                finalArr.push(arr[0], arr[1] - arr[0], arr[1])
            })
            finalArr.push(totalTeaching, total - totalTeaching, total)
            const fullName = `${tutor.lname} ${tutor.fname}`
            let typeOfScholar = ""
            if (tutor.isCityScholarship) {
                typeOfScholar = "City Scholarship"
            } else {
                if (tutor.isImpact) {
                    typeOfScholar = "Impact"
                } else {
                    if (tutor.isShachak) {
                        typeOfScholar = "Shachak"
                    } else {
                        if (tutor.isForAcademicPoints) {
                            typeOfScholar = "Academic Points"
                        } else {
                            if (tutor.isFromUniformToStudies) {
                                typeOfScholar = "From Uniform To Studies"
                            } else {
                                typeOfScholar = "Other"
                            }
                        }
                    }
                }
            }
            finalArr.unshift(fullName, tutor.id, tutor.phoneA, typeOfScholar)
            resolve(finalArr)
        })
    }

    getOneMonthHours = (tutor, month) => {
        return new Promise(async (resolve) => {
            const reports = await this.client
                .db("test")
                .collection("reports")
                .find({
                    tutor_id: tutor._id,
                    date: {
                        $gte: new Date(month + "-01"),
                        $lt: new Date(month + "-31"),
                    },
                })
                .toArray()
            const totalHours = await lib.sumBy(reports, (val) => {
                return val.totalTime
            })

            const teachingHours = await lib.sumBy(reports, (val) => {
                return val.studyTime + val.chavrutaTime
            })

            return resolve([teachingHours, totalHours])
        })
    }
}

tutorsSingelton = (client, month) => {
    if (!Tutors.tutorsOnlyInstance) {
        const tutorsOnlyInstance = new Tutors(client, month)
        return tutorsOnlyInstance
    }
    return Tutors.tutorsOnlyInstance
}

module.exports = tutorsSingelton
