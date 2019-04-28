const express = require('express');

const db = require('../utilities/sqlconn.js');

var router = express.Router();

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

router.post("/addcourse", (req, res) => {
    // Parameters for the courses
    let id = req.body['id'];
    let shortdesc = req.body['shortdesc'];
    let longdesc = req.body['longdesc'];
    let prereqs = req.body['prereqs'];

    if (id && shortdesc && longdesc && prereqs) {
        db.none("INSERT INTO courses VALUES ($1, $2, $3, $4)", [id, shortdesc, longdesc, prereqs])
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