const express = require('express');
const router = express.Router();
const getElements = require('./utilities.js').getElements;

// TODO: DOCUMENTATION FOR EACH API CALL
// APIDOCSJS
// ADD status
// moment js for time parsing

router.get('/years', function (req, res) {
  getElements('schedule', function (error, result) {
    if (error) res.status(500).json(result);

    let calendarYears = result['ns2:schedule']['calendarYears'][0]['calendarYear'];
    let years = [];
    for (let i = 0; i < calendarYears.length; i++) {
      years.push(calendarYears[i]['_']);
    }
    res.status(200).json(years);
  });
});

router.get('/semester', function (req, res) {
  let year = req.query.year;
  getElements('schedule/' + year, function (error, result) {
    if (error) res.status(500).json(result);

    let calendarSemester = result['ns2:calendarYear']['terms'][0]['term'];
    let semester = [];
    for (let i = 0; i < calendarSemester.length; i++) {
      semester.push(calendarSemester[i]['_']);
    }
    res.status(200).json(semester);
  });
});

router.get('/major', function (req, res) {
  let year = req.query.year;
  let semester = req.query.semester;
  getElements('schedule/' + year + '/' + semester, function (error, result) {
    if (error) res.status(500).json(result);

    let major = result['ns2:term']['subjects'][0]['subject'];
    let majorList = [];
    for (let i = 0; i < major.length; i++) {
      let subject = major[i]['_'];
      let id = major[i]['$']['id'];
      majorList.push({subject: subject, id: id});
    }
    res.status(200).json(majorList);
  });
});

router.get('/course', function (req, res) {
  let year = req.query.year;
  let semester = req.query.semester;
  let course = req.query.course;
  getElements('schedule/' + year + '/' + semester + '/' + course, function (error, result) {
    if (error) res.status(500).json(result);

    let courses = result['ns2:subject']['courses'][0]['course'];
    let courseList = [];
    for (let i = 0; i < courses.length; i++) {
      let course = courses[i]['_'];
      let id = courses[i]['$']['id'];
      courseList.push({course: course, id: id});
    }
    res.status(200).json(courseList);
  });
});

router.get('/section', function (req, res) {
  let year = req.query.year;
  let semester = req.query.semester;
  let course = req.query.course;
  let courseId = req.query.courseId;
  getElements('schedule/' + year + '/' + semester + '/' + course + '/' + courseId, function (error, result) {
    if (error) res.status(500).json(result);

    let section = result['ns2:course']['sections'][0]['section'];
    let sectionList = [];
    for (let i = 0; i < section.length; i++) {
      let sectionName = section[i]['_'];
      let sectionId = section[i]['$']['id'];
      sectionList.push({[sectionName]: sectionId});
    }
    res.status(200).json(sectionList);
  });
});

// section returns dictionary:
// sectionId,
// sectionNumber,
// enrollmentStatus,
// type,
// startTime,
// endTime,
// daysOfWeek
router.get('/sectionDetails', function (req, res) {
  let year = req.query.year;
  let semester = req.query.semester;
  let course = req.query.course;
  let courseId = req.query.courseId;
  let sectionId = req.query.sectionId;
  getElements('schedule/' + year + '/' + semester + '/' + course + '/' + courseId + '/' + sectionId, function (error, result) {
    if (error) res.status(500).json(result);

    let sectionNumber = result['ns2:section']['sectionNumber'][0];
    let enrollmentStatus = result['ns2:section']['enrollmentStatus'][0];
    let type = result['ns2:section']['meetings'][0]['meeting'][0]['type'][0]['$']['code'];

    let startTime = result['ns2:section']['meetings'][0]['meeting'][0]['start'];
    if (startTime != null) {
      startTime = startTime[0];
    }
    let endTime = result['ns2:section']['meetings'][0]['meeting'][0]['end'];
    if (endTime != null) {
      endTime = endTime[0];
    }
    let daysOfWeek = result['ns2:section']['meetings'][0]['meeting'][0]['daysOfTheWeek'];
    if (daysOfWeek != null) {
      daysOfWeek = daysOfWeek[0];
    }
    let sectionDetails = {
      sectionId: sectionId,
      sectionNumber: sectionNumber,
      enrollmentStatus: enrollmentStatus,
      type: type,
      startTime: startTime,
      endTime: endTime,
      daysOfWeek: daysOfWeek
    };
    res.status(200).json(sectionDetails);
  });
});

module.exports = router;
