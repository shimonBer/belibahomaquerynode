const fs = require('fs');
const lib = require('lodash');
var mongoose = require("mongoose");
const Reporter = require("../Reporter");

const { Trainee, Report } = require("../../models/models");

class Trainees extends Reporter {
    constructor(client, month) {
        super(client, month, 'Trainees_'+month+'.csv');
        this.bigTable = [];
        fs.readFile('/Users/shimon.ber/beliba_homa_project/querying/report_makers/staticReports/months.json', (err, data) => {
            this.months = JSON.parse(data);
            if(!this.months.includes(month)){
                this.months.push(month);
                fs.writeFile("/Users/shimon.ber/beliba_homa_project/querying/report_makers/staticReports/months.json", JSON.stringify(this.months), () => {});

            } else {
                const index = this.months.indexOf(month);
                this.months = this.months.slice(0, index + 1);
            }
        })
        
    }
    createData = () => {
        return new Promise(async (resolve) => {
            const trainees = await this.client.db("test").collection("trainees").find({isServed: true}, 'fname lname').toArray();
            resolve();
        });
    }

    createReport = () => {
        return new Promise(async (resolve) => {
            const trainees = await this.client.db("test").collection("trainees").find({}, 'fname lname').toArray();

            const P1 = new Promise(async (resolve) => {
                trainees.map((trainee) => this.getFullHours(trainee));
            })
            const P2 = new Promise(async (resolve) => {
                trainees.map((trainee) => this.printAllHours(trainee));
            })
            Promise.all(P1,P2).then((result)
                => {
                this.bigTable = result;
                const headers = ["Full name"];
                this.months.forEach((month) => {
                    headers.push(month + "-studying", month + "-total");
                })
                headers.push("Total studying hours", "Total hours");
            
                this.bigTable.unshift(headers);

                
                })
                
                resolve(this.bigTable);                
            })
            
        })
    }
    
    printAllHours = (trainee) => {
        return new Promise(async (resolve) => {
            const reports = await this.client.db("test").collection("reports").find({trainee_id: trainee._id, date: {"$gte": new Date(month + "-01"), "$lt": new Date(month + "-31")}}).toArray();
            const finalArr = [];
            reports.forEach((report) => {
                finalArr.push(report.studyTime , report.date);
            })
            resolve(finalArr);
        })
    }

    getFullHours = (trainee) => {
        return new Promise(async (resolve) => {
            const results =  await Promise.all(this.months.map(month => this.getOneMonthHours(trainee, month)));
            let totalTeaching = 0;
            let total = 0;
            const finalArr = [];
            results.forEach((arr) => {
                totalTeaching += arr[0];
                total += arr[1];
                finalArr.push(arr[0], arr[1]);
            })
            finalArr.push(totalTeaching, total);
            const fullName = `${trainee.lname} ${trainee.fname}`;
            finalArr.unshift(fullName);
            finalArr.unshift("סך הכל שעות תגבור לחודש זה");
            resolve(finalArr);
        })
    }
    
    getOneMonthHours = (trainee, month) => {
        return new Promise(async (resolve) => {
            const reports = await this.client.db("test").collection("reports").find({trainee_id: trainee._id, date: {"$gte": new Date(month + "-01"), "$lt": new Date(month + "-31")}}).toArray();
            const totalHours = await lib.sumBy(
                reports, 
                val => {
                return val.totalTime;
                }
            );
                
            const teachingHours = await lib.sumBy(
                reports,
                val => {
                return (val.studyTime + val.chavrutaTime);
                }
            );
    
            return resolve([teachingHours,totalHours]);  
    
        })
    
    }
} 



traineesSingelton = (client, month) => {
    if(!Trainees.traineesOnlyInstance) {
        const traineesOnlyInstance = new Trainees(client, month);
        return traineesOnlyInstance;
    } 
    return Trainees.traineesOnlyInstance;
}

module.exports = traineesSingelton;