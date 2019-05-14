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
 * @deprecated
 */
router.post("/setdm", (req, res) => {
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

/**
 * Create a campaign. Creates a group for users of this campaign to join.
 */
router.post("/create", (req, res) => {
    const short_desc = req.body['short_desc'];
    const dm_id = req.body['dm_id'];
    const title = req.body['title'];
    // Create group for campaign and get its id.
    getInsertGroupId(short_desc)
        .then(groupId => {
            if (title && groupId) {
                db.none("INSERT INTO campaigns (group_id, dm_id, title) VALUES ($1, $2, $3)", [groupId, dm_id, title])
                .then(() => {
                    res.send({
                        success: true,
                    })
                }).catch((err) => {
                    console.log(err)
                    res.send({
                        success: false,
                        error: err
                    });
                });
            } else {
                res.send({
                    success: false,
                    input: req.body,
                    error: "Missing required  information"
                });
            }
        }).catch(err => {
            res.send({
                success: false,
                input: req.body,
                error: err
            });
        })
    
});

/**
 * Return a campaign from id or group id.
 */
router.get("/search", (req, res) => {
    const campaign_id = req.query['campaign_id']
    const group_id = req.query['group_id']

    if (campaign_id || group_id) {
        db.manyOrNone('SELECT * FROM campaigns WHERE id = $1 '
        + ' OR group_id = $2', [campaign_id, group_id])
           .then((data) => {
                res.send({
                    success: true,
                    data: data
                })
           }).catch((error) => {
            console.log(error);
            res.send({
                success: false,
                error: error
            })
        })
    }
});

/**
 * Return all campaigns a user is a part of.
 */
router.get("/mycampaigns", (req, res) => {
    const userId = req.query['user_id']

    db.manyOrNone('SELECT * FROM campaigns AS C, user_group AS G '
     + 'WHERE G.user_id = $1 AND G.group_id = C.group_id', [userId])
        .then((data) => {
            res.send({
                success: true,
                data: data
            });
        }).catch((error) => {
        console.log(error);
        res.send({
            success: false,
            error: error
        })
    });
});

/**
 * https://github.com/vitaly-t/pg-promise/blob/master/examples/select-insert.md
 * @param {String} title Title of the new campaign.
 * TODO: Title should be unique? Cancel campaign add and notify front end.
 */
function getInsertGroupId(short_desc) {
    return db.task('getInsertGroupId', t => {
            return t.oneOrNone('INSERT INTO groups(short_desc) VALUES($1) RETURNING id', short_desc, g => g.id)
        });
}

module.exports = router;