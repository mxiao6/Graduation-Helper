// will contain a .save() function to push data to database
// functions related to schedule objects
var mysql = require('mysql');
var userLogin = require('./userlogin');
var user_id = userLogin.user_id;
var pool = userLogin.pool;

// input: semester, year, list of crns, list of subject, list of courseNums
exports.save = function (req, res) {
  console.log('CALLING SAVESCHEDULE()');
  // temp ==> DELETE ME
  // user_id = 1;
  //
  // console.log("CURRENTUSERID: " + user_id);
  let semester = req.query.semester;
  let year = req.query.year;
  let crns = req.query.crns;
  let subjects = req.query.subjects;
  let courseNumbers = req.query.courseNumbers;

  // console.log("subjects: " + subjects[0]);
  // console.log("subjects: " + subjects[1]);

  pool.getConnection(function (err, connection) {
    if (err) {
      res.send('Get pool connection error');
    }
    connection.query('INSERT INTO Schedules (semester,user_id) VALUES (?,?);', [semester + '' + year, user_id], function (err, res) {
      if (err) { throw err; }
    });
    connection.query('SELECT schedule_id FROM Schedules WHERE user_id = ? AND semester = ?;', [user_id, semester + '' + year], function (err, res) {
      if (err) { throw err; }
      let scheduleId = res[0].schedule_id;
      // console.log("SCHEDULEID: " + scheduleId);

      if (crns.length !== subjects.length || crns.length !== courseNumbers.length || subjects.length !== courseNumbers.length) {
        throw {
          name: 'Inconsistent course lengths',
          message: 'Course count is not uniform across inputs'
        };
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
