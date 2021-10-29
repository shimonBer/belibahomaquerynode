const mongoose = require("mongoose");
// const config = require("../config");

const {trainee_schema, tutor_schema, report_schema, institutes_schema, academic_details_schema, admins_schema,areas_schema} = require("../schema/schema");;


  module.exports = {
    Trainee: mongoose.model("trainee", trainee_schema),
    Tutor: mongoose.model("tutor", tutor_schema),
    Report: mongoose.model("report", report_schema),
    Institute: mongoose.model("institute", institutes_schema),
    AcademicDetail: mongoose.model("academicdetail", academic_details_schema),
    Admin: mongoose.model("admin", admins_schema),
    areas: mongoose.model("areas", areas_schema)
}