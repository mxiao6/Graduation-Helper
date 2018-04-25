// functions related to schedule objects
var userLogin = require('./userlogin');
var pool = userLogin.pool;

/**
*@api{post}/saveschedule Save user schedule
*@apiName saveschedule
*@apiGroup Schedule
*@apiVersion 0.3.0
*
*@apiParam {int} userId user ID that the schedule is to be associated with
*@apiParam {String} semester The specific semester
*@apiParam {String} year The school year
*@apiParam {Object[]} sections List of class sections to save
*
*@apiParamExample {json} Request-Example:
*   {
*     "year": "2017",
*     "semester": "Spring",
*     "sections": [
*       {
*         "subjectId": "CS",
*         "courseId": "425",
*         "sectionId": "31384",
*         "sectionTitle": "Distributed Systems",
*         "sectionNumber": "T3",
*         "type": "LCD",
*         "startTime": "09:30 AM",
*         "endTime": "10:45 AM",
*         "daysOfWeek": "TR"
*       },
*       {
*         "subjectId": "CS",
*         "courseId": "429",
*         "sectionId": "41483",
*         "sectionTitle": "Software Engineering II, ACP",
*         "sectionNumber": "Q3",
*         "type": "LCD",
*         "startTime": "02:00 PM",
*         "endTime": "03:15 PM",
*         "daysOfWeek": "TR"
*       }
*     ]
*   }
*
*@apiErrorExample Error-Response:
* HTTP/1.1 400 Bad Request
* {
*    "error": "Incorrect parameters"
* }
*
*/
exports.save = function (req, res) {
  let userId = req.body.userId;
  let semester = req.body.semester;
  let year = req.body.year;
  let sections = req.body.sections;

  if (userId == null || semester == null || year == null || sections == null) {
    return res.status(400).json({error: 'Incorrect parameters'});
  }

  for (let i = 0; i < sections.length; i++) {
    if (sections[i].subjectId == null || sections[i].courseId == null || sections[i].sectionId == null) {
      return res.status(400).json({error: 'Incorrect parameters'});
    }
  }

  pool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).json({error: 'Connection Error'});
    }

    connection.beginTransaction(function (err) {
      if (err) {
        throw err;
      }
      connection.query('INSERT INTO schedules (semester, year, user_id) VALUES (?,?,?);', [
        semester,
        year,
        userId
      ], function (err, results) {
        if (err) {
          return connection.rollback(function () {
            return res.status(500).json({error: 'Could not save schedules'});
          });
        }

        let scheduleId = results.insertId;

        let insertSections = sections.map(function (section) {
          let vals = [
            scheduleId,
            section.subjectId,
            section.courseId,
            section.sectionId.split(' ')[0],
            section.sectionNumber.split(' ')[0],
            section.sectionTitle,
            section.type,
            section.startTime,
            section.endTime,
            section.daysOfWeek,
            semester,
            year
          ];
          return vals;
        });

        let query = 'INSERT INTO courses (scheduleId, subjectId,courseId,sectionId, sectionNumber, sectionTitle, type, startTime, endTime, daysOfWeek,semester,year) VALUES ?;';
        connection.query(query, [insertSections], function (err) {
          if (err) {
            return connection.rollback(function () {
              return res.status(500).json({error: 'Could not save schedules'});
            });
          } else {
            connection.commit(function (err) {
              if (err) {
                return connection.rollback(function () {
                  return res.status(500).json({error: 'Save commit Error'});
                });
              } else {
                connection.release();
                return res.status(200).send('Saved successfully');
              }
            });
          }
        });
      });
    });
  });
};

/**
*@api{get}/getschedule Get saved user schedules
*@apiName getschedule
*@apiGroup Schedule
*@apiVersion 0.3.0
*
*@apiParam {int} userId user ID that the schedule is associated with
*@apiParam {String} [semester] The specific semester
*@apiParam {String} [year] The specific school year
*
*@apiParamExample {json} Request-Example:
*   {
*     "userId": 9,
*     "year": "2018",
*     "semester": "Spring",
*   }
*
*@apiSuccessExample {json} Success-Response
* HTTP/1.1 200 OK
*  {
*    "6": [
*      {
*          "subjectId": "CS",
*          "courseId": "425",
*          "sectionId": "31384",
*          "type": "LCD",
*          "startTime": "09:30 AM",
*          "endTime": "10:45 AM",
*          "daysOfWeek": "TR",
*          "semester": "Spring",
*          "year": 2018
*      },
*      {
*          "subjectId": "CS",
*          "courseId": "429",
*          "sectionId": "41483",
*          "type": "LCD",
*          "startTime": "02:00 PM",
*          "endTime": "03:15 PM",
*          "daysOfWeek": "TR",
*          "semester": "Spring",
*          "year": 2018
*      }
*    ],
*    "14": [
*      {
*          "subjectId": "CS",
*          "courseId": "425",
*          "sectionId": "31384",
*          "type": "LCD",
*          "startTime": "09:30 AM",
*          "endTime": "10:45 AM",
*          "daysOfWeek": "TR",
*          "semester": "Spring",
*          "year": 2018
*      }
*    ]
* }
*
*
*@apiErrorExample Error-Response:
* HTTP/1.1 400 Bad Request
* {
*    "error": "Incorrect parameters"
* }
*
*/
exports.get = function (req, res) {
  let userId = req.query.userId;
  let semester = req.query.semester;
  let year = req.query.year;
  if (userId == null) {
    return res.status(400).json({error: 'Incorrect parameters'});
  }

  pool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).json({error: 'Connection Error'});
    }

    connection.query('SELECT courses.* FROM courses, schedules WHERE schedules.user_id = ? AND schedules.scheduleId = courses.scheduleId AND (? is null OR ? = courses.year) AND (? is null OR ? = courses.semester)', [
      userId,
      year,
      year,
      semester,
      semester
    ], function (err, results, fields) {
      connection.release();
      if (err) {
        return res.status(500).send({error: 'Could not get saved schedules'});
      } else {
        let schedules = {};
        for (let i = 0; i < results.length; i++) {
          let {id, scheduleId, ...section} = results[i];
          if (schedules.hasOwnProperty(scheduleId)) {
            schedules[scheduleId].push(section);
          } else {
            schedules[scheduleId] = [section];
          }
        }
        return res.status(200).json(schedules);
      }
    });
  });
};

