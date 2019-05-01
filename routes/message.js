const express = require('express');
const db = require('../utilities/sqlconn.js');
var router = express.Router();
const bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post("/startthread", (req, res) => {
    let title = req.body['title'];
    if (title) {
        db.oneOrNone("INSERT INTO threads ((title) VALUES ($1) RETURNING id", [title])
    }
});

router.post("/sendmessage", (req, res) => {

});

router.post("/messages", (req, res) => {

});
