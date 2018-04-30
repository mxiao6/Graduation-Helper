const express = require('express');
const router = express.Router();
const getAllDetails = require('./utilities.js').getAllDetails;

/**
*@api {post} /schedule/generate Get generated schedules for classes
*@apiName GenerateSchedules
*@apiGroup Schedule
*@apiVersion 0.3.0
*
*@apiParam {String} year The specific school year
*@apiParam {String} semester The specific semester year
*@apiParam {String[]} courses List of courses to generate schedules
*@apiParam {Object} [preferences] User preferences information
*@apiParam {String[]="M","T","W","R","F"} preferences.noClassDays List of days the user does not want classes
*@apiParam {String[]="morning","lunch","evening"} preferences.noClassOptions List of not prefered times of the day
*@apiParam {Object[]} preferences.noClassTime List of times the user does not want classes
*@apiParam {Number} preferences.noClassTime.start Start time
*@apiParam {Number} preferences.noClassTime.end End time
*@apiParam {Object} [range] Range of schedules to recieve
*@apiParam {Number} range.offset Starting offset
*@apiParam {Number} range.limit Maximum numbers of schedules from offset
*
*@apiParamExample {json} Request-Example:
*   {
*     "year": "2017",
*     "semester": "Spring",
*     "courses": ["PHYS211","CS125"],
*     "preferences": {
*       "noClassDays": ["M","W"],
*       "noClassOptions": ["morning","lunch","evening"],
*       "noClassTime": [{"start": 14, "end": 16}],
*     },
*     "range": {"offset": 0, "limit": 20}
*   }
*
*@apiSuccessExample {json} Success-Response:
*   HTTP/1.1 200 OK
*   {
*     "numOfSchedules": 21,
*     "metAllPreferences": false,
*     "schedules": [
*       {
*         "score": 80,
*         "sections": [
*           {
*             "subjectId": "CS",
*             "courseId": "461",
*             "sectionId": "48199",
*             "sectionNumber": "AL4",
*             "enrollmentStatus": "CrossListOpen",
*             "type": "Lecture",
*             "startTime": "12:30 PM",
*             "endTime": "01:45 PM",
*             "daysOfWeek": "MW"
*           },
*           {
*             "subjectId": "CS",
*             "courseId": "425",
*             "sectionId": "31384 56315",
*             "sectionNumber": "T3 T4",
*             "enrollmentStatus": "CrossListOpen",
*             "type": "Lecture",
*             "startTime": "09:30 AM",
*             "endTime": "10:45 AM",
*             "daysOfWeek": "TR"
*           },
*           {
*             "subjectId": "CS",
*             "courseId": "461",
*             "sectionId": "63508",
*             "sectionNumber": "AY2",
*             "enrollmentStatus": "CrossListOpen",
*             "type": "Discussion",
*             "startTime": "11:00 AM",
*             "endTime": "11:50 AM",
*             "daysOfWeek": "R"
*           },
*           {
*             "subjectId": "CHLH",
*             "courseId": "243",
*             "sectionId": "65894 57812",
*             "sectionNumber": "ON ONL",
*             "enrollmentStatus": "Closed",
*             "type": "Online",
*             "startTime": "ARRANGED"
*           }
*         ]
*       }
*     ]
*   }
*
*
*@apiErrorExample Error-Response:
*   HTTP/1.1 422 Internal Server Error
*   {
*     "error": "Incorrect Parameters"
*   }
*/
router.post('/generate', function (req, res) {
  if (!hasProperties(req)) {
    return res.status(422).json({error: 'Incorrect Parameters'});
  }

  let year = req.body.year;
  let semester = req.body.semester;
  let selectedClasses = req.body.courses;
  let preferences = req.body.preferences;
  let range = req.body.range;
  getAllDetails(year, semester, selectedClasses).then(function (result) {
    let generatedSchedules = generateSchedules(result, preferences);

    if (range != null) {
      if (range.offset < 0 || range.limit < 0 || range.offset >= generatedSchedules.numOfSchedules) {
        throw new Error('Invalid Range');
      }
      generatedSchedules.schedules = generatedSchedules.schedules.slice(range.offset, range.offset + range.limit);
    }

    return res.status(200).json(generatedSchedules);
  }).catch(function (err) {
    return res.status(500).json({error: err.message});
  });
});

// Checks that the api call has necessary parameters
function hasProperties (req) {
  if (!req.body.hasOwnProperty('year') || !req.body.hasOwnProperty('semester') || !req.body.hasOwnProperty('courses')) {
    return false;
  }
  return true;
}

// Checks that two sections are similar in cases where
// certain sections are the same thing but simply in different rooms
function isSectionsSimilar (sectionA, sectionB) {
  if (sectionA.daysOfWeek === sectionB.daysOfWeek) {
    if (sectionA.startTime === sectionB.startTime && sectionA.endTime === sectionB.endTime) {
      return true;
    }
  }
  return false;
}

