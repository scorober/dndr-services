const express = require('express');
const db = require('../utilities/sqlconn.js');

var router = express.Router();
const bodyParser = require('body-parser');

router.use(bodyParser.json());

/**
 * @deprecated Use '/search' instead
 */
router.get("/user", (req, res) => {
    const user_id = req.query['user_id'];
    db.manyOrNone('SELECT * FROM users WHERE id = $1', [user_id])
    .then((data) => {
        res.send({
            success:true,
            data: data
        });
    }).catch((err) => {
        console.log(err);
        res.send({
            success: false,
            error: err
        })
    })
});



router.get("/users", (req, res) => {
    db.manyOrNone('SELECT * FROM users')
    .then((data) => {
        res.send({
            success: true,
            data: data
        });
    }).catch((err) => {
        console.log(err);
        res.send({
            success: false,
            error: err
        })
    })
});

/** 
 * GET request to search for a user by username or id.
 */
router.get("/search", (req, res) => {

    const username = req.query['username'];
    const id = req.query['user_id'];

    if (username) {
        param = '%' + username + '%'
        db.manyOrNone("SELECT * FROM users WHERE username LIKE $1", [param])
            .then((data) => {
                res.send({
                    success:true,
                    data: data
                });
            }).catch((err) => {
            console.log(err);
            res.send({
                success: false,
                error: err
            })
        })
    } else if (id) {
        db.manyOrNone('SELECT * FROM users WHERE id = $1', [id])
        .then((data) => {
            res.send({
                success:true,
                results: data
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
            error: "Invalid user credentials"
        });
    }
});

/**
 * Updates all profile fields of a user.
 * TODO: Can we dynamically update user profiles in one query with a varying
 * amount of parameters, or do we have to create separate promises for each field?
 * 
 * Right now front end will have to just resend the non-updated text if the user wants
 * to update less than all four fields. 
 */
router.post("/update", (req, res) => {
    let user_id = req.body['user_id'];
    let shortDesc = req.body['short_desc'];
    let longDesc = req.body['long_desc'];
    let playerLevel = req.body['player_level']


    if (user_id && longDesc && shortDesc && playerLevel) {
        db.none("UPDATE users SET short_desc = $1, long_desc = $2, "
                + "player_level = $3 WHERE id = $4",
                [shortDesc, longDesc, playerLevel, user_id])
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
 * Adds a pending friend request.
 */
router.post("/addfriend", (req, res) => {
    // Set user1_id to lowest value in friends id pair.
    let user1_id = Math.min(req.body['user1_id'], req.body['user2_id']);
    let user2_id = Math.max(req.body['user1_id'], req.body['user2_id']);
    
    if (user1_id && user2_id) {
        db.none("INSERT INTO friends (user1_id, user2_id) VALUES ($1, $2)", [user1_id, user2_id])
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
 * Accept a pending friend request by setting pending false.
 */
router.post("/acceptfriend", (req, res) => {
    const friend_id = req.body['friend_id'];
    if (friend_id) {
        db.none("UPDATE friends SET pending = FALSE WHERE id = $1", [friend_id])
        .then(() => {
            res.send({
                success:true,
            })
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
            error: "Invalid id"
        });
    } 
});

/**
 * GET all friends or pending friend requests.  Returns pending requests if requests is set to true.
 * TODO: Not finished, everything below hasn't been tested/passed
 */
router.get("/friends", (req, res) => {
    const user_id = req.query['user_id'];
    const requests = parseInt(req.query['requests']);
    if (user_id && requests == 1) { // Returns list of friend requests
        db.manyOrNone('SELECT U.username, U.short_desc, F.id, F.pending FROM friends AS F, users AS U' 
            +' WHERE (F.user1_id = $1 OR F.user2_id = $1) AND F.pending = TRUE AND U.id != $1', [user_id])
            .then((data) => {
                res.send({
                    success:true,
                    data: data
                })
            }).catch((err) => {
                console.log(err);
                res.send({
                    success: false,
                    error: err
                })
            })
    } else if (user_id && requests == 2) { // Returns list of friends
        db.manyOrNone('SELECT U.username, U.short_desc, F.id, F.pending FROM friends AS F, users AS U' 
        +' WHERE (F.user1_id = $1 OR F.user2_id = $1) AND F.pending = FALSE AND U.id != $1', [user_id])
        .then((data) => {
            res.send({
                success:true,
                data: data
            })
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
            error: "Invalid parameters"
        });
    }
});

/**
 * Remove a friendship
 * TODO: Will the friend_id be readily accessible or do we want to delete by user1/user2 ids?
 */
router.post("/removefriend", (req, res) => {
    const friend_id = req.body['friend_id'];
    if (friend_id) {
        db.none("DELETE FROM friends WHERE id = $1", [friend_id])
        .then((data) => {
            res.send({
                success:true,
                groups: data
            })
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
            error: "Invalid friend id"
        });
    }
});

/**
 * Add a review.
 */
router.post("/addreview", (req, res) => {
    const reviewed_id = req.body['reviewed_id'];
    const reviewer_id = req.body['reviewer_id'];
    const body = req.body['body'];
    const ranking = req.body['ranking'];

    if (reviewed_id && reviewer_id && body && ranking) {
        db.none('INSERT INTO reviews (reviewer_id, reviewed_id, body, ranking) VALUES ($1, $2, $3, $4)', [reviewer_id, reviewed_id, body, ranking])
            .then(() => {
                res.send({
                    success: true
                });
            }).catch((err) => {
            //log the error
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
            error: "Missing required information"
        });
    }

});

// TODO: remove/ edit reviews. 
module.exports = router;