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

    let generatedSchedules = genPrototype(result);
    res.status(200).json(generatedSchedules);
  });
});

// Preproccesses section List by section letters and type code
// returns in the form of array of section Letters with each section type ['A': {lEC:[], DIS:[]}, 'B':{LEC:[], DIS:[]}]
function preProcessSections (sectionList) {
  let processedList = {};
  for (let i = 0; i < sectionList.length; i++) {
    let section = sectionList[i];
    let sectionLetter = section.sectionNumber.charAt(0);
    let sectionType = section.type;
    if (processedList.hasOwnProperty(sectionLetter)) {
      // Has section Letter
      if (processedList[sectionLetter].hasOwnProperty(sectionType)) {
        // Has type code
        processedList[sectionLetter][sectionType].push(section);
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

// Generates all permuations for a class section i.e 'A'
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
  let allPermutations = [];

  if (shouldFlatten(processedDict)) {
    let flattened = flattenSectionLetters(processedDict);
    allPermutations = cartesianProduct(flattened);
  } else {
    for (let sectionLetter in processedDict) {
      let product = cartesianProduct(processedDict[sectionLetter]);
      allPermutations = allPermutations.concat(product);
    }
  }
  return allPermutations;
}

// Gets section permutations for every class's course
// returns an array of arrays of section permutaion arrays
function getPermutationsForAllClasses (classes) {
  // console.log('Calculating permuations for every class');
  let permutationResult = [];
  for (let i = 0; i < classes.length; i++) {
    permutationResult.push(getCourseSectionPermutations(classes[i].sectionList));
  }
  // console.log('Finished finding all permutations');
  return permutationResult;
}

// function generateRecursive (currSchedule, listOfPermutationsForEveryClass, index) {
//   if (index >= listOfPermutationsForEveryClass.length) {
//     return [currSchedule];
//   }
//   let newSchedules = [];
//   let permuationsForClass = listOfPermutationsForEveryClass[index];
//   for (let i = 0; i < permuationsForClass.length; i++) {
//     let newSections = permuationsForClass[i];
//     let newSchedule = currSchedule.slice();
//     let isOverlapping = insertAndSortIfNotOverlapped(newSchedule, newSections);
//     if (!isOverlapping) {
//       let generatedSchedule = generateRecursive(newSchedule, listOfPermutationsForEveryClass, index + 1);
//       newSchedules = newSchedules.concat(generatedSchedule);
//     }
//   }
//   return newSchedules;
// };

// Iteratively generate Schedules
// Much faster than recursively but still space issues
function generateIterative (listOfPermutationsForEveryClass) {
  let newSchedules = [
    []
  ];
  for (let i = 0; i < listOfPermutationsForEveryClass.length; i++) {
    let classPermutations = listOfPermutationsForEveryClass[i];
    let newCurrent = [];
    for (let j = 0; j < newSchedules.length; j++) {
      let base = newSchedules[j];
      for (let k = 0; k < classPermutations.length; k++) {
        let clone = base.slice();
        let isOverlapped = insertAndSortIfNotOverlapped(clone, classPermutations[k]);
        if (!isOverlapped) {
          newCurrent.push(clone);
        }
      }
    }
    newSchedules = newCurrent;
  }
  return newSchedules;
}

// Generates all possible valid schedules given details for all classes
let genPrototype = (classes) => {
  let allPermutations = getPermutationsForAllClasses(classes);
  // let schedules = generateRecursive([], allPermutations, 0);
  let schedules = generateIterative(allPermutations);
  return schedules;
};

module.exports = router;
