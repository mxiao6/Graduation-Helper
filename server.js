const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.get('/hello', function(req, res){
  res.send("Hello World");
});

app.get('/api/hello', function(req, res){
  res.send({express: 'Hello from express'});
});

app.get('*', function(req, res){
  res.send("Sorry, page not found");
});

app.listen(port, () => console.log(`Listening on ${port}`));
