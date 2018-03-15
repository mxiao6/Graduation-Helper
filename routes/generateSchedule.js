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
  if (currSection.startTime === 'ARRANGED' || newSection.startTime === 'ARRANGED')
    return false;

  let daysOfTheWeek = newSection.daysOfWeek;
  for (let i = 0; i < daysOfTheWeek.length; i++) {
    if (currSection.daysOfWeek.indexOf(daysOfTheWeek.charAt(i)) > -1) {
      return true;
    }
  }
  return false;
}

function insertAndSortIfNotOverlapped (currSections, newSections) {
  if (currSections.length === 0) {
    currSections.push(...newSections);
    return false;
  }

  for (let j = 0; j < newSections.length; j++) {
    let newSection = newSections[j];
    let happensLatest = true;

    for (let i = 0; i < currSections.length; i++){
      if (occursOnSameDays(currSections[i], newSection)) {
        let startA = new Date('January 1, 2000 ' + currSections[i].startTime);
        let endA = new Date('January 1, 2000 ' + currSections[i].endTime);
        let startB = new Date('January 1, 2000 ' + newSection.startTime);
        let endB = new Date('January 1, 2000 ' + newSection.endTime);

        if (startA <= endB && endA >= startB){
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
    if (happensLatest){
      currSections.push(newSection);
    }
  }
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
        var isOverlapped = insertAndSortIfNotOverlapped(clone, [arr[a]]);
        // console.log("Overlaps: " + isOverlapped);
        if (!isOverlapped) {
          newCurrent.push(clone);
        } else {
          // console.log('TRUE PRINT');
          // console.log(clone);
          // console.log(arr[a]);
          // console.log(current);
        }
      }
    }
    current = newCurrent;
  }

  return current;
}

function flattenSectionLetters (sectionList) {
  let flatten = {};
  for (let letter in sectionList){
    flatten[letter] = Object.values(sectionList[letter])[0];
  }
  return flatten;
}

// Very very simple bandage for certain classes where theres only 1 section
// And you have to pick one of each like physc 211
function shouldFlatten (processedDict) {
  let sectionAExists = false;
  for (let sectionLetter in processedDict) {
    if(sectionLetter === 'A'){
      sectionAExists = true;
    }
    if (Object.keys(processedDict[sectionLetter]).length >= 2) {
      return false;
    }
  }
  return sectionAExists;
}

// Get All section permutations for a given class course
function getCourseSectionPermutations (classSectionList) {
  let processedDict = preProcessSections(classSectionList);
  let allPermutations = [];

  // console.log(shouldFlatten(processedDict));
  // console.log(processedDict);

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

// TODO
function isConflictingWithSchedule (sections, schedule) {
  return false;
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

function generateIterative(listOfPermutationsForEveryClass){
  console.log("Generating Schedules");
  let count = 0;
  let newSchedules = [[]];
  for (let i = 0; i < listOfPermutationsForEveryClass.length; i++){
    let classPermutations = listOfPermutationsForEveryClass[i];
    let newCurrent = [];
    for (let j = 0; j < newSchedules.length; j++){
      let base = newSchedules[j];
      for (let k = 0; k < classPermutations.length; k++){
        let clone = base.slice();
        let isOverlapped = insertAndSortIfNotOverlapped(clone, classPermutations[k]);
        if (!isOverlapped){
          newCurrent.push(clone);
        }
      }
    }
    newSchedules = newCurrent;
  }
  return newSchedules;
}

function getPermutationsForAllClasses(classes){
  console.log("Calculating permuations for every class");
  let permutationResult = [];
  for (let i = 0; i < classes.length; i++){
    permutationResult.push(getCourseSectionPermutations(classes[i].sectionList));
  }
  console.log("Finished finding all permutations");
  return permutationResult;
}

let genPrototype = (classes) => {
  let allPermutations = getPermutationsForAllClasses(classes);

  // let schedules = generateRecursive([], allPermutations, 0);
  let schedules = generateIterative(allPermutations);
  return schedules;
};

router.get('/generate/:year([0-9]{4})/:semester(summer|fall|spring|winter)', function (req, res) {
  /*
  initial function to get all data from list of classes.
  This function does not currently generate anything just gets all the section details for every class
  Assuming selected classes are given as ['AAS100','CS428','CS225', etc]
  */
  let url = 'schedule/' + req.params.year + '/' + req.params.semester + '/';
  let selectedClasses = ['CS173', 'CS125','CS225'];
  // let selectedClasses = ['CS173','CS125','CS225','CHEM236','CHEM237','CHEM312'];
  getAllDetails(url, selectedClasses, function (result) {
    let generatedSchedules = [];
    for (let i = 0; i < 1; i++){
      console.time("Generate Schedules");
      generatedSchedules = genPrototype(result);
      console.timeEnd("Generate Schedules");
    }
    console.log("NUMBER OF SCHEDULES: " + generatedSchedules.length);
    res.json(generatedSchedules);
    // res.json([]);
  });
});

module.exports = router;
