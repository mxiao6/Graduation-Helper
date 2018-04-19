const Promise = require('bluebird');
const request = require('request-promise');
const parseStringAsync = Promise.promisifyAll(require('xml2js')).parseStringAsync;

// Helper function to make request to course xml data
function getParsedRequest (query) {
  return request(query).then(parseStringAsync);
}

function getSectionTimeInfo (jsonInfo) {
  let type = jsonInfo['ns2:section']['meetings'][0]['meeting'][0]['type'][0]['$']['code'];

  let startTime = jsonInfo['ns2:section']['meetings'][0]['meeting'][0]['start'];
  if (startTime != null) {
    startTime = startTime[0];
  }
  let endTime = jsonInfo['ns2:section']['meetings'][0]['meeting'][0]['end'];
  if (endTime != null) {
    endTime = endTime[0];
  }
  let daysOfWeek = jsonInfo['ns2:section']['meetings'][0]['meeting'][0]['daysOfTheWeek'];
  if (daysOfWeek != null) {
    daysOfWeek = daysOfWeek[0].trim();
  }

  return {type: type, startTime: startTime, endTime: endTime, daysOfWeek: daysOfWeek};
}

function getSectionParentInfo (jsonInfo) {
  let sectionId = jsonInfo['ns2:section']['$'].id;
  let subjectId = jsonInfo['ns2:section']['parents'][0]['subject'][0]['$'].id;
  let courseId = jsonInfo['ns2:section']['parents'][0]['course'][0]['$'].id;
  return {sectionId: sectionId, subjectId: subjectId, courseId: courseId};
}

function getSectionOtherInfo (jsonInfo) {
  let sectionTitle = jsonInfo['ns2:section']['sectionTitle'];
  if (sectionTitle != null) {
    sectionTitle = sectionTitle[0].trim();
  } else {
    sectionTitle = jsonInfo['ns2:section']['parents'][0]['course'][0]['_'];
  }

  let sectionNumber = jsonInfo['ns2:section']['sectionNumber'];
  if (sectionNumber != null) {
    sectionNumber = sectionNumber[0].trim();
  } else {
    sectionNumber = '0';
  }

  let enrollmentStatus = jsonInfo['ns2:section']['enrollmentStatus'];
  if (enrollmentStatus != null) {
    enrollmentStatus = enrollmentStatus[0];
  } else {
    enrollmentStatus = 'UNKNOWN';
  }

  return {sectionTitle: sectionTitle, sectionNumber: sectionNumber, enrollmentStatus: enrollmentStatus};
}

function parseSectionDetails (jsonInfo) {
  let {sectionTitle, sectionNumber, enrollmentStatus} = getSectionOtherInfo(jsonInfo);
  let {type, startTime, endTime, daysOfWeek} = getSectionTimeInfo(jsonInfo);
  let {sectionId, subjectId, courseId} = getSectionParentInfo(jsonInfo);

  let sectionDetails = {
    sectionTitle: sectionTitle,
    sectionId: sectionId,
    subjectId: subjectId,
    courseId: courseId,
    sectionNumber: sectionNumber,
    enrollmentStatus: enrollmentStatus,
    type: type,
    startTime: startTime,
    endTime: endTime,
    daysOfWeek: daysOfWeek
  };

  return sectionDetails;
}

// Given course url get all the urls for its sections
function getSectionListHelper ([courseUrl, specialTopic]) {
  return getParsedRequest(courseUrl).then(function (result) {
    let hrefs = [];
    let sectionsInSemester = result['ns2:course']['sections'][0]['section'];

    for (let i = 0; i < sectionsInSemester.length; i++) {
      let href = sectionsInSemester[i]['$'].href;
      hrefs.push(href);
    }
    return [hrefs, specialTopic];
  });
}

// Given a list of urls for courses get all the urls for its sections
function getSectionList (courseUrlItems) {
  return Promise.map(courseUrlItems, courseUrlItem => getSectionListHelper(courseUrlItem), {concurrency: 3}).then(function (result) {
    let coursesSectionUrlsItems = [];
    for (let i = 0; i < result.length; i++) {
      coursesSectionUrlsItems.push(result[i]);
    }
    return coursesSectionUrlsItems;
  });
}

// Given a section url list for a course, get all the section details
function getSectionDetailsHelper ([sectionUrls, specialTopic]) {
  return Promise.map(sectionUrls, sectionUrl => getParsedRequest(sectionUrl), {concurrency: 3}).then(function (result) {
    let sections = [];
    for (let i = 0; i < result.length; i++) {
      let section = parseSectionDetails(result[i]);
      // Checks if special topic class is defined
      if (specialTopic != null) {
        let acronym = section.sectionTitle.match(/\b(\w)/g).join('');
        if (specialTopic !== acronym) {
          continue;
        }
      }
      sections.push(section);
    }
    return sections;
  });
}

// Given an array of course section url lists, get all of the section details for each course
function getSectionDetails (coursesSectionUrlsItems) {
  return Promise.map(coursesSectionUrlsItems, sectionUrlsItem => getSectionDetailsHelper(sectionUrlsItem), {concurrency: 3}).then(function (result) {
    let sectionsForCourses = [];
    for (let i = 0; i < result.length; i++) {
      sectionsForCourses.push(result[i]);
    }
    return sectionsForCourses;
  });
}

// Given course list get all sections for those courses
// input ['CS425','CS429']
function getAllDetails (year, semester, selectedCourses) {
  let courseUrlItems = selectedCourses.map(function (course) {
    let courseTags = course.split('-');
    let specialTopic = courseTags[1];
    let params = courseTags[0].split(/(\d+)/);
    let courseUrl = 'https://courses.illinois.edu/cisapp/explorer/schedule/' + year + '/' + semester + '/' + params[0] + '/' + params[1] + '.xml';
    return [courseUrl, specialTopic];
  });

  return getSectionList(courseUrlItems).then(getSectionDetails);
}

module.exports = {
  getAllDetails: getAllDetails,
  parseSectionDetails: parseSectionDetails,
  getParsedRequest: getParsedRequest
};
