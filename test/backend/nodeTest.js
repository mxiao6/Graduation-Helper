let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../server');
let should = chai.should();
chai.use(chaiHttp);

describe('API tests', () => {

    describe('/register user', () => {
      it('it should not register since email already exists', function (done) {
          chai.request(server)
            .post('/register')
            .send({"username": "admin", "email" : "admin@gmail.com", "password": "cs428"})
            .end(function (err, res) {
                res.should.have.status(422);
                res.text.should.be.equal('Email already registered!');
                done();
            });
      });
    });

    describe('/login user', () => {
      it('it should login successfully', function (done) {
          chai.request(server)
            .post('/login')
            .send({
              "email": "admin@gmail.com",
              "password": "cs428"
            })
            .end((err,res) => {
              res.should.have.status(250);
              res.text.should.be.equal('login sucessfull');
              done();
            });

      });

      it('it should not login wrong password', function (done) {
        chai.request(server)
          .post('/login')
          .send({
            "email": "admin@gmail.com",
            "password": "wrong_pass"
          })
          .end((err,res) => {
            res.should.have.status(422);
            res.text.should.be.equal('Email and password does not match');
            done();
          });
      });

      it('it should not login no existing email', function (done) {
        chai.request(server)
          .post('/login')
          .send({
            "email": "NOEMAIL@gmail.com",
            "password": "NOEMAIL"
          })
          .end((err,res) => {
            res.should.have.status(422);
            res.text.should.be.equal('Email does not exist');
            done();
          });
      });
    });

    describe('/resetpassword', () => {
      it('resetpass', function (done) {
        chai.request(server)
            .post('/resetpassword')
            .send({
              "email" : "test@gmail.com",
              "password": "newpassword"
            })
            .end((err, res) => {
                res.should.have.status(300);
                res.text.should.be.equal('Reset successfully!');
                done();
            });
      });
    });

});

describe('API tests', () => {
  it('it should get all years', function (done){
    chai.request(server)
      .get('/api/years')
      .end((err,res) => {
        res.body.should.be.a('array');
        res.body.length.should.be.eql(15);
        res.body[0].should.be.equal('2018');
        done();
      });
  });

  it('it should get all semester for given year', function (done){
    chai.request(server)
      .get('/api/semester')
      .query({year:'2018'})
      .end((err,res) => {
        res.body.should.be.a('array');
        res.body.length.should.be.eql(4);
        done();
      });
  });

  it('it should get all major for given year and semester', function (done){
    chai.request(server)
      .get('/api/major')
      .query({
        year:'2018',
        semester: 'spring'
      })
      .end((err,res) => {
        res.body.should.be.a('array');
        res.body.length.should.be.eql(180);
        done();
      });
  });

  it('it should get all course for given year, semester, major', function (done){
    chai.request(server)
      .get('/api/course')
      .query({
        year:'2018',
        semester: 'spring',
        course:'AAS'
      })
      .end((err,res) => {
        res.body.should.be.a('array');
        res.body.length.should.be.eql(18);
        done();
      });
  });

  it('it should get class section for given year, semester, major, course, courseNumber', function (done){
    chai.request(server)
      .get('/api/section')
      .query({
        year:'2018',
        semester: 'spring',
        course:'AAS',
        courseNumber: '100'
      })
      .end((err,res) => {
        res.body.should.be.a('array');
        res.body.length.should.be.eql(8);
        done();
      });
  });

});
