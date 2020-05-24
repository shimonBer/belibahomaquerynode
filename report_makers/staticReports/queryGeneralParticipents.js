var ObjectId = require('mongodb').ObjectId; 
const lib = require('lodash');
var mongoose = require("mongoose");
const { Trainee, Tutor, Report, Institute, AcademicDetail } = require("../../models/models");
const asyncForEach = require("../../util/helpFunction");
const Reporter = require("../Reporter");


class GeneralParticipents extends Reporter{
    constructor(month) {
        super(month, 'generalParticipents.csv');
        this.bigTable = [['Name','ID','email', 'address','mobile','asked-help-in','Institution','Main-study','study-year', 'Tutor-name', 'Tutor-mobile', this.month + '-study-hours', this.month + '-chavruta-hours', this.month + '-total-hours']];
    }
    
     createData = () => {
        return new Promise(async (resolve) => {
            const trainees = await Trainee.find({}, 'fname lname id realAddress email phoneA needsHelpIn studyYear institute mainStudy isRegisteredToKivun realAddress');
            const reports = await Report.find({date: {"$gte": new Date(this.month + "-01"), "$lt": new Date(this.month + "-31")}});
            const institutes = await Institute.find({});
            const instituteMapping = {};
            await asyncForEach(institutes, async (institute) => {
                instituteMapping[new mongoose.Types.ObjectId(institute._doc._id)] = institute._doc.name;
            })
            const mainStudies = await AcademicDetail.find({});
            const mainStudymapping = {};
            mainStudies.forEach((mainStudy) => {
                mainStudymapping[new mongoose.Types.ObjectId(mainStudy._doc._id)] = mainStudy._doc.name;
            });

            const traineesReports = {};
            reports.forEach((report) => {
                if(traineesReports[new mongoose.Types.ObjectId(report._doc.trainee_id)]){
                    traineesReports[new mongoose.Types.ObjectId(report._doc.trainee_id)].push(report);
                } else {
                    traineesReports[new mongoose.Types.ObjectId(report._doc.trainee_id)] = [report];
                }

            })
            await asyncForEach(trainees, async (trainee) => {
                const institue = instituteMapping[new mongoose.Types.ObjectId(trainee._doc.institute)];
                const mainStudy = mainStudymapping[new mongoose.Types.ObjectId(trainee._doc.mainStudy)];
                let trainee_arr = [trainee._doc.fname + " " + trainee._doc.lname, trainee._doc.id, trainee._doc.email, trainee._doc.realAddress.street + ' , ' + trainee._doc.realAddress.neighborhood + ' , ' + trainee._doc.realAddress.city, trainee._doc.phoneA, trainee._doc.needsHelpIn.replace(/(\r\n|\n|\r)/gm, ""), institue, mainStudy, trainee._doc.studyYear];
                const trainee_id_obj = new mongoose.Types.ObjectId(trainee._id);
                if(traineesReports[trainee_id_obj]){
                    const tutor = await Tutor.findById(new mongoose.Types.ObjectId(traineesReports[trainee_id_obj][0]._doc.tutor_id));
                    if(!!tutor){
                        trainee_arr.push(tutor._doc.fname + " " + tutor._doc.lname);
                        trainee_arr.push(tutor._doc.phoneA);
                        const studyHours = lib.sumBy(
                            traineesReports[trainee_id_obj],
                            val => {
                            return (val._doc.studyTime);
                            }
                        );
                        trainee_arr.push(studyHours);
                        const chavrutaHours = lib.sumBy(
                            traineesReports[trainee_id_obj],
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
            })
            

            // await asyncForEach(trainees, async (trainee) => {
            //     const institue = instituteMapping[new mongoose.Types.ObjectId(trainee._doc.institute)];
            //     const mainStudy = mainStudymapping[new mongoose.Types.ObjectId(trainee._doc.mainStudy)];
            //     let trainee_arr = [trainee._doc.fname + " " + trainee._doc.lname, trainee._doc.id, trainee._doc.email, trainee._doc.realAddress.street + ' , ' + trainee._doc.realAddress.neighborhood + ' , ' + trainee._doc.realAddress.city, trainee._doc.phoneA, trainee._doc.needsHelpIn.replace(/(\r\n|\n|\r)/gm, ""), institue, mainStudy, trainee._doc.studyYear];

            //     const reports = await Report.find({trainee_id: new mongoose.Types.ObjectId(trainee.id), date: {"$gte": new Date(this.month + "-01"), "$lt": new Date(this.month + "-31")}});
            //     if(!!reports[0]) {
            //         const tutor = await Tutor.findById(new mongoose.Types.ObjectId(reports[0]._doc.tutor_id));
            //         if(!!tutor){
            //             trainee_arr.push(tutor._doc.fname + " " + tutor._doc.lname);
            //             trainee_arr.push(tutor._doc.phoneA);
            //             const studyHours = lib.sumBy(
            //                 reports,
            //                 val => {
            //                 return (val._doc.studyTime);
            //                 }
            //             );
            //             trainee_arr.push(studyHours);
            //             const chavrutaHours = lib.sumBy(
            //                 reports,
            //                 val => {
            //                 return (val._doc.chavrutaTime);
            //                 }
            //             );
            //             trainee_arr.push(chavrutaHours, studyHours + chavrutaHours);
        
            //         } else{
            //             trainee_arr.push('No Tutor', 0, 0);
            //         }
                    
            //     } else{
            //         trainee_arr.push('No Tutor', 0, 0);
            //     }
            //     this.bigTable.push(trainee_arr);
                
            // });
            resolve();
        })
    
    }
    
}

generalParticipentsSingelton = (month) => {
    if(!GeneralParticipents.generalParticipentsOnlyInstance) {
        const generalParticipentsOnlyInstance = new GeneralParticipents(month);
        return generalParticipentsOnlyInstance;
    } 
    return GeneralParticipents.generalParticipentsOnlyInstance;
 
}
module.exports = generalParticipentsSingelton;