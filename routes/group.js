const express = require('express');
const db = require('../utilities/sqlconn.js');

var router = express.Router();
const bodyParser = require('body-parser');

router.use(bodyParser.json());

/**
 * Creates a new group.
 */
router.post("/create", (req, res) => {
    let title = req.body['title'];
    let shortDesc = req.body['short_desc'];

    if (title && shortDesc) {
        db.none("INSERT INTO groups (title, short_desc) VALUES ($1, $2)", [title, shortDesc])
            .then(() => {
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
 * Returnas all groups a user is in by ID.
 * TODO: JOIN with groups to return Title etc.
 */
router.post("/mygroups", (req, res) => {
    let user_id = req.body['user_id'];
    
    if (user_id) {
        db.manyOrNone('SELECT * FROM user_group WHERE user_id = $1', [user_id])
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
});

/**
 * Insert a user into a group.
 */
router.post('/adduser', (req, res) => {
    let user_id = req.body['user_id'];
    let group_id = req.body['group_id'];
    
    if (user_id && group_id) {
        db.none("INSERT INTO user_group (user_id, group_id) VALUES ($1, $2)", [user_id, group_id])
        .then(() => {
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

module.exports = router;