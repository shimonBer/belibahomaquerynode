
const asyncMiddleware = async (req, res, next) => {
    const month = req.query.month;
    const reportersInstance = req.query.reporter(month);
    await reportersInstance.createData();
    await reportersInstance.createReport();
    next();
}

module.exports = asyncMiddleware;
