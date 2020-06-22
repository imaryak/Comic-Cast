const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const multer = require('multer');
const helmet = require('helmet');

//mongoose connectin
mongoose.connect('mongodb://localhost/comicast3', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

//App Initialization
const app = express();
const port = 3013;

// Passport Config
require('./config/passport')(passport);

// helmet Start, contains 11 packages relating to various security features
app.use(helmet());

// View Engine
app.set('view engine', 'pug');
app.set('views', './views');

// Body Parser Middleware
// body-parser allows express to read the body and then parse that into a Json object that we can understand
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Seting Static Folder for all media and stylesheets
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for express-sessions
// When user login to any system, they can see their activity based on their ID. So we need to store user’s ID into a session and then query that ID to display different information about that User.
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

app.use((req, res, next) => {
    res.locals.flashMessages = req.flash();
    next();
});

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));

app.listen(port,()=>{console.log(`app started running at port ${port}`)});