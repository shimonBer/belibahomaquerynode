var ObjectId = require('mongodb').ObjectId; 
const lib = require('lodash');
var mongoose = require("mongoose");
const { Trainee, Tutor, Report, Institute, AcademicDetail } = require("../../models/models");
const asyncForEach = require("../../util/helpFunction");
const Reporter = require("../Reporter");


class KivunA extends Reporter{
    constructor(client, month) {
        super(client, month, 'kivunA.csv');
        this.bigTable = [['Name','ID','email', 'address','mobile','asked-help-in','Institution','Main-study','study-year', 'Tutor-name', 'Tutor-mobile', this.month + '-study-hours', this.month + '-chavruta-hours', this.month + '-total-hours']];
    }
    
     createData = () => {
        return new Promise(async (resolve) => {
            const trainees = await this.client.db("test").collection("trainees").find({"institute": {$ne: new ObjectId('5d6f643b3acdb6001790e08f')}, "realAddress.city": "ירושלים"}, 'fname lname id realAddress email phoneA needsHelpIn studyYear institute mainStudy isRegisteredToKivun realAddress').toArray();
            await asyncForEach(trainees, async (trainee) => {
                const institue = (await this.client.db("test").collection("institutes").find({_id:trainee.institute}).toArray())[0].name;
                const mainStudy = (await this.client.db("test").collection("academicdetails").find({_id: trainee.mainStudy}).toArray())[0].name;
                let trainee_arr = [trainee.fname + " " + trainee.lname, trainee.id, trainee.email, trainee.realAddress.street + ' , ' + trainee.realAddress.neighborhood + ' , ' + trainee.realAddress.city, trainee.phoneA, trainee.needsHelpIn.replace(/(\r\n|\n|\r)/gm, ""), institue, mainStudy, trainee.studyYear];
                const reports = await this.client.db("test").collection("reports").find({trainee_id: trainee._id, date: {"$gte": new Date(this.month + "-01"), "$lt": new Date(this.month + "-31")}}).toArray();
                if(!!reports[0]) {
                    const tutor = (await this.client.db("test").collection("tutors").find({_id: reports[0].tutor_id}).toArray())[0];
                    if(!!tutor){
                        trainee_arr.push(tutor.fname + " " + tutor.lname);
                        trainee_arr.push(tutor.phoneA);
                        const studyHours = lib.sumBy(
                            reports,
                            val => {
                            return (val.studyTime);
                            }
                        );
                        trainee_arr.push(studyHours);
                        const chavrutaHours = lib.sumBy(
                            reports,
                            val => {
                            return (val.chavrutaTime);
                            }
                        );
                        trainee_arr.push(chavrutaHours, studyHours + chavrutaHours);
        
                    } else{
                        trainee_arr.push('No Tutor', 0, 0);
                    }
                    
                } else{
                    trainee_arr.push('No Tutor', 0, 0);
                }
                this.bigTable.push(trainee_arr);
                
            });
            resolve();
        })
    
    }
    
}

kivunASingelton = (client, month) => {
    if(!KivunA.kivunAOnlyInstance) {
        const kivunAOnlyInstance = new KivunA(client, month);
        return kivunAOnlyInstance;
    } 
    return KivunA.kivunAOnlyInstance;
 
}
module.exports = kivunASingelton;