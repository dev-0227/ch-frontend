const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Database",
        pageKey: "../database/index"
    });
});

router.get("/import/entityType", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Database Import Audit-Entity-Type",
        pageKey: "../database/import/entity_type"
    });
});

router.get("/import/eventType", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Database Import Audit-Event-Type",
        pageKey: "../database/import/event_type"
    });
});
router.get("/import/eventSubType", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Database Import Audit-Event-Sub-Type",
        pageKey: "../database/import/event_sub_type"
    });
});

router.get("/import/languages", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Database Import Languages",
        pageKey: "../database/import/languages"
    });
});

router.get("/import/currencies", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Database Import Currencies",
        pageKey: "../database/import/currencies"
    });
});

router.get("/import/coverageType", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Database Import Coverage Type",
        pageKey: "../database/import/coverageType"
    });
});

router.get("/import/race", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Database Import Race",
        pageKey: "../database/import/race"
    });
});

router.get("/import/ethnicity", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Database Import Ethnicity",
        pageKey: "../database/import/ethnicity"
    });
});

router.get("/import/fhir_types", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Database Import fhir Types",
        pageKey: "../database/import/fhir_types"
    });
});

router.get("/import/jurisdiction", (req, res, next) => {
    res.render("layout/mainblank", {
        pageTitle: "Database Import Jurisdiction",
        pageKey: "../database/import/jurisdiction"
    });
});

module.exports = router;



