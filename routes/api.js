const express = require('express');
const router = express.Router();
const getElements = require('./utilities.js').getElements;

router.get('/years', function (req, res) {
  getElements('schedule', function (result) {
    let calendarYears = result['ns2:schedule']['calendarYears'][0]['calendarYear'];
    let years = [];
    for (let i = 0; i < calendarYears.length; i++) {
      years.push(calendarYears[i]['_']);
    }
    res.json(years);
  });
});

router.get('/semester', function (req, res) {
  let year = req.query.year;
  getElements('schedule/' + year, function (result) {
    let calendarSemester = result['ns2:calendarYear']['terms'][0]['term'];
    let semester = [];
    for (let i = 0; i < calendarSemester.length; i++) {
      semester.push(calendarSemester[i]['_']);
    }
    res.json(semester);
  });
});

router.get('/major', function (req, res) {
  let year = req.query.year;
  let semester = req.query.semester;
  getElements('schedule/' + year + '/' + semester, function (result) {
    let major = result['ns2:term']['subjects'][0]['subject'];
    let majorList = [];
    for (let i = 0; i < major.length; i++) {
      let subject = major[i]['_'];
      let id = major[i]['$']['id'];
      majorList.push({subject: subject, id: id});
    }
    res.json(majorList);
  });
});

router.get('/course', function (req, res) {
  let year = req.query.year;
  let semester = req.query.semester;
  let course = req.query.course;
  getElements('schedule/' + year + '/' + semester + '/' + course, function (result) {
    let courses = result['ns2:subject']['courses'][0]['course'];
    let courseList = [];
    for (let i = 0; i < courses.length; i++) {
      let course = courses[i]['_'];
      let id = courses[i]['$']['id'];
      courseList.push({course: course, id: id});
    }
    res.json(courseList);
  });
});

// TODO:
router.get('/sections', function (req, res) {
  let year = req.query.year;
  let semester = req.query.semester;
  let course = req.query.course;

  getElements('schedule/' + year + '/' + semester + '/' + course, function (result) {
    let courses = result['ns2:subject']['courses'][0]['course'];
    let courseList = [];
    for (let i = 0; i < courses.length; i++) {
      let name = courses[i]['_'];
      let id = courses[i]['$']['id'];
      courseList.push({[name]: id});
    }
    res.json(courseList);
  });
});

module.exports = router;
