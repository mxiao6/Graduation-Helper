const request = require('request');
const parseString = require('xml2js').parseString;
const async = require('async');

// Helper function to make request to course xml data
let getElements = (query, myCallback) => {
  request('https://courses.illinois.edu/cisapp/explorer/' + query + '.xml', function (error, response, body) {
    if (!error && response.statusCode === 200) {
      parseString(body, function (err, result) {
        if (err) {
          myCallback(500, {'error': 'Could not parse xml data ' + err});
        } else {
          myCallback(null, result);
        }
      });
    } else if (response.statusCode !== 200) {
      myCallback(response.statusCode, {'error': 'Could not retrieve data from course website. ' + response.body});
      console.log(response);
    } else {
      myCallback(500, {'error': 'Could not make request to the course website'});
    }
  }).end();
};

// Given course "CS428" gets the list of sections
let getListOfsectionsFromCourseNum = (context, course, doneCallBack) => {
  let params = course.split(/(\d+)/);
  let url = context.partialURL + params[0] + '/' + params[1];
  getElements(url, function (error, result) {
    if (error) {
      console.log(error);
      return doneCallBack(null, {});
    }

    let section = result['ns2:course']['sections'][0]['section'];
    let sectionList = [];
    for (let i = 0; i < section.length; i++) {
      let sectionId = section[i]['$']['id'];
      sectionList.push(sectionId);
    }

    let listOfSections = {
      subjectId: params[0],
      courseId: params[1],
      sectionList: sectionList
    };
    return doneCallBack(null, listOfSections);
  });
};

// Given section id, get details for that specific section
// async function for mapping
// TODO: Extract function to remove duplicate code later
let getSectionDetails = (context, sectionId, doneCallBack) => {
  let url = context.partialURL + sectionId;
  getElements(url, function (error, result) {
    if (error) {
      console.log(error);
      return doneCallBack(null, {});
    }

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
      daysOfWeek = daysOfWeek[0].trim();
    }

    let sectionDetails = {
      subjectId: context.subjectId,
      courseId: context.courseId,
      sectionId: sectionId,
      sectionNumber: sectionNumber,
      enrollmentStatus: enrollmentStatus,
      type: type,
      startTime: startTime,
      endTime: endTime,
      daysOfWeek: daysOfWeek
    };
    return doneCallBack(null, sectionDetails);
  });
};

// Iterates through list of sections for class and gets its specific details
let getAllClassesSectionDetails = (context, listOfSectionsForClass, doneCallBack) => {
  let sectionList = listOfSectionsForClass.sectionList;
  // console.log("Getting details now ");
  // console.log(listOfSectionsForClass);
  let partialURL = context.partialURL + listOfSectionsForClass.subjectId + '/' + listOfSectionsForClass.courseId + '/';
  async.map(sectionList, getSectionDetails.bind(null, {partialURL: partialURL, subjectId: listOfSectionsForClass.subjectId, courseId: listOfSectionsForClass.courseId}), function (err, results) {
    if (err) {
      console.log('ERROR: ' + err);
    }
    listOfSectionsForClass.sectionList = results;
    return doneCallBack(null, listOfSectionsForClass);
  });
};

// Gets all data from list of classes.
// For now assuming input of form ['CS428','CS421','CS412','CS225']
let getAllDetails = (partialURL, selectedClasses, callback) => {
  console.log('Getting all selected classes information');
  async.map(selectedClasses, getListOfsectionsFromCourseNum.bind(null, {partialURL: partialURL}), function (err, allClassesSectionList) {
    if (err) {
      console.log('ERROR: ' + err);
    }
    async.map(allClassesSectionList, getAllClassesSectionDetails.bind(null, {partialURL: partialURL}), function (err, results) {
      if (err) {
        console.log('ERROR: ' + err);
      }
      callback(results);
    });
  });
};

module.exports = {
  getElements: getElements,
  getAllDetails: getAllDetails
};
