var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", {
    title: "Shippler API",
    body: "Server is running on port 4000"
  });
});

module.exports = router;
