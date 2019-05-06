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
 */
router.post("/startthread", (req, res) => {
    let title = req.body['title'];
    if (title) {
        db.oneOrNone("INSERT INTO threads ((title) VALUES ($1) RETURNING id", [title])
    }
});

/**
 * Send a message.
 * Message needs to be added to the db and the recipient(s) need to be notified.
 */
router.post("/send", (req, res) => {

});

/**
 * Return messages in a thread sorted by date.
 */
router.post("/getthread", (req, res) => {

});

/**
 * 
 * @param {String} thread 
 */
function getInsertThreadId(id, title) {
    return db.task('getInsertThreadId', t => {
            return t.oneOrNone('SELECT id FROM threads WHERE id = $1 AND title = $2', [id, title], u => u && u.id)
                .then(userId => {
                    return userId || t.one('INSERT INTO threads (title) VALUES($1) RETURNING id', title, u => u.id);
                });
        });
}

module.exports = router