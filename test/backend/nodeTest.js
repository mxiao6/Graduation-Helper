var app = require('../../server.js');
var chai = require('chai');
var request = require('supertest');

var expect = chai.expect;

describe('API tests', function() {

    it('should have return version number', function (done) {
        request(app)
            .post('/register')
            .send({"username": "zuyi", "email" : "zuyi@gmail.com", "password": "pass"})
            .end(function (err, res) {
                console.log(res.statusCode);
                done();
            });
    });
});