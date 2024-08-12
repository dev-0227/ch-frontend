const express = require("express");
const router = express.Router();

router.get("/patient", (req, res, next) => {
    res.render("layout/trackingblank", {
        pageTitle: "Patient Trackings",
        pageKey: "../trackings/patienttracking"
    });
});

router.get("/appointment", (req, res, next) => {
    res.render("layout/trackingblank", {
        pageTitle: "Appointment Trackings",
        pageKey: "../trackings/appointmenttracking"
    });
});

router.get("/ffs", (req, res, next) => {
    res.render("layout/trackingblank", {
        pageTitle: "FFS Trackings",
        pageKey: "../trackings/ffstracking"
    });
});

module.exports = router;
