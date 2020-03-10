var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var { Admin } = require('../models/models');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../util/config');


// router.post('/register', function(req, res) {
  
//     var hashedPassword = bcrypt.hashSync(req.body.password, 8);
    
//     User.create({
//       name : req.body.name,
//       email : req.body.email,
//       password : hashedPassword
//     },
//     function (err, user) {
//       if (err) return res.status(500).send("There was a problem registering the user.")
//       // create a token
//       var token = jwt.sign({ id: user._id }, config.secret, {
//         expiresIn: 86400 // expires in 24 hours
//       });
//       res.status(200).send({ auth: true, token: token });
//     }); 
//   });


router.post('/login', function(req, res) {

    Admin.findOne({ email: req.body.email }, function (err, user) {
      if (err) return res.status(500).send('Error on the server.');
      if (!user) return res.status(404).send('No user found.');
      
      var passwordIsValid = bcrypt.compareSync(req.body.password, user._doc.password);
      if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
      
      const expires =  86400;
      let secret = process.env.ENVIRONMENT ==='dev' ? config.secret : process.env.SECRET;
      var token = jwt.sign({ id: user._id }, secret, {
        expiresIn: expires // expires in 24 hours
      });
      
      res.status(200).send({ auth: true, token: token, expiresIn: expires });
    });
    
  });

  module.exports = {
    authRouter: router,
  }