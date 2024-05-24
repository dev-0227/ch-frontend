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
        pageKey: "../settings/user",
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

router.get("/organization", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Organization List",
        pageKey: "../settings/organization"
    })
})

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

router.get("/hedissetting", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Hedis Settings",
        pageKey: "../settings/hedissetting",
    });
});

router.get("/referralsetting", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Referral Settings",
        pageKey: "../settings/referralsetting",
    });
});

router.get("/appointmentsetting", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Appointment Settings",
        pageKey: "../settings/appointmentsetting",
    });
});

router.get("/paymentsetting", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Payment Settings",
        pageKey: "../settings/paymentsetting"
    });
});

router.get("/communicationsetting", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Communication Settings",
        pageKey: "../settings/communicationsetting"
    });
});

router.get("/contactsetting", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Contact Settings",
        pageKey: "../settings/contactsetting"
    });
});

router.get("/diagnosisgroup", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Diagnosis Group",
        pageKey: "../settings/diagnosisgroup"
    });
});

router.get("/vital", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Vitals",
        pageKey: "../settings/vital"
    });
});

router.get("/diagnosticreport", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Diagnostic Report",
        pageKey: "../settings/diagnosticreport"
    });
});

router.get("/qrcode", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "QR Code",
        pageKey: "../settings/qrcode"
    });
});

module.exports = router;