var mysql = require('mysql');
var connection = mysql.createConnection({
  //information for connecting to Azure database
  /*
  host:'graduationhelper.mysql.database.azure.com',
  user:'myadmin@graduationhelper',
  password:'Cs428grh!',
  database:'graduation_helper'
  */
  //Please try to use local database to test!!!
  host:'localhost',
  user:'xxx',
  password:'xxx',
  database:'xxx'
});


connection.connect(function(err){
if(!err) {
    console.log("sucessfully connected to database");
} else {
    console.log("Database error");
}
});

exports.register = function(req,res){
  var users={
    "username":req.body.username,
    "email":req.body.email,
    "password":req.body.password,
  }
  connection.query('SELECT * FROM users WHERE email = ?', [req.body.email], function (error, results, fields) {
  //check for duplicate register
  if (error) {
    res.send("error ocurred");
  }else{
    if(results.length >0){
      res.send("Email already registered!")
    }
    else{
        connection.query('INSERT INTO users SET ?',users, function (error, results, fields) {
        if (error) {
        //console.log("error ocurred",error);
        res.send("error ocurred");
        }else{
        //console.log('The solution is: ', results);
        res.send("user registered sucessfully");
        }
      });
    }
  }
  });

}
exports.login = function(req,res){
  var email= req.body.email;
  var password = req.body.password;
  connection.query('SELECT * FROM users WHERE email = ?',[email], function (error, results, fields) {
  if (error) {
    res.send("error ocurred");
  }else{
    if(results.length >0){
      if(result[0].password === password){
        res.send("login sucessfull");
      }
      else{
        res.send("Email and password does not match");
      }
    }
    else{
      res.send("Email does not exist");
    }
  }
  });
}