CREATE DATABASE testDatabase;

CREATE TABLE testDatabase.users (
  user_id int(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
  username varchar(16) NOT NULL,
  email varchar(32) NOT NULL,
  password varchar(32) NOT NULL
);

CREATE TABLE testDatabase.courses(
  course_id int(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
  subject varchar(4) NOT NULL,
  course_number int(11) NOT NULL,
  cru int(11) NOT NULL,
  schedule_id int(11) NOT NULL
);

CREATE TABLE testDatabase.schedules(
  schedule_id int(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
  semester varchar(8) NOT NULL,
  user_id int(11) NOT NULL
);
