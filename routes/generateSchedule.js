const express = require('express');
const router = express.Router();
//data input in [[],[]]
router.get('/generate', function (req, res) {
    console.log("generate schedule!!");
    res.json([]);
});

module.exports = router;