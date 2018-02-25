const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
var path = require('path');

// app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/hello', function(req, res){
  res.send("Hello World");
});

app.get('/api/hello', function(req, res){
  res.send({express: 'Hello from express'});
});

app.listen(port, () => console.log(`Listening on ${port}`));
