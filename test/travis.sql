CREATE DATABASE testDatabase;

CREATE TABLE testDatabase.users {
  user_id int(11) AUTO_INCREMENT,
  username varchar(16),
  email varchar(32),
  password varchar(32),
  PRIMARY_KEY (user_id)
}

CREATE TABLE testDatabase.courses{
  course_id int(11) AUTO_INCREMENT,
  subject varchar(4),
  course_number int(11),
  cru int(11),
  schedule_id int(11),
  PRIMARY_KEY (course_id)
}

CREATE TABLE testDatabase.schedules{
  schedule_id int(11) AUTO_INCREMENT,
  semester varchar(8),
  user_id int(11),
  PRIMARY_KEY (schedule_id)
}
