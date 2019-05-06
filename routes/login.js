//express is the framework we're going to use to handle requests
const express = require('express');

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

let getHash = require('../utilities/utils').getHash;

var router = express.Router();

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

//Pull in the JWT module along without a secret key
let jwt = require('jsonwebtoken');
let config = {
    secret: process.env.JSON_WEB_TOKEN
};

/**
 * Logs the user in using JWT.
 * Returns the user id of the login.
 */
router.post('/', (req, res) => {
    let email = req.body['email'];
    let theirPw = req.body['password'];
    
    if(email && theirPw) {
        //Using the 'one' method means that only one row should be returned
        db.one('SELECT user_id, password, salt FROM logins WHERE email=$1', [email])
            .then(row => { //If successful, run function passed into .then()
                let salt = row['salt'];
                //Retrieve our copy of the password
                let ourSaltedHash = row['password'];

                //Combined their password with our salt, then hash
                let theirSaltedHash = getHash(theirPw, salt);

                //Did our salted hash match their salted hash?
                let wasCorrectPw = ourSaltedHash === theirSaltedHash;

                if (wasCorrectPw) {
                    //credentials match. get a new JWT  
                    // optional for project
                    let token = jwt.sign({username: email},
                        config.secret,
                        {
                            expiresIn: '24h' // expires in 24 hours
                        }
                    );
                    //package and send the results
                    res.json({
                        success: true,
                        message: 'Authentication successful!',
                        token: token,
                        user_id: row.user_id  // return user id belonging to login
                    });
                } else {
                    //credentials did not match
                    res.send({
                        success: false,
                        message: 'Credentials do not match'
                    });
                }
            })
            //More than one row shouldn't be found, since table has constraint on it
            .catch((err) => { // Ending up here when loggin in 
                //If anything happened, it wasn't successful
                res.send({
                    success: false,
                    message: err
                });
            });
    } else {
        res.send({
            success: false,
            message: 'missing credentials'
        });
    }
});

module.exports = router;