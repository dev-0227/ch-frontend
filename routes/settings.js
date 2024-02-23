const express = require("express");

const router = express.Router();

router.get("/setting", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Settings",
        pageKey: "../settings/setting"
    });
});

router.get("/specialist", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Specialist List",
        pageKey: "../settings/specialist"
    });
});
router.get("/manager", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "User List",
        pageKey: "../settings/manager"
    });
});
router.get("/users", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "User List",
        pageKey: "../settings/user"
    });
});

router.get("/role", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Role List",
        pageKey: "../settings/role"
    });
});
router.get("/permission", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Permission List",
        pageKey: "../settings/permission"
    });
});
router.post("/logger", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Audit Event",
        pageKey: "../settings/logger",
        sdate: req.body.sdate,
        edate: req.body.edate,
    });
});

router.get("/clinic", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Clinics",
        pageKey: "../settings/clinic"
    });
});

module.exports = router;