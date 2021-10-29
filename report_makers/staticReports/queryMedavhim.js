var ObjectId = require('mongodb').ObjectId; 
const lib = require('lodash');
var mongoose = require("mongoose");
const { Trainee, Tutor, Report, Institute, AcademicDetail } = require("../../models/models");
const asyncForEach = require("../../util/helpFunction");
const Reporter = require("../Reporter");


class Medavhim extends Reporter{
    constructor(client, month1, month2, month3 ) {
        super(client, month1 , 'Medavhim.csv');
        this.bigTable = [['Name','ID','email', 'address','mobile','asked-help-in','Institution','Main-study','study-year', 'Tutor-name', 'Tutor-mobile', this.month1 + '-study-hours',  this.month2 + '-study-hours', this.month3 + '-study-hours', 'total-Qhours']];
    }
    
     createData = () => {
        return new Promise(async (resolve) => {
            const trainees = await this.client.db("test").collection("trainees").find(
                {
                    "realAddress.city": "ירושלים",
                    "realAddress.city": "ירושליים",
                    "realAddress.city": "גבעת זאב",
                    "realAddress.city": "קרית יערים",
                    "realAddress.city": "קריית יערים",
                    "realAddress.city": "תל סטון",
                    "realAddress.city": "תל ציון",
                    "isResidentOf": true,
                    institute: {
                        $ne: new ObjectId("5d6f643b3acdb6001790e08f"),
                    },
                },
                'fname lname id realAddress email phoneA needsHelpIn studyYear institute mainStudy isRegisteredToKivun realAddress').toArray();
            await asyncForEach(trainees, async (trainee) => {
                const institue = (await this.client.db("test").collection("institutes").find({_id:trainee.institute}).toArray())[0].name;
                const mainStudy = (await this.client.db("test").collection("academicdetails").find({_id: trainee.mainStudy}).toArray())[0].name;
                let trainee_arr = [trainee.fname + " " + trainee.lname, trainee.id, trainee.email, trainee.realAddress.street + ' , ' + trainee.realAddress.neighborhood + ' , ' + trainee.realAddress.city, trainee.phoneA, trainee.needsHelpIn.replace(/(\r\n|\n|\r)/gm, ""), institue, mainStudy, trainee.studyYear];
                const reportsM1 = await this.client.db("test").collection("reports").find({trainee_id: trainee._id, date: {"$gte": new Date(this.month1 + "-01"), "$lt": new Date(this.month1 + "-31")}}).toArray();
                const reportsM2 = await this.client.db("test").collection("reports").find({trainee_id: trainee._id, date: {"$gte": new Date(this.month2 + "-01"), "$lt": new Date(this.month2 + "-31")}}).toArray();
                const reportsM3 = await this.client.db("test").collection("reports").find({trainee_id: trainee._id, date: {"$gte": new Date(this.month3 + "-01"), "$lt": new Date(this.month3 + "-31")}}).toArray();
                if(!!reportsM1[0]) {
                    const tutor = (await this.client.db("test").collection("tutors").find({_id: reportsM1[0].tutor_id}).toArray())[0];
                    if(!!tutor){
                        trainee_arr.push(tutor.fname + " " + tutor.lname);
                        trainee_arr.push(tutor.phoneA);
                        const studyHoursM1 = lib.sumBy(
                            reportsM1,
                            val => {
                            return (val.studyTime);
                            }
                        );
                        const studyHoursM2 = lib.sumBy(
                            reportsM2,
                            val => {
                            return (val.studyTime);
                            }
                        );
                        const studyHoursM3 = lib.sumBy(
                            reportsM3,
                            val => {
                            return (val.studyTime);
                            }
                        );
                        trainee_arr.push(studyHoursM1);
                        trainee_arr.push(studyHoursM2);
                        trainee_arr.push(studyHoursM3);
                        trainee_arr.push(studyHoursM1 + studyHoursM2 + studyHoursM3);
        
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

MedavhimSingelton = (client, month,) => {
    if(!Medavhim.MedavhimOnlyInstance) {
        const MedavhimOnlyInstance = new Medavhim(client, month, month+1, month+2);
        return MedavhimOnlyInstance;
    } 
    return Medavhim.MedavhimOnlyInstance;
 
}
module.exports = MedavhimSingelton;