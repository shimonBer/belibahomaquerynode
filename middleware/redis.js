// const RedisServer = require('redis-server');
const redis = require("redis");
const client = redis.createClient(process.env.REDIS_URL);
client.on('error', (err) => {
    console.log("Error " + err)
});
client.on("connect", function() {
    console.log("Connected to Redis");
  });
 
// Simply pass the port that you want a Redis server to listen on.
// const server = new RedisServer();
 
// server.open((err) => {
//   if (err === null) {
//     // You may now connect a client to the Redis
//     // server bound to port 6379.
//     const client = redis.createClient();
//     client.on("error", function(error) {
//         console.error(error);
//     });

//   }else{
//       console.log(err);
//   }
// });


const setValueRedis = (req, res, next) => {
    client.setex(req.query.reportName, 3600, req.query.downloadURL);
    next();
}

module.exports = {
    setValueRedis,
    client
}