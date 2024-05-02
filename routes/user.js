const router = require("express").Router();
const { ensureAuthenticated } = require("../config/auth");
const History = require("../model/History");
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const comma = require("../utils/comma");
const Deposit = require("../model/Deposit");
const uuid = require("uuid");
const Withdraw = require("../model/Withdraw");
const nodeMailer = require("nodemailer");

router.get("/dashboard", ensureAuthenticated, (req, res) => {
    try {
        const user = req.user.toObject();
        return res.render("dashboard", { req, res, user, pageTitle: "Dashboard", comma, layout: "layout2" });
    } catch (err) {
        return res.redirect("/dashboard");
    }
});


router.get("/tradinghistory", ensureAuthenticated, (req, res) => {
    try {
        return res.render("profileRecord", { res, pageTitle: "Profile Record", req, comma, layout: "layout2" });
    } catch (err) {
        return res.redirect("/dashboard");
    }
});

router.get("/accounthistory", ensureAuthenticated, async (req, res) => {
    try {
        const deposits = await Deposit.find({ userID: req.user.id });
        const withdraws = await Withdraw.find({ userID: req.user.id });
        return res.render("accountHistory", { res, pageTitle: "Account History", deposits, withdraws, req, comma, layout: "layout2" });
    } catch (err) {
        return res.redirect("/dashboard");
    }
});

router.get("/asset-balance", ensureAuthenticated, (req, res) => {
    try {
        return res.render("assetBalance", { res, pageTitle: "Asset Balance", req, comma, layout: "layout2" });
    } catch (err) {
        return res.redirect("/dashboard");
    }
});

router.get("/buy-plan", ensureAuthenticated, (req, res) => {
    try {
        return res.render("buyPlan", { res, pageTitle: "Buy Plan", req, comma, layout: "layout2" });
    } catch (err) {
        return res.redirect("/dashboard");
    }
});

router.get("/referuser", ensureAuthenticated, (req, res) => {
    try {
        return res.render("referuser", { res, pageTitle: "Refer User", req, comma, layout: "layout2" });
    } catch (err) {
        return res.redirect("/dashboard");
    }
});

router.get("/account-settings", ensureAuthenticated, (req, res) => {
    try {
        return res.render("accountSettings", { res, pageTitle: "Account Settings", req, comma, layout: "layout2" });
    } catch (err) {
        return res.redirect("/dashboard");
    }
});

router.get("/support", ensureAuthenticated, (req, res) => {
    try {
        return res.render("support", { res, pageTitle: "Support", req, comma, layout: "layout2" });
    } catch (err) {
        return res.redirect("/dashboard");
    }
});

router.get("/withdrawals", ensureAuthenticated, (req, res) => {
    try {
        return res.render("withdrawals", { res, pageTitle: "Withdraw Funds", req, comma, layout: "layout2" });
    } catch (err) {
        return res.redirect("/dashboard");
    }
});

router.get("/withdraw-funds/:method", ensureAuthenticated, (req, res) => {
    try {
        const { method } = req.params;
        if (!method) {
            return res.redirect("/withdrawals");
        }
        if (method === "bank") {
            return res.render("bankWithdrawal", { res, pageTitle: "Withdraw Funds", req, comma, layout: "layout2" });
        }
        if (method === "ethereum") {
            return res.render("ethWithdrawal", { res, pageTitle: "Withdraw Funds", req, comma, layout: "layout2" });
        }
        if (method === "bitcoin") {
            return res.render("bitcoinWithdrawal", { res, pageTitle: "Withdraw Funds", req, comma, layout: "layout2" });
        }
        return res.redirect("/withdrawals");
    } catch (err) {
        return res.redirect("/dashboard");
    }
});

router.post("/withdraw-funds/:method", ensureAuthenticated, async (req, res) => {
    try {
        const { method } = req.params;

        const otp = Math.floor(Math.random() * 900000) + 100000;

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
            to: req.user.email,
            subject: "OTP Request",
            html: `<div>
                <h1>Greetings!</h1>
                <p>
                    You have initiated a withdrawal request, use the OTP below to complete your request.
                </p>
                <p>
                    ${otp}
                </p>
                <p>
                    Kind regards,
                </p>
            </div>`,
        };


        await User.updateOne({ _id: req.user.id }, {
            otp
        });
        await User.updateOne({ id: req.user.id }, {
            otp
        });

        await transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log(err);
            }
        })
        req.flash("success_msg", "Action Sucessful! OTP have been sent to your email");
        return res.redirect(`/withdraw-funds/${method}`)
    } catch (err) {
        return res.redirect("/dashboard");
    }
});

