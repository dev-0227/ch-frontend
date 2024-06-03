const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Hedis",
        pageKey: "../hedis/hedis"
    });
});

router.get("/appointment", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Appointment",
        pageKey: "../appointments/appointment"
    });
});

router.get("/referral", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Referral Tracking",
        pageKey: "../hedis/referral"
    });
});

router.get("/referrals", (req, res, next) => {
    res.render("layout/jexcelblank", {
        pageTitle: "Referral Tracking",
        pageKey: "../hedis/referralExcel"
    });
});

router.get("/report", (req, res, next) => {
    res.render("layout/jexcelblank", {
        pageTitle: "Hedis Report",
        pageKey: "../hedis/report"
    });
});
router.get("/daily", (req, res, next) => {
    res.render("layout/jexcelblank", {
        pageTitle: "Hedis Daily",
        pageKey: "../hedis/daily"
    });
});

router.get("/noncompliant", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Hedis Non Utilizers",
        pageKey: "../hedis/noncompliant"
    });
});

router.get("/conciergereport", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Hedis Concierge Report",
        pageKey: "../hedis/conciergereport"
    });
});

router.get("/population", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Hedis Popluation",
        pageKey: "../hedis/population"
    });
});
router.get("/monthreport", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Hedis Monthly Report",
        pageKey: "../hedis/monthreport"
    });
});
router.post("/access", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Hedis Work Report",
        pageKey: "../hedis/access",
        sdate: req.body.sdate,
        edate: req.body.edate,
    });
});
router.get("/query", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Hedis Query Builder",
        pageKey: "../hedis/querybuilder"
    });
});
module.exports = router;