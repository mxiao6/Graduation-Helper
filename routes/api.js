const express = require('express');
const router = express.Router();
const request = require('request');
const parseString = require('xml2js').parseString;

router.get('/hello', function(req, res){
  res.send({express: 'Hello from express api'});
});

router.get('/schedule', function(req, res){
  request('https://courses.illinois.edu/cisapp/explorer/schedule.xml', function(error, response, body){
    if (!error && response.statusCode == 200){
      parseString(body, function(err, result){
        calendarYears = result['ns2:schedule']['calendarYears'][0]['calendarYear']
        res.send(calendarYears);
      });
    }else{
      console.log(error);
      res.send([]);
    }
  });
});

router.get('/schedule/:year([0-9]{4})', function(req, res){
  let query = req.params.year+'.xml';
  request('https://courses.illinois.edu/cisapp/explorer/schedule/'+query, function(error, response, body){
    if (!error && response.statusCode == 200){
      parseString(body, function(err, result){
        terms = result['ns2:calendarYear']['terms'][0]['term'];
        res.send(terms);
      });
    }else{
      console.log(error);
      res.send([]);
    }
  });
});

router.get('/schedule/:year([0-9]{4})/:semester(summer|fall|spring|winter)', function(req, res){
  let query = req.params.year+'/'+req.params.semester+'.xml';
  request('https://courses.illinois.edu/cisapp/explorer/schedule/'+query, function(error, response, body){
    if (!error && response.statusCode == 200){
      parseString(body, function(err, result){
        subjects = result['ns2:term']['subjects'][0]['subject'];
        res.send(subjects);
      });
    }else{
      console.log(error);
      res.send([]);
    }
  });
});

router.get('/schedule/:year([0-9]{4})/:semester(summer|fall|spring|winter)/:subject([A-Z]{2,4})', function(req, res){
  let query = req.params.year+'/'+req.params.semester+'/'+req.params.subject+'.xml';
  request('https://courses.illinois.edu/cisapp/explorer/schedule/'+query, function(error, response, body){
    if (!error && response.statusCode == 200){
      parseString(body, function(err, result){
        courses = result['ns2:subject']['courses'][0]['course'];
        res.send(courses);
      });
    }else{
      console.log(error);
      res.send([]);
    }
  });
});

router.get('/schedule/:year([0-9]{4})/:semester(summer|fall|spring|winter)/:subject([A-Z]{2,4})/:id([0-9]{3})', function(req, res){
  let query = req.params.year+'/'+req.params.semester+'/'+req.params.subject+'/'+req.params.id+'.xml';
  request('https://courses.illinois.edu/cisapp/explorer/schedule/'+query, function(error, response, body){
    if (!error && response.statusCode == 200){
      parseString(body, function(err, result){
        sections = result['ns2:course']['sections'][0]['section'];
        res.send(sections);
      });
    }else{
      console.log(error);
      res.send([]);
    }
  });
});

module.exports = router;
