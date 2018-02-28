const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
var path = require('path');

// app.use(express.static(path.join(__dirname, 'public')));

app.get('/hello', function(req, res){
  res.send("Hello World");
});

app.get('/api/hello', function(req, res){
  res.send({express: 'Hello from express'});
});

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(port, () => console.log(`Listening on ${port}`));
