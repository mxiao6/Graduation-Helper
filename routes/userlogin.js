var mysql = require('mysql');
var nodemailer = require('nodemailer');
var randomstring = require('randomstring');
var moment = require('moment');
var bcrypt = require('bcryptjs');
var crypto = require('crypto-js');
var querystring = require('querystring');
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
/**
*@api{register}/userlogin Register a new user
*@apiName Register
*@apiGroup User
*@apiVersion 0.3.0
*
*@apiParam {String} username Username
*@apiParam {String} email User's email
*@apiParam {String} password User entered password
*
*@apiSuccessExample Success-Response:
*   HTTP/1.1 250 OK
*   {
      "user registered sucessfully"
    }
*
*@apiErrorExample Error-Response:
*   HTTP/1.1 422
*   {
*     "Email already registered!"
*   }
*/
exports.register = function (req, res) {
  var inputpassword = req.body.password;
  var testMode = process.argv.length > 2 && process.argv[2] === 'test';
  bcrypt.hash(inputpassword, 10, function (err, results) {
    if (err) {
      res.status(500).send('hash error');
    }
    var hashed = results;
    var users = {
      'username': req.body.username,
      'email': req.body.email,
      'password': hashed,
      'act': testMode
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
          res.status(500).send('Database query error occurred');
        } else {
          if (results.length > 0) {
            res.status(422).send('Email already registered!');
          } else {
            connection.query('INSERT INTO users SET ?', users, function (error, results, fields) {
              if (error) {
                res.status(500).send('Database query error occurred');
              } else if (!testMode) {
                var cipher = crypto.AES.encrypt(req.body.email, 'Excalibur');
                cipher = querystring.escape(cipher);
                var transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                    user: 'graduationhelper@gmail.com',
                    pass: 'Grh12345'
                  }
                });
                var themail = {
                  from: 'sender@email.com', // sender address
                  to: req.body.email, // receiver
                  subject: 'Activate your Account in GRH!!!', // Subject line
                  text: 'You are receiving this because you just registered an account. ' +
                  'Please use this URL to activate your account\n' + 'http://grhlinux.azurewebsites.net/act?inf=' + cipher + '\n If you did not request this, please ignore this email.'
                };
                transporter.sendMail(themail, function (err, info) {
                  if (err) {
                    console.log(err);
                  } else {
                    res.status(250).send('Account created successfully. Please check your email to activate your account.');
                    console.log(info);
                  }
                });
              } else {
                res.status(250).send('Account created successfully. Please check your email to activate your account.');
              }
            });
          }
        }
      });
    });
  });
};

/**
*@api{activate}/act account activate
*@apiName act
*@apiGroup User
*@apiVersion 0.2.0
*
*@apiParam {String} inf encrypted user's email
*
*@apiSuccessExample Success-Response:
*   HTTP/1.1 250 OK
*   {
      "user account activate!!!"
    }
*
*
*@apiErrorExample Error-Response:
*   HTTP/1.1 500
*   {
*     "Database query error occurred"
*   }
*
*/
exports.activate = function (req, res) {
  var cipher = req.query.inf;
  var bytes = crypto.AES.decrypt(cipher.toString(), 'Excalibur');
  var recoveremail = bytes.toString(crypto.enc.Utf8);
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).send('Database pool connection error');
    }
    connection.query('UPDATE users SET act = ? WHERE email = ?', [1, recoveremail], function (error, results, fields) {
      if (error) {
        res.status(500).send('Database query error occurred');
      } else {
        res.redirect('http://grhlinux.azurewebsites.net/#/Login');
        res.status(250).send('User account activated!');
      }
    });
  });
};

/**
*@api{login}/userlogin User login
*@apiName Login
*@apiGroup User
*@apiVersion 0.3.0
*
*@apiParam {String} email User's email
*@apiParam {String} password Entered password
*
*@apiSuccessExample Success-Response:
*   HTTP/1.1 250 OK
*   {
      "user login sucessfully"
    }
*
*@apiErrorExample Error-Response:
*   HTTP/1.1 422
*   {
*     "Email does not exist"
*   }
*
*@apiErrorExample Error-Response:
*   HTTP/1.1 422
*   {
*     "Account hasn't activate"
*   }
*
*@apiErrorExample Error-Response:
*   HTTP/1.1 422
*   {
*     "Email and password does not match"
*   }
*/

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
        res.status(500).send('Database query error occurred');
      } else {
        if (results.length > 0) {
          var hashedpass = results[0].password;
          bcrypt.compare(password, hashedpass, function (err, result) {
            if (err) {
              res.status(500).send('hash error');
            }
            var valid = result;

            if (!results[0].act) {
              res.status(422).send('Account has not activate');
              var cipher = crypto.AES.encrypt(req.body.email, 'Excalibur');
              cipher = querystring.escape(cipher);
              var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'graduationhelper@gmail.com',
                  pass: 'Grh12345'
                }
              });
              var themail = {
                from: 'sender@email.com', // sender address
                to: req.body.email, // receiver
                subject: 'Activate your Account in GRH!!!', // Subject line
                text: 'You are receiving this because you just registered an account. ' +
                  'Please use this URL to activate your account\n' + 'http://grhlinux.azurewebsites.net/act?inf=' + cipher + '\n If you did not request this, please ignore this email.'
              };
              transporter.sendMail(themail, function (err, info) {
                if (err) {
                  console.log(err);
                } else {
                  res.status(250).send('Activate email sent successfully');
                  console.log(info);
                }
              });
            } else if (valid) {
              let userInfo = {
                userId: results[0].user_id,
                username: results[0].username,
                email: results[0].email,
                message: 'login successful'
              };
              res.status(250).send(userInfo);
            } else {
              res.status(422).send('Email and password do not match');
            }
          });
        } else {
          res.status(422).send('Email does not exist');
        }
      }
    });
  });
};

