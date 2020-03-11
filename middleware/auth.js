var jwt = require('jsonwebtoken');

const verifyTokenMiddleware = (req, res, next) => {
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    if (process.env.ENVIRONMENT !== 'prod') {
      require('dotenv').config({ path: '../.env'});
    }
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
          next();
      
    });
  };

  module.exports = {
    tokenMiddleware: verifyTokenMiddleware
  }