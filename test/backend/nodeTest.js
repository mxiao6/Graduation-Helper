let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../server');
chai.use(chaiHttp);
require('chai').should();

describe('API tests', () => {
  describe('/register user', () => {
    it('it should not register since email already exists', function (done) {
      chai.request(server)
        .post('/register')
        .send({'username': 'admin', 'email': 'admin@gmail.com', 'password': 'cs428'})
        .end(function (err, res) {
          res.should.have.status(422);
          res.text.should.be.equal('Email already registered!');
          done();
          if (err) {
            console.log(err);
          }
        });
    });
  });

  describe('/login user', () => {
    it('it should login successfully', function (done) {
      chai.request(server)
        .post('/login')
        .send({
          'email': 'admin@gmail.com',
          'password': 'cs428'
        })
        .end((err, res) => {
          res.should.have.status(250);
          // res.text.should.be.equal('login successful');
          done();
          if (err) {
            console.log(err);
          }
        });
    });

    it('it should not login wrong password', function (done) {
      chai.request(server)
        .post('/login')
        .send({
          'email': 'admin@gmail.com',
          'password': 'wrong_pass'
        })
        .end((err, res) => {
          res.should.have.status(422);
          res.text.should.be.equal('Email and password does not match');
          done();
          if (err) {
            console.log(err);
          }
        });
    });

    it('it should not login no existing email', function (done) {
      chai.request(server)
        .post('/login')
        .send({
          'email': 'NOEMAIL@gmail.com',
          'password': 'NOEMAIL'
        })
        .end((err, res) => {
          res.should.have.status(422);
          res.text.should.be.equal('Email does not exist');
          done();
          if (err) {
            console.log(err);
          }
        });
    });
  });
  /*
  describe('/resetpassword', () => {
    it('resetpass', function (done) {
      chai.request(server)
        .post('/resetpassword')
        .send({
          'email': 'test@gmail.com',
          'password': 'newpassword'
        })
        .end((err, res) => {
          res.should.have.status(300);
          res.text.should.be.equal('Reset successfully!');
          done();
          if (err) {
            console.log(err);
          }
        });
    });
  });
  */
});

describe('schedule test', () => {
  it('should give us a schedule', function (done) {
    chai.request(server)
      .get('/schedule/generate')
      .query({
        'year': '2018',
        'semester': 'Spring',
        'courses': [
          'CS125',
          'CS173'
        ]
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        done();
        if (err) {
          console.log(err);
        }
      });
  });
  it('should not give us a schedule', function (done) {
    chai.request(server)
      .get('/schedule/generate')
      .query({
        'year': '-1',
        'semester': 'blah',
        'courses': [
          'CS125',
          'CS173'
        ]
      })
      .end((err, res) => {
        res.should.have.status(500);
        res.body.error.should.be.equal('Could not generate schedules');
        done();
        if (err) {
          console.log(err);
        }
      });
  });
});
/*
describe('save schedule tests', () => {
    it('save schedule', function (done) {
        chai.request(server)
            .post('/saveschedule')
            .send({
                userId: 'admin@gmail.com',
                semester: 'Spring',
                year: '2018',
                crns: ['31187', '31152'],
                subjects: ['CS', 'CS'],
                courseNumbers: ["173", "125"]
            })
            .end((err, res) => {
              res.should.have.status(200);
              done();
              if (err) {
                console.log(err);
              }
            });
    });
}); */

describe('API tests', () => {
  it('it should get all years', function (done) {
    chai.request(server)
      .get('/api/years')
      .end((err, res) => {
        res.body.should.be.a('array');
        res.body.length.should.be.eql(15);
        res.body[0].should.be.equal('2018');
        done();
        if (err) {
          console.log(err);
        }
      });
  });

  it('it should get all semester for given year', function (done) {
    chai.request(server)
      .get('/api/semester')
      .query({year: '2018'})
      .end((err, res) => {
        res.body.should.be.a('array');
        res.body.length.should.be.eql(4);
        done();
        if (err) {
          console.log(err);
        }
      });
  });

  it('it should get all major for given year and semester', function (done) {
    chai.request(server)
      .get('/api/subject')
      .query({
        year: '2018',
        semester: 'spring'
      })
      .end((err, res) => {
        res.body.should.be.a('array');
        res.body.length.should.be.eql(180);
        done();
        if (err) {
          console.log(err);
        }
      });
  });

  it('it should get all course for given year, semester, major', function (done) {
    chai.request(server)
      .get('/api/course')
      .query({
        year: '2018',
        semester: 'spring',
        course: 'AAS'
      })
      .end((err, res) => {
        res.body.should.be.a('array');
        res.body.length.should.be.eql(18);
        done();
        if (err) {
          console.log(err);
        }
      });
  });

  it('it should get class section for given year, semester, major, course, courseNumber', function (done) {
    chai.request(server)
      .get('/api/section')
      .query({
        year: '2018',
        semester: 'spring',
        course: 'AAS',
        courseId: '100'
      })
      .end((err, res) => {
        res.body.should.be.a('array');
        res.body.length.should.be.eql(8);
        done();
        if (err) {
          console.log(err);
        }
      });
  });
});
