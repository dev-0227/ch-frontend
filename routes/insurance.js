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

router.get("/type", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Insurance Type",
        pageKey: "../insurance/instype"
    });
});

router.get("/pay", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Insurance Payment Method",
        pageKey: "../insurance/inspayform"
    });
});

module.exports = router;
