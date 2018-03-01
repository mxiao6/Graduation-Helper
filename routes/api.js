const express = require('express');
const router = express.Router();
const request = require('request');
const getElements = require('./utilities.js').getElements;

router.get('/years',function(req,res) {
    getElements('schedule', function (result) {
        calendarYears = result['ns2:schedule']['calendarYears'][0]['calendarYear'];
        let years = [];
        for(i = 0; i < calendarYears.length; i++) {
            years.push(calendarYears[i]['_']);
        }
        res.json(years);
    });
});

router.get('/semester',function(req,res) {
    let year = req.query.year;
    getElements('schedule/' + year, function (result) {
        calendarSemester = result['ns2:calendarYear']['terms'][0]['term'];
        let semester = [];
        for(i = 0; i < calendarSemester.length; i++) {
            semester.push(calendarSemester[i]['_']);
        }
        res.json(semester);
    });
});

router.get('/major',function(req,res) {
    let year = req.query.year;
    let semester = req.query.semester;
    getElements('schedule/' + year + '/' + semester, function (result) {
        major = result['ns2:term']['subjects'][0]['subject'];
        let majorList = [];
        for(i = 0; i < major.length; i++) {
            let subject = major[i]['_'];
            let id = major[i]['$']['id'];
            majorList.push({subject:subject, id:id});
        }
        res.json(majorList);
    });
});

router.get('/course',function(req,res) {
    let year = req.query.year;
    let semester = req.query.semester;
    let course = req.query.course;
    getElements('schedule/' + year + '/' + semester + '/' + course, function (result) {
        courses = result['ns2:subject']['courses'][0]['course'];
        let courseList = [];
        for(i = 0; i < courses.length; i++) {
            let course = courses[i]['_'];
            let id = courses[i]['$']['id'];
            courseList.push({course:course, id:id});
        }
        res.json(courseList);
    });
});


router.get('/section',function(req,res) {
    let year = req.query.year;
    let semester = req.query.semester;
    let course = req.query.course;
    let courseNum = req.query.courseNumber;
    getElements('schedule/' + year + '/' + semester + '/' + course + '/' + courseNum, function (result) {
        section = result['ns2:course']['sections'][0]['section'];
        let sectionList = [];
        for(i = 0; i < section.length; i++) {
            let sectionName = section[i]['_'];
            let sectionId = section[i]['$']['id'];
            sectionList.push({[sectionName]:sectionId});
        }
        res.json(sectionList);
    });
});

//section returns dictionary:
// sectionName,
// sectionId,
// sectionNumber,
// enrollmentStatus,
// type,
// startTime,
// endTime,
// daysOfWeek
/*getElements('schedule/' + year + '/' + semester + '/' + course + '/' + courseNum + '/' + sectionId, function (result) {
    let sectionNumber = result['ns2:section']['sectionNumber'];
    let enrollmentStatus = result['ns2:section']['enrollmentStatus'];
    let type = result['ns2:section']['meetings'][0]['type'];
    let startTime = result['ns2:section']['meetings'][0]['start'];
    let endTime = result['ns2:section']['meetings'][0]['end'];
    let daysOfWeek = result['ns2:section']['meetings'][0]['daysOfTheWeek'];
    sectionList.push({
        sectionName:sectionName,
        sectionId:sectionId,
        sectionNumber:sectionNumber,
        enrollmentStatus:enrollmentStatus,
        type:type,
        startTime:startTime,
        endTime:endTime,
        daysOfWeek:daysOfWeek,
    });
    sectionList.push("TEST");
});*/

module.exports = router;
