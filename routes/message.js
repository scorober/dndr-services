/*
    Messaging endpoint, unfinished.

*/

const express = require('express');
const db = require('../utilities/sqlconn.js');
var router = express.Router();
const bodyParser = require('body-parser');

router.use(bodyParser.json());


/**
 * First message thread... need a helper function to insert messages into db?
 * @deprecated
 */

router.post("/createthread", (req, res) => {
    const title = req.body['title'];
    const userId = req.body['user_id'];
    const recipientId = req.body['recipient_id'];

    if (userId && recipientId) {
        getInsertThreadId(title)
        .then((threadId) => {
            db.tx(t => {
                return t.batch([
                    t.none('INSERT INTO user_thread (user_id, thread_id) VALUES ($1, $2)', [userId, threadId]),
                    t.none('INSERT INTO user_thread (user_id, thread_id) VALUES ($1, $2)', [recipientId, threadId])
                ]);
            }).then(() => {
                res.send({
                    success: true,
                    threadId: threadId
                })
            }).catch(err => {
                res.send({
                    success: false,
                    error: err
                });
            })
        }).catch((err) => {
            res.send({
                success: false,
                error: err
            });
        })
    } else {
        res.send({
            success: false,
            input: req.body,
            error: "Missing required information"
        });
    }
});

/**
 * Send a message.
 * Message needs to be added to the db and the recipient(s) need to be notified.
 */
router.post("/send", (req, res) => {

    const message = req.body['message'];
    const userId = req.body['user_id'];
    const recipientId = req.body['recipient_id'];

    if (message && userId && recipientId) {
        // Create or find an existing thread
        getThreadId(userId, recipientId, "msg")
        .then((threadId) => {
            console.log(threadId)
            //this could be part of a transaction
            db.one('INSERT INTO messages (sender_id, message_body) VALUES ($1, $2) RETURNING id', [userId, message], u => u && u.id)
            .then((messageId) => {
                // Needs previous queries id
                db.none('INSERT INTO message_thread (thread_id, message_id) VALUES ($1, $2)', [threadId, messageId])
                .then(() => {
                    // TODO: need to check if this exists first
                    // Checks if triple exists and creates one if not present.
                    // redundant thens here...
                    // insertThreadUsers(userId, recipientId, threadId)
                    let user1 = Math.min(userId, recipientId);
                    let user2 = Math.max(userId, recipientId);
                    db.oneOrNone('SELECT id FROM user_thread WHERE user_id = $1 AND recipient_id = $2 AND thread_id = $3', [user1, user2, threadId])
                    .then(id => {
                        if(id) {
                            res.send({
                                success: true,
                                threadId: threadId
                            })
                        } else {
                            db.none("INSERT INTO user_thread (user_id, recipient_id, thread_id) VALUES ($1, $2, $3)", [user1, user2, threadId])
                            .then(() => {
                                res.send({
                                    success: true,
                                    threadId: threadId
                                })
                            })
                        }
                    }).catch((err) => {
                        res.send({
                            success: false,
                            error: err
                        });
                    })
                 
                })
                .catch((err) => {
                    console.log(err)
                    res.send({
                        pller: 'aeoag',
                        success: false,
                        error: err
                    });
                });
            })
            .catch(err => {
                console.log(err)
                res.send({
                    success: false,
                    error: err
                });
            });
        }).catch((err) => {
            console.log("help)")
            res.send({
                success: false,
                error: err
            });
        });
    }
});  


router.get("/threads", (req, res) => {
    const userId = req.query['user_id'];
    if (userId) {
        db.manyOrNone('SELECT T.id FROM threads AS T, user_thread AS U WHERE U.user_id = $1 OR U.recipient_id = $1', userId)
        .then((data) => {
            res.send({
                success: true,
                data: data
            });
        })
        .catch(err => {
            res.send({
                success: false,
                error: err
            })
        })
    }
});
/**
 * Return messages in a thread sorted by date.
 */
router.get("/thread", (req, res) => {
    const threadId = req.query['thread_id'];
    if (threadId) {
        db.manyOrNone('SELECT M.sender_id, M.message_body, M.create_date FROM messages AS M, message_thread AS T WHERE T.thread_id = $1 AND M.id = T.message_id ORDER BY M.create_date ASC', threadId)
        .then(data => {
            res.send({
                success: true,
                data: data
            })
        })
    }
});


/**
 * 
 * @param {String} thread 
 */
function getThreadId(userId, recipientId, title) {
    let user1 = Math.min(userId, recipientId);
    let user2 = Math.max(userId, recipientId)
    return db.task('getInsertThreadId', t => {
            return t.oneOrNone('SELECT thread_id FROM user_thread WHERE (user_id = $1) AND (recipient_id = $2)', [user1, user2], u => u && u.thread_id)
                .then(threadId => {
                    console.log(threadId)
                    if (threadId) {
                        return threadId
                    } else {
                        return getInsertThreadId(title)
                    }
                }).catch((err) => {
                    console.log(err)
                })
        });
}

function getInsertThreadId(title) {
    if (!title) title = "";
        return db.one('INSERT INTO threads (title) VALUES ($1) RETURNING id', title, u => u && u.id)
            .then(threadId => {
                return threadId
            });
}

function insertThreadUsers(userId, recipientId, threadId) {
    if (userId && recipientId) {
        // if (!title) title = "";
        let user1 = Math.min(userId, recipientId);
        let user2 = Math.max(userId, recipientId);
        db.oneOrNone('SELECT id FROM user_thread WHERE user_id = $1 AND recipient_id = $2 AND thread_id = $3', [user1, user2, threadId])
        .then(id => {
            if(id) {
                return;
            } else {
                db.none("INSERT INTO user_thread (user_id, recipient_id, thread_id) VALUES ($1, $2, $3)", [user1, user2, threadId])
                .then(() => {
                    return;
                })
            }
        })


    } else {
        res.send({
            success: false,
            input: req.body,
            error: "Missing required information"
        });
    }
}

module.exports = router