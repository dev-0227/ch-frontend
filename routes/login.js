const express = require("express");

const router = express.Router();
router.get("/", (req, res, next) => {
    res.render("layout/blank", {
        pageTitle: "Login",
        pageKey: "../auth/login",
        redirect:req.query.page
    });
});
router.get("/signup", (req, res, next) => {
    res.render("layout/blank", {
        pageTitle: "Sign Up",
        pageKey: "../auth/signup"
    });
});
router.get("/forgot", (req, res, next) => {
    res.render("layout/blank", {
        pageTitle: "Forgot Password",
        pageKey: "../auth/forgot_password"
    });
});
router.get("/resetpwd", (req, res, next) => {
    res.render("layout/blank", {
        pageTitle: "Reset Password",
        pageKey: "../auth/resetpwd"
    });
});
router.get("/register", (req, res, next) => {
    res.render("layout/blank", {
        pageTitle: "Register",
        pageKey: "../auth/register"
    });
});
router.get("/security", (req, res, next) => {
    res.render("layout/blank", {
        pageTitle: "Security Question",
        pageKey: "../auth/security"
    });
});
router.get("/paymentgate", (req, res, next) => {
    res.render("layout/blank", {
        pageTitle: "Payment By Patient",
        pageKey: "../auth/paymentgate"
    });
});
router.get("/404", (req, res, next) => {
    res.render("layout/blank", {
        pageTitle: "404",
        pageKey: "../pages/404page"
    });
});
router.get("/success_payment", (req, res, next) => {
    res.render("layout/blank", {
        pageTitle: "Succssful",
        pageKey: "../pages/success_payment"
    });
});
router.get("/cancel_payment", (req, res, next) => {
    res.render("layout/blank", {
        pageTitle: "Canceled",
        pageKey: "../pages/cancel_payment"
    });
});
router.get("/success_payment_credit", (req, res, next) => {
    res.render("layout/blank", {
        pageTitle: "Succssful",
        pageKey: "../pages/success_payment_credit"
    });
});
router.get("/contact", (req, res, next) => {
    res.render("layout/blank", {
        pageTitle: "Contact Us",
        pageKey: "../pages/contact"
    });
});
router.get("/connection", (req, res, next) => {
    res.render("layout/blank", {
        pageTitle: "Contact Us",
        pageKey: "../pages/connection"
    });
});
module.exports = router;