const express = require('express');
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const accessControls = require('./auth/accessControls');
const { connectionstring } = require('./util/config');
const { tokenMiddleware } = require('./middleware/auth');
const { reportRouter } = require('./routes/reports');
const { authRouter } = require('./routes/auth');
var cors = require('cors')

const address = process.env.ENVIRONMENT === 'dev' ? connectionstring : process.env.ADDRESS;
const app = express();

app.use(cors()) 
app.use(accessControls);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api/auth', authRouter);
app.use(tokenMiddleware);
app.use('/reports', reportRouter);

const port = process.env.PORT || 3000;

app.listen(port, async() => {
    console.log('listening on port ' + port);
    await mongoose
      .connect(address,  { useUnifiedTopology: true, useNewUrlParser: true })
      .then(() => console.log("Connected to MongoDB..."))
      .catch(err => console.error("Could not connect to MongoDB...", err));
})