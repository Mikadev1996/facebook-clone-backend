const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session')
const compression = require('compression');
const helmet = require('helmet');
const passport = require('passport');
const cors = require('cors');
require('dotenv').config();
require('./passport');

// Mongo DB
const mongoose = require("mongoose");
const myMongoDB = process.env.MONGO;
mongoose.connect(myMongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', () => console.error.bind(console, 'MongoDB connection error'));


const app = express();

const corsOptions = {origin: 'https://shielded-hamlet-48088.herokuapp.com'};
app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client/build')));

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use(compression());
app.use(helmet());

app.get('/', (req, res, next) => {
    res.send("hello!");
})

app.use((req, res, next) => {
    res.status(404)
        .json({
            error: "404: Page not found"
        })
})

app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.json({
        "error": err
    })
});

module.exports = app;
