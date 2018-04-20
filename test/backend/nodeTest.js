let chai = require('chai');
let chaiHttp = require('chai-http');
let server = 'http://localhost:5000'; // require('../../server');
var itParam = require('mocha-param');
chai.use(chaiHttp);
require('chai').should();

describe('User tests', function () {
    it('it should not register since email already exists', function (done) {
        chai.request(server).post('/register').send({ 'username': 'admin', 'email': 'admin@illinois.edu', 'password': 'cs428' }).end(function (err, res) {
            res.should.have.status(422);
            res.text.should.be.equal('Email already registered!');
            if (err) {
                err.response.should.have.status(422);
            }
            done();
        });
    });

    it('it should login successfully', function (done) {
        chai.request(server).post('/login').send({ 'email': 'admin@illinois.edu', 'password': 'test2test2test2' }).end((err, res) => {
            res.should.have.status(250);
            (err === null).should.equal(true);
            done();
        });
    });

    it('it should not login wrong password', function (done) {
        chai.request(server).post('/login').send({ 'email': 'admin@illinois.edu', 'password': 'wrong_pass' }).end((err, res) => {
            res.should.have.status(422);
            res.text.should.be.equal('Email and password does not match');
            if (err) {
                err.response.should.have.status(422);
            }
            done();
        });
    });

    it('it should not login no existing email', function (done) {
        chai.request(server).post('/login').send({ 'email': 'NOEMAIL@illinois.edu', 'password': 'NOEMAIL' }).end((err, res) => {
            res.should.have.status(422);
            res.text.should.be.equal('Email does not exist');
            if (err) {
                err.response.should.have.status(422);
            }
            done();
        });
    });

    var aucode = 'ABCDEFGHIJ';
    it('resetpass', function (done) {
        chai.request(server).post('/sendemail').send({'email': 'admin@illinois.edu'}).end((err, res) => {
            res.should.have.status(250);
            res.text.should.be.equal('Email not sent; in testing mode');
            done();
            if (err) {
                console.log(err);
            }
        });
    });

    it('resetpass', function (done) {
        chai.request(server).post('/resetpassword').send({'email': 'admin@illinois.edu', 'password': 'test2test2test2', 'aucode': aucode}).end((err, res) => {
            res.should.have.status(250);
            done();
            if (err) {
                console.log(err);
            }
        });
    });

    it('badResetpass', function (done) {
        chai.request(server).post('/sendemail').send({'email': 'NOEMAIL@illinois.edu'}).end((err, res) => {
            res.should.have.status(422);
            res.text.should.be.equal('Email does not exist');
            done();
            if (err) {
                console.log(err);
            }
        });
    });
});

describe('schedule test', function () {
    describe('General schedule tests', function () {
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

        it('should not give us a schedule', function (done) {
            chai.request(server).post('/schedule/generate').send({ 'year': '-1', 'semester': 'blah', 'courses': ['CS125'] }).end((err, res) => {
                res.should.have.status(500);
                if (err) {
                    err.response.should.have.status(500);
                }
                done();
            });
        });

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
    describe('Schedule preferences tests', function () {
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

            describe('All preferences test', function () {
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

    describe('parameterized tests', function () {
        var data = [
            {
                year: '-1',
                semester: 'blah',
                courses: ['CS125', 'CS173']
            },
            {
                year: '1950',
                semester: 'Spring',
                courses: ['CS125', 'CS173']
            },
            {
                year: '2010',
                semester: 'Summer',
                courses: ['CS999', 'CS2232']
            },
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
});

describe('API tests', function () {
    this.timeout(10000);

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

    it('it should get all semester for given year', function (done) {
        chai.request(server).get('/api/semester').query({ year: '2018' }).end((err, res) => {
            res.body.should.be.a('array');
            res.body.length.should.be.eql(4);
            (err === null).should.equal(true);
            done();
        });
    });

    it('it should get all major for given year and semester', function (done) {
        chai.request(server).get('/api/subject').query({ year: '2018', semester: 'spring' }).end((err, res) => {
            res.body.should.be.a('array');
            res.body.length.should.be.eql(180);
            (err === null).should.equal(true);
            done();
        });
    });

    it('it should get all course for given year, semester, major', function (done) {
        chai.request(server).get('/api/course').query({ year: '2018', semester: 'spring', course: 'AAS' }).end((err, res) => {
            res.body.should.be.a('array');
            res.body.length.should.be.eql(18);
            (err === null).should.equal(true);
            done();
        });
    });

    it('it should get class section for given year, semester, major, course, courseNumber', function (done) {
        chai.request(server).get('/api/section').query({ year: '2018', semester: 'spring', course: 'AAS', courseId: '100' }).end((err, res) => {
            res.body.should.be.a('array');
            res.body.length.should.be.eql(8);
            (err === null).should.equal(true);
            done();
        });
    });
});
