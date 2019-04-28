//express is the framework we're going to use to handle requests
const express = require('express');

//retrieve the router project from express
var router = express.Router();
const bodyParser = require("body-parser");
 
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

router.get("/", (req, res) => {
    setTimout( () => {
        res.send({
            message: "Thanks for waiting"
        });
    }, 1000);
});

router.post("/", (req, res) => {
    setTimeout( () => {
        res.send({
            message: "Waiting again??"
        });
    }, 1000);
})

module.exports = router;