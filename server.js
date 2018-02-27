const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
<<<<<<< HEAD
const api = require('./routes/api.js');
const userlogin = require('./routes/userlogin.js');
const selectClasses = require('./routes/selectclasses.js');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/api', api);
app.use('/register',userlogin.register);
app.use('/login',userlogin.login);
app.use('/', selectClasses);

=======
var path = require('path');

// app.use(express.static(path.join(__dirname, 'public')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
>>>>>>> origin/master

app.get('/hello', function(req, res){
  res.send("Hello World");
});

<<<<<<< HEAD
app.get('*', function(req, res){
  res.send("Sorry, page not found");
});

app.listen(port, () => console.log(`Listening on ${port}`));
=======
app.get('/api/hello', function(req, res){
  res.send({express: 'Hello from express'});
});

app.listen(port, () => console.log(`Listening on ${port}`));
>>>>>>> origin/master
