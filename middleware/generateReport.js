
const generateReportMiddleware = async (req, res, next) => {
    const month = req.query.month;
    const reportersInstance = req.query.reporter(req.app.client, month);
    await reportersInstance.createData();
    res.locals.report = await reportersInstance.createReport();
    next();
}

module.exports = generateReportMiddleware;
