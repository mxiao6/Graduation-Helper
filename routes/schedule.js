// will contain a .save() function to push data to database
// functions related to schedule objects
// var mysql = require('mysql');
var userLogin = require('./userlogin');
// var userId = userLogin.userId;
var pool = userLogin.pool;

/**
 *@api{post}/saveschedule save the user schedule to the database
 *@apiName saveschedule
 *@apiGroup Schedule
 *@apiVersion 0.1.0
 *
 *@apiParam {int} userId user ID that the schedule is to be associated with
 *@apiParam {String} semester The specific semester
 *@apiParam {String} year The school year
 *@apiParam {String[]} crns List of the course CRN values from schedule
 *@apiParam {String[]} subjects List of the course subject codes from schedule
 *@apiParam {String[]} courseNumbers List of the course numbers from schedule
 *
 */
exports.save = function (req, res) {
  let userId = req.query.userId;
  let semester = req.query.semester;
  let year = req.query.year;
  let crns = req.query.crns;
  let subjects = req.query.subjects;
  let courseNumbers = req.query.courseNumbers;

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(400).send('Get pool connection error');
    }
    if (userId == null) {
      res.status(400).send('invalid userId : userId is NULL');
    }
    connection.query('INSERT INTO Schedules (semester,user_id) VALUES (?,?);', [semester + '' + year, userId], function (err, res) {
      if (err) { throw err; }
    });
    connection.query('SELECT schedule_id FROM Schedules WHERE user_id = ? AND semester = ?;', [userId, semester + '' + year], function (err, res) {
      if (err) { throw err; }
      let scheduleId = res[0].schedule_id;

      if (crns.length !== subjects.length || crns.length !== courseNumbers.length || subjects.length !== courseNumbers.length) {
        res.status(400).send('input error : Course count is not uniform across inputs');
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

exports.get = function (req, res) {
  let userId = req.query.userId;
  let schedule = null;
  pool.getConnection(function (err, connection) {
    if (err) {
      res.send('Get pool connection error');
    }


  });
  res.status(200);
};
