// functions related to schedule objects
var userLogin = require('./userlogin');
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
  if (userId == null || semester == null || year == null || crns == null || subjects == null || courseNumbers == null) {
    res.status(400).send('ERROR : missing parameters');
  }
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(400).send('Get pool connection error');
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

/**
 *@api{get}/getschedule get a user schedule from the database
 *@apiName getschedule
 *@apiGroup Schedule
 *@apiVersion 0.1.0
 *
 *@apiParam {int} userId user ID that the schedule is associated with
 *@apiParam {String} semester The specific semester
 *@apiParam {String} year The school year
 *
 *@apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 *   "term": "FALL2018",
 *   "courses": [
 *       {
 *           "subject": "CS",
 *           "courseNumber": 125,
 *           "crn": 123456
 *       },
 *       {
 *           "subject": "ARCH",
 *           "courseNumber": 101,
 *           "crn": 789123
 *       }
 *   ]
 * }
 *@apiErrorExample Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *    "ERROR : missing parameters"
 * }
 *@apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *    "ERROR : no schedule exists for the user and semester combination"
 * }
 **/
exports.get = function (req, res) {
  let userId = req.query.userId;
  let semester = req.query.semester;
  let year = req.query.year;
  let schedule = null;
  if (userId == null || semester == null || year == null) {
    res.status(400).send('ERROR : missing parameters');
  }
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(400).send('Get pool connection error');
    }
    connection.query('SELECT schedule_id FROM Schedules WHERE user_id = ? AND semester = ?;', [userId, semester + '' + year], function (err, qres) {
      if (err) { throw err; }
      if (qres.length === 0) {
        res.status(500).send('ERROR : no schedule exists for the user and semester combination');
      }
      let scheduleId = qres[0].schedule_id;
      connection.query('SELECT * FROM Courses WHERE schedule_id = ?;', [scheduleId], function (err, qres) {
        if (err) { throw err; }
        schedule = {};
        schedule.term = semester + '' + year;
        schedule.courses = [];
        for (let i = 0; i < qres.length; i++) {
          let c = {};
          c.subject = qres[i].subject;
          c.courseNumber = qres[i].course_number;
          c.crn = qres[i].crn;
          schedule.courses.push(c);
        }
        res.status(200).send(schedule);
      });
    });
  });
};
