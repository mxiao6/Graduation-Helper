var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../../server');
var itParam = require('mocha-param');
chai.use(chaiHttp);
require('chai').should();

describe('API tests', function () {
  describe('/register user', function () {
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

  describe('/login user', function () {
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
  describe('/resetpassword', function() {
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

describe('parameterized tests', function () {
  var data = [{year: '-1', semester: 'blah', courses: ['CS125', 'CS173']}, {year: '1950', semester: 'Spring', courses: ['CS125', 'CS173']},
    {year: '2010', semester: 'Summer', courses: ['CS999', 'CS2232']}, {year: '0', semester: 'blah', courses: ['BAD000', 'BAD111']}];

  itParam('reject all', data, function (schedule) {
    chai.request(server)
      .post('/schedule/generate')
      .send({
        'year': schedule.year,
        'semester': schedule.semester,
        'courses': [
          schedule.courses
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

describe('schedule test', function () {
  /** it('should give us a schedule', function (done) {
    this.timeout(20000);
    chai.request(server)
      .post('/schedule/generate')
      .send({
        'year': '2018',
        'semester': 'Spring',
        'courses': [
          'CS125',
          'CS173'
        ]
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('Object');
        res.body.should.have.nested.property('numOfSchedules');
        res.body.should.have.nested.property('schedules');
        done();
        if (err) {
          console.log(err);
        }
      });
  }); */
  it('should not give us a schedule', function (done) {
    chai.request(server)
      .post('/schedule/generate')
      .send({
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

describe('save and get schedule tests', function () {
  /** it('save schedule', function (done) {
        chai.request(server)
            .post('/saveschedule')
            .send({
                userId: 1,
                semester: 'Spring',
                year: '2018',
                crns: ['31187', '31152'],
                subjects: ['CS', 'CS'],
                courseNumbers: ["173", "125"]
            })
            .end((err, res) => {
              res.should.have.status(400);
              done();
              if (err) {
                console.log(err);
              }
            });
    });
    it('get schedule', function (done) {
        chai.request(server)
            .post('/saveschedule')
            .send({
                userId: 0,
                semester: 'Spring',
                year: '2018',
            })
            .end((err, res) => {
            res.should.have.status(400);
        done();
        if (err) {
            console.log(err);
        }
    });
    }); */
});

describe('API tests', function () {
  this.timeout(10000);

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
        user_id: 0,
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
