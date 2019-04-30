const express = require('express');

const db = require('../utilities/sqlconn.js');

var router = express.Router();

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

/**
 * Assigns a dm to a campaign.
 */
router.post("/assigndm", (req, res) => {
    // Parameters for the courses
    let user_id = req.body['user_id'];
    let campaign_id = req.body['campaign_id'];

    if (user_id && campaign_id) {
        db.none("INSERT INTO dms VALUES ($1, $2)", [user_id, campaign_id])
            .then(() => {
                //We successfully added the course, let the user know
                res.send({
                    success: true
                });
            }).catch((err) => {
            //log the error
            console.log(err);
            res.send({
                success: false,
                error: err
            });
        });
    } else {
        res.send({
            success: false,
            input: req.body,
            error: "Missing required information"
        });
    }
});

// Probably need a POST with users id
router.get("/courses", (req, res) => {

    db.manyOrNone('SELECT * FROM courses')
    //If successful, run function passed into .then()
        .then((data) => {
            res.send({
                success: true,
                names: data
            });
        }).catch((error) => {
        console.log(error);
        res.send({
            success: false,
            error: error
        })
    });
});


module.exports = router;