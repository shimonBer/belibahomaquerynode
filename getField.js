const fs = require('fs');
const sendmail = require('sendmail')();
const lib = require('lodash');
var mongoose = require("mongoose");
var address = "mongodb+srv://ariekfiri:CLZR4KxsjdTTGbz@cluster0-dmeus.gcp.mongodb.net/test?retryWrites=true&w=majority";

// var trainee_schema = new mongoose.Schema();
// Trainee= mongoose.model("trainee", trainee_schema);

// var tutor_schema = new mongoose.Schema();
// var Tutor = mongoose.model("tutor", tutor_schema);

var report_schema = new mongoose.Schema();
var Report = mongoose.model("report", report_schema);

var institutes_schema = new mongoose.Schema();
var Institute = mongoose.model("institute", institutes_schema );

var academic_details_schema = new mongoose.Schema();
var AcademicDetail = mongoose.model("academicdetail", academic_details_schema );

var areas_schema = new mongoose.Schema();
var Area = mongoose.model("area", areas_schema);

var relation_schema = new mongoose.Schema();
var Relation = mongoose.model("relation", relation_schema);

var admin_schema = new mongoose.Schema();
var Admin = mongoose.model("admin", admin_schema);

var coordinator_schema = new mongoose.Schema();
var Coordinator = mongoose.model("coordinator", coordinator_schema);


var big = [];
const getData = async () => {
    await mongoose
      .connect(address,  { useUnifiedTopology: true, useNewUrlParser: true })
      .then(() => console.log("Connected to MongoDB..."))
      .catch(err => console.error("Could not connect to MongoDB...", err));

    const coordinators = await Coordinator.findOne();
    let arr = []
    for (key in coordinators._doc) arr.push(`"${key}"`);
    big.push(arr);
    arr = [];
    const institues = await Institute.findOne();
    for (key in institues._doc) arr.push(`"${key}"`);
    big.push(arr);
    arr = [];
    const academicDetails = await AcademicDetail.findOne();
    for (key in academicDetails._doc) arr.push(`"${key}"`);
    big.push(arr);
    arr = [];
    const admins = await Admin.findOne();
    for (key in admins._doc) arr.push(`"${key}"`);
    big.push(arr);
    arr = [];
    const relations = await Relation.findOne();
    for (key in relations._doc) arr.push(`"${key}"`);
    big.push(arr);
    arr = [];
    const areas = await Area.findOne();
    for (key in areas._doc) arr.push(`"${key}"`);
    big.push(arr);
    arr = [];
    const reports = await Report.findOne();
    for (key in reports._doc) arr.push(`"${key}"`);
    big.push(arr);
    arr = [];

}

getData().then(()=>{
    let csvContent = "";

    big.forEach(function(rowArray) {
        let row = rowArray.join(",");
        csvContent += row + "\r\n";
    });
    fs.writeFile('fields.csv',csvContent, function (err) {
            if (err) throw err;
            console.log('Saved!');
        // mongoose.connection.close();
          });
    }

);