/**
*@api{post}/editschedule Edit saved user schedules
*@apiName editschedule
*@apiGroup Schedule
*@apiVersion 0.1.0
*
*@apiParam {int} scheduleId specific schedule ID to be edited
*@apiParam {Object[]} sections List of new class sections
*
*@apiParamExample {json} Request-Example:
*  {
*    "scheduleId": 5,
*    "sections": [
*       {
*         "subjectId": "CS",
*         "courseId": "425",
*         "sectionId": "31384",
*         "sectionTitle": "Distributed Systems",
*         "sectionNumber": "T3",
*         "type": "LCD",
*         "startTime": "09:30 AM",
*         "endTime": "10:45 AM",
*         "daysOfWeek": "TR",
*         "semester": "Spring",
*         "year": 2018
*       },
*       {
*         "subjectId": "CS",
*         "courseId": "429",
*         "sectionId": "41483",
*         "sectionTitle": "Software Engineering II, ACP",
*         "sectionNumber": "Q3",
*         "type": "LCD",
*         "startTime": "02:00 PM",
*         "endTime": "03:15 PM",
*         "daysOfWeek": "TR",
*         "semester": "Spring",
*         "year": 2018
*       }
*     ]
*  }
*
*@apiSuccessExample {json} Success-Response:
* HTTP/1.1 200 OK
*{
*  'Edit successful'
*}
*
*@apiErrorExample Error-Response:
* HTTP/1.1 400 Bad Request
* {
*    "error": "Incorrect parameters"
* }
*/
exports.edit = function (req, res) {
  let scheduleId = req.body.scheduleId;
  let sections = req.body.sections;

  if (scheduleId === null || sections === null) {
    return res.status(400).json({error: 'Incorrect parameters'});
  }
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].subjectId == null || sections[i].courseId == null || sections[i].sectionId == null) {
      return res.status(400).json({error: 'Incorrect parameters'});
    }
  }

  pool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).json({error: 'Connection Error'});
    }
    // find the current courses, remove, then add the new sections
    connection.beginTransaction(function (err) {
      if (err) {
        throw err;
      }
      // delete current courses
      connection.query('DELETE FROM courses WHERE scheduleId = ?', [scheduleId], function (err, results, fields) {
        if (err) {
          return connection.rollback(function () {
            return res.status(500).json({error: 'Could not delete existing courses'});
          });
        }
        // add the new sections
        let insertSections = sections.map(function (section) {
          let vals = [
            scheduleId,
            section.subjectId,
            section.courseId,
            section.sectionId,
            section.sectionNumber,
            section.sectionTitle,
            section.type,
            section.startTime,
            section.endTime,
            section.daysOfWeek,
            section.semester,
            section.year
          ];
          return vals;
        });

        let query = 'INSERT INTO courses (scheduleId, subjectId, courseId,sectionId, sectionNumber, sectionTitle, type, startTime, endTime, daysOfWeek,semester,year) VALUES ?;';
        connection.query(query, [insertSections], function (err) {
          if (err) {
            return connection.rollback(function () {
              return res.status(500).json({error: 'Could not edit schedules'});
            });
          } else {
            connection.commit(function (err) {
              if (err) {
                return connection.rollback(function () {
                  return res.status(500).json({error: 'Edit commit Error'});
                });
              } else {
                connection.release();
                return res.status(200).send('Edited successfully');
              }
            });
          }
        });
      });
    });
  });
};

/**
 * @api{post}/deleteschedule Delete user schedule
 * @apiName deleteschedule
 * @apiGroup Schedule
 * @apiVersion 0.1.0
 *
 * @apiParam {int} scheduleId Schedule ID to be deleted
 *
 * @apiParamExample {json} Request-Example:
 * {
 *    "scheduleId": 5
 * }
 *
 * @apiSuccessExample SuccessResponse:
 * "Delete Successful"
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *    "error": "Incorrect parameters"
 * }
 */
exports.delete = function (req, res) {
  let scheduleId = req.body.scheduleId;

  if (scheduleId === null) {
    return res.status(400).json({error: 'Incorrect parameters'});
  }
  pool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).json({error: 'Connection Error'});
    }
    connection.beginTransaction(function (err) {
      if (err) {
        throw err;
      }
      // delete the courses
      connection.query('DELETE FROM courses WHERE scheduleId = ?', [scheduleId], function (err, results, fields) {
        if (err) {
          return connection.rollback(function () {
            return res.status(500).json({error: 'Could not delete courses'});
          });
        }
        // delete the schedule
        connection.query('DELETE FROM schedules WHERE scheduleId = ?', [scheduleId], function (err, results, fields) {
          if (err) {
            return connection.rollback(function () {
              return res.status(500).json({error: 'Could not delete schedule'});
            });
          }
          connection.commit(function (err) {
            if (err) {
              return connection.rollback(function () {
                return res.status(500).json({error: 'Delete commit error'});
              });
            } else {
              connection.release();
              return res.status(200).send('Delete Successful');
            }
          });
        });
      });
    });
  });
};
