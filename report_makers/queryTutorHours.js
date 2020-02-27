const fs = require('fs');
const lib = require('lodash');
var mongoose = require("mongoose");
const Reporter = require("./Reporter");
const path = require("path");

const {Trainee, Tutor, Report, Institute, AcademicDetail} = require("../models/models");

var months = ["2019-10", "2019-11", "2019-12", "2020-01"];

class Tutors extends Reporter {
    constructor(month) {
        super(month, 'tutors.csv');
        this.bigTable = [];
        if(!months.includes(month)){
            months.push(month);
        }
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
                let csvContent = "";
                const headers = ["Full name"];
                months.forEach((month) => {
                    headers.push(month + "-studying");
                    headers.push(month + "-total");
                })
                headers.push("Total studying hours", "Total hours");
            
                this.bigTable.unshift(headers);
                this.bigTable.forEach(function(rowArray) {
                    let row = rowArray.join(";");
                    csvContent += row + "\r\n";
                });
                fs.writeFile(path.resolve(path.join(__dirname, `../reports/${this.filename}`)),csvContent, function (err) {
                        if (err) throw err;
                        console.log('Saved!');
                });                    
            })
            resolve();
        })
    }

    getFullHours = (tutor) => {
        return new Promise(async (resolve) => {
            const results =  await Promise.all(months.map(month => this.getOneMonthHours(tutor, month)));
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
            finalArr.unshift(fullName);
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