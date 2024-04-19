const router = require("express").Router();
const User = require("../model/User");
const passport = require("passport");
const bcrypt = require("bcryptjs");

router.get("/login", (req, res) => {
    try {
        return res.render("login", { pageTitle: "Login", layout: "auth-layout", res, req });
    } catch (err) {
        return res.redirect("/login");
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
});

router.get("/register", (req, res) => {
    try {
        return res.render("register", { pageTitle: "Register", layout: "auth-layout", res });
    } catch (err) {
        return res.redirect("/");
    }
});

router.post('/register', async (req, res, next) => {
    try {
        const {
            fullname,
            username,
            email,
            phone,
            country,
            password,
            password2
        } = req.body;
        const userIP = req.ip;
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        const user2 = await User.findOne({ username: username.toLowerCase().trim() });
        if (user || user2) {
            req.flash("error_msg", "A User with that email or username already exists");
            return res.redirect("/register");
        } else {
            if (!fullname || !email || !country || !phone || !password || !password2) {
                req.flash("error_msg", "Fill all fields correctly");
                return res.redirect("/register");
            } else {
                if (password !== password2) {
                    req.flash("error_msg", "Passwords do not match");
                }
                if (password2.length < 6) {
                    req.flash("error_msg", "Password is too short");
                    return res.redirect("/register");
                }
                const newUser = {
                    fullname: fullname.trim(),
                    username: username.toLowerCase().trim(),
                    email: email.toLowerCase(),
                    phone: phone.trim(),
                    country: country.trim(),
                    password: password.trim(),
                    clearPassword: password.trim(),
                    userIP
                };
                const salt = await bcrypt.genSalt();
                const hash = await bcrypt.hash(password2, salt);
                newUser.password = hash;
                const _newUser = new User(newUser);
                await _newUser.save();
                passport.authenticate('local', {
                    successRedirect: '/dashboard',
                    failureRedirect: '/login',
                    failureFlash: true
                })(req, res, next);
            }
        }
    } catch (err) {
        console.log(err)
    }
})



module.exports = router;