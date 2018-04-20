// use to hash original passwords
var bcrypt = require('bcryptjs');
var mysql = require('mysql');
var pool = mysql.createPool({
  // information for connecting to Azure database
  host: 'graduationhelper.mysql.database.azure.com',
  user: 'myadmin@graduationhelper',
  password: 'Cs428grh!',
  database: 'graduation_helper'
});
var emaillist;
pool.getConnection(function (err, connection) {
  if (err) {
  }
  connection.query('SELECT email FROM users', function (error, results, fields) {
    // Done with connection
    connection.release();

    // check for duplicate register
    if (error) {
      console.log('gg');
    }
    emaillist = results;
    console.log('emaillist');
    for (let i = 0; i < emaillist.length; i++) {
      var cure = emaillist[i]['email'];
      connection.query('SELECT password FROM users WHERE email = ?', cure, function (error, results, fields) {
        if (error) {
        }
        var unhashed = results[0]['password'];
        bcrypt.hash(unhashed, 10, function (err, results) {
          if (err) {
          }
          var hashed = results;
          connection.query('UPDATE users SET password = ? WHERE email = ?', [results, emaillist[i]['email']], function (error, results, fields) {
            if (error) {
              console.log(hashed);
            }
            console.log(i);
            console.log(emaillist[i]['email']);
            console.log(hashed);
          });
          connection.query('UPDATE users SET act = ? WHERE email = ?', [true, emaillist[i]['email']], function (error, results, fields) {
            if (error) {
              console.log('a2');
            }
            console.log(i);
            console.log(emaillist[i]['email']);
            console.log(hashed);
          });
        });
      });
    }
  });
});
