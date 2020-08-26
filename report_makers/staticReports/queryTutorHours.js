const fs = require('fs');
const lib = require('lodash');
var mongoose = require("mongoose");
const Reporter = require("../Reporter");

const { Tutor, Report } = require("../../models/models");

class Tutors extends Reporter {
    constructor(client, month) {
        super(client, month, 'tutors.csv');
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
            const trainees = await this.client.db("test").collection("trainees").find({isServed: true}, 'fname lname institute isServed').toArray();
            resolve();
        });
    }

    createReport = () => {
        return new Promise(async (resolve) => {
            const tutors = await this.client.db("test").collection("tutors").find({}, 'fname lname isImpact phoneA').toArray();
            Promise.all(tutors.map((tutor) => this.getFullHours(tutor))).then((result) => {
                this.bigTable = result;
                const headers = ["Full name", "Is Impact", "Mobile"];
                this.months.forEach((month) => {
                    headers.push(month + "-studying", month + "-total");
                })
                headers.push("Total studying hours", "Total hours");
            
                this.bigTable.unshift(headers);
                
                resolve(this.bigTable);                
            })
            
        })
    }

    getFullHours = (tutor) => {
        return new Promise(async (resolve) => {
            const results =  await Promise.all(this.months.map(month => this.getOneMonthHours(tutor, month)));
            let totalTeaching = 0;
            let total = 0;
            const finalArr = [];
            results.forEach((arr) => {
                totalTeaching += arr[0];
                total += arr[1];
                finalArr.push(arr[0], arr[1]);
            })
            finalArr.push(totalTeaching, total);
            const fullName = `${tutor.lname} ${tutor.fname}`;
            finalArr.unshift(fullName, tutor.isImpact, tutor.phoneA);
            resolve(finalArr);
        })
    }
    
    getOneMonthHours = (tutor, month) => {
        return new Promise(async (resolve) => {
            const reports = await this.client.db("test").collection("reports").find({tutor_id: tutor._id, date: {"$gte": new Date(month + "-01"), "$lt": new Date(month + "-31")}}).toArray();
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



tutorsSingelton = (client, month) => {
    if(!Tutors.tutorsOnlyInstance) {
        const tutorsOnlyInstance = new Tutors(client, month);
        return tutorsOnlyInstance;
    } 
    return Tutors.tutorsOnlyInstance;
}

module.exports = tutorsSingelton;