/**
*@api{sendemail}/userlogin Send reset information and record verification information
*@apiName Sendemail
*@apiGroup User
*@apiVersion 0.3.0
*
*@apiParam {String} email User's email
*
*@apiSuccessExample Success-Response:
*   HTTP/1.1 250 OK
*   {
      "Email sended successfully"
    }
*
*@apiErrorExample Error-Response:
*   HTTP/1.1 422
*   {
*     "Email does not exist"
*   }
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
        res.status(500).send('Database query error occurred');
      } else {
        if (results.length > 0) {
          var aucode;
          var now = moment().format('YYYY-MM-DD HH:mm:ss');
          connection.query('SELECT * FROM authentication WHERE email = ?', [email], function (error, results, fields) {
            if (error) {
              res.status(500).send('Database query error occurred');
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
                      res.status(500).send('Database query error occurred');
                    }
                  });
                  connection.query('UPDATE authentication SET timesaved = ? WHERE email = ?', [now, email], function (error, results, fields) {
                    if (error) {
                      res.status(500).send('Database query error occurred');
                    }
                  });
                }
              } else {
                if (process.argv.length > 2 && process.argv[2] === 'test') { aucode = 'ABCDEFGHIJ'; } else { aucode = randomstring.generate(10); }
                var auinfor = {
                  'email': email,
                  'aucode': aucode,
                  'timesaved': now
                };
                connection.query('INSERT INTO authentication SET ?', auinfor, function (error, results, fields) {
                  if (error) {
                    res.status(500).send('Database query error occurred');
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
              text: 'You are receiving this because you tried to reset the password for your account on Graduation Helper. \n' +
                'The reset authentication code is ：     ' + aucode + '\n The code will expired in 30 minutes.' +
                "If you didn't request this, please ignore this email."
            };

            if (process.argv.length > 2 && process.argv[2] === 'test') {
              res.status(250).send('Email not sent; in testing mode');
            } else {
              transporter.sendMail(themail, function (err, info) {
                if (err) {
                  console.log(err);
                } else {
                  res.status(250).send('Email sent successfully');
                  console.log(info);
                }
              });
            }
          });
        } else {
          res.status(422).send('Email does not exist');
        }
      }
    });
  });
};

/**
*@api{resetpassword}/userlogin Update password after verificating
*@apiName Resetpassword
*@apiGroup User
*@apiVersion 0.3.0
*
*@apiParam {String} email User's email
*@apiParam {String} password User's new password
*@apiParam {String} aucode User entered authentication code
*
*@apiParamExample {json} Request-Example:
*   {
*     "email": "jwu108@illinois.edu",
*     "password": "12345678",
*     "aucode": "Ml7eX4Q85L"
*   }
*
*@apiSuccessExample Success-Response:
*   HTTP/1.1 250 OK
*   {
      "Reset successfully"
    }
*
*@apiErrorExample authentication code exipried:
*   HTTP/1.1 422
*   {
*     "aucode expired!"
*   }
*
*@apiErrorExample authentication code exipried:
*   HTTP/1.1 422
*   {
*     "aucode unmatched!"
*   }
*
*/
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
        res.status(500).send('Database query error occurred');
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
      } else if (aucode !== Uaucode) {
        res.status(422).send('aucode did not match!');
      } else {
        bcrypt.hash(password, 10, function (err, results) {
          if (err) {
            res.status(500).send('hash error');
          }
          var password = results;
          connection.query('UPDATE users SET password = ? WHERE email = ?', [
            password, email
          ], function (error, results, fields) {
            if (error) {
              res.status(500).send('Database query error occurred');
            } else {
              res.status(250).send('Reset successfully!');
            }
          });
        });
      }
    });
  });
};

/**
*@api{getUserInfo}/userlogin return the user information given the userid
*@apiName GetUserInfo
*@apiGroup User
*@apiVersion 0.3.0
*
*@apiParam {String} user_id User's unique id
*
*@apiSuccessExample Success-Response:
*   HTTP/1.1 250 OK
*   {
      userId: user_id,
      username: username,
      email: email
    }
*
*/

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
        res.status(500).send('Database query error occurred');
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
