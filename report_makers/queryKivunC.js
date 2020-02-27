const fs = require('fs');
// const sendmail = require('sendmail')();
const lib = require('lodash');
var mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectId; 
const Reporter = require("./Reporter");
const asyncForEach = require("../helpFunction");


const {Trainee, Tutor, Report, Institute, AcademicDetail} = require("../models/models");

class KivunC extends Reporter {
    constructor(month) {
        super(month, 'kivunC.csv');
        this.bigTable = [];
    }
    createData = () => {
        return new Promise( async (resolve) => {
            const trainees = await Trainee.find({"realAddress.city": "ירושלים", "institute": {$ne: new ObjectId('5d6f643b3acdb6001790e08f')}}, 'fname lname');
            await asyncForEach(trainees, async (trainee) => {
                try{
                    let reports = await Report.find({"trainee_id": new ObjectId(trainee.id), date: {"$gte": new Date(this.month + "-01"), "$lt": new Date(this.month + "-31")}}, "from to date studyTime");
                    if(reports && reports.length > 0){
                        this.bigTable.push([`${trainee._doc.fname} ${trainee._doc.lname}`]);
                        let trainee_arr = reports.map((report) => {
                            if(report._doc.to && report._doc.from){
                                return `${report._doc.date.toDateString()}, ${report._doc.studyTime} study hours: ${report._doc.from} - ${report._doc.to}`
                            }else{
                                return `${report._doc.date.toDateString()}, ${report._doc.studyTime} study hours`;
                            }
                        })
                        this.bigTable.push(trainee_arr);

                    }

                } catch(err){
                    console.log(err);
                }

            })
            resolve();

        })
    }
}


kivunCSingelton = (month) => {
    if(!KivunC.kivunCOnlyInstance) {
        const kivunCOnlyInstance = new KivunC(month);
        return kivunCOnlyInstance;
    } 
    return KivunC.kivunCOnlyInstance;
}

module.exports = kivunCSingelton;