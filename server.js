const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const api = require('./routes/api.js');
//const userlogin = require('./routes/userlogin.js');
const selectClasses = require('./routes/selectclasses.js');
const bodyParser = require('body-parser');
var path = require('path');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/api', api);
//app.use('/register',userlogin.register);
//app.use('/login',userlogin.login);
app.use('/', selectClasses);

app.get('/hello', function(req, res){
  res.send("Hello World");
});

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

process.on('uncaughtException', (err) => {
  console.log("uncaughtException " + err);
});

app.listen(port, () => console.log(`Listening on ${port}`));
