var ObjectId = require('mongodb').ObjectId; 
const lib = require('lodash');
var mongoose = require("mongoose");
const { Trainee, Tutor, Report, Institute, AcademicDetail } = require("../../models/models");
const asyncForEach = require("../../util/helpFunction");
const Reporter = require("../Reporter");
const fs = require('fs');


class GeneralParticipentsServed extends Reporter{
    constructor(month) {
        super(month, 'generalParticipentsServed.csv');
        this.bigTable = [];
    }
    
     createData = () => {
        return new Promise(async (resolve) => {
            const trainees = await Trainee.find({isServed: true}, 'fname lname institute isServed');
            const institutes = await Institute.find({});
            const instituteMapping = {};
            institutes.forEach((institute) => {
                instituteMapping[new mongoose.Types.ObjectId(institute._doc._id)] = institute._doc.name;
            })
            this.bigTable.push(['Full name', 'Institue', 'isServed'])
          
            trainees.forEach((trainee) => {
                this.bigTable.push([trainee._doc.fname + " " + trainee._doc.lname, instituteMapping[new mongoose.Types.ObjectId(trainee._doc.institute)], trainee._doc.isServed])


            })
            resolve(this.bigTable);
            
           
             
        })
    
    }
   
    
}

generalParticipentsServedSingelton = (month) => {
    if(!GeneralParticipentsServed.generalParticipentsServedOnlyInstance) {
        const generalParticipentsServedOnlyInstance = new GeneralParticipentsServed(month);
        return generalParticipentsServedOnlyInstance;
    } 
    return GeneralParticipentsServed.generalParticipentsServedOnlyInstance;
 
}
module.exports = generalParticipentsServedSingelton;