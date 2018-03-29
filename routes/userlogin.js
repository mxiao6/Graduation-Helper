var mysql = require('mysql');
var nodemailer = require('nodemailer');
var randomstring = require('randomstring');
var moment = require('moment');
var pool;

if (process.argv.length > 2 && process.argv[2] === 'test') {
  pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'testDatabase'

  });
} else {
  pool = mysql.createPool({
    // information for connecting to Azure database
    host: 'graduationhelper.mysql.database.azure.com',
    user: 'myadmin@graduationhelper',
    password: 'Cs428grh!',
    database: 'graduation_helper'
  });
}

exports.register = function (req, res) {
  var users = {
    'username': req.body.username,
    'email': req.body.email,
    'password': req.body.password
  };
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).send('Database pool connection error');
    }

    connection.query('SELECT * FROM users WHERE email = ?', [req.body.email], function (error, results, fields) {
      // Done with connection
      connection.release();

      // check for duplicate register
      if (error) {
        res.status(500).send('Database query error ocurred');
      } else {
        if (results.length > 0) {
          res.status(422).send('Email already registered!');
        } else {
          connection.query('INSERT INTO users SET ?', users, function (error, results, fields) {
            if (error) {
              // console.log("error ocurred",error);
              res.status(500).send('Database query error ocurred');
            } else {
              // console.log('The solution is: ', results);
              res.status(250).send('user registered sucessfully');
            }
          });
        }
      }
    });
  });
};

exports.login = function (req, res) {
  var email = req.body.email;
  var password = req.body.password;

  // Use the connection
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).send('Database pool connection error');
    }

    connection.query('SELECT * FROM users WHERE email = ?', [email], function (error, results, fields) {
      // Done with the connection
      connection.release();

      if (error) {
        res.status(500).send('Database query error ocurred');
      } else {
        if (results.length > 0) {
          if (results[0].password === password) {
            let userInfo = {
              userId: results[0].user_id,
              username: results[0].username,
              email: results[0].email,
              message: 'login successful'
            };
            res.status(250).send(userInfo);
          } else {
            res.status(422).send('Email and password does not match');
          }
        } else {
          res.status(422).send('Email does not exist');
        }
      }
    });
  });
};
/* for password reset:
-request: user email
-respond: Authentication code used to reset password
*/

exports.sendemail = function (req, res) {
// first check if email exist and send authentication code to that email and to response
  var email = req.body.email;
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).send('Database pool connection error');
    }
    connection.query('SELECT * FROM users WHERE email = ?', [email], function (error, results, fields) {
      connection.release();
      if (error) {
        res.status(500).send('Database query error ocurred1');
      } else {
        if (results.length > 0) {
          var aucode;
          var now = moment().format('YYYY-MM-DD HH:mm:ss');
          connection.query('SELECT * FROM authentication WHERE email = ?', [email], function (error, results, fields) {
            if (error) {
              res.status(500).send('Database query error ocurred0');
            } else {
              if (results.length > 0) {
                var timenow = moment();
                var timeold = results[0].timesaved;
                console.log(timenow);
                console.log(timeold);
                console.log(timenow.diff(timeold, 'minutes'));
                if (timenow.diff(timeold, 'minutes') <= 30) {
                  aucode = results[0].aucode;
                } else {
                  aucode = randomstring.generate(10);
                  connection.query('UPDATE authentication SET aucode = ? WHERE email = ?', [aucode, email], function (error, results, fields) {
                    if (error) {
                      res.status(500).send('Database query error ocurred');
                    }
                  });
                  connection.query('UPDATE authentication SET timesaved = ? WHERE email = ?', [now, email], function (error, results, fields) {
                    if (error) {
                      res.status(500).send('Database query error ocurred');
                    }
                  });
                }
              } else {
                aucode = randomstring.generate(10);
                var auinfor = {
                  'email': email,
                  'aucode': aucode,
                  'timesaved': now
                };
                connection.query('INSERT INTO authentication SET ?', auinfor, function (error, results, fields) {
                  if (error) {
                    // console.log("error ocurred",error);
                    res.status(500).send('Database query error ocurred2');
                  }
                });
              }
            }
            var transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'graduationhelper@gmail.com',
                pass: 'Grh12345'
              }
            });
            console.log(aucode);
            var themail = {
              from: 'sender@email.com', // sender address
              to: email, // receiver
              subject: 'Reset information from GRH', // Subject line
              text: 'Your are receiving this because you try to reset password for your account on Graduation Helper. \n' +
        'The reset authentication code is ：     ' + aucode + '. The code will expired in 30 minutes.\n' +
        "If you didn't request this, please ignore and nothing will be changed in your account."
            };

            transporter.sendMail(themail, function (err, info) {
              if (err) {
                console.log(err);
              } else {
                res.status(250).send('Email sended successfully');
                console.log(info);
              }
            });
          });
        } else {
          res.status(422).send('Email does not exist');
        }
      }
    });
  });
};

exports.resetpassword = function (req, res) {
  // called when user is authorized to reset password
  var email = req.body.email;
  var password = req.body.password;
  var Uaucode = req.body.aucode;
  var aucode;
  var sendtime;

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).send('Database pool connection error');
    }
    // first get the true aucode
    connection.query('SELECT * FROM authentication WHERE email = ?', [email], function (error, results, fields) {
      connection.release();
      if (error) {
        res.status(500).send('Database query error ocurred');
      } else {
        if (results.length > 0) {
          aucode = results[0].aucode;
          sendtime = results[0].timesaved;
        } else {
          res.status(422).send('Email does not exist');
        }
      }
      var now = moment();
      var then = sendtime;
      var timediff = now.diff(then, 'minutes');
      if (timediff > 30) {
        res.status(422).write('aucode expired!');
      } else if (aucode.toLowerCase() !== Uaucode.toLowerCase()) {
        res.status(422).send('aucode unmatched!');
      } else {
        connection.query('UPDATE users SET password = ? WHERE email = ?', [
          password, email
        ], function (error, results, fields) {
          if (error) {
            res.status(500).send('Database query error ocurred');
          } else {
            res.status(300).send('Reset successfully!');
          }
        });
      }
    });
  });
};

exports.getUserInfo = function (req, res) {
  var userId = req.body.user_id;
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).send('Database pool connection error');
    }
    connection.query('SELECT * FROM users WHERE user_id = ?', [userId], function (error, results, fields) {
      // Done with the connection
      connection.release();

      if (error) {
        res.status(500).send('Database query error ocurred');
      } else {
        if (results.length > 0) {
          let userInfo = {
            userId: results[0].user_id,
            username: results[0].username,
            email: results[0].email
          };
          res.status(250).send(userInfo);
        } else {
          res.status(422).send('UserId does not exist');
        }
      }
    });
  });
};

exports.pool = pool;
