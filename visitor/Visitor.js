class Visitor {
    constructor() {
        if(this.constructor === Visitor) {
            throw new error("cannot instansiate this class");
        }
    }

    visit(o, month) {
        throw new error("cannot call an abstract function");
    }
}

export default Visitor;