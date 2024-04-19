const router = require("express").Router();

router.get("/", (req, res) => {
    try {
        return res.render("index", { pageTitle: "Welcome", req, res });
    }
    catch (err) {
        return res.redirect("/");
    }
});

router.get("/about", (req, res) => {
    try {
        return res.render("about", { pageTitle: "Welcome", req, res });
    }
    catch (err) {
        return res.redirect("/");
    }
});

router.get("/contact", (req, res) => {
    try {
        return res.render("contact", { pageTitle: "Welcome", req, res });
    }
    catch (err) {
        return res.redirect("/");
    }
});

router.get("/plans", (req, res) => {
    try {
        return res.render("plans", { pageTitle: "Welcome", req, res });
    }
    catch (err) {
        return res.redirect("/");
    }
});

router.get("/services", (req, res) => {
    try {
        return res.render("index", { pageTitle: "Welcome", req, res });
    }
    catch (err) {
        return res.redirect("/");
    }
});

router.get("/faq", (req, res) => {
    try {
        return res.render("faq", { pageTitle: "Welcome", req, res });
    }
    catch (err) {
        return res.redirect("/");
    }
});


module.exports = router;