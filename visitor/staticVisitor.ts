import Visitor from "./Visitor";
import tutorsGenerator from "../report_makers/queryTutorHours";
import kivunAGenerator from "../report_makers/queryKivunA";
import kivunBGenerator from "../report_makers/queryKivunB";
import kivunCGenerator from "../report_makers/queryKivunC";

class StaticVisitor extends Visitor {
    // visit(tutorsReport: tutorsGenerator, month: string) {
    //     return new Promise(async (resolve) => {
    //         const tutorsInstance = tutorsReport(month);
    //         await tutorsInstance.createData();
    //         await tutorsInstance.createReport();
    //         resolve();
    //     });
    // }

    visit(kivunAReport: kivunAGenerator, month: string) {
        return new Promise(async (resolve) => {
            const kivunAInstance = kivunAReport(month);
            await kivunAInstance.createData();
            await kivunAInstance.createReport();
            resolve();
        });
    }
    
    // visit(kivunBReport: kivunBGenerator, month: string) {
    //     return new Promise(async (resolve) => {
    //         const kivunBInstance = kivunBReport(month);
    //         await kivunBInstance.createData();
    //         await kivunBInstance.createReport();
    //         resolve();
    //     });
    // }
    // visit(kivunCReport: kivunCGenerator, month: string) {
    //     return new Promise(async (resolve) => {
    //         const kivunCInstance = kivunCReport(month);
    //         await kivunCInstance.createData();
    //         await kivunCInstance.createReport();
    //         resolve();
    //     });
    // }
}