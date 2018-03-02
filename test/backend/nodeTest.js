var chai = require('chai');
var request = require('supertest');

var expect = chai.expect;

describe('API tests', function() {

    var server;
    beforeEach(function () {
        server = require('../../server.js');;
    });

    afterEach(function () {
        server.close();
    });

    it('register', function (done) {
        request(server)
            .post('/register')
            .send({"username": "zuyi", "email" : "zuyi@gmail.com", "password": "pass"})
            .end(function (err, res) {
                expect(res.statusCode).to.be.equal(422);
                done();
            });
    });

    it('login', function (done) {
        request(server)
            .post('/login')
            .send({ "email" : "zuyi@gmail.com", "password": "pass"})
            .end(function (err, res) {
                expect(res.statusCode).to.be.equal(250);
                done();
                require('../../server.js').close()
                console.log('hey')
            });
    });

    it('resetpass', function (done) {
        request(server)
            .post('/login')
            .send({ "email" : "zuyi@gmail.com", "password": "pass"})
            .end(function (err, res) {
                expect(res.statusCode).to.be.equal(250);
                done();
                require('../../server.js').close()
                console.log('hey')
            });
    });

});