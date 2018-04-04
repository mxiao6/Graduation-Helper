const express = require('express');
const router = express.Router();
const getAllDetails = require('./utilities.js').getAllDetails;

/**
*@api{get}/schedule/generate Get generated schedules for classes
*@apiName GenerateSchedules
*@apiGroup Schedule
*@apiVersion 0.1.0
*
*@apiParam {String} year The specific school year
*@apiParam {String} semester The specific semester year
*@apiParam {String[]} courses List of courses to generate schedules
*
*@apiParamExample {json} Request-Example:
*   {
*     "year": "2018",
*     "semester": "Spring",
*     "courses": ["CS125", "CS173"]
*   }
*
*@apiSuccessExample {json} Success-Response:
*   HTTP/1.1 200 OK
*   [
*     [
*       {
*         "subjectId": "CS",
*         "courseId": "173",
*         "sectionId": "39311",
*         "sectionNumber": "AL1",
*         "enrollmentStatus": "Open (Restricted)",
*         "type": "LEC",
*         "startTime": "09:30 AM",
*         "endTime": "10:45 AM",
*         "daysOfWeek": "TR"
*       }, {
*         "subjectId": "CS",
*         "courseId": "173",
*         "sectionId": "31187",
*         "sectionNumber": "ADA",
*         "enrollmentStatus": "Closed",
*         "type": "DIS",
*         "startTime": "01:00 PM",
*         "endTime": "01:50 PM",
*         "daysOfWeek": "R"
*       }, {
*         "subjectId": "CS",
*         "courseId": "125",
*         "sectionId": "31152",
*         "sectionNumber": "AL1",
*         "enrollmentStatus": "Open (Restricted)",
*         "type": "LEC",
*         "startTime": "08:00 AM",
*         "endTime": "08:50 AM",
*         "daysOfWeek": "MWF"
*       }, {
*         "subjectId": "CS",
*         "courseId": "125",
*         "sectionId": "31159",
*         "sectionNumber": "AYB",
*         "enrollmentStatus": "Open",
*         "type": "LBD",
*         "startTime": "11:00 AM",
*         "endTime": "12:50 PM",
*         "daysOfWeek": "T"
*       }
*     ]
*   ]
*
*@apiErrorExample Error-Response:
*   HTTP/1.1 500 Internal Server Error
*   {
*     "error": "Could not generate schedules"
*   }
*/
router.get('/generate', function (req, res) {
  let url = 'schedule/' + req.query.year + '/' + req.query.semester + '/';
  let selectedClasses = req.query.courses;
  getAllDetails(url, selectedClasses, function (error, result) {
    if (error) {
      return res.status(500).json({error: 'Could not generate schedules'});
    }

    console.log('Generating Schedules no preferences');
    console.time('generate');
    let generatedSchedules = genPrototype(result);
    console.timeEnd('generate');
    console.log(generatedSchedules.length);
    console.log('Generated Schedules. Sending Data back');
    res.status(200).json(generatedSchedules);
  });
});

/* *@apiParamExample {json} Request-Example:
*   {
*     "year": "2017",
*     "semester": "Spring",
*     "courses": ["PHYS211","CS125"],
*     "preferences": {
*     "noClassDays": ["M","W"],
*       "noClassTime": [{"start": 14, "end": 16}],
*       "noClassOptions": ["morning"]
*     }
*   } */
router.post('/generate', function (req, res) {
  let url = 'schedule/' + req.body.year + '/' + req.body.semester + '/';
  let selectedClasses = req.body.courses;
  let preferences = req.body.preferences;
  console.log();
  console.log('Getting section details');
  getAllDetails(url, selectedClasses, function (error, result) {
    if (error) {
      return res.status(500).json({error: 'Could not generate schedules'});
    }
    console.log('Generating Schedules');
    console.time('generate');
    let generatedSchedules = genPrototype(result, preferences);
    console.timeEnd('generate');
    console.log('Number of schedules: ', generatedSchedules.numOfSchedules);

    let seen = new Set();
    let hasDuplicates = generatedSchedules.schedules.some(function (curr) {
      return seen.size === seen.add(curr.sections).size;
    });
    console.log('Has Duplicates: ', hasDuplicates);

    console.log('Generated Schedules. Sending Data back');
    if (generatedSchedules.numOfSchedules > 100){
      generatedSchedules.schedules = generatedSchedules.schedules.slice(0, 100);
      res.status(200).json(generatedSchedules)
    }else{
      res.status(200).json(generatedSchedules);
    }
  });
});

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
    let sectionType = section.type;
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
// If the new section overlaps then it inserts it into current sections in order and returns false
// If the new section overlaps then it returns false and new sections is not added to current
function insertAndSortIfNotOverlapped (currSections, newSections) {
  if (currSections.length === 0) {
    currSections.push(...newSections);
    return false;
  }

  for (let j = 0; j < newSections.length; j++) {
    let newSection = newSections[j];
    let happensLatest = true;

    for (let i = 0; i < currSections.length; i++) {
      if (occursOnSameDays(currSections[i], newSection)) {
        let startA = new Date('January 1, 2000 ' + currSections[i].startTime);
        let endA = new Date('January 1, 2000 ' + currSections[i].endTime);
        let startB = new Date('January 1, 2000 ' + newSection.startTime);
        let endB = new Date('January 1, 2000 ' + newSection.endTime);

        if (startA <= endB && endA >= startB) {
          return true;
        }
        // New section happens before current Section
        if (startB < startA) {
          currSections.splice(i, 0, newSection);
          happensLatest = false;
          break;
        }
      }
    }
    if (happensLatest) {
      currSections.push(newSection);
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
        let isOverlapped = insertAndSortIfNotOverlapped(clone, [arr[a]]);
        if (!isOverlapped) {
          newCurrent.push(clone);
        }
      }
    }
    current = newCurrent;
  }
  return current;
}

