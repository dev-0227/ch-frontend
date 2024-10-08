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
        pageKey: "../specialists/specialist"
    });
});

router.get("/providers", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Clinic Providers",
        pageKey: "../providers/providers"
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
        pageTitle: "Organization Management",
        pageKey: "../organizations/organization"
    })
})

router.get("/organizationtype", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Organization Type List",
        pageKey: "../organizations/organizationtype"
    })
})

router.get("/qualification", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Qualification List",
        pageKey: "../settings/qualification"
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

router.get("/insurancesetting", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Insurance Settings",
        pageKey: "../settings/insurancesetting",
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



router.get("/report-measureReportDefinition", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Measure Report Definition",
        pageKey: "../settings/report/measureReportDefinition"
    });
});

router.get("/report-hedis-quality-program", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "HEDIS Quality Program",
        pageKey: "../settings/report/hedisQualityProgram"
    });
});

router.get("/report-hedis-report-builder", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Measure Report Definition",
        pageKey: "../settings/report/hedisReportBuilder"
    });
});

router.get("/report-hedis-quality-tracker", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "HEDIS Quality Tracker",
        pageKey: "../settings/report/hedisQualityTracker"
    });
});

/* 
* settings for PK Risk and Barriers
*/
router.get("/barriers_ptrisk", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "PT Risk",
        pageKey: "../settings/barriers/ptrisk"
    });
});

router.get("/barriers_disability", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Disability",
        pageKey: "../settings/barriers/disability"
    });
});

router.get("/barriers_communicationneeds", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Communication Needs",
        pageKey: "../settings/barriers/communicationneeds"
    });
});
//

/* 
* settings for Medication Adherance
*/
router.get("/medadherance", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Medications",
        pageKey: "../settings/medadherance/medications"
    });
});

router.get("/medadheranceDispense", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Medications Dispense",
        pageKey: "../settings/medadherance/medicationsDispense"
    });
});

router.get("/medadheranceRequest", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Medications Request",
        pageKey: "../settings/medadherance/medicationsRequest"
    });
});
//


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

router.get("/lab", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Laboratory",
        pageKey: "../settings/lab"
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

router.get('/ecwbulk', (req, res, next) => {
    res.render('layout/mainblank', {
        pageTitle: 'ECW Bulk',
        pageKey: '../settings/ecwbulk'
    })
})

// Affiliation
router.get('/affiliation_list', (req, res, next) => {
    res.render('layout/mainblank', {
        pageTitle: 'Affiliations',
        pageKey: '../affiliation/list'
    })
})

router.get('/affiliation_insurance', (req, res, next) => {
    res.render('layout/mainblank', {
        pageTitle: 'Insurance Affiliation',
        pageKey: '../affiliation/ins'
    })
})

module.exports = router;
