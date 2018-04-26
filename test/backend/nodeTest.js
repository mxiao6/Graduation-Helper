let chai = require('chai');
let chaiHttp = require('chai-http');
let server = 'http://localhost:5000';
var itParam = require('mocha-param');
chai.use(chaiHttp);
require('chai').should();

/**
 * tests to test basic user functionalities like registering, login, bad password, reseting password
 */
describe('User tests', function () {
  // cannot register an account that already exist
  it('it should not register since email already exists', function (done) {
    chai.request(server).post('/register').send({ 'username': 'admin', 'email': 'admin@illinois.edu', 'password': 'cs428' }).end(function (err, res) {
      res.should.have.status(422);
      res.text.should.be.equal('Email already registered.');
      if (err) {
        err.response.should.have.status(422);
      }
      done();
    });
  });
  // basic login sucessfully test
  it('it should login successfully', function (done) {
    chai.request(server).post('/login').send({ 'email': 'admin@illinois.edu', 'password': 'test2test2test2' }).end((err, res) => {
      res.should.have.status(250);
      (err === null).should.equal(true);
      done();
    });
  });
  // wrong password test
  it('it should not login wrong password', function (done) {
    chai.request(server).post('/login').send({ 'email': 'admin@illinois.edu', 'password': 'wrong_pass' }).end((err, res) => {
      res.should.have.status(422);
      res.text.should.be.equal('Email and password do not match.');
      if (err) {
        err.response.should.have.status(422);
      }
      done();
    });
  });
  // bad login because username and password are invalid
  it('it should not login no existing email', function (done) {
    chai.request(server).post('/login').send({ 'email': 'NOEMAIL@illinois.edu', 'password': 'NOEMAIL' }).end((err, res) => {
      res.should.have.status(422);
      res.text.should.be.equal('Email does not exist.');
      if (err) {
        err.response.should.have.status(422);
      }
      done();
    });
  });
  // tests to send mail for resting password
  var aucode = 'ABCDEFGHIJ';
  it('resetpass', function (done) {
    chai.request(server).post('/sendemail').send({ 'email': 'admin@illinois.edu' }).end((err, res) => {
      res.should.have.status(250);
      res.text.should.be.equal('Email not sent because the server is in testing mode.');
      done();
      if (err) {
        console.log(err);
      }
    });
  });
  // testing to see if new password is set
  it('resetpass', function (done) {
    chai.request(server).post('/resetpassword').send({ 'email': 'admin@illinois.edu', 'password': 'test2test2test2', 'aucode': aucode }).end((err, res) => {
      res.should.have.status(250);
      done();
      if (err) {
        console.log(err);
      }
    });
  });
  // the reset password should fail if the email is invalid or does not exist in the database
  it('badResetpass', function (done) {
    chai.request(server).post('/sendemail').send({ 'email': 'NOEMAIL@illinois.edu' }).end((err, res) => {
      res.should.have.status(422);
      res.text.should.be.equal('Email does not exist.');
      done();
      if (err) {
        console.log(err);
      }
    });
  });
});

/**
 * this group of tests are to test whether schedule funcionalities are woring
 */
