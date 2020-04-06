var ObjectId = require('mongodb').ObjectId; 
const lib = require('lodash');
var mongoose = require("mongoose");
const { Trainee, Tutor, Report, Institute, AcademicDetail } = require("../../models/models");
const asyncForEach = require("../../util/helpFunction");
const Reporter = require("../Reporter");


class KivunA extends Reporter{
    constructor(month) {
        super(month, 'kivunA.csv');
        this.bigTable = [['Name','ID','email', 'address','mobile','asked-help-in','Institution','Main-study','study-year', 'Tutor-name', 'Tutor-mobile', this.month + '-study-hours', this.month + '-chavruta-hours', this.month + '-total-hours']];
    }
    
     createData = () => {
        return new Promise(async (resolve) => {
            const trainees = await Trainee.find({"institute": {$ne: new ObjectId('5d6f643b3acdb6001790e08f')}, "realAddress.city": "ירושלים"}, 'fname lname id realAddress email phoneA needsHelpIn studyYear institute mainStudy isRegisteredToKivun realAddress');
            await asyncForEach(trainees, async (trainee) => {
                const institue = (await Institute.findById(new mongoose.Types.ObjectId(trainee._doc.institute)))._doc.name;
                const mainStudy = (await AcademicDetail.findById(new mongoose.Types.ObjectId(trainee._doc.mainStudy)))._doc.name;
                let trainee_arr = [trainee._doc.fname + " " + trainee._doc.lname, trainee._doc.id, trainee._doc.email, trainee._doc.realAddress.street + ' , ' + trainee._doc.realAddress.neighborhood + ' , ' + trainee._doc.realAddress.city, trainee._doc.phoneA, trainee._doc.needsHelpIn.replace(/(\r\n|\n|\r)/gm, ""), institue, mainStudy, trainee._doc.studyYear];
                const reports = await Report.find({trainee_id: new mongoose.Types.ObjectId(trainee.id), date: {"$gte": new Date(this.month + "-01"), "$lt": new Date(this.month + "-31")}});
                if(!!reports[0]) {
                    const tutor = await Tutor.findById(new mongoose.Types.ObjectId(reports[0]._doc.tutor_id));
                    if(!!tutor){
                        trainee_arr.push(tutor._doc.fname + " " + tutor._doc.lname);
                        trainee_arr.push(tutor._doc.phoneA);
                        const studyHours = lib.sumBy(
                            reports,
                            val => {
                            return (val._doc.studyTime);
                            }
                        );
                        trainee_arr.push(studyHours);
                        const chavrutaHours = lib.sumBy(
                            reports,
                            val => {
                            return (val._doc.chavrutaTime);
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

kivunASingelton = (month) => {
    if(!KivunA.kivunAOnlyInstance) {
        const kivunAOnlyInstance = new KivunA(month);
        return kivunAOnlyInstance;
    } 
    return KivunA.kivunAOnlyInstance;
 
}
module.exports = kivunASingelton;