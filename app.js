const express = require('express');
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const accessControls = require('./auth/accessControls');
const { tokenMiddleware } = require('./middleware/auth');
const { reportRouter } = require('./routes/reports');
const { authRouter } = require('./routes/auth');
const cors = require('cors')

if (process.env.ENVIRONMENT !== 'prod') {
    require('dotenv').config({ path: '.env'});
}
const app = express();

app.use(cors({origin: '*'}));
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
      .connect(process.env.ADDRESS,  { useUnifiedTopology: true, useNewUrlParser: true })
      .then(() => console.log("Connected to MongoDB..."))
      .catch(err => console.error("Could not connect to MongoDB...", err));
})