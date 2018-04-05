CREATE DATABASE testDatabase;

CREATE TABLE testDatabase.users (
  user_id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(16) NOT NULL,
  email VARCHAR(32) NOT NULL,
  password VARCHAR(32) NOT NULL,
  PRIMARY KEY (user_id)
);

CREATE TABLE testDatabase.course(
  course_id INT NOT NULL AUTO_INCREMENT,
  subject VARCHAR(4) NOT NULL,
  course_number INT NOT NULL,
  crn INT NOT NULL,
  schedule_id INT NOT NULL,
  semester VARCHAR(6) NOT NULL,
  year INT NOT NULL,
  PRIMARY KEY (course_id)
);

CREATE TABLE testDatabase.schedule(
  schedule_id INT NOT NULL AUTO_INCREMENT,
  semester VARCHAR(8) NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (schedule_id)
);

CREATE TABLE testDatabase.authentication(
  email VARCHAR(32) NOT NULL,
  aucode VARCHAR(64) NOT NULL,
  timesaved DATETIME NOT NULL,
  PRIMARY KEY (email)
);
