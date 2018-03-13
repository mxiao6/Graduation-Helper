//will contain a .save() function to push data to database
//functions related to schedule objects
var mysql = require('mysql');

//TEMP
var currentSemester = "FALL";

function saveSchedule(schedule) {
    console.log("CALLING SAVESCHEDULE()");
    pool.getConnection(function (err, connection) {
        if (err) {
            res.send('Get pool connection error');
        }
        connection.query('INSERT INTO Schedule (schedule_id,semester,user_id) VALUES (NULL,?,?);',[currentSemester],[user_id]);
    });
}