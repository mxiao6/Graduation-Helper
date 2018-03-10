const express = require('express');
const router = express.Router();
const getAllDetails = require('./utilities.js').getAllDetails;
// data input in [[],[]]
router.get('/generate', function (req, res) {
  console.log('generate schedule!!');
  res.json([]);
});

router.get('/generate/:year([0-9]{4})/:semester(summer|fall|spring|winter)', function (req, res) {
  /*
  initial function to get all data from list of classes.
  This function does not currently generate anything just gets all the section details for every class
  Assuming selected classes are given as ['AAS100','CS428','CS225', etc]
  */
  let url = 'schedule/' + req.params.year + '/' + req.params.semester + '/';
  let selectedClasses = ['AAS100', 'AAS200', 'AAS201', 'CS428', 'CS225'];
  getAllDetails(url, selectedClasses, function (result) {
    res.json(result);
  });
});

module.exports = router;
