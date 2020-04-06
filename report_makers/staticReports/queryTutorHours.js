const fs = require('fs');
const lib = require('lodash');
var mongoose = require("mongoose");
const Reporter = require("../Reporter");

const { Tutor, Report } = require("../../models/models");

class Tutors extends Reporter {
    constructor(month) {
        super(month, 'tutors.csv');
        this.bigTable = [];
        fs.readFile('./months.json', (err, data) => {
            this.months = JSON.parse(data);
            if(!this.months.includes(month)){
                this.months.push(month);
                fs.writeFile("./months.json", JSON.stringify(this.months), () => {});

            } else {
                const index = this.months.indexOf(month);
                this.months = this.months.slice(0, index + 1);
            }
        })
        
    }
    createData = () => {
        return new Promise(async (resolve) => {
            resolve();
        });
    }

    createReport = () => {
        return new Promise(async (resolve) => {
            const tutors = await Tutor.find({}, 'fname lname isImpact');
            Promise.all(tutors.map((tutor) => this.getFullHours(tutor))).then((result) => {
                this.bigTable = result;
                const headers = ["Full name", "Is Impact"];
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
            const fullName = `${tutor._doc.lname} ${tutor._doc.fname}`;
            finalArr.unshift(fullName, tutor._doc.isImpact);
            resolve(finalArr);
        })
    }
    
    getOneMonthHours = (tutor, month) => {
        return new Promise(async (resolve) => {
            const reports = await Report.find({tutor_id: new mongoose.Types.ObjectId(tutor.id), date: {"$gte": new Date(month + "-01"), "$lt": new Date(month + "-31")}});
            const totalHours = await lib.sumBy(
                reports, 
                val => {
                return val._doc.totalTime;
                }
            );
                
            const teachingHours = await lib.sumBy(
                reports,
                val => {
                return (val._doc.studyTime + val._doc.chavrutaTime);
                }
            );
    
            return resolve([teachingHours,totalHours]);  
    
        })
    
    }
} 



tutorsSingelton = (month) => {
    if(!Tutors.tutorsOnlyInstance) {
        const tutorsOnlyInstance = new Tutors(month);
        return tutorsOnlyInstance;
    } 
    return Tutors.tutorsOnlyInstance;
}

module.exports = tutorsSingelton;