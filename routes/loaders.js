const express = require("express");
const router = express.Router();

router.get("/clinicdataloader", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Data Management",
        pageKey: "../loaders/clinicdataloader"
    });
});

router.get("/ptloader", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Patient Loader",
        pageKey: "../loaders/ptloader"
    });
});

router.get("/hedisloader", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Hedis Loader",
        pageKey: "../loaders/hedisloader"
    });
});

router.get("/ffsloader", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "FFS Loader",
        pageKey: "../loaders/ffsloader"
    });
});

router.get("/vitalloader", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "VItal Loader",
        pageKey: "../loaders/vitalloader"
    });
});

module.exports = router;