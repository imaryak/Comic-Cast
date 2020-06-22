const express = require('express');
const router = express.Router();
const passport = require('passport');
const bodyParser = require('body-parser');
const { forwardAuthenticated } = require('../config/auth');
urlencodedParser = bodyParser.urlencoded({ extended: false });
const upload = require('../config/multer');
const { check, validationResult } = require('express-validator');
const { body } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const smtpTransport = require("../config/nodemailer");
const emailVerify = require("../config/emailVerify");
const { find } = require('../models/User');

// Register Page -----------------------------------------------------------------------------------------------------------------------
router.get('/register', forwardAuthenticated, (req, res) => {
    res.render('register')
});

router.post('/register', forwardAuthenticated, urlencodedParser, upload, [
    check('password', 'Password should be minimum 8 characters').isLength({ min: 8 }),
    check('email').custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            User.findOne({email:req.body.email}, function(err, user){
                if(err) {
                    reject(new Error('Server Error'))
                }
                if(Boolean(user)) {
                    reject(new Error('E-mail already in use'))
                }
                resolve(true)
            });
        });
    }),
    check('username').custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            User.findOne({username :req.body.username}, function(err, user){
                if(err) {
                    reject(new Error('Server Error'))
                }
                if(Boolean(user)) {
                    reject(new Error('Username already in use'))
                }
                resolve(true)
            });
        });
    }),
    body('password2').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    }),
], (req, res) => {
    const { name, username, email, password, password2, dateOfBirth, gender, country, about, website} = req.body;
    let avatar;
    if(req.file){
        avatar = req.file.filename;
    } 

    var errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.render('register', {errors:errors.array()});
        console.log(errors);
    } else{
        var newUser = new User({
            name: name,
            username: username,
            email: email,
            password: password,
            dateOfBirth: dateOfBirth,
            gender: gender,
            country: country,
            about: about,
            website: website,
            avatar: avatar,
    })

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
                .save()
                .then(user => {
                    req.flash('success', 'Registration Successful, Confirm your Email and Login');
                    res.redirect('/users/login');

                    const link = "http://" + req.get('host') + "/users/verify/" + user.id ;
                    const mailOptions = {
                        from: '"Comicast" <comicast.standup@gmail.com>',
                        to : req.body.email,
                        subject : "Please confirm your Email account",
                        html : "<center><h1> Hello, Welcome to Comicast!</h1><br><br> You have been Successfully Reistered with Comicast. To confirm your email click  <a href="+link+">here</a><center> <br> In case it wasn't you who registered, ignore this mail."
                    }
                    smtpTransport.sendMail(mailOptions, function(error, response){
                        if(error){
                            console.log(error);
                            res.send(error);
                        }else{
                            console.log("Message sent");
                        }
                    });
            })
            .catch(err => console.log(err));
        });
    });
    };
} );

// Login Page --------------------------------------------------------------------------------------------------------------------------
router.get('/login', forwardAuthenticated, (req, res) => { 
    res.render('login');
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/home',
        failureRedirect: '/users/login',
        failureFlash: true
    })
    (req, res, next);
});

// Email Verification Page -------------------------------------------------------------------------------------------------------------
router.get('/verify/:id', emailVerify);

// Forgot Password Page ----------------------------------------------------------------------------------------------------------------
router.get('/password', (req, res) => { 
    res.render('password')
});

router.post('/password', (req, res) => {
    const {email_confirm} = req.body;
    User.findOne({email: email_confirm}, function (err, user){ 
        if (err) throw err;
        if(user){
            const link = "http://" + req.get('host') + "/users/password/verify/" + user.id;
            const mailOptions = {
                from: '"Comicast" <comicast.standup@gmail.com>',
                to : req.body.email_confirm,
                subject : "Reset Password",
                html : "<center><h1> Reset your Password here</h1><br><br> Click <a href="+link+">here</a> to set new password </center>"
            }
            smtpTransport.sendMail(mailOptions, function(error, response){
                if(error){
                    console.log(error);
                    res.send(error);
                }else{
                    console.log("Message sent");
                }
            });
            req.flash('success', 'Reset Password Link Sent to your Email')
            res.redirect('/users/login');
        } else {
            req.flash('error', 'No User Found')
            res.redirect("/users/password")
        }
    });
});

// Forgot Password Verification Page ---------------------------------------------------------------------------------------------------
let mongooseId;
router.get('/password/verify/:id', (req, res) => {
    mongooseId = req.params.id;
    User.findOne({_id: mongooseId}, function (err, user){ 
        if (err) throw err;
        if(user){
            res.render('passwordChange')
        }else{
            req.flash("error", "Request is from an Unknown Source");
            res.redirect("/users/login");            
        }
    });
});

router.post('/password/verify/final', forwardAuthenticated, urlencodedParser,[
    check('password', 'Password should be minimum 8 characters').isLength({ min: 8 }),
    body('password2').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    }),
], (req, res) => {
    const {password} = req.body;

    var errors = validationResult(req);

    if(!errors.isEmpty()) {
        res.render('passwordChange', {errors:errors.array()});
        console.log(errors);
    } else {
        User.findOne({_id: mongooseId}, (err, user) => {
            if (err) throw err;
            if(user){
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) {
                        throw err
                    } else {
                        bcrypt.hash(req.body.password, salt, function(err, hash) {
                            if (err) {
                                throw err
                            } else {
                                req.body.password = hash;
                                User.findByIdAndUpdate({_id: mongooseId}, {password: req.body.password}, (err, result) => {
                                    if (err) {
                                        res.send(err);
                                    } else {
                                        req.flash("success", "Password has been Changed");
                                        res.redirect("/users/login");
                                    }
                                });
                            }
                        });
                    }
                });               
            } else {  
                req.flash("error", "Request couldn't be fulfilled");
                res.redirect('/users/login')              
            }
        }); 
    }
});


// Logout-------------------------------------------------------------------------------------------------------------------------------
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;