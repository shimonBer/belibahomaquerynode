var ObjectId = require('mongodb').ObjectId; 
const asyncForEach = require("../../util/helpFunction");
const Reporter = require("../Reporter");

const { Trainee } = require("../../models/models");


class KivunB extends Reporter{
    constructor(client, month) {
        super(client, month, 'kivunB.csv');
        this.bigTable = [['Name','ID', 'mobile', 'email', 'date-of-birth', 'gender', 'marital-status', 'city-by-id', 'neighborhood-by-id', 'is-yeshiva-seminar', 'years-in-yeshiva-seminar', 'is-professional-trained', 'details-professional-trained', 'has-degree', 'degree-details', 'work-details', 'asked-topics-from-kivun']];

    }
    createData = () => {

        return new Promise(async (resolve) => {
            const trainees = await this.client.db("test").collection("trainees").find({"realAddress.city": "ירושלים", "institute": {$ne: new ObjectId('5d6f643b3acdb6001790e08f')}}, 'fname lname id phoneA realAddress email phoneA birthDate gender maritalStatus needsHelpIn studyYear institute mainStudy isRegisteredToKivun realAddress yeshivaTimes isLearnedInYeshiva isHaveAnotherProfessionalTraining previousProfession isHaveAnotherDegree previousDegree workStatus WantDetailsAbout').toArray();
            await asyncForEach(trainees, async (trainee) => {
                const needHelp = Object.keys(trainee.WantDetailsAbout).filter(subject => trainee.WantDetailsAbout[subject])
                let trainee_arr = [trainee.fname + " " + trainee.lname, trainee.id, trainee.phoneA, trainee.email, trainee.birthDate, trainee.gender, trainee.maritalStatus, trainee.realAddress.city, trainee.realAddress.neighborhood, trainee.isLearnedInYeshiva, trainee.yeshivaTimes, trainee.isHaveAnotherProfessionalTraining, trainee.previousProfession, trainee.isHaveAnotherDegree, trainee.previousDegree, trainee.workStatus, needHelp];
    
                this.bigTable.push(trainee_arr);
    
    
    
            });
            return resolve();
    
        })
    }
}


kivunBSingelton = (client, month) => {
    if(!KivunB.kivunBOnlyInstance) {
        const kivunBOnlyInstance = new KivunB(client, month);
        return kivunBOnlyInstance;
    } 
    return KivunB.kivunBOnlyInstance;
}

module.exports = kivunBSingelton;