// For some classes each section letter represents a type of class
function flattenSectionLetters (sectionList) {
  let flatten = {};
  for (let letter in sectionList) {
    flatten[letter] = Object.values(sectionList[letter])[0];
  }
  return flatten;
}

// For some classes, each section letter represents a type of section in combination with other section letters
// i.e. PHYS211 A is for lectures, D is for discussion
// It will check if processed list for a class needs to be flatten
// returns a flatten list of sections
// {A: {LEC:[]}, B: {DIS:[]}} -> {A: [], B:[]}
function shouldFlatten (processedDict) {
  let sectionAExists = false;
  for (let sectionLetter in processedDict) {
    if (sectionLetter === 'A') {
      sectionAExists = true;
    }

    if (sectionLetter === '0' || sectionLetter === 'O') {
      return false;
    }

    if (Object.keys(processedDict[sectionLetter]).length >= 2) {
      return false;
    }
  }
  return sectionAExists;
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
  console.log(coursePermutation.length);
  return coursePermutation;
}

// Gets section permutations for every class's course
// returns an array of arrays of section permutaion arrays
function getPermutationsForAllClasses (classes) {
  // console.log('Calculating permuations for every class');
  let allPermutations = [];
  for (let i = 0; i < classes.length; i++) {
    allPermutations.push(getCourseSectionPermutations(classes[i].sectionList));
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
      score = getScoreNoClassTime(score, section, preferences.noClassTime);
      score = getScoreNoClassDays(score, section, preferences.noClassDays);
      score = getScoreNoClassOptions(score, section, preferences.noClassOptions);
    }
  }
  return score;
}

// Iteratively generate Schedules
// Much faster than recursively but still space issues
function generateIterative (listOfPermutationsForEveryClass, preferences) {
  let newSchedules = [
    {
      score: 100,
      sections: []
    }
  ];
  let metAllPreferences = false;
  for (let i = 0; i < listOfPermutationsForEveryClass.length; i++) {
    let classPermutations = listOfPermutationsForEveryClass[i];
    let newCurrent = [];
    for (let j = 0; j < newSchedules.length; j++) {
      for (let k = 0; k < classPermutations.length; k++) {
        let base = {
          ...newSchedules[j]
        };
        base.sections = base.sections.slice();
        let isOverlapped = insertAndSortIfNotOverlapped(base.sections, classPermutations[k]);
        if (!isOverlapped) {
          if (preferences && i === listOfPermutationsForEveryClass.length - 1) {
            base.score = calculateScheduleScore(base.sections, preferences);
            if (base.score === 100){
              metAllPreferences = true;
            }
          }
          newCurrent.push(base);
        }
      }
    }
    newSchedules = newCurrent;
  }

  let generated = {
    numOfSchedules: newSchedules.length,
    metAllPreferences: metAllPreferences,
    schedules: newSchedules
  }
  return generated;
}

// function isIndicesFull (indices, listOfPermutationsForEveryClass) {
//   for (let i = indices.length - 1; i >= 0; i--) {
//     if (indices[i] !== listOfPermutationsForEveryClass[i].length - 1) {
//       indices[i] = indices[i] + 1;
//       indices.fill(0, i + 1);
//       return false;
//     }
//   }
//   return true;
// }

// Testing a new less space intensive iterative genenrating method. Slower
// function generateIterativeSpace (listOfPermutationsForEveryClass) {
//   let indices = new Array(listOfPermutationsForEveryClass.length).fill(0);
//   let current = [];
//   let isDone = false;
//   while (!isDone) {
//     let temp = [];
//     let isOverlapped = false;
//     for (let i = 0; i < indices.length; i++) {
//       isOverlapped = insertAndSortIfNotOverlapped(temp, listOfPermutationsForEveryClass[i][indices[i]]);
//       if (isOverlapped) {
//         break;
//       }
//     }
//     if (!isOverlapped) {
//       current.push(temp);
//     }
//     isDone = isIndicesFull(indices, listOfPermutationsForEveryClass);
//   }
//   return current;
// }

// Generates all possible valid schedules given details for all classes and optional preferences
function genPrototype (classes, preferences) {
  let allPermutations = getPermutationsForAllClasses(classes);
  let generated = generateIterative(allPermutations, preferences);
  console.time('Sorting');
  generated.schedules.sort(function (a, b) {
    if (a.score > b.score) {
      return -1;
    } else if (a.score < b.score) {
      return 1;
    }
    return 0;
  });
  console.timeEnd('Sorting');
  return generated;
}

module.exports = router;
