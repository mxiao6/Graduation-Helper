const request = require('request');
const parseString = require('xml2js').parseString;

let getElements = (query, callbackTest) => {
  request('https://courses.illinois.edu/cisapp/explorer/' + query + '.xml', function (error, response, body) {
    if (!error && response.statusCode === 200) {
      parseString(body, function (err, result) {
        if (err) { console.log('ERROR:' + err); }
        callbackTest(result);
      });
    } else {
      console.log('ERROR:' + error);
      return null;
    }
  }).end();
};

module.exports = {
  getElements: getElements
};