// Preproccesses section List by section letters and type code
// returns in the form of array of section Letters with each section type {'A': {lEC:[], DIS:[]}, 'B':{LEC:[], DIS:[]}}
function preProcessSections (sectionList) {
  let processedList = {};
  for (let i = 0; i < sectionList.length; i++) {
    let section = sectionList[i];
    let sectionLetter = section.sectionNumber.charAt(0);
    let sectionType = section.type.split(/[^A-Za-z]/)[0];
    if (processedList.hasOwnProperty(sectionLetter)) {
      if (processedList[sectionLetter].hasOwnProperty(sectionType)) {
        let listOfSectionsWithLetterAndType = processedList[sectionLetter][sectionType];

        let prevSection = listOfSectionsWithLetterAndType[listOfSectionsWithLetterAndType.length - 1];
        if (isSectionsSimilar(prevSection, section)) {
          prevSection.sectionId = prevSection.sectionId + ' ' + section.sectionId;
          prevSection.sectionNumber = prevSection.sectionNumber + ' ' + section.sectionNumber;
        } else {
          listOfSectionsWithLetterAndType.push(section);
        }
      } else {
        processedList[sectionLetter][sectionType] = [section];
      }
    } else {
      processedList[sectionLetter] = {};
      processedList[sectionLetter][sectionType] = [section];
    }
  }
  return processedList;
}

// Checks if two sections occurs on the same day
// Returns true if occurs on same day, false otherwise
function occursOnSameDays (currSection, newSection) {
  if (currSection.startTime === 'ARRANGED' || newSection.startTime === 'ARRANGED') {
    return false;
  }

  let daysOfTheWeek = newSection.daysOfWeek;
  for (let i = 0; i < daysOfTheWeek.length; i++) {
    if (currSection.daysOfWeek.indexOf(daysOfTheWeek.charAt(i)) > -1) {
      return true;
    }
  }
  return false;
}

// Given current sections check if the new sections Overlaps
function checkIfSectionsOverlap (currSections, newSections) {
  if (currSections.length === 0) {
    return false;
  }

  for (let j = 0; j < newSections.length; j++) {
    let newSection = newSections[j];
    for (let i = 0; i < currSections.length; i++) {
      let currSection = currSections[i];
      if (occursOnSameDays(currSection, newSection)) {
        let startA = new Date('January 1, 2000 ' + currSection.startTime);
        let endA = new Date('January 1, 2000 ' + currSection.endTime);
        let startB = new Date('January 1, 2000 ' + newSection.startTime);
        let endB = new Date('January 1, 2000 ' + newSection.endTime);

        if (startA <= endB && endA >= startB) {
          return true;
        }
      }
    }
  }
  return false;
}

// Generates all permutations for a class section i.e 'A'
// get data in the form of {"LEC": [], "LBD":[]}
// returns non-overlapping array of all section combinations required for course
function cartesianProduct (data) {
  let current = [
    []
  ];
  for (let p in data) {
    let arr = data[p];
    let newCurrent = [];
    for (let c = 0; c < current.length; c++) {
      let baseArray = current[c];
      for (let a = 0; a < arr.length; a++) {
        let clone = baseArray.slice();
        let newSections = [arr[a]];
        let isOverlapped = checkIfSectionsOverlap(clone, newSections);
        if (!isOverlapped) {
          clone.push(...newSections);
          newCurrent.push(clone);
        }
      }
    }
    current = newCurrent;
  }
  return current;
}

// Flattens the section list
// returns a flatten list of sections
// {A: {LEC:[]}, B: {DIS:[]}} -> {A: [], B:[]}
function flattenSectionLetters (sectionList) {
  let flatten = {};
  for (let letter in sectionList) {
    flatten[letter] = Object.values(sectionList[letter])[0];
  }
  return flatten;
}

// For some classes, each section letter represents a type of section in combination with other section letters
// i.e. PHYS211 A is for lectures, D is for discussion
// i.e BTW250 every section is a lecture but they have different sectionNumbers
// It will check if processed list for a class needs to be flatten
function shouldFlatten (processedDict) {
  let shouldFlatten = false;
  let uniqueSectionTypes = new Set();
  for (let sectionLetter in processedDict) {
    if (sectionLetter === 'A') {
      shouldFlatten = true;
    }

    let sectionTypes = Object.keys(processedDict[sectionLetter]);
    if (sectionLetter === '0' || sectionLetter === 'O' || sectionTypes.length >= 2) {
      return false;
    }

    sectionTypes.forEach(function (type) {
      uniqueSectionTypes.add(type);
    });
  }

  if (uniqueSectionTypes.size <= 1) {
    shouldFlatten = false;
  }
  return shouldFlatten;
}

