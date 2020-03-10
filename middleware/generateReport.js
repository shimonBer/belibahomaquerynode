
const generateReportMiddleware = async (req, res, next) => {
    const month = req.query.month;
    const reportersInstance = req.query.reporter(month);
    await reportersInstance.createData();
    res.locals.report = await reportersInstance.createReport();
    next();
}

module.exports = generateReportMiddleware;
