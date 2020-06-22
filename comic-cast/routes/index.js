const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
router.get('/home', ensureAuthenticated, (req, res) => {
    res.render('home', {
        user: req.user
    });
});

// Profile Page
router.get('/user', ensureAuthenticated, (req, res) => {
    res.render('user',{
        user : req.user
    });
});

module.exports = router;
