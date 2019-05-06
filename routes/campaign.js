/*
    Campaigns relation backend endpoints.

*/
const express = require('express');
const db = require('../utilities/sqlconn.js');
var router = express.Router();

const bodyParser = require("body-parser");

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


// TODO: Update campaign table with group_id, create group if DNE?
router.post("/assigngroup", (req, res) => {
    const group_id = req.body['group_id'];
    const campaign_id = req.body['campaign_id'];
});

// TODO: Create campaign, should create group and threads.
router.post("/create", (req, res) => {
    
});


// TODO: Stub, unfinished. Join on group and user ids, return campaign info.
router.post("/mycampaigns", (req, res) => {
    db.manyOrNone('SELECT * FROM courses')
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