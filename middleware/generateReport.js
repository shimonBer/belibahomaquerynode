
const generateReportMiddleware = async (req, res, next) => {
    const from = req.query.from;
    const to = req.query.to;

    const reportersInstance = req.query.reporter(req.app.client, from, to);
    await reportersInstance.createData();
    res.locals.report = await reportersInstance.createReport();
    next();
}

module.exports = generateReportMiddleware;
