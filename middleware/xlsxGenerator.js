const XLSX = require('xlsx');

const generateXlsxFile = (req, res, next) => {
    const book = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet(res.locals.report);
    XLSX.utils.book_append_sheet(book, sheet, 'sheet1');
    const fullFilename = `${req.query.filename}_${req.query.month}.xlsx`;
    req.query.fullFilename = fullFilename;
    XLSX.writeFile(book, `reports/${req.query.fullFilename}`);
    next();
};
module.exports = generateXlsxFile;