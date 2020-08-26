const fs = require("fs")
const lib = require("lodash")
var mongoose = require("mongoose")
const Reporter = require("../Reporter")

const { Tutor, Report } = require("../../models/models")

class MonthlyHours extends Reporter {
    constructor(client, month) {
        super(client, month, "MonthlyHours.csv")
        this.bigTable = []
        fs.readFile(
            "/Users/shimon.ber/beliba_homa_project/querying/report_makers/staticReports/months.json",
            (err, data) => {
                this.months = JSON.parse(data)
                if (!this.months.includes(month)) {
                    this.months.push(month)
                    fs.writeFile(
                        "/Users/shimon.ber/beliba_homa_project/querying/report_makers/staticReports/months.json",
                        JSON.stringify(this.months),
                        () => {}
                    )
                } else {
                    const index = this.months.indexOf(month)
                    this.months = this.months.slice(0, index + 1)
                }
            }
        )
    }
    createData = () => {
        return new Promise(async (resolve) => {
            const trainees = await this.client.db("test").collection("trainees").find({isServed: true}, 'fname lname institute isServed').toArray();

            resolve()
        })
    }

    createReport = () => {
        return new Promise(async (resolve) => {
            Promise.all(
                this.months.map((month) => this.getOneMonthHours(month))
            ).then((result) => {
                this.bigTable = result
                resolve(this.bigTable)
            })
        })
    }

    getOneMonthHours = (month) => {
        return new Promise(async (resolve) => {
            const reports = await this.client
                .db("test")
                .collection("reports")
                .find({
                    date: {
                        $gte: new Date(month + "-01"),
                        $lt: new Date(month + "-31"),
                    },
                })
                .toArray()

            return resolve([month, reports.length])
        })
    }
}

MonthlyHoursSingelton = (client, month) => {
    if (!MonthlyHours.MonthlyHoursOnlyInstance) {
        const MonthlyHoursOnlyInstance = new MonthlyHours(client, month)
        return MonthlyHoursOnlyInstance
    }
    return MonthlyHours.MonthlyHoursOnlyInstance
}

module.exports = MonthlyHoursSingelton
