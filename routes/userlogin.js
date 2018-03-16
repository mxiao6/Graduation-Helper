var mysql = require('mysql');
var nodemailer = require('nodemailer');
var randomstring = require('randomstring');
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
              res.send('user registered sucessfully');
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
            res.status(250).send('login sucessfull');
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

Process: User click reset password -> user input email -> user receive code
-> user input authentication code -> frontend check if code match -> call reset function.

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
        res.status(500).send('Database query error ocurred');
      } else {
        if (results.length > 0) {
          var aucode = randomstring.generate(10);
          var transporter = nodemailer.createTransport({
            service: 'gmail??',
            auth: {
              user: 'sender@email.com',
              pass: 'emailpassword'
            }
          });

          var themail = {
            from: 'sender@email.com', // sender address
            to: email, // receiver
            subject: 'Reset information from GRH', // Subject line
            text: 'Your are receiving this because you try to reset password for your account on Graduation Helper. \n' +
        'The reset authentication code is ' + aucode + '\n' +
        "If you didn't request this, please ignore and nothing will be changed in your account."
          };

          transporter.sendMail(themail, function (err, info) {
            if (err) { console.log(err); } else { console.log(info); }
          });

          res.send(aucode);
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

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).send('Database pool connection error');
    }
    connection.query('UPDATE users SET password = ? WHERE email = ?', [
      password, email
    ], function (error, results, fields) {
      connection.release();

      if (error) {
        res.status(500).send('Database query error ocurred');
      } else {
        res.status(300).send('Reset successfully!');
      }
    });
  });
};
