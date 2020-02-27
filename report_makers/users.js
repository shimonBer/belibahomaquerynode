const fs = require('fs');
// const sendmail = require('sendmail')();
const lib = require('lodash');
var mongoose = require("mongoose");
var address = "mongodb+srv://ariekfiri:CLZR4KxsjdTTGbz@cluster0-dmeus.gcp.mongodb.net/test?retryWrites=true&w=majority";

var trainee_schema = new mongoose.Schema();
Trainee= mongoose.model("trainee", trainee_schema);

var tutor_schema = new mongoose.Schema();
var Tutor = mongoose.model("tutor", tutor_schema);

var institutes_schema = new mongoose.Schema();
var Institute = mongoose.model("institute", institutes_schema );


var academic_details_schema = new mongoose.Schema();
var AcademicDetail = mongoose.model("academicdetail", academic_details_schema );

var area_schema = new mongoose.Schema();
var Area = mongoose.model("area", area_schema);


var bigTable = [['Name','email','mobile', 'area', 'Institution']];

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index]);
    }
  }

const getData = async () => {
    await mongoose
      .connect(address,  { useUnifiedTopology: true, useNewUrlParser: true })
      .then(() => console.log("Connected to MongoDB..."))
      .catch(err => console.error("Could not connect to MongoDB...", err));

    const trainees = await Trainee.find({}, 'userType fname lname email phoneA activityArea institute');
    await asyncForEach(trainees, async (trainee) => {
        const institue = (await Institute.findById(new mongoose.Types.ObjectId(trainee._doc.institute)))._doc.name;
        const area = (await Area.findById(new mongoose.Types.ObjectId(trainee._doc.activityArea)))._doc.name;
        // const mainStudy = (await AcademicDetail.findById(new mongoose.Types.ObjectId(trainee._doc.mainStudy)))._doc.name;
        let trainee_arr = [trainee._doc.userType, trainee._doc.fname + " " + trainee._doc.lname, trainee._doc.email, trainee._doc.phoneA, area, institue];
        
        bigTable.push(trainee_arr);



    });

    const tutors = await Tutor.find({}, 'userType fname lname email phoneA activityArea institute');
    await asyncForEach(tutors, async (tutor) => {
        const institue = (await Institute.findById(new mongoose.Types.ObjectId(tutor._doc.institute)))._doc.name;
        const area = (await Area.findById(new mongoose.Types.ObjectId(tutor._doc.activityArea)))._doc.name;
        // const mainStudy = (await AcademicDetail.findById(new mongoose.Types.ObjectId(trainee._doc.mainStudy)))._doc.name;
        let tutor_arr = [tutor._doc.userType, tutor._doc.fname + " " + tutor._doc.lname, tutor._doc.email, tutor._doc.phoneA, area, institue];
        
        bigTable.push(tutor_arr);



    });
    
}


getData().then(()=>{
    let csvContent = "";

    bigTable.forEach(function(rowArray) {
        let row = rowArray.join(":");
        csvContent += row + "\r\n";
    });
    fs.writeFile('users.csv',csvContent, function (err) {
            if (err) throw err;
            console.log('Saved!');
        // mongoose.connection.close();
          });
    }

);


  

//   mongoose.connection.close()