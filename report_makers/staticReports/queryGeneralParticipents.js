const lib = require('lodash');
const { Trainee, Tutor, Report, Institute, AcademicDetail } = require("../../models/models");
const asyncForEach = require("../../util/helpFunction");
const Reporter = require("../Reporter");
const fs = require('fs');
const ObjectID = require('mongodb').ObjectID;


class GeneralParticipents extends Reporter{
    constructor(client, month) {
        super(client, month, 'generalParticipents.csv');
        this.bigTable = [];
        fs.readFile('/Users/shimon.ber/beliba_homa_project/querying/report_makers/staticReports/months.json', (err, data) => {
            this.months = JSON.parse(data);
            if(!this.months.includes(month)){
                this.months.push(month);
                fs.writeFile("/Users/shimon.ber/beliba_homa_project/querying/report_makers/staticReports/months.json", JSON.stringify(this.months), () => {});

            } else {
                const index = this.months.indexOf(month);
                this.months = this.months.slice(0, index + 1);
            }
        })
    }
    
     createData = () => {
        return new Promise(async (resolve) => {
            const trainees = await this.client.db("test").collection("trainees").find({}, 'fname lname id realAddress email phoneA needsHelpIn studyYear institute mainStudy isRegisteredToKivun realAddress').toArray();
            const reports = await this.client.db("test").collection("reports").find({date: {"$gte": new Date(this.month + "-01"), "$lt": new Date(this.month + "-31")}}).toArray();
            const institutes = await this.client.db("test").collection("institutes").find({}).toArray();
            const tutors = await this.client.db("test").collection("tutors").find({}).toArray();
            const tutorAsObj = {};
            tutors.forEach((tutor) => {
                tutorAsObj[tutor._id] = [tutor.fname + " " + tutor.lname, tutor.phoneA];
                
            })
            const instituteMapping = {};
            institutes.forEach((institute) => {
                instituteMapping[institute._id] = institute.name;
            })
            const mainStudies = await this.client.db("test").collection("academicdetails").find({}).toArray();
            const mainStudymapping = {};
            mainStudies.forEach((mainStudy) => {
                mainStudymapping[mainStudy._id] = mainStudy.name;
            });

            const traineesReports = {};
            const tutorsTraineesMapping = {};

            reports.forEach((report) => {
                if(traineesReports[report.trainee_id]){
                    traineesReports[report.trainee_id].push(report);
                } else {
                    traineesReports[report.trainee_id] = [report];
                }
                tutorsTraineesMapping[report.trainee_id] = tutorAsObj[report.tutor_id];
            })
            
            // trainees.forEach((trainee) => {
                
                Promise.all(trainees.map((trainee) => {
                    const institue = instituteMapping[trainee.institute];
                    const mainStudy = mainStudymapping[trainee.mainStudy];
                    const trainee_id_obj = trainee._id;
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
                finalArr.unshift(trainee.fname + " " + trainee.lname, trainee.id, trainee.email, trainee.realAddress.street + ' , ' + trainee.realAddress.neighborhood + ' , ' + trainee.realAddress.city, trainee.phoneA, trainee.needsHelpIn.replace(/(\r\n|\n|\r)/gm, ""), institue, mainStudy, trainee.studyYear, tutor[0], tutor[1]);
            } else {
                finalArr.unshift(trainee.fname + " " + trainee.lname, trainee.id, trainee.email, trainee.realAddress.street + ' , ' + trainee.realAddress.neighborhood + ' , ' + trainee.realAddress.city, trainee.phoneA, trainee.needsHelpIn.replace(/(\r\n|\n|\r)/gm, ""), institue, mainStudy, trainee.studyYear, "No Tutor", "No Tutor");
            }
            resolve(finalArr);
        })
    }
    
    getOneMonthHours = (trainee, month) => {
        return new Promise(async (resolve) => {
            const reports = await this.client.db("test").collection("reports").find({trainee_id: trainee._id, date: {"$gte": new Date(month + "-01"), "$lt": new Date(month + "-31")}}).toArray();
        
                
            const teachingHours = await lib.sumBy(
                reports,
                val => {
                return (val.studyTime);
                }
            );

            const chavrutaHours = await lib.sumBy(
                reports,
                val => {
                return (val.chavrutaTime);
                }
            );
    
            return resolve([teachingHours, chavrutaHours, teachingHours + chavrutaHours]);  
    
        })
    
    }
    
}

generalParticipentsSingelton = (client, month) => {
    if(!GeneralParticipents.generalParticipentsOnlyInstance) {
        const generalParticipentsOnlyInstance = new GeneralParticipents(client, month);
        return generalParticipentsOnlyInstance;
    } 
    return GeneralParticipents.generalParticipentsOnlyInstance;
 
}
module.exports = generalParticipentsSingelton;