module.exports = function (req, res, next) {
    // Website you wish to allow to connect
    // if (process.env.NODE_ENV == "local") {
    res.setHeader("Access-Control-Allow-Origin", "*")
    // } else {
    //     res.setHeader(
    //         "Access-Control-Allow-Origin",
    //         "https://belibahomaquery.herokuapp.com"
    //     )
    // }

    // Request methods you wish to allow
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    )

    // Request headers you wish to allow
    res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With,content-type,x-auth-token"
    )

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", true)

    
    // Pass to next layer of middleware
    next()
}
