var mongoose = require("mongoose");
// var bcrypt = require('bcryptjs');

module.exports  = {
    trainee_schema: new mongoose.Schema(),
    tutor_schema: new mongoose.Schema(),
    report_schema: new mongoose.Schema(),
    institutes_schema: new mongoose.Schema(),
    academic_details_schema: new mongoose.Schema(),
    admins_schema: new mongoose.Schema()

}

// admins_schema.methods.generateAuthToken = function() {
//     const token = jwt.sign(
//       {
//         _id: this._id,
//         fname: this.fname,
//         lname: this.lname,
//         type: this.userType
//       },
//       config.secret
//     );
//     return token;
//   };


//   admins_schema.methods.comparePassword = function(candidatePassword, next) {
//     bcrypt.compare(candidatePassword, this.password, function(err, isMatch){
//         if(err){
//             return next(err);
//         } 
//         next(null, isMatch)
//     })
//   };
