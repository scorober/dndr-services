const express = require('express');
const db = require('../utilities/sqlconn.js');
var router = express.Router();
const bodyParser = require("body-parser");
// This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());


/**
 * Add user to a group
 */
router.post("/addgroup", (req, res) => {
    // Parameters for the courses
    let title = req.body['title'];
    let desc = req.body['desc'];

    if (title && desc) {
        db.none("INSERT INTO groups (title, description) VALUES ($1, $2)", [title, desc])
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

/**
 * Select groups a user is in.
 */
router.post("/mygroups", (req, res) => {

    let user_id = req.body['user_id'];
    
    if (user_id) {
        db.manyOrNone('SELECT * FROM groups WHERE user_id = $1', [user_id])
            .then((data) => {
                res.send({
                    success:true,
                    groups: data
                });
            }).catch((err) => {
            console.log(err);
            res.send({
                success: false,
                error: err
            })
        })
    } else {
        res.send({
            success: false,
            input: req.body,
            error: "Invalid user id"
        });
    }
})