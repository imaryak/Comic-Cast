const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');

const User = require('../models/User');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'username', passReqToCallback: true}, (req, username, password, done) => {
            // Match user
            User.findOne({
                username: username
                }).then(user => {
                    if (!user) {
                    return done(null, false, req.flash('error', 'Username not registered'));
                    } else if(!user.confirmed){
                    return done(null, false, req.flash('error', 'Email not verified'));  
                    }

            // Match password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                    if (isMatch) {
                    return done(null, user);
                    } else {
                    return done(null, false, req.flash('error', 'Password is invalid'));
                }
            });
        });
    })
);

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
        });
    });
};