describe('schedule test', function () {
  /**
     * the following describe tests schedule generation
     */
  describe('General schedule tests', function () {
    // random schedule based on year, semester and classes
    it('should give us a schedule', function (done) {
      this.timeout(20000);
      chai
        .request(server)
        .post('/schedule/generate')
        .send({
          year: '2018',
          semester: 'Spring',
          courses: ['CS125', 'CS173']
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('Object');
          res.body.should.have.nested.property('numOfSchedules');
          res.body.should.have.nested.property('schedules');
          (err === null).should.equal(true);
          done();
        });
    });
    // want a specifc course in schedule
    it('should give us a schedule animal science', function (done) {
      this.timeout(20000);
      chai.request(server).post('/schedule/generate').send({ 'year': '2018', 'semester': 'Spring', 'courses': ['ANSC250'] }).end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('Object');
        res.body.should.have.nested.property('numOfSchedules');
        res.body.should.have.nested.property('schedules');
        (err === null).should.equal(true);
        done();
      });
    });
    // bad schedule test
    it('should not give us a schedule', function (done) {
      chai.request(server).post('/schedule/generate').send({ 'year': '-1', 'semester': 'blah', 'courses': ['CS125'] }).end((err, res) => {
        res.should.have.status(500);
        if (err) {
          err.response.should.have.status(500);
        }
        done();
      });
    });
    // bad parameter test
    it('should not give us a schedule because of incorrect Parameters', function (done) {
      chai.request(server).post('/schedule/generate').send({ 'semester': 'blah', 'courses': ['ANSC250'] }).end((err, res) => {
        res.should.have.status(422);
        res.body.error.should.be.equal('Incorrect Parameters');
        if (err) {
          err.response.should.have.status(422);
        }
        done();
      });
    });
  });
  /**
     * tests the preferences constraints upon schedule generation
     */
  describe('Schedule preferences tests', function () {
    // incomplete satisfication for preferences test
    it('should give us a schedule that does not meet preferences for start and end time', function (done) {
      this.timeout(10000);
      chai.request(server).post('/schedule/generate').send({
        'year': '2018',
        'semester': 'Spring',
        'courses': ['ANSC250'],
        'preferences': {
          noClassDays: [],
          noClassOptions: [],
          noClassTime: [
            {
              start: 12,
              end: 14
            }
          ]
        }
      }).end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('Object');
        res.body.should.have.nested.property('numOfSchedules');
        res.body.should.have.nested.property('schedules');
        res.body.should.have.nested.property('metAllPreferences');
        res.body.should.include({ 'metAllPreferences': false });
        (err === null).should.equal(true);
        done();
      });
    });
    // generate a schedule that fits all requreiments
    it('should give us a schedule that meets preferences for start and end time', function (done) {
      this.timeout(10000);
      chai.request(server).post('/schedule/generate').send({
        'year': '2018',
        'semester': 'Spring',
        'courses': ['ANSC250'],
        'preferences': {
          noClassDays: [],
          noClassOptions: [],
          noClassTime: [
            {
              start: 8,
              end: 9
            }
          ]
        }
      }).end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('Object');
        res.body.should.have.nested.property('numOfSchedules');
        res.body.should.have.nested.property('schedules');
        res.body.should.have.nested.property('metAllPreferences');
        res.body.should.include({ 'metAllPreferences': true });
        (err === null).should.equal(true);
        done();
      });
    });
    // class option preference not met
    it('should give us a schedule that does not meet preferences for class option', function (done) {
      this.timeout(10000);
      chai.request(server).post('/schedule/generate').send({
        'year': '2018',
        'semester': 'Spring',
        'courses': ['ANSC250'],
        'preferences': {
          noClassDays: [],
          noClassOptions: ['lunch'],
          noClassTime: []
        }
      }).end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('Object');
        res.body.should.have.nested.property('numOfSchedules');
        res.body.should.have.nested.property('schedules');
        res.body.should.have.nested.property('metAllPreferences');
        res.body.should.include({ 'metAllPreferences': false });
        (err === null).should.equal(true);
        done();
      });
    });
    // class option met for schedule
    it('should give us a schedule that meets preferences for class option', function (done) {
      this.timeout(10000);
      chai.request(server).post('/schedule/generate').send({
        'year': '2018',
        'semester': 'Spring',
        'courses': ['ANSC250'],
        'preferences': {
          noClassDays: [],
          noClassOptions: ['evening'],
          noClassTime: []
        }
      }).end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('Object');
        res.body.should.have.nested.property('numOfSchedules');
        res.body.should.have.nested.property('schedules');
        res.body.should.have.nested.property('metAllPreferences');
        res.body.should.include({ 'metAllPreferences': true });
        (err === null).should.equal(true);
        done();
      });
    });
    // class days preference not met
    it('should give us a schedule that does not meet preferences for class days', function (done) {
      this.timeout(10000);
      chai.request(server).post('/schedule/generate').send({
        'year': '2018',
        'semester': 'Spring',
        'courses': ['ANSC250'],
        'preferences': {
          noClassDays: [
            'T', 'R'
          ],
          noClassOptions: [],
          noClassTime: []
        }
      }).end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('Object');
        res.body.should.have.nested.property('numOfSchedules');
        res.body.should.have.nested.property('schedules');
        res.body.should.have.nested.property('metAllPreferences');
        res.body.should.include({ 'metAllPreferences': false });
        (err === null).should.equal(true);
        done();
      });
    });
    // class day preferences met
    it('should give us a schedule that meets preferences for class days', function (done) {
      this.timeout(10000);
      chai.request(server).post('/schedule/generate').send({
        'year': '2018',
        'semester': 'Spring',
        'courses': ['ANSC250'],
        'preferences': {
          noClassDays: [
            'M', 'W', 'F'
          ],
          noClassOptions: [],
          noClassTime: []
        }
      }).end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('Object');
        res.body.should.have.nested.property('numOfSchedules');
        res.body.should.have.nested.property('schedules');
        res.body.should.have.nested.property('metAllPreferences');
        res.body.should.include({ 'metAllPreferences': true });
        (err === null).should.equal(true);
        done();
      });
    });
    // testing with only very few prefernces
    describe('Few preferences test', function () {
      it('should give us a schedule that meets a few preferences 1', function (done) {
        this.timeout(10000);
        chai.request(server).post('/schedule/generate').send({
          'year': '2018',
          'semester': 'Spring',
          'courses': ['ANSC250'],
          'preferences': {
            noClassDays: ['F'],
            noClassOptions: [],
            noClassTime: [
              {
                start: 12,
                end: 14
              }
            ]
          }
        })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('Object');
            res.body.should.have.nested.property('numOfSchedules');
            res.body.should.have.nested.property('schedules');
            res.body.should.have.nested.property('metAllPreferences');
            res.body.should.include({ metAllPreferences: false });
            (err === null).should.equal(true);
            done();
          });
      });

      it('should give us a schedule that meets preferences for start and end time', function (done) {
        this.timeout(10000);
        chai
          .request(server)
          .post('/schedule/generate')
          .send({
            year: '2018',
            semester: 'Spring',
            courses: ['ANSC250'],
            preferences: {
              noClassDays: [],
              noClassOptions: [],
              noClassTime: [
                {
                  start: 8,
                  end: 9
                }
              ]
            }
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('Object');
            res.body.should.have.nested.property('numOfSchedules');
            res.body.should.have.nested.property('schedules');
            res.body.should.have.nested.property('metAllPreferences');
            res.body.should.include({ metAllPreferences: true });
            (err === null).should.equal(true);
            done();
          });
      });

      it('should give us a schedule that does not meet preferences for class option', function (done) {
        this.timeout(10000);
        chai
          .request(server)
          .post('/schedule/generate')
          .send({
            year: '2018',
            semester: 'Spring',
            courses: ['ANSC250'],
            preferences: {
              noClassDays: [],
              noClassOptions: ['lunch'],
              noClassTime: []
            }
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('Object');
            res.body.should.have.nested.property('numOfSchedules');
            res.body.should.have.nested.property('schedules');
            res.body.should.have.nested.property('metAllPreferences');
            res.body.should.include({ metAllPreferences: false });
            (err === null).should.equal(true);
            done();
          });
      });

      it('should give us a schedule that meets preferences for class option', function (done) {
        this.timeout(10000);
        chai
          .request(server)
          .post('/schedule/generate')
          .send({
            year: '2018',
            semester: 'Spring',
            courses: ['ANSC250'],
            preferences: {
              noClassDays: [],
              noClassOptions: ['evening'],
              noClassTime: []
            }
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('Object');
            res.body.should.have.nested.property('numOfSchedules');
            res.body.should.have.nested.property('schedules');
            res.body.should.have.nested.property('metAllPreferences');
            res.body.should.include({ metAllPreferences: true });
            (err === null).should.equal(true);
            done();
          });
      });

      it('should give us a schedule that does not meet preferences for class days', function (done) {
        this.timeout(10000);
        chai
          .request(server)
          .post('/schedule/generate')
          .send({
            year: '2018',
            semester: 'Spring',
            courses: ['ANSC250'],
            preferences: {
              noClassDays: ['T', 'R'],
              noClassOptions: [],
              noClassTime: []
            }
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('Object');
            res.body.should.have.nested.property('numOfSchedules');
            res.body.should.have.nested.property('schedules');
            res.body.should.have.nested.property('metAllPreferences');
            res.body.should.include({ metAllPreferences: false });
            (err === null).should.equal(true);
            done();
          });
      });

      it('should give us a schedule that meets preferences for class days', function (done) {
        this.timeout(10000);
        chai
          .request(server)
          .post('/schedule/generate')
          .send({
            year: '2018',
            semester: 'Spring',
            courses: ['ANSC250'],
            preferences: {
              noClassDays: ['M', 'W', 'F'],
              noClassOptions: [],
              noClassTime: []
            }
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('Object');
            res.body.should.have.nested.property('numOfSchedules');
            res.body.should.have.nested.property('schedules');
            res.body.should.have.nested.property('metAllPreferences');
            res.body.should.include({ metAllPreferences: true });
            (err === null).should.equal(true);
            done();
          });
      });
      // prefernce 1 satisfied paritally
      describe('Few preferences test', function () {
        it('should give us a schedule that meets a few preferences 1', function (done) {
          this.timeout(10000);
          chai
            .request(server)
            .post('/schedule/generate')
            .send({
              year: '2018',
              semester: 'Spring',
              courses: ['ANSC250'],
              preferences: {
                noClassDays: ['F'],
                noClassOptions: [],
                noClassTime: [
                  {
                    start: 7,
                    end: 9
                  },
                  {
                    start: 9,
                    end: 10
                  }
                ]
              }
            })
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('Object');
              res.body.should.have.nested.property('numOfSchedules');
              res.body.should.have.nested.property('schedules');
              res.body.should.have.nested.property('metAllPreferences');
              res.body.should.include({ metAllPreferences: true });
              (err === null).should.equal(true);
              done();
            });
        });
        // prefernce 2 satisfied paritally
        it('should give us a schedule that meets a few preferences 2', function (done) {
          this.timeout(10000);
          chai
            .request(server)
            .post('/schedule/generate')
            .send({
              year: '2018',
              semester: 'Spring',
              courses: ['ANSC250'],
              preferences: {
                noClassDays: ['M'],
                noClassOptions: ['morning'],
                noClassTime: [
                  {
                    start: 18,
                    end: 20
                  }
                ]
              }
            })
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('Object');
              res.body.should.have.nested.property('numOfSchedules');
              res.body.should.have.nested.property('schedules');
              res.body.should.have.nested.property('metAllPreferences');
              res.body.should.include({ metAllPreferences: true });
              (err === null).should.equal(true);
              done();
            });
        });
        // prefernce 3 satisfied paritally
        it('should give us a schedule that meets a few preferences 3', function (done) {
          this.timeout(10000);
          chai
            .request(server)
            .post('/schedule/generate')
            .send({
              year: '2018',
              semester: 'Spring',
              courses: ['ANSC250'],
              preferences: {
                noClassDays: ['M', 'F'],
                noClassOptions: ['evening'],
                noClassTime: []
              }
            })
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('Object');
              res.body.should.have.nested.property('numOfSchedules');
              res.body.should.have.nested.property('schedules');
              res.body.should.have.nested.property('metAllPreferences');
              res.body.should.include({ metAllPreferences: true });
              (err === null).should.equal(true);
              done();
            });
        });

        it('should give us a schedule that does not meet a few preferences 1', function (done) {
          this.timeout(10000);
          chai
            .request(server)
            .post('/schedule/generate')
            .send({
              year: '2018',
              semester: 'Spring',
              courses: ['ANSC250'],
              preferences: {
                noClassDays: ['T', 'R'],
                noClassOptions: ['lunch'],
                noClassTime: []
              }
            })
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('Object');
              res.body.should.have.nested.property('numOfSchedules');
              res.body.should.have.nested.property('schedules');
              res.body.should.have.nested.property('metAllPreferences');
              res.body.should.include({ metAllPreferences: false });
              (err === null).should.equal(true);
              done();
            });
        });

        it('should give us a schedule that does not meet a few preferences 2', function (done) {
          this.timeout(10000);
          chai
            .request(server)
            .post('/schedule/generate')
            .send({
              year: '2018',
              semester: 'Spring',
              courses: ['ANSC250'],
              preferences: {
                noClassDays: ['T', 'R'],
                noClassOptions: ['evening'],
                noClassTime: [
                  {
                    start: 11,
                    end: 14
                  }
                ]
              }
            })
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('Object');
              res.body.should.have.nested.property('numOfSchedules');
              res.body.should.have.nested.property('schedules');
              res.body.should.have.nested.property('metAllPreferences');
              res.body.should.include({ metAllPreferences: false });
              (err === null).should.equal(true);
              done();
            });
        });

        it('should give us a schedule that does not meet a few preferences 3', function (done) {
          this.timeout(10000);
          chai
            .request(server)
            .post('/schedule/generate')
            .send({
              year: '2018',
              semester: 'Spring',
              courses: ['ANSC250'],
              preferences: {
                noClassDays: ['M', 'F'],
                noClassOptions: ['evening'],
                noClassTime: [
                  {
                    start: 11,
                    end: 14
                  }
                ]
              }
            })
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('Object');
              res.body.should.have.nested.property('numOfSchedules');
              res.body.should.have.nested.property('schedules');
              res.body.should.have.nested.property('metAllPreferences');
              res.body.should.include({ metAllPreferences: false });
              (err === null).should.equal(true);
              done();
            });
        });
      });
      /**
         * test if given a possible preference would they be all satisfeid
         */
      describe('All preferences test', function () {
        // preference 1 all satisifed
        it('should give us a schedule that meets all preferences 1', function (done) {
          this.timeout(10000);
          chai.request(server).post('/schedule/generate').send({
            'year': '2018',
            'semester': 'Spring',
            'courses': ['ANSC250'],
            'preferences': {
              noClassDays: [
                'M', 'W'
              ],
              noClassOptions: ['evening'],
              noClassTime: [
                {
                  start: 7,
                  end: 8
                }
              ]
            }
          }).end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('Object');
            res.body.should.have.nested.property('numOfSchedules');
            res.body.should.have.nested.property('schedules');
            res.body.should.have.nested.property('metAllPreferences');
            res.body.should.include({ 'metAllPreferences': true });
            (err === null).should.equal(true);
            done();
          });
        });
        // preference 2 all satisifed
        it('should give us a schedule that meets all preferences 2', function (done) {
          this.timeout(10000);
          chai.request(server).post('/schedule/generate').send({
            'year': '2018',
            'semester': 'Spring',
            'courses': ['ANSC250'],
            'preferences': {
              noClassDays: [
                'M', 'W'
              ],
              noClassOptions: ['evening'],
              noClassTime: [
                {
                  start: 7,
                  end: 8
                }, {
                  start: 8,
                  end: 9
                }
              ]
            }
          }).end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('Object');
            res.body.should.have.nested.property('numOfSchedules');
            res.body.should.have.nested.property('schedules');
            res.body.should.have.nested.property('metAllPreferences');
            res.body.should.include({ 'metAllPreferences': true });
            (err === null).should.equal(true);
            done();
          });
        });
        // preference 3 all satisifed
        it('should give us a schedule that meets all preferences 3', function (done) {
          this.timeout(10000);
          chai.request(server).post('/schedule/generate').send({
            'year': '2018',
            'semester': 'Spring',
            'courses': ['ANSC250'],
            'preferences': {
              noClassDays: [
                'M', 'W', 'F'
              ],
              noClassOptions: [
                'evening', 'morning'
              ],
              noClassTime: [
                {
                  start: 7,
                  end: 8
                }, {
                  start: 8,
                  end: 9
                }
              ]
            }
          }).end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('Object');
            res.body.should.have.nested.property('numOfSchedules');
            res.body.should.have.nested.property('schedules');
            res.body.should.have.nested.property('metAllPreferences');
            res.body.should.include({ 'metAllPreferences': true });
            (err === null).should.equal(true);
            done();
          });
        });

        it('should give us a schedule that does not meet all preferences 1', function (done) {
          this.timeout(10000);
          chai.request(server).post('/schedule/generate').send({
            'year': '2018',
            'semester': 'Spring',
            'courses': ['ANSC250'],
            'preferences': {
              noClassDays: ['T'],
              noClassOptions: ['lunch'],
              noClassTime: [
                {
                  start: 12,
                  end: 14
                }
              ]
            }
          }).end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('Object');
            res.body.should.have.nested.property('numOfSchedules');
            res.body.should.have.nested.property('schedules');
            res.body.should.have.nested.property('metAllPreferences');
            res.body.should.include({ 'metAllPreferences': false });
            (err === null).should.equal(true);
            done();
          });
        });

        it('should give us a schedule that does not meet all preferences 2', function (done) {
          this.timeout(10000);
          chai.request(server).post('/schedule/generate').send({
            'year': '2018',
            'semester': 'Spring',
            'courses': ['ANSC250'],
            'preferences': {
              noClassDays: ['T'],
              noClassOptions: ['lunch'],
              noClassTime: [
                {
                  start: 11,
                  end: 12
                }, {
                  start: 12,
                  end: 14
                }
              ]
            }
          }).end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('Object');
            res.body.should.have.nested.property('numOfSchedules');
            res.body.should.have.nested.property('schedules');
            res.body.should.have.nested.property('metAllPreferences');
            res.body.should.include({ 'metAllPreferences': false });
            (err === null).should.equal(true);
            done();
          });
        });

        it('should give us a schedule that does not meet all preferences 3', function (done) {
          this.timeout(10000);
          chai.request(server).post('/schedule/generate').send({
            'year': '2018',
            'semester': 'Spring',
            'courses': ['ANSC250'],
            'preferences': {
              noClassDays: [
                'T', 'R'
              ],
              noClassOptions: ['lunch'],
              noClassTime: [
                {
                  start: 11,
                  end: 12
                }, {
                  start: 12,
                  end: 14
                }
              ]
            }
          }).end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('Object');
            res.body.should.have.nested.property('numOfSchedules');
            res.body.should.have.nested.property('schedules');
            res.body.should.have.nested.property('metAllPreferences');
            res.body.should.include({ 'metAllPreferences': false });
            (err === null).should.equal(true);
            done();
          });
        });
      });
    });
  });
  /**
     * advanced parameterized tests
     */
  describe('parameterized tests', function () {
    var data = [
      // invalid year
      {
        year: '-1',
        semester: 'blah',
        courses: ['CS125', 'CS173']
      },
      // year out of bounnd
      {
        year: '1950',
        semester: 'Spring',
        courses: ['CS125', 'CS173']
      },
      // class number out of bound
      {
        year: '2010',
        semester: 'Summer',
        courses: ['CS999', 'CS2232']
      },
      // semester invalid
      {
        year: '0',
        semester: 'blah',
        courses: ['BAD000', 'BAD111']
      }
    ];

    itParam('reject all', data, function (schedule) {
      chai.request(server).post('/schedule/generate').send({
        'year': schedule.year,
        'semester': schedule.semester,
        'courses': schedule.courses
      }).end((err, res) => {
        res.should.have.status(500);
        // done();
        if (err) {
          err.response.should.have.status(500);
        }
      });
    });
  });
  /**
     * general tests for saving and getting a schedule
     */
  describe('schedule tests', function () {
    // saving a basic CS schedule
    it('saving a schedule', function (done) {
      this.timeout(10000);
      chai.request(server).post('/saveschedule').send({
        'userId': 1,
        'year': '2018',
        'semester': 'Spring',
        'sections': [
          {
            'subjectId': 'CS',
            'courseId': '425',
            'sectionId': '31384',
            'sectionTitle': 'Distributed Systems',
            'sectionNumber': 'T3',
            'type': 'LCD',
            'startTime': '09:30 AM',
            'endTime': '10:45 AM',
            'daysOfWeek': 'TR'
          }
        ]
      }).end((err, res) => {
        res.should.have.status(200);
        done();
        if (err) {
          console.log(err.body);
          err.response.should.have.status(500);
        }
      });
    });
    // getting the schedule that we just saved
    it('getting an existing schedule', function (done) {
      this.timeout(10000);
      chai.request(server).get('/getschedule').query({
        'userId': 1,
        'year': '2018',
        'semester': 'Fall'
      }).end((err, res) => {
        res.should.have.status(200);
        done();
        if (err) {
          err.response.should.have.status(500);
        }
      });
    });
  });
});

