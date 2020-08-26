const lib = require('lodash');
var mongoose = require("mongoose");
const { Trainee, Tutor, Report, Institute, AcademicDetail } = require("../../models/models");
const asyncForEach = require("../../util/helpFunction");
const Reporter = require("../Reporter");
const fs = require('fs');


class GeneralParticipentsServed extends Reporter{
    constructor(client, month) {
        super(client, month, 'generalParticipentsServed.csv');
        this.bigTable = [];
    }
    
     createData = () => {
        return new Promise(async (resolve) => {
            const trainees = await this.client.db("test").collection("trainees").find({isServed: true}, 'fname lname institute isServed').toArray();
            const institutes = await this.client.db("test").collection("institutes").find({}).toArray();
            const instituteMapping = {};
            institutes.forEach((institute) => {
                instituteMapping[institute._id] = institute.name;
            })
            this.bigTable.push(['Full name', 'Institue', 'isServed'])
          
            trainees.forEach((trainee) => {
                this.bigTable.push([trainee.fname + " " + trainee.lname, instituteMapping[trainee.institute], trainee.isServed])


            })
            resolve(this.bigTable);
            
           
             
        })
    
    }
   
    
}

generalParticipentsServedSingelton = (client, month) => {
    if(!GeneralParticipentsServed.generalParticipentsServedOnlyInstance) {
        const generalParticipentsServedOnlyInstance = new GeneralParticipentsServed(client, month);
        return generalParticipentsServedOnlyInstance;
    } 
    return GeneralParticipentsServed.generalParticipentsServedOnlyInstance;
 
}
module.exports = generalParticipentsServedSingelton;