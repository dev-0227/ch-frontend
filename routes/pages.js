const express = require("express");

const router = express.Router();
router.get("/dash", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Dashboard",
        pageKey: "../pages/dash"
    });
});
router.get("/qrcode", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "QR Code",
        pageKey: "../pages/qrcode"
    });
});


router.get("/clinic", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Clinics",
        pageKey: "../pages/clinic"
    });
});
router.get("/profile", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Profile",
        pageKey: "../pages/profile"
    });
});
router.get("/setting", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Settings",
        pageKey: "../pages/setting"
    });
});
router.get("/hedis", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Hedis",
        pageKey: "../pages/hedis"
    });
});
router.get("/hedisloader", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Hedis Loader",
        pageKey: "../pages/hedisloader"
    });
});
router.get("/clinicdataloader", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Data Management",
        pageKey: "../pages/clinicdataloader"
    });
});
router.get("/ptloader", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Patient Loader",
        pageKey: "../pages/ptloader"
    });
});
router.get("/ffsloader", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "FFS Loader",
        pageKey: "../pages/ffsloader"
    });
});
router.get("/ptlist", (req, res, next) => {
    res.render("jexcelblank", {
        pageTitle: "Patient List",
        pageKey: "../pages/ptlist"
    });
});
router.get("/hedisreport", (req, res, next) => {
    res.render("jexcelblank", {
        pageTitle: "Hedis Report",
        pageKey: "../pages/hedisreport"
    });
});
router.get("/hedisdaily", (req, res, next) => {
    res.render("jexcelblank", {
        pageTitle: "Hedis Daily",
        pageKey: "../pages/hedisdaily"
    });
});
router.get("/hedisnoncompliant", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Hedis Non Utilizers",
        pageKey: "../pages/hedisnoncompliant"
    });
});
router.get("/conciergereport", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Hedis Concierge Report",
        pageKey: "../pages/conciergereport"
    });
});
router.get("/hedispopulation", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Hedis Popluation",
        pageKey: "../pages/hedispopulation"
    });
});
router.get("/invoice", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Invoice",
        pageKey: "../pages/invoice"
    });
});
router.get("/hedissetting", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Hedis Settings",
        pageKey: "../pages/hedissetting"
    });
});
router.get("/paymentsetting", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Payment Settings",
        pageKey: "../pages/paymentsetting"
    });
});
router.get("/communicationsetting", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Communication Settings",
        pageKey: "../pages/communicationsetting"
    });
});
router.get("/generatemodule", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Generate Module",
        pageKey: "../pages/generatemodule"
    });
});
router.get("/contactsetting", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Contact Settings",
        pageKey: "../pages/contactsetting"
    });
});
router.get("/notesview", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "All Notes",
        pageKey: "../pages/notesview"
    });
});
router.get("/paid", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "FFS Paid",
        pageKey: "../pages/paid"
    });
});
router.get("/ptrespon", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "PT Responsibility",
        pageKey: "../pages/ptrespon"
    });
});
router.get("/claims", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Claims",
        pageKey: "../pages/claims"
    });
});
router.get("/multibill", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Multi Bill",
        pageKey: "../pages/multibill"
    });
});
router.post("/multibillview", (req, res, next) => {
    res.render("nosiderblank", {
        pageTitle: "Multibill",
        pageKey: "../pages/multibillview",
        sdate: req.body.sdate,
        edate: req.body.edate,
    });
});
router.post("/copaynonpaidview", (req, res, next) => {
    res.render("jexcelblank", {
        pageTitle: "Copay Non Paid",
        pageKey: "../pages/copaynonpaidview",
        sdate: req.body.sdate,
        edate: req.body.edate,
    });
});
router.post("/copayinvoice", (req, res, next) => {
    res.render("nosiderblank", {
        pageTitle: "Copay Invoice",
        pageKey: "../pages/copayinvoice",
        id: req.body.id,
        ptid: req.body.ptid,
        cadjcheck: req.body.cadjcheck,
        dadjcheck: req.body.dadjcheck,
        copay: req.body.copay,
        copay_adj: req.body.copay_adj,
        deduct: req.body.deduct,
        deduct_adj: req.body.deduct_adj,
    });
});
router.post("/defpaidview", (req, res, next) => {
    res.render("nosiderblank", {
        pageTitle: "FFS Paid",
        pageKey: "../pages/defpaidview",
        sdate: req.body.sdate,
        edate: req.body.edate,
    });
});
router.post("/avgpaidview", (req, res, next) => {
    res.render("nosiderblank", {
        pageTitle: "FFS Paid",
        pageKey: "../pages/avgpaidview",
        sdate: req.body.sdate,
        edate: req.body.edate,
    });
});
router.post("/pcppaidview", (req, res, next) => {
    res.render("nosiderblank", {
        pageTitle: "FFS Paid",
        pageKey: "../pages/pcppaidview",
        sdate: req.body.sdate,
        edate: req.body.edate,
    });
});
router.post("/cptpaidview", (req, res, next) => {
    res.render("nosiderblank", {
        pageTitle: "FFS Paid",
        pageKey: "../pages/cptpaidview",
        sdate: req.body.sdate,
        edate: req.body.edate,
    });
});
router.post("/areacptpaidview", (req, res, next) => {
    res.render("nosiderblank", {
        pageTitle: "FFS Paid",
        pageKey: "../pages/areacptpaidview",
        sdate: req.body.sdate,
        edate: req.body.edate,
        group: req.body.group,
        spec: req.body.spec,
        type: req.body.type,
    });
});
router.post("/superbillview", (req, res, next) => {
    res.render("nosiderblank", {
        pageTitle: "FFS Paid",
        pageKey: "../pages/superbillview",
        sdate: req.body.sdate,
        edate: req.body.edate,
        ins: req.body.ins,
        spec: req.body.spec,
        type: req.body.type,
    });
});
router.get("/hedismonthreport", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Hedis Monthly Report",
        pageKey: "../pages/hedismonthreport"
    });
});
router.get("/insurance", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Insurance List",
        pageKey: "../pages/insurance"
    });
});
router.get("/inslob", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Insurance LOB",
        pageKey: "../pages/inslob"
    });
});
router.get("/creditsms", (req, res, next) => {
    res.render("nosiderblank", {
        pageTitle: "Credit Panel",
        pageKey: "../pages/credit"
    });
});
router.post("/deductiblereport", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Deductible Report",
        pageKey: "../pages/deductiblereport",
        sdate: req.body.sdate,
        edate: req.body.edate,
    });
});
router.post("/copayreport", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Copay Report",
        pageKey: "../pages/copayreport",
        sdate: req.body.sdate,
        edate: req.body.edate,
    });
});
router.get("/contactlist", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Contacts",
        pageKey: "../pages/contactlist"
    });
});
router.get("/ticket", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Connections",
        pageKey: "../pages/ticket"
    });
});
router.post("/hedisaccess", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Hedis Work Report",
        pageKey: "../pages/hedisaccess",
        sdate: req.body.sdate,
        edate: req.body.edate,
    });
});
router.post("/accessdetail", (req, res, next) => {
    res.render("nosiderblank", {
        pageTitle: "Hedis Work Details",
        pageKey: "../pages/accessdetail",
        userid: req.body.userid,
        sdate: req.body.sdate,
        edate: req.body.edate,
    });
});
router.get("/hedisquery", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Hedis Query Builder",
        pageKey: "../pages/hedisquerybuilder"
    });
});
router.get("/diagnosisgroup", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Diagnosis Group",
        pageKey: "../pages/diagnosisgroup"
    });
});
module.exports = router;