const { config } = require('../util/config');

const verifyTokenMiddleware = (req, res, next) => {
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    let secret = process.env.ENVIRONMENT ==='dev' ? config.secret : process.env.SECRET;
    jwt.verify(token, secret, function(err, decoded) {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
          next();
      
    });
  };

  module.exports = {
    tokenMiddleware: verifyTokenMiddleware
  }