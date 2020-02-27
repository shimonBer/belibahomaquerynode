const lib = require('lodash');
var mongoose = require("mongoose");
var address = "mongodb+srv://ariekfiri:CLZR4KxsjdTTGbz@cluster0-dmeus.gcp.mongodb.net/test?retryWrites=true&w=majority";
var ObjectId = require('mongodb').ObjectId; 
const asyncForEach = require("../helpFunction");
const Reporter = require("./Reporter");

const {Trainee, Tutor, Report, Institute, AcademicDetail} = require("../models/models");


class KivunB extends Reporter{
    constructor(month) {
        super(month, 'kivunB.csv');
        this.bigTable = [['Name','ID', 'mobile', 'email', 'date-of-birth', 'gender', 'marital-status', 'city-by-id', 'neighborhood-by-id', 'is-yeshiva-seminar', 'years-in-yeshiva-seminar', 'is-professional-trained', 'details-professional-trained', 'has-degree', 'degree-details', 'work-details', 'asked-topics-from-kivun']];

    }
    createData = () => {

        return new Promise(async (resolve) => {
            const trainees = await Trainee.find({"realAddress.city": "ירושלים", "institute": {$ne: new ObjectId('5d6f643b3acdb6001790e08f')}}, 'fname lname id phoneA realAddress email phoneA birthDate gender maritalStatus needsHelpIn studyYear institute mainStudy isRegisteredToKivun realAddress yeshivaTimes isLearnedInYeshiva isHaveAnotherProfessionalTraining previousProfession isHaveAnotherDegree previousDegree workStatus WantDetailsAbout');
            await asyncForEach(trainees, async (trainee) => {
                // const institue = (await Institute.findById(new mongoose.Types.ObjectId(trainee._doc.institute)))._doc.name;
                // const mainStudy = (await AcademicDetail.findById(new mongoose.Types.ObjectId(trainee._doc.mainStudy)))._doc.name;
                const needHelp = Object.keys(trainee._doc.WantDetailsAbout).filter(subject => trainee._doc.WantDetailsAbout[subject])
                let trainee_arr = [trainee._doc.fname + " " + trainee._doc.lname, trainee._doc.id, trainee._doc.phoneA, trainee._doc.email, trainee._doc.birthDate, trainee._doc.gender, trainee._doc.maritalStatus, trainee._doc.realAddress.city, trainee._doc.realAddress.neighborhood, trainee._doc.isLearnedInYeshiva, trainee._doc.yeshivaTimes, trainee._doc.isHaveAnotherProfessionalTraining, trainee._doc.previousProfession, trainee._doc.isHaveAnotherDegree, trainee._doc.previousDegree, trainee._doc.workStatus, needHelp];
    
                this.bigTable.push(trainee_arr);
    
    
    
            });
            return resolve();
    
        })
    }
}


kivunBSingelton = (month) => {
    if(!KivunB.kivunBOnlyInstance) {
        const kivunBOnlyInstance = new KivunB(month);
        return kivunBOnlyInstance;
    } 
    return KivunB.kivunBOnlyInstance;
}

module.exports = kivunBSingelton;

