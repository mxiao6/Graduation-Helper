const express = require('express');
const router = express.Router();
const getElements = require('./utilities.js').getElements;

// TODO: DOCUMENTATION FOR EACH API CALL
// APIDOCSJS
// ADD status
// moment js for time parsing

/**
*@api{get}/years Get all years
*@apiName GetYears
*@apiGroup Class
*@apiVersion 0.1.0
*
*@apiSuccessExample {String[]} Success-Response:
*   HTTP/1.1 200 OK
*   [
*     "2018",
*     "2017",
*     "2016",
*     "2015",
*     "2014"
*   ]
*
*@apiErrorExample Error-Response:
*   HTTP/1.1 500 Internal Server Error
*   {
*     "error": "InternalServerError"
*   }
*/
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

/**
*@api{get}/semester Get semesters for year
*@apiName GetSemester
*@apiGroup Class
*@apiVersion 0.1.0
*
*@apiParam {String} year The specific school year
*
*@apiSuccessExample {String[]} Success-Response:
*   HTTP/1.1 200 OK
*   [
*     "Spring",
*     "Summer",
*     "Fall",
*     "Winter"
*   ]
*
*@apiErrorExample Error-Response:
*   HTTP/1.1 500 Internal Server Error
*   {
*     "error": "InternalServerError"
*   }
*/
router.get('/semester', function (req, res) {
  let year = req.query.year;
  getElements('schedule/' + year, function (error, result) {
    if (error) res.status(500).json(result);

    let calendarSemester = result['ns2:calendarYear']['terms'][0]['term'];
    let semester = [];
    for (let i = 0; i < calendarSemester.length; i++) {
      semester.push(calendarSemester[i]['_'].split(' ')[0]);
    }
    res.status(200).json(semester);
  });
});

/**
*@api{get}/subject Get all subjects
*@apiName GetSubjects
*@apiGroup Class
*@apiVersion 0.1.0
*
*@apiParam {String} year The school year
*@apiParam {String} semester The specific semester
*
*@apiSuccess {String} subject   The school subject
*@apiSuccess {String} id        Subject ID
*@apiSuccessExample {Object[]} Success-Response:
*   HTTP/1.1 200 OK
*   [
*       {
*         "subject": "Asian American Studies",
*         "id": "AAS"
*       },
*       {
*         "subject": "Agricultural and Biological Engineering",
*         "id": "ABE"
*       },
*       {
*         "subject": "Accountancy",
*         "id": "ACCY"
*       }
*   ]
*
*@apiErrorExample Error-Response:
*   HTTP/1.1 500 Internal Server Error
*   {
*     "error": "InternalServerError"
*   }
*/
router.get('/subject', function (req, res) {
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

/**
*@api{get}/course Get courses in a subject
*@apiName GetCourses
*@apiGroup Class
*@apiVersion 0.1.0
*
*@apiParam {String} year The school year
*@apiParam {String} semester The specific semester
*@apiParam {String} course The course abbreviation
*
*@apiSuccess {String} course    The subject course
*@apiSuccess {String} id        Course ID
*@apiSuccessExample {Object[]} Success-Response:
*   HTTP/1.1 200 OK
*   [
*       {
*         "course": "Intro Asian American Studies",
*         "id": "100"
*       },
*       {
*         "course": "U.S. Race and Empire",
*         "id": "200"
*       },
*       {
*         "course": "US Racial & Ethnic Politics",
*         "id": "201"
*       }
*   ]
*
*@apiErrorExample Error-Response:
*   HTTP/1.1 500 Internal Server Error
*   {
*     "error": "InternalServerError"
*   }
*/
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

/**
*@api{get}/section Get sections in a specific course
*@apiName GetSections
*@apiGroup Class
*@apiVersion 0.1.0
*
*@apiParam {String} year The school year
*@apiParam {String} semester The specific semester
*@apiParam {String} course The course abbreviation
*@apiParam {String} courseId The specific course ID
*
*@apiSuccess {String} section   The sections in a course
*@apiSuccess {String} id        section ID
*@apiSuccessExample {Object[]} Success-Response:
*   HTTP/1.1 200 OK
*   [
*       {
*         "section": "AD1"
*         "id": "30107"
*       },
*       {
*         "section": "AD2",
*         "id": "41729"
*       },
*       {
*         "section": "AD3",
*         "id": "43832"
*       },
*       {
*         "section": "AD4",
*         "id": "48232"
*       }
*   ]
*
*@apiErrorExample Error-Response:
*   HTTP/1.1 500 Internal Server Error
*   {
*     "error": "InternalServerError"
*   }
*/
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
      sectionList.push({section: sectionName, id: sectionId});
    }
    res.status(200).json(sectionList);
  });
});

/**
*@api{get}/sectionDetails Get section details
*@apiName GetSectionDetails
*@apiGroup Class
*@apiVersion 0.1.0
*
*@apiParam {String} year The school year
*@apiParam {String} semester The specific semester
*@apiParam {String} course The course abbreviation
*@apiParam {String} courseId The specific course ID
*@apiParam {String} sectionId The specific section ID
*
*@apiSuccess {String} sectionId         The section ID
*@apiSuccess {String} sectionNumber     The section number
*@apiSuccess {String} enrollmentStatus  Enrollment Status
*@apiSuccess {String} type              Section Type
*@apiSuccess {String} startTime         Section Start Time
*@apiSuccess {String} endTime           Section End Time
*@apiSuccess {String} daysOfWeek        The days the classes occur
*@apiSuccessExample {Object[]} Success-Response:
*   HTTP/1.1 200 OK
*   {
*     "sectionId": "30107",
*     "sectionNumber": "AD1",
*     "enrollmentStatus": "Open",
*     "type": "DIS",
*     "startTime": "09:00 AM",
*     "endTime": "09:50 AM",
*     "daysOfWeek": "F      "
*   }
*
*@apiErrorExample Error-Response:
*   HTTP/1.1 500 Internal Server Error
*   {
*     "error": "InternalServerError"
*   }
*/
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
