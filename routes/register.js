/*
    Mostly webservices lab code.

*/
const express = require('express');

const crypto = require("crypto");
let db = require('../utilities/utils').db;

let getHash = require('../utilities/utils').getHash;

let sendEmail = require('../utilities/utils').sendEmail;

var router = express.Router();

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

/**
 * Add a login for a user. 
 *
 * Register a new account. Create a new entry in Login and User relations.  
 * Generate a salted_hash.
 * TODO: Send an email with registration here?
 */
router.post('/', (req, res) => {
    res.type("application/json");

    //Retrieve data from query params
    var username = req.body['username'];
    var email = req.body['email'];
    var password = req.body['password'];

  
    if(username && email && password) {
        //We're storing salted hashes to make our application more secure
        //If you're interested as to what that is, and why we should use it
        //watch this youtube video: https://www.youtube.com/watch?v=8ZtInClXe1Q
        let salt = crypto.randomBytes(32).toString("hex");
        let salted_hash = getHash(password, salt);

        getInsertUserId(username)
        .then(userId => {
            let params = [userId, email, salted_hash, salt];
            // Use .none() since no result gets returned from an INSERT in SQL
            // We're using placeholders ($1, $2, $3) in the SQL query string to avoid SQL Injection
            // If you want to read more: https://stackoverflow.com/a/8265319
            db.none("INSERT INTO logins (user_id, email, password, salt) VALUES ($1, $2, $3, $4)", params)
            .then(() => {
                res.send({
                    success: true,
                    user_id: userId, // Return generated user Id to front end.
                });
                // sendEmail("uwnetid@uw.edu", email, "Welcome!", "<strong>Welcome to our app!</strong>");
            }).catch((err) => {
            console.log(err);
            res.send({
                success: false,
                error: err
            });
        });
        }).catch(err => {
            console.log(err);
        });
    } else {
        res.send({
            success: false,
            input: req.body,
            error: "Missing required login information"
        });
    }
});


/**
 * https://github.com/vitaly-t/pg-promise/blob/master/examples/select-insert.md
 * @param {String} username Username of new user.
 * Inserts user into the users table OR finds the entry for the same username. 
 * Returns the id for that user.
 * 
 * TODO: If the username exists the registration should be aborted and 
 * user notified.
 */
function getInsertUserId(username) {
    return db.task('getInsertUserId', t => {
            return t.oneOrNone('SELECT id FROM users WHERE username = $1', username, u => u && u.id)
                .then(userId => {
                    return userId 
                    || t.one('INSERT INTO users(username) VALUES($1) RETURNING id', username, u => u.id);
                });
        });
}
module.exports = router;