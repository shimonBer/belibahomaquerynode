const fs = require('fs');
const path = require("path");

class Reporter {
    constructor(month, filename) {
        if(this.constructor === Reporter) {
            throw new error("cannot instansiate this class");
        }
        this.month = month;
        this.filename = `${month}-${filename}`;
    }

    createData() {
        throw new error("cannot call an abstract function");
    }
    createReport = () => {
        return new Promise((resolve) => {

            let csvContent = "";
            this.bigTable.forEach(function(rowArray) {
                let row = rowArray.join(";");
                csvContent += row + "\r\n";
            });
            fs.writeFile(path.resolve(path.join(__dirname, `../reports/${this.filename}`)), csvContent, function (err) {
                if (err) throw err;
                    console.log('Saved!');
                    return resolve();
            });
        }) 
    }
}

module.exports = Reporter;