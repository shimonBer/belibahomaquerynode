const fs = require('fs');
const sendmail = require('sendmail')();
var mongoose = require("mongoose");
var address = "mongodb+srv://ariekfiri:CLZR4KxsjdTTGbz@cluster0-dmeus.gcp.mongodb.net/test?retryWrites=true&w=majority";

var tutor_schema = new mongoose.Schema({ email: String });
var Tutor = mongoose.model("tutor", tutor_schema);
var trainee_schema = new mongoose.Schema({ email: String });
var Trainee = mongoose.model("trainee", trainee_schema);
var coordinator_schema = new mongoose.Schema({ email: String });
var Coordinator = mongoose.model("coordinator", coordinator_schema);
// get_email();
get_fields();

async function get_email() {
  await mongoose
    .connect(address,  { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log("Connected to MongoDB..."))
    .catch(err => console.error("Could not connect to MongoDB...", err));
  fs.appendFile('email.txt', 'tutors with points:\n', function (err) {
      if (err) throw err;
      console.log('Saved!');
    });
  var tutor_emails = await Tutor.find({isForAcademicPoints:true});
  fs.appendFile('emails.txt', tutor_emails.map(tutor_email => tutor_email.email), function (err) {
    if (err) throw err;
    console.log('Saved!');
  });

  fs.appendFile('email.txt', 'tutors without points:\n', function (err) {
      if (err) throw err;
      console.log('Saved!');
    });
  var tutor_emails = await Tutor.find({isForAcademicPoints:false});
  fs.appendFile('emails.txt', tutor_emails.map(tutor_email => tutor_email.email), function (err) {
    if (err) throw err;
    console.log('Saved!');
  });

  fs.appendFile('email.txt', 'trainees:\n', function (err) {
      if (err) throw err;
      console.log('Saved!');
    });
  const trainees_emails = await Trainee.find();
  fs.appendFile('emails.txt', trainees_emails.map(trainees_email => trainees_email.email), function (err) {
    if (err) throw err;
    console.log('Saved!');
  });

  fs.appendFile('email.txt', 'coordinators:\n', function (err) {
      if (err) throw err;
      console.log('Saved!');
    });
  const coordinators_emails = await Coordinator.find();
  fs.appendFile('emails.txt', coordinators_emails.map(coordinators_email => coordinators_email.email), function (err) {
    if (err) throw err;
    console.log('Saved!');
  });

}

async function get_fields() {
  await mongoose
    .connect(address,  { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log("Connected to MongoDB..."))
    .catch(err => console.error("Could not connect to MongoDB...", err));
    var mykeys;
  await Trainee.findOne({}, function(err, result) {
    mykeys = Object.keys(result._doc);
});

  console.log(mykeys);

mongoose.connection.close()

}