let chai = require('chai');
let chaiHttp = require('chai-http');
let server = 'http://localhost:5000';
var itParam = require('mocha-param');
chai.use(chaiHttp);
require('chai').should();

/**
 * Tests to test basic user functionalities like registering, login, bad password, reseting password
 */
describe('User tests', function () {
  // Cannot register an account that already exist. Frontend created a user called admin with email admin@illinois.edu
    //we should not be able to create another user with the same username and email
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
  // Login with the user created by frontend test
  it('it should login successfully', function (done) {
    chai.request(server).post('/login').send({ 'email': 'admin@illinois.edu', 'password': 'test2test2test2' }).end((err, res) => {
      res.should.have.status(250);
      (err === null).should.equal(true);
      done();
    });
  });
  // The password is test2test2test2 and we should not be able to loging with another password
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
  // Both the username and password are invalid here, we first check if an email exists
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
  //  Send an email to admin@gmail.com and see if it actually got sent
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
  // Resetting the password of admin@illinois.edu. The reset password does not matter
  it('resetpass', function (done) {
    chai.request(server).post('/resetpassword').send({ 'email': 'admin@illinois.edu', 'password': 'test2test2test2', 'aucode': aucode }).end((err, res) => {
      res.should.have.status(250);
      done();
      if (err) {
        console.log(err);
      }
    });
  });
  // We should not be able to send an email to something that does not exist in the database
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
 * This group of tests are to test whether schedule funcionalities are woring
 */
describe('schedule test', function () {
  /**
     * The following describe tests schedule generation
     */
  describe('General schedule tests', function () {
    // These classes CS125 and CS173 do not conflict and both are offered in spring 2018 and should give us a schedule
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
    // We want only ANSC250 in our schedule
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
    // The year and semester are invalid here and so we should not get a schedule
    it('should not give us a schedule', function (done) {
      chai.request(server).post('/schedule/generate').send({ 'year': '-1', 'semester': 'blah', 'courses': ['CS125'] }).end((err, res) => {
        res.should.have.status(500);
        if (err) {
          err.response.should.have.status(500);
        }
        done();
      });
    });
    // We do not specify a year thus a schedule cannot be genretead
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
     * Tests the preferences constraints upon schedule generation
     */
  describe('Schedule preferences tests', function () {
    // We state that we should want the class time to start from 12pm to 2 pm. There does exist a course at that time so
      // a schedule should be generated
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
    // generate a schedule where our class starts at 8am to 9am
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
    //We cannot have lunch because the class starts from 12-2pm
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
    // The latest this class goes is until 2pm and thus we are free for the evening
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
    // The classes do not meet on Tuesday and Thursday
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
    // This class meets on monday, wednesday and friday
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
    // This class meets on Friday
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
      //class starts and ends from 8-9 am
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
      // The class does meet friday but not from 7-9am or 9-10am
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
        // Class does not meet on mondays but does meet in morning but does not meet from 6-8pm
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
        // Class does not meet on monday
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
        //Class exists during lunch but does meet on Tuesday and Thursday
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
        //class does not meet from 11am -2pm
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
        //No class on monday
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
         * Test if given a possible preference would they be all satisfeid
         */
      describe('All preferences test', function () {
        // Classes meet on Monday, Wednesday, starts form 7am to 8am and does not have class in evening
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
        // Same as last test but class can also start from 8am-9am
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
        // Same as last test but class can also exist on Friday
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
        //Class does not meet on tuesday
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
        //Class does not meet on tuesday and classtime and lunch preference conflict
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
        //Classes do not start from 12pm-2pm
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
     * Advanced parameterized tests
     */
  describe('parameterized tests', function () {
    var data = [
      // Invalid year and semester but valid classes
      {
        year: '-1',
        semester: 'blah',
        courses: ['CS125', 'CS173']
      },
      // Year is too old even though semester and courses are valid
      {
        year: '1950',
        semester: 'Spring',
        courses: ['CS125', 'CS173']
      },
      // Year and sesmter valid but classes are not
      {
        year: '2010',
        semester: 'Summer',
        courses: ['CS999', 'CS2232']
      },
      // Semester is invalid
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
     * General tests for saving and getting a schedule
     */
  describe('schedule tests', function () {
    // We save a scheduel for user 1 where they are taking CS425 from 9:30am to 10:45am on tuesday and thursday
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
    // Checking the schedule for user 1 that we generated in the last test. We see if the schedule can be read properly
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
  // Check getting all the years for classes that exist, lower bound of about 1980 and an upper bound on current year
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
  // See if we are able to obtain all the semesters for 2018, spring, summer, fall, winter
  it('it should get all semester for given year', function (done) {
    chai.request(server).get('/api/semester').query({ year: '2018' }).end((err, res) => {
      res.body.should.be.a('array');
      res.body.length.should.be.eql(4);
      (err === null).should.equal(true);
      done();
    });
  });
  // Get all majors for 2018 Spring
  it('it should get all major for given year and semester', function (done) {
    chai.request(server).get('/api/subject').query({ year: '2018', semester: 'spring' }).end((err, res) => {
      res.body.should.be.a('array');
      res.body.length.should.be.eql(180);
      (err === null).should.equal(true);
      done();
    });
  });
  // Get all courses for 2018, spring in the AAS department
  it('it should get all course for given year, semester, major', function (done) {
    chai.request(server).get('/api/course').query({ year: '2018', semester: 'spring', course: 'AAS' }).end((err, res) => {
      res.body.should.be.a('array');
      res.body.length.should.be.eql(18);
      (err === null).should.equal(true);
      done();
    });
  });
  // See all AAS100 sections for Spring 2018
  it('it should get class section for given year, semester, major, course, courseNumber', function (done) {
    chai.request(server).get('/api/section').query({ year: '2018', semester: 'spring', course: 'AAS', courseId: '100' }).end((err, res) => {
      res.body.should.be.a('array');
      res.body.length.should.be.eql(8);
      (err === null).should.equal(true);
      done();
    });
  });
});