// Helper method to get All section permutations for a given class course
// returns an array of permutations for a course
function getCourseSectionPermutations (classSectionList) {
  let processedDict = preProcessSections(classSectionList);
  let coursePermutation = [];

  if (shouldFlatten(processedDict)) {
    let flattened = flattenSectionLetters(processedDict);
    coursePermutation = cartesianProduct(flattened);
  } else {
    for (let sectionLetter in processedDict) {
      let product = cartesianProduct(processedDict[sectionLetter]);
      coursePermutation = coursePermutation.concat(product);
    }
  }
  return coursePermutation;
}

// Gets section permutations for every class's course
// returns an array of arrays of section permutaion arrays
function getPermutationsForAllClasses (classes) {
  let allPermutations = [];
  for (let i = 0; i < classes.length; i++) {
    allPermutations.push(getCourseSectionPermutations(classes[i]));
  }
  return allPermutations;
}

// Calculates the score if the section conflicts with unwanted times
function getScoreNoClassTime (score, section, noClassTime) {
  let startA = new Date('January 1, 2000 ' + section.startTime);
  let endA = new Date('January 1, 2000 ' + section.endTime);
  for (let i = 0; i < noClassTime.length; i++) {
    let time = noClassTime[i];
    let startB = new Date(2000, 0, 1, time.start);
    let endB = new Date(2000, 0, 1, time.end);
    if (startA < endB && endA > startB) {
      score -= 10;
    }
  }
  return score;
}

// Calculates the score if the section happens on unwanted days
function getScoreNoClassDays (score, section, noClassDays) {
  for (let i = 0; i < noClassDays.length; i++) {
    let day = noClassDays[i];
    if (section.daysOfWeek.indexOf(day) > -1) {
      score -= 10;
    }
  }
  return score;
}

// Calculates the score for any section that conflict with preset times
function getScoreNoClassOptions (score, section, noClassOptions) {
  let timeOptions = {
    morning: {
      start: new Date(2000, 0, 1, 6),
      end: new Date(2000, 0, 1, 10)
    },
    lunch: {
      start: new Date(2000, 0, 1, 12),
      end: new Date(2000, 0, 1, 14)
    },
    evening: {
      start: new Date(2000, 0, 1, 18),
      end: new Date(2000, 0, 1, 24)
    }
  };

  let startA = new Date('January 1, 2000 ' + section.startTime);
  let endA = new Date('January 1, 2000 ' + section.endTime);
  for (let i = 0; i < noClassOptions.length; i++) {
    let startB = timeOptions[noClassOptions[i]].start;
    let endB = timeOptions[noClassOptions[i]].end;
    if (startA < endB && endA > startB) {
      score -= 10;
    }
  }
  return score;
}

// Calculates the weighted score for each the schedule
function calculateScheduleScore (scheduleSections, preferences) {
  let score = 100;
  for (let i = 0; i < scheduleSections.length; i++) {
    let section = scheduleSections[i];
    if (section.startTime !== 'ARRANGED') {
      if (preferences.noClassTime) {
        score = getScoreNoClassTime(score, section, preferences.noClassTime);
      }
      if (preferences.noClassDays) {
        score = getScoreNoClassDays(score, section, preferences.noClassDays);
      }
      if (preferences.noClassOptions) {
        score = getScoreNoClassOptions(score, section, preferences.noClassOptions);
      }
    }
  }
  return score;
}

// Iteratively generate Schedules
// Much faster than recursively but still space issues
function generateIterative (listOfPermutationsForEveryClass, preferences) {
  let schedules = [
    {
      score: 100,
      sections: []
    }
  ];
  let metAllPreferences = false;
  for (let i = 0; i < listOfPermutationsForEveryClass.length; i++) {
    let classPermutations = listOfPermutationsForEveryClass[i];
    let updatedSchedules = [];
    for (let j = 0; j < schedules.length; j++) {
      for (let k = 0; k < classPermutations.length; k++) {
        let base = {
          ...schedules[j]
        };
        base.sections = base.sections.slice();
        let isOverlapped = checkIfSectionsOverlap(base.sections, classPermutations[k]);
        if (!isOverlapped) {
          base.sections.push(...classPermutations[k]);
          if (preferences && i === listOfPermutationsForEveryClass.length - 1) {
            base.score = calculateScheduleScore(base.sections, preferences);
            if (base.score === 100) {
              metAllPreferences = true;
            }
          }
          updatedSchedules.push(base);
        }
      }
    }
    schedules = updatedSchedules;
    if (schedules.length === 0) {
      break;
    }
  }

  let generated = {
    numOfSchedules: schedules.length,
    metAllPreferences: metAllPreferences,
    schedules: schedules
  };
  return generated;
}

// Generates all possible valid schedules given details for all classes and optional preferences
function generateSchedules (classes, preferences) {
  let allPermutations = getPermutationsForAllClasses(classes);
  let generated = generateIterative(allPermutations, preferences);
  generated.schedules.sort(function (a, b) {
    if (a.score > b.score) {
      return -1;
    } else if (a.score < b.score) {
      return 1;
    }
    return 0;
  });
  return generated;
}

module.exports = router;
