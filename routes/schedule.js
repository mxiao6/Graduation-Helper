// functions related to schedule objects
const async = require('async');
var userLogin = require('./userlogin');
var pool = userLogin.pool;

/**
 *@api{post}/saveschedule save the user schedule to the database
 *@apiName saveschedule
 *@apiGroup Schedule
 *@apiVersion 0.2.0
 *
 *@apiParam {int} userId user ID that the schedule is to be associated with
 *@apiParam {String} semester The specific semester
 *@apiParam {String} year The school year
 *@apiParam {String[]} crns List of the course CRN values from schedule
 *@apiParam {String[]} subjects List of the course subject codes from schedule
 *@apiParam {String[]} courseNumbers List of the course numbers from schedule
 *
 */
exports.save = function(req, res) {
  let userId = req.body.userId;
  let semester = req.body.semester;
  let year = req.body.year;
  let sections = req.body.sections;
  console.log(req.body);

  if (userId == null || semester == null || year == null || sections == null) {
    return res.status(400).send('ERROR : missing parameters');
  }

  for (let i = 0; i < sections.length; i++) {
    if (sections[i].subjectId == null || sections[i].courseId == null || sections[i].sectionId == null) {
      return res.status(400).send('ERROR : missing parameters');
    }
  }

  pool.getConnection(function(err, connection) {
    if (err) {
      return res.status(400).send('Get pool connection error');
    }

    connection.beginTransaction(function(err) {
      if (err) {
        throw err;
      }
      connection.query('INSERT INTO schedules (semester,user_id) VALUES (?,?);', [
        semester + '' + year,
        userId
      ], function(err, results) {
        let schedule_id = results.insertId;

        async.each(sections, function(section, callback) {
          connection.query('INSERT INTO courses (schedule_id, subjectId,courseId,sectionId,type, startTime, endTime, daysOfWeek,semester,year) VALUES (?,?,?,?,?,?,?,?,?,?);', [
            schedule_id,
            section.subjectId,
            section.courseId,
            section.sectionId,
            section.type,
            section.startTime,
            section.endTime,
            section.daysOfWeek,
            semester,
            year
          ], function(err, results) {
            if (err) {
              callback(err);
            } else {
              callback(null);
            }
          });
        }, function(err) {
          if (err) {
            return connection.rollback(function() {
              return res.status(500).send('Save query Error');
            });
          } else {
            connection.commit(function(err) {
              if (err) {
                return connection.rollback(function() {
                  return res.status(500).send('Save commit Error');
                });
              } else {
                connection.release();
                return res.status(200).send('Save successfully');
              }
            });
          }
        });
      });
    });
  });
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
exports.get = function(req, res) {
  let userId = req.query.userId;
  let semester = req.query.semester;
  let year = req.query.year;
  if (userId == null) {
    res.status(400).send('ERROR : missing parameters');
  }

  pool.getConnection(function(err, connection) {
    if (err) {
      return res.status(400).send('Get pool connection error');
    }

    connection.query('SELECT courses.* FROM courses, schedules WHERE schedules.user_id = ? AND schedules.schedule_id = courses.schedule_id AND (? is null OR ? = courses.year) AND (? is null OR ? = courses.semester)', [
      userId,
      year,
      year,
      semester,
      semester
    ], function(err, results, fields){
      connection.release();
      if(err){
        return res.status(500).send('Get query error');
      }else{
        let schedules = {};
        for (let i = 0; i < results.length; i++){
          let {id, schedule_id, ...section} = results[i];
          if (schedules.hasOwnProperty(schedule_id)){
            schedules[schedule_id].push(section);
          }else{
            schedules[schedule_id] = [section];
          }
        }

        schedules = Object.values(schedules);
        return res.status(200).json(schedules);
      }
    });
  });
};
