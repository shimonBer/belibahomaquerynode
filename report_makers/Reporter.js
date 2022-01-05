class Reporter {
    constructor(client, from , to, filename) {
        if(this.constructor === Reporter) {
            throw new error("cannot instansiate this class");
        }
        this.client = client;
        // this.from = from;
        // this.filename = `${from}-${to}`;
    }

    createData() {
        throw new error("cannot call an abstract function");
    }
    createReport = () => {
        return new Promise((resolve) => {

            // let csvContent = "";
            // this.bigTable.forEach(function(rowArray) {
            //     let row = rowArray.join(";");
            //     csvContent += row + "\r\n";
            // });
            return resolve(this.bigTable);
        }) 
    }
}

module.exports = Reporter;