router.post("/withdraw-funds-method", ensureAuthenticated, async (req, res) => {
    try {
        const { method, amount, otpcode } = req.body;
        if (otpcode != req.user.otp) {
            req.flash("error_msg", "Incorrect OTP");
            return res.redirect(`/withdraw-funds/${method}`);
        }
        if (Math.abs(amount) < 50) {
            req.flash("error_msg", "You can only withdraw a minimum of $50");
            return res.redirect(`/withdraw-funds/${method}`);
        }
        if (Math.abs(amount) > req.user.balance) {
            req.flash("error_msg", "Insufficient funds");
            return res.redirect(`/withdraw-funds/${method}`);
        }
        if (req.user.withdrawEnabled) {
            req.flash("error_msg", "Withdrawal is Disabled at the moment, Please check back later");
            return res.redirect(`/withdraw-funds/${method}`);;
        }

        const reference = uuid.v1().split("-").slice(0, 3).join("");

        const newWith = new Withdraw({
            amount: Number(amount),
            method,
            userID: req.user.id,
            user: req.user,
            reference
        });

        await newWith.save();
        req.flash("success_msg", "Success, your withdrawal request is processing...");
        return res.redirect(`/withdraw-funds/${method}`);
    } catch (err) {
        console.log(err);
        return res.redirect("/dashboard");
    }
});

router.get("/deposits", ensureAuthenticated, async (req, res) => {
    try {
        const { iamount } = req.query;
        if (req.user.balance >= iamount) {
            await User.updateOne({ email: req.user.email }, {
                activeInvestment: String(iamount),
                balance: Math.abs(req.user.balance) - Math.abs(iamount)
            });
            req.flash("success_msg", "Plan activated successfully!");
            return res.redirect("/dashboard");
        } else {
            return res.render("deposit", { res, iamount, pageTitle: "Deposit", req, comma, layout: "layout2" });
        }
    } catch (err) {
        console.log(err);
        return res.redirect("/dashboard");
    }
});

router.post("/deposits", ensureAuthenticated, async (req, res) => {
    try {
        const { method, amount } = req.body;

        let network;
        let address;

        const wallets = {
            bitcoin: "bc1qga6zp95eaugufhck82rpmq7dh38clt93nggv3a",
            ethereum: "0xdC793B2dbe78cb14AC40e6b71392FeF2d82e992c",
            usdt: "TU94q3inA4XPNYYXTb15ukYEnETbiZqD5q"
        }

        const networks = {
            bitcoin: "Bitcoin",
            ethereum: "ETH",
            usdt: "TRC20"
        }

        if (!amount) {
            req.flash("Please enter the amount to deposit");
            return res.redirect("/deposits");
        }

        address = wallets[method];
        network = networks[method];

        return res.render("payment", { res, req, address, amount, method, network, pageTitle: "Deposit", layout: "layout2" });
    } catch (err) {
        return res.redirect("/dashboard");
    }
});


router.post("/deposits/payment", ensureAuthenticated, async (req, res) => {
    try {
        const {
            method,
            amount,
        } = req.body;

        if (!method || !amount) {
            req.flash("error_msg", "Fill mandatory fields");
            return res.redirect("/deposits");
        }

        const reference = uuid.v1().split("-").slice(0, 3).join("");

        const newDeposit = new Deposit({
            amount: Number(amount),
            method,
            userID: req.user.id,
            user: req.user,
            reference
        });

        const newHistory = new History({
            amount: Number(amount),
            method,
            userID: req.user.id,
            user: req.user,
            reference
        });


        await newDeposit.save();
        await newHistory.save();

        req.flash("success_msg", "Your deposit request has been submitted successfully!");
        return res.redirect("/deposits");
    } catch (err) {
        console.log(err)
        return res.redirect("/dashboard");
    }
});


router.post("/update-password", ensureAuthenticated, async (req, res) => {
    try {
        const { currentPassword, password, password2 } = req.body;

        if (!currentPassword || !password || !password2) {
            req.flash("error_msg", "Please fill all fields!");
            return res.redirect("/update-password");
        }

        if (password.length < 8) {
            req.flash("error_msg", "Password should be at least 8 characters long");
            return res.redirect("/update-password");
        }

        if (password !== password2) {
            req.flash("error_msg", "Passwords do not match");
            return res.redirect("/update-password")
        }

        const isMatch = await bcrypt.compare(currentPassword, req.user.password);

        if (!isMatch) {
            req.flash("error_msg", "Current password is incorrect");
            return res.redirect("/update-password");
        }

        return res.render("updatePassword", { res, pageTitle: "Update Password", req, comma, layout: "layout2" });
    } catch (err) {
        return res.redirect("/dashboard");
    }
});

module.exports = router;