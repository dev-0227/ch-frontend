const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
    res.render("layout/jexcelblank", {
        pageTitle: "Patient List",
        pageKey: "../patients/ptlist"
    });
});

module.exports = router;