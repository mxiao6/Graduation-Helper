// will contain a .save() function to push data to database
// functions related to schedule objects
// var mysql = require('mysql');
var userLogin = require('./userlogin');
var userId = userLogin.userId;
var pool = userLogin.pool;

<<<<<<< HEAD
//input: semester, year, list of crns, list of subject, list of courseNums
/**
 *@{post}/saveschedule save the user schedule to the database
 *@saveName saveschedule
 *@saveGroup Class
 *@saveVersion 0.1.0
 *
 *@saveParam {String} semester The specific semester
 *@saveParam {String} year The school year
 *@saveParam {String[]} crns List of the course CRN values from schedule
 *@saveParam {String[]} subjects List of the course subject codes from schedule
 *@saveParam {String[]} courseNumbers List of the course numbers from schedule
 *
 */
exports.save = function(req,res) {
    //console.log("CALLING SAVESCHEDULE()");
    //temp ==> DELETE ME
    //user_id = 1;
    //
    //console.log("CURRENTUSERID: " + user_id);
    let semester = req.query.semester;
    let year = req.query.year;
    let crns = req.query.crns;
    let subjects = req.query.subjects;
    let courseNumbers = req.query.courseNumbers;
=======
// input: semester, year, list of crns, list of subject, list of courseNums
exports.save = function (req, res) {
  console.log('CALLING SAVESCHEDULE()');
  // temp ==> DELETE ME
  // userId = 1;
  //
  // console.log("CURRENTUSERID: " + userId);
  let semester = req.query.semester;
  let year = req.query.year;
  let crns = req.query.crns;
  let subjects = req.query.subjects;
  let courseNumbers = req.query.courseNumbers;
>>>>>>> cf40fee3b39c1bc7d722ed989b56828029b07c43

  // console.log("subjects: " + subjects[0]);
  // console.log("subjects: " + subjects[1]);

  pool.getConnection(function (err, connection) {
    if (err) {
      res.send('Get pool connection error');
    }
    connection.query('INSERT INTO Schedules (semester,user_id) VALUES (?,?);', [semester + '' + year, userId], function (err, res) {
      if (err) { throw err; }
    });
    connection.query('SELECT schedule_id FROM Schedules WHERE user_id = ? AND semester = ?;', [userId, semester + '' + year], function (err, res) {
      if (err) { throw err; }
      let scheduleId = res[0].schedule_id;
      // console.log("SCHEDULEID: " + scheduleId);

      if (crns.length !== subjects.length || crns.length !== courseNumbers.length || subjects.length !== courseNumbers.length) {
        throw new {
          name: 'Inconsistent course lengths',
          message: 'Course count is not uniform across inputs'
        }();
      }

      // start adding the courses
      for (let i = 0; i < crns.length; i++) {
        connection.query('INSERT INTO Courses (subject,course_number,crn,schedule_id,semester,year) VALUES (?,?,?,?,?,?);', [subjects[i], courseNumbers[i], crns[i], scheduleId, semester, year], function (err, res) {
          if (err) { throw err; }
        });
      }
    });
  });
  res.status(200);
};
