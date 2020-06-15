if (process.env.NODE_ENV !== "production") {
    require('dotenv').config({ path: '.env'});
}
const express = require('express');
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const accessControls = require('./auth/accessControls');
const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);

const cors = require('cors')

const { tokenMiddleware } = require('./middleware/auth');
const { reportRouter } = require('./routes/reports');
const { authRouter } = require('./routes/auth');

app.set('socketio', io);
app.use(cors({origin: '*'}));
app.use(accessControls);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api/auth', authRouter);
app.use(tokenMiddleware);
app.use('/api/reports', reportRouter);

const port = process.env.PORT || 3000;

// app.listen(port, async() => {
//     console.log('listening on port ' + port);
//     await mongoose
//       .connect(process.env.ADDRESS,  { useUnifiedTopology: true, useNewUrlParser: true })
//       .then(() => console.log("Connected to MongoDB..."))
//       .catch(err => console.error("Could not connect to MongoDB...", err));
// })

io.on('connection', (socket) => {
    console.log('connected socket');
})

http.listen(port, async () => {
    console.log('listening on port ' + port);
    await mongoose
      .connect(process.env.ADDRESS,  { useUnifiedTopology: true, useNewUrlParser: true })
      .then(() => console.log("Connected to MongoDB..."))
      .catch(err => console.error("Could not connect to MongoDB...", err));
})