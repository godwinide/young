const router = require("express").Router();
const nodeMailer = require("nodemailer");


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


router.post("/sendemail", async (req, res) => {
    try {
        const { subject, body, email, username, phone } = req.body;

        let transporter = nodeMailer.createTransport({
            host: "smtp.zoho.com",
            secure: true,
            port: 465,
            auth: {
                user: "info@avadigitaltrade.pro",
                pass: "TgzCkyHYTkdA",
            },
        })

        const mailOptions = {
            from: "info@avadigitaltrade.pro",
            to: "avafxtradez@aol.com",
            subject,
            html: `<div>
                <p>
                    Name: ${username}
                </p>
                <p>
                    Email: ${email}
                </p>
                <p>
                    Phone Number: ${phone}
                </p>
                <p>
                    ${body}
                </p>
            </div>`,
        };

        await transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log(err);
            }
        });

        req.flash("success_msg", "Feedback send successfully.")

        res.redirect("/#email")
    } catch (err) {
        console.log(err);
    }
});


module.exports = router;