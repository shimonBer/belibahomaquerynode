if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ path: ".env" })
}
const express = require("express")
// const mongoose = require("mongoose");
var MongoClient = require('mongodb').MongoClient;

const bodyParser = require("body-parser")
const accessControls = require("./auth/accessControls")
const app = express()

// const http = require("http").createServer(app)

// const io = require("socket.io")(http)
// const mongoQueries = require("mongodb-query-node");
const cors = require("cors")

const { tokenMiddleware } = require("./middleware/auth")
const { reportRouter } = require("./routes/reports")
const { authRouter } = require("./routes/auth")

// app.set("socketio", io)
app.use(cors({ origin: "*" }))
app.use(accessControls)
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use("/api/auth", authRouter)
app.use(tokenMiddleware)
app.use("/api/reports", reportRouter)

const port = process.env.PORT || 3000

const client = new MongoClient(process.env.ADDRESS, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
})
// app.use("/api/queries", mongoQueries)


app.listen(port, () => {
    console.log("listening on port " + port)
    client
        .connect()
        .then(() => {
            console.log("Connected to MongoDB...");
            app.client = client;
        })
        .catch((err) => console.error("Could not connect to MongoDB...", err))
})
