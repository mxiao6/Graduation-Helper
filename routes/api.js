const express = require('express');
const router = express.Router();
const Promise = require('bluebird');
const parseSectionDetails = require('./utilities.js').parseSectionDetails;
const getParsedRequest = require('./utilities.js').getParsedRequest;

/**
*@api{get}/years Get all years
*@apiName GetYears
*@apiGroup Class
*@apiVersion 0.2.0
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
*   HTTP/1.1 404 Internal Server Error
*   {
*     "error": "Could not get years"
*   }
*/
router.get('/years', function (req, res) {
  let url = 'https://courses.illinois.edu/cisapp/explorer/schedule.xml';
  getParsedRequest(url).then(function (result) {
    let calendarYears = result['ns2:schedule']['calendarYears'][0]['calendarYear'];
    if (calendarYears == null) {
      res.status(404).json({'error': 'Could not get years'});
    } else {
      let years = [];
      for (let i = 0; i < calendarYears.length; i++) {
        years.push(calendarYears[i]['_']);
      }
      res.status(200).json(years);
    }
  }).catch(function (err) {
    return res.status(500).json({'error': err});
  });
});

/**
*@api{get}/semester Get semesters for year
*@apiName GetSemester
*@apiGroup Class
*@apiVersion 0.2.0
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
*   HTTP/1.1 404 Internal Server Error
*   {
*     "error": "No semesters found for year"
*   }
*/
router.get('/semester', function (req, res) {
  let year = req.query.year;
  let url = 'https://courses.illinois.edu/cisapp/explorer/schedule/' + year + '.xml';

  getParsedRequest(url).then(function (result) {
    let calendarSemester = result['ns2:calendarYear']['terms'][0]['term'];
    if (calendarSemester == null) {
      res.status(404).json({'error': 'No semesters found for year'});
    } else {
      let semester = [];
      for (let i = 0; i < calendarSemester.length; i++) {
        semester.push(calendarSemester[i]['_'].split(' ')[0]);
      }
      res.status(200).json(semester);
    }
  }).catch(function (err) {
    return res.status(500).json({'error': err});
  });
});

/**
*@api{get}/subject Get all subjects
*@apiName GetSubjects
*@apiGroup Class
*@apiVersion 0.2.0
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
*   HTTP/1.1 404 Internal Server Error
*   {
*     "error": "No subjects found"
*   }
*/
router.get('/subject', function (req, res) {
  let year = req.query.year;
  let semester = req.query.semester;
  let url = 'https://courses.illinois.edu/cisapp/explorer/schedule/' + year + '/' + semester + '.xml';
  getParsedRequest(url).then(function (result) {
    let major = result['ns2:term']['subjects'][0]['subject'];
    if (major == null) {
      res.status(404).json({'error': 'No subjects found'});
    } else {
      let majorList = [];
      for (let i = 0; i < major.length; i++) {
        let subject = major[i]['_'];
        let id = major[i]['$']['id'];
        majorList.push({subject: subject, id: id});
      }
      res.status(200).json(majorList);
    }
  }).catch(function (err) {
    return res.status(500).json({'error': err});
  });
});

/**
*@api{get}/course Get courses in a subject
*@apiName GetCourses
*@apiGroup Class
*@apiVersion 0.2.0
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
*   HTTP/1.1 404 Internal Server Error
*   {
*     "error": "No courses found"
*   }
*/
router.get('/course', function (req, res) {
  let year = req.query.year;
  let semester = req.query.semester;
  let course = req.query.course;
  let url = 'https://courses.illinois.edu/cisapp/explorer/schedule/' + year + '/' + semester + '/' + course + '.xml';
  getParsedRequest(url).then(async function (result) {
    let courses = result['ns2:subject']['courses'][0]['course'];
    if (courses == null) {
      res.status(404).json({'error': 'No courses found'});
    } else {
      let courseList = [];
      for (let i = 0; i < courses.length; i++) {
        let courseName = courses[i]['_'];
        let id = courses[i]['$']['id'];

        // Check if the courses are special topics and split them up
        if (courseName === 'Special Topics') {
          let specialTopicsUrl = 'https://courses.illinois.edu/cisapp/explorer/schedule/' + year + '/' + semester + '/' + course + '/' + id + '.xml';
          let topics = await getSpecialTopics(specialTopicsUrl);
          if(topics && topics.size != 0){
            topics.forEach(function(topic){
              courseList.push({course: topic, id: id});
            });
            continue;
          }
        }

        courseList.push({course: courseName, id: id});
      }
      return res.status(200).json(courseList);
    }
  }).catch(function (err) {
    return res.status(500).json({'error': err.message});
  });
});

function getSpecialTopics(specialTopicsUrl){
  return getParsedRequest(specialTopicsUrl).then(function(result){
    let section = result['ns2:course']['sections'][0]['section'];
    if (section == null) {
      return [];
    } else {
      let sectionListUrls = [];
      for (let i = 0; i < section.length; i++) {
        let sectionUrl = section[i]['$'].href;
        sectionListUrls.push(sectionUrl);
      }
      return sectionListUrls;
    }
  }).then(function(urls){
    return Promise.map(urls, url => getParsedRequest(url), {concurrency: 3}).then(function(result){
      let topicsSet = new Set([]);
      for (let i = 0; i < result.length; i++){
        let sectionTitle = result[i]['ns2:section']['sectionTitle'];
        if (sectionTitle == null){
          return topicsSet;
        }
        // console.log(sectionTitle[0]);
        topicsSet.add(sectionTitle[0]);
      }
      return topicsSet;
    }).catch(function(err){
      throw err;
    });
  });
}

/**
*@api{get}/section Get sections in a specific course
*@apiName GetSections
*@apiGroup Class
*@apiVersion 0.2.0
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
*   HTTP/1.1 404 Internal Server Error
*   {
*     "error": "No sections found"
*   }
*/
router.get('/section', function (req, res) {
  let year = req.query.year;
  let semester = req.query.semester;
  let course = req.query.course;
  let courseId = req.query.courseId;
  let url = 'https://courses.illinois.edu/cisapp/explorer/schedule/' + year + '/' + semester + '/' + course + '/' + courseId + '.xml';
  getParsedRequest(url).then(function (result) {
    let section = result['ns2:course']['sections'][0]['section'];
    if (section == null) {
      res.status(404).json({'error': 'No sections found'});
    } else {
      let sectionList = [];
      for (let i = 0; i < section.length; i++) {
        let sectionName = section[i]['_'];
        let sectionId = section[i]['$']['id'];
        sectionList.push({section: sectionName, id: sectionId});
      }
      res.status(200).json(sectionList);
    }
  }).catch(function (err) {
    return res.status(500).json({'error': err});
  });
});

/**
*@api{get}/sectionDetails Get section details
*@apiName GetSectionDetails
*@apiGroup Class
*@apiVersion 0.2.0
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
*     "subjectId": "AAS",
*     "courseId": "100",
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
*     "error": "Could not make request to the course website"
*   }
*/
router.get('/sectionDetails', function (req, res) {
  let year = req.query.year;
  let semester = req.query.semester;
  let course = req.query.course;
  let courseId = req.query.courseId;
  let sectionId = req.query.sectionId;
  let url = 'https://courses.illinois.edu/cisapp/explorer/schedule/' + year + '/' + semester + '/' + course + '/' + courseId + '/' + sectionId + '.xml';

  getParsedRequest(url).then(function (result) {
    let sectionDetails = parseSectionDetails(result);
    res.status(200).json(sectionDetails);
  }).catch(function (err) {
    return res.status(500).json({'error': err});
  });
});

module.exports = router;
