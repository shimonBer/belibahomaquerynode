const fs = require("fs");
// const sendmail = require('sendmail')();
const lib = require("lodash");
var mongoose = require("mongoose");
var ObjectId = require("mongodb").ObjectId;
const Reporter = require("../Reporter");
const asyncForEach = require("../../util/helpFunction");

const { Trainee, Report } = require("../../models/models");

function formatDate(date) {
    let d = new Date(date)
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [day, month, year].join('-');
}

class MedavhimH extends Reporter {
    constructor(client, month) {    
        super(client, month, "MedavhimHours_"+month+".csv");
        this.bigTable = [];
    }
    createData = () => {
        return new Promise(async (resolve) => {
            const trainees = await this.client.db("test").collection("trainees").find(
                {
                    $or:[
                    "realAddress.city": "ירושלים",
                    "realAddress.city": "ירושליים",
                    "realAddress.city": "גבעת זאב",
                    "realAddress.city": "קרית יערים",
                    "realAddress.city": "קריית יערים",
                    "realAddress.city": "תל סטון",
                    "realAddress.city": "תל ציון",
                    ],
                    "isResidentOf": true,
                    institute: {
                        $ne: new ObjectId("5d6f643b3acdb6001790e08f"),
                    },
                },
                "fname lname"
            ).toArray();
            await asyncForEach(trainees, async (trainee) => {
                try {
                    let reports = await this.client.db("test").collection("reports").find(
                        {
                            trainee_id: trainee._id,
                            date: {
                                $gte: new Date(this.month + "-01"),
                                $lt: new Date(this.month + "-31"),
                            },
                        },
                        "from to date studyTime"
                    ).toArray();
                    if (reports && reports.length > 0) {
                        this.bigTable.push([
                            `${trainee.fname} ${trainee.lname}`,
                        ]);
                        let trainee_arr = reports.map((report) => {
                            if (report.to && report.from) {
                                return `${formatDate(report.date.toLocaleString("he-IL", {timeZone: "Asia/Jerusalem"}))}, ${
                                    report.studyTime
                                } study hours: ${report.from} - ${
                                    report.to
                                }`;
                            } else {
                                return `${formatDate(report.date.toLocaleString("he-IL", {timeZone: "Asia/Jerusalem"}))}, ${
                                    report.studyTime
                                } study hours`;
                            }
                        });
                        this.bigTable.push(trainee_arr);
                    }
                } catch (err) {
                    console.log(err);
                }
            });
            resolve();
        });
    };
}

MedavhimHSingelton = (client, month) => {
    if (!MedavhimH.MedavhimHOnlyInstance) {
        const MedavhimHOnlyInstance = new MedavhimH(client, month);
        return MedavhimHOnlyInstance;
    }
    return MedavhimH.MedavhimHOnlyInstance;
};

module.exports = MedavhimHSingelton;
