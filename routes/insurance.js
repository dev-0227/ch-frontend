const express = require("express");
const router = express.Router();


router.get("/list", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Insurance List",
        pageKey: "../insurance/list"
    });
});

module.exports = router;
