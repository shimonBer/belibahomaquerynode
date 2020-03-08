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
            return resolve(csvContent);
        }) 
    }
}

module.exports = Reporter;