/**
 * These tests test the api calls for getting years, semesters, majors, coursenumber and combonation
 * of the above things
 */
describe('API tests', function () {
  this.timeout(10000);
  // checks getting years
  it('it should get all years', function (done) {
    chai
      .request(server)
      .get('/api/years')
      .end((err, res) => {
        res.body.should.be.a('array');
        res.body.length.should.be.eql(15);
        res.body[0].should.be.equal('2018');
        (err === null).should.equal(true);
        done();
      });
  });
  // checks getting semester in a year
  it('it should get all semester for given year', function (done) {
    chai.request(server).get('/api/semester').query({ year: '2018' }).end((err, res) => {
      res.body.should.be.a('array');
      res.body.length.should.be.eql(4);
      (err === null).should.equal(true);
      done();
    });
  });
  // checks if a given combo of year and semester gives semesters
  it('it should get all major for given year and semester', function (done) {
    chai.request(server).get('/api/subject').query({ year: '2018', semester: 'spring' }).end((err, res) => {
      res.body.should.be.a('array');
      res.body.length.should.be.eql(180);
      (err === null).should.equal(true);
      done();
    });
  });
  // checks for courses in a year, semester and study area
  it('it should get all course for given year, semester, major', function (done) {
    chai.request(server).get('/api/course').query({ year: '2018', semester: 'spring', course: 'AAS' }).end((err, res) => {
      res.body.should.be.a('array');
      res.body.length.should.be.eql(18);
      (err === null).should.equal(true);
      done();
    });
  });
  // gets class selection for a specific course
  it('it should get class section for given year, semester, major, course, courseNumber', function (done) {
    chai.request(server).get('/api/section').query({ year: '2018', semester: 'spring', course: 'AAS', courseId: '100' }).end((err, res) => {
      res.body.should.be.a('array');
      res.body.length.should.be.eql(8);
      (err === null).should.equal(true);
      done();
    });
  });
});
