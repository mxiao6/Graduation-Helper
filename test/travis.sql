CREATE DATABASE testDatabase;

CREATE TABLE testDatabase.users (
  user_id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(16) NOT NULL,
  email VARCHAR(32) NOT NULL,
  password VARCHAR(64) NOT NULL,
  act BOOL NOT NULL,
  PRIMARY KEY (user_id)
);

CREATE TABLE testDatabase.courses(
  id INT NOT NULL AUTO_INCREMENT,
  scheduleId INT NOT NULL,
  subjectId VARCHAR(4) NOT NULL,
  courseId VARCHAR(4) NOT NULL,
  sectionId VARCHAR(6) NOT NULL,
  type VARCHAR(4) NOT NULL,
  startTime VARCHAR(10) NOT NULL,
  endTime VARCHAR(10) NOT NULL,
  daysOfWeek VARCHAR(7) NOT NULL,
  semester VARCHAR(6) NOT NULL,
  year INT NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE testDatabase.schedules(
  scheduleId INT NOT NULL AUTO_INCREMENT,
  semester VARCHAR(8) NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (scheduleId)
);

CREATE TABLE testDatabase.authentication(
  email VARCHAR(32) NOT NULL,
  aucode VARCHAR(64) NOT NULL,
  timesaved DATETIME NOT NULL,
  PRIMARY KEY (email)
);
