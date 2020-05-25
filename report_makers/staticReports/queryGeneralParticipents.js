var ObjectId = require('mongodb').ObjectId; 
const lib = require('lodash');
var mongoose = require("mongoose");
const { Trainee, Tutor, Report, Institute, AcademicDetail } = require("../../models/models");
const asyncForEach = require("../../util/helpFunction");
const Reporter = require("../Reporter");
const fs = require('fs');


class GeneralParticipents extends Reporter{
    constructor(month) {
        super(month, 'generalParticipents.csv');
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
            const trainees = await Trainee.find({}, 'fname lname id realAddress email phoneA needsHelpIn studyYear institute mainStudy isRegisteredToKivun realAddress');
            const reports = await Report.find({date: {"$gte": new Date(this.month + "-01"), "$lt": new Date(this.month + "-31")}});
            const institutes = await Institute.find({});
            const tutors = await Tutor.find({});
            const tutorAsObj = {};
            tutors.forEach((tutor) => {
                tutorAsObj[new mongoose.Types.ObjectId(tutor._id)] = [tutor._doc.fname + " " + tutor._doc.lname, tutor._doc.phoneA];
                
            })
            const instituteMapping = {};
            institutes.forEach((institute) => {
                instituteMapping[new mongoose.Types.ObjectId(institute._doc._id)] = institute._doc.name;
            })
            const mainStudies = await AcademicDetail.find({});
            const mainStudymapping = {};
            mainStudies.forEach((mainStudy) => {
                mainStudymapping[new mongoose.Types.ObjectId(mainStudy._doc._id)] = mainStudy._doc.name;
            });

            const traineesReports = {};
            const tutorsTraineesMapping = {};

            reports.forEach((report) => {
                if(traineesReports[new mongoose.Types.ObjectId(report._doc.trainee_id)]){
                    traineesReports[new mongoose.Types.ObjectId(report._doc.trainee_id)].push(report);
                } else {
                    traineesReports[new mongoose.Types.ObjectId(report._doc.trainee_id)] = [report];
                }
                tutorsTraineesMapping[new mongoose.Types.ObjectId(report._doc.trainee_id)] = tutorAsObj[report._doc.tutor_id];
            })
            
            // trainees.forEach((trainee) => {
                
                Promise.all(trainees.map((trainee) => {
                    const institue = instituteMapping[new mongoose.Types.ObjectId(trainee._doc.institute)];
                    const mainStudy = mainStudymapping[new mongoose.Types.ObjectId(trainee._doc.mainStudy)];
                    const trainee_id_obj = new mongoose.Types.ObjectId(trainee._id);
                    const tutor = tutorsTraineesMapping[trainee_id_obj];
                    return (
                        this.getFullHours(trainee, institue, mainStudy, tutor)
                    )
                    })).then((result) => {
                    this.bigTable = result;
                    const headers = ['Name','ID','email', 'address','mobile','asked-help-in','Institution','Main-study','study-year', 'Tutor-name', 'Tutor-mobile'];
                    this.months.forEach((month) => {
                        headers.push(month + "-studying", month + "-chevruta", month + "-total");
                    });
                    headers.push("study-total", "cheavruta-total", "total")
                    this.bigTable.unshift(headers);
                    
                    resolve(this.bigTable);                
                })
                // if(traineesReports[trainee_id_obj]){
                //     const tutor = tutorsTraineesMapping[trainee_id_obj];
                //     if(!!tutor){
                //         trainee_arr.push(tutor[0]);
                //         trainee_arr.push(tutor[1]);
                //         const studyHours = lib.sumBy(
                //             traineesReports[trainee_id_obj],
                //             val => {
                //             return (val._doc.studyTime);
                //             }
                //         );
                //         trainee_arr.push(studyHours);
                //         const chavrutaHours = lib.sumBy(
                //             traineesReports[trainee_id_obj],
                //             val => {
                //             return (val._doc.chavrutaTime);
                //             }
                //         );
                //         trainee_arr.push(chavrutaHours, studyHours + chavrutaHours);
        
                //     } else{
                //         trainee_arr.push('No Tutor', 0, 0);
                //     }
                    
                // } else{
                //     trainee_arr.push('No Tutor', 0, 0);
                // }
                // this.bigTable.push(trainee_arr);
            // })
            

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
            // resolve();
        })
    
    }
    getFullHours = (trainee, institue, mainStudy, tutor) => {
        return new Promise(async (resolve) => {
            const results =  await Promise.all(this.months.map(month => this.getOneMonthHours(trainee, month)));
            
            
            let totalTeaching = 0;
            let totalChavruta = 0;
            const finalArr = [];
            results.forEach((arr) => {
                totalTeaching += arr[0];
                totalChavruta += arr[1];
                finalArr.push(arr[0], arr[1], arr[2]);
            })
            finalArr.push(totalTeaching, totalChavruta, totalTeaching + totalChavruta);
            if(!!tutor){
                finalArr.unshift(trainee._doc.fname + " " + trainee._doc.lname, trainee._doc.id, trainee._doc.email, trainee._doc.realAddress.street + ' , ' + trainee._doc.realAddress.neighborhood + ' , ' + trainee._doc.realAddress.city, trainee._doc.phoneA, trainee._doc.needsHelpIn.replace(/(\r\n|\n|\r)/gm, ""), institue, mainStudy, trainee._doc.studyYear, tutor[0], tutor[1]);
            } else {
                finalArr.unshift(trainee._doc.fname + " " + trainee._doc.lname, trainee._doc.id, trainee._doc.email, trainee._doc.realAddress.street + ' , ' + trainee._doc.realAddress.neighborhood + ' , ' + trainee._doc.realAddress.city, trainee._doc.phoneA, trainee._doc.needsHelpIn.replace(/(\r\n|\n|\r)/gm, ""), institue, mainStudy, trainee._doc.studyYear, "No Tutor", "No Tutor");
            }
            resolve(finalArr);
        })
    }
    
    getOneMonthHours = (trainee, month) => {
        return new Promise(async (resolve) => {
            const reports = await Report.find({trainee_id: new mongoose.Types.ObjectId(trainee.id), date: {"$gte": new Date(month + "-01"), "$lt": new Date(month + "-31")}});
        
                
            const teachingHours = await lib.sumBy(
                reports,
                val => {
                return (val._doc.studyTime);
                }
            );

            const chavrutaHours = await lib.sumBy(
                reports,
                val => {
                return (val._doc.chavrutaTime);
                }
            );
    
            return resolve([teachingHours, chavrutaHours, teachingHours + chavrutaHours]);  
    
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