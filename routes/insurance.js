const express = require("express");
const router = express.Router();


router.get("/list", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Insurance List",
        pageKey: "../insurance/list"
    });
});

router.get("/lob", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Insurance LOB",
        pageKey: "../insurance/inslob"
    });
});

module.exports = router;
