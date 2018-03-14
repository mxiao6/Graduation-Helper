const express = require('express');
const router = express.Router();
const getAllDetails = require('./utilities.js').getAllDetails;
// data input in [[],[]]
router.get('/generate', function (req, res) {
  console.log('generate schedule!!');
  res.json([]);
});

// Preproccesses section List into section Letter
// And type code
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

function occursOnSameDays (currSection, newSection) {
  let daysOfTheWeek = newSection.daysOfWeek.trim();
  for (let i = 0; i < daysOfTheWeek.length; i++) {
    if (currSection.daysOfWeek.trim().indexOf(daysOfTheWeek.charAt(i)) > -1) {
      return true;
    }
  }
  return false;
}

function insertAndSortIfNotOverlapped (currSections, newSection) {
  if (currSections.length === 0) {
    currSections.push(newSection);
    return false;
  }

  for (let i = 0; i < currSections.length; i++) {
    if (occursOnSameDays(currSections[i], newSection)) {
      let startA = new Date('January 1, 2000 ' + currSections[i].startTime);
      let endA = new Date('January 1, 2000 ' + currSections[i].endTime);
      let startB = new Date('January 1, 2000 ' + newSection.startTime);
      let endB = new Date('January 1, 2000 ' + newSection.endTime);

      if (startA <= endB && endA >= startB) return true;

      // New section happens before current Section
      if (startB < startA) {
        currSections.splice(i, 0, newSection);
        return false;
      }
    }
  }

  currSections.push(newSection);
  return false;
}

// get permutations in {"LEC": [], "LBD":[]}
function cartesianProduct (data) {
  var current = [[]];
  for (var p in data) {
    var arr = data[p];
    var newCurrent = [];
    for (var c = 0; c < current.length; c++) {
      var baseArray = current[c];
      for (var a = 0; a < arr.length; a++) {
        var clone = baseArray.slice();
        // clone.push(arr[a]);
        // newCurrent.push(clone);
        var isOverlapped = insertAndSortIfNotOverlapped(clone, arr[a]);
        console.log(isOverlapped);
        if (!isOverlapped) {
          newCurrent.push(clone);
        } else {
          console.log('TRUE PRINT');
          console.log(clone);
          console.log(arr[a]);
        }
      }
    }
    current = newCurrent;
  }

  return current;
}

function flattenSectionLetters (sectionList) {
  let vals = Object.values(sectionList);
  let flatten = {};
  for (let i = 0; i < vals.length; i++) {
    flatten = Object.assign(flatten, vals[i]);
  }
  return flatten;
}

// Very very simple bandage for certain classes where theres only 1 section
// And you have to pick one of each like physc 211
function shouldFlatten (processedDict) {
  for (let sectionLetter in processedDict) {
    if (Object.keys(processedDict[sectionLetter]).length >= 2) {
      return false;
    }
  }
  return true;
}

// Get All section permutations for a given class course
function getCourseSectionPermutations (classSectionList) {
  let processedDict = preProcessSections(classSectionList);
  let allPermutations = [];

  console.log(shouldFlatten(processedDict));
  if (shouldFlatten(processedDict)) {
    let flattened = flattenSectionLetters(processedDict);
    console.log(flattened);
    allPermutations = cartesianProduct(flattened);
  } else {
    for (let sectionLetter in processedDict) {
      let product = cartesianProduct(processedDict[sectionLetter]);
      allPermutations = allPermutations.concat(product);
    }
  }
  return allPermutations;
}

// TODO
function isConflictingWithSchedule (sections, schedule) {
  return false;
}

let gen3 = (currSchedule, classes, index) => {
  if (index >= classes.length) {
    return [currSchedule];
  }
  let sectionList = classes[index].sectionList;
  let newSchedules = [];
  for (let i = 0; i < sectionList.length; i++) {
    let section = sectionList[i];

    if (!isConflictingWithSchedule(section, currSchedule)) {
      let nextSchedule = [...currSchedule, section];
      let generatedSchedule = gen3(nextSchedule, classes, index + 1);
      newSchedules = newSchedules.concat(generatedSchedule);
    }
  }
  return newSchedules;
};

// let genPrototype = (classes) => {
//   let schedules = gen3([], classes, 0);
//   return schedules;
// };

router.get('/generate/:year([0-9]{4})/:semester(summer|fall|spring|winter)', function (req, res) {
  /*
  initial function to get all data from list of classes.
  This function does not currently generate anything just gets all the section details for every class
  Assuming selected classes are given as ['AAS100','CS428','CS225', etc]
  */
  let url = 'schedule/' + req.params.year + '/' + req.params.semester + '/';
  // let selectedClasses = ['CS461', 'THEA101', 'CS125','PHYS211','CS173'];
  let selectedClasses = ['CS173', 'CS125', 'PHYS211'];
  getAllDetails(url, selectedClasses, function (result) {
    // res.json(result[3]);
    // let p = preProcessSections(result[4].sectionList)
    // res.json(p);
    // res.json(cartesianProduct(flattenSectionLetters(p)));
    let test = result[2].sectionList;
    let perm = getCourseSectionPermutations(test);
    // let perm = preProcessSections(test);
    res.json(perm);
  });
});

module.exports = router;
