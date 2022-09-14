const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('./models/userModel');
const findOrCreate = require('mongoose-findorcreate');
const bcrypt = require('bcryptjs');
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.callbackURL,
        profileFields: ['id', 'first_name', 'last_name']
    },
    function(accessToken, refreshToken, profile, cb) {
        console.log(profile)
        User.findOrCreate({ facebookId: profile.id, firstname: profile._json.first_name, surname: profile._json.last_name}, function (err, user) {
            return cb(err, user);
        });
    }
));

passport.use(
    new LocalStrategy((username, password, done) => {
        User.findOne({username: username}, (err, user) => {
            if (err) return done(err);
            if (!user) return done(null, false, { message: "Incorrect Username"});

            bcrypt.compare(password, user.password, (err, res) => {
                if (res) return done(null, user);
                else return done(null, false, { message: "Incorrect Password"});
            })
        })
    })
)

passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_KEY
    }, (jwtPayload, done) => {
        return done(null, jwtPayload);
    }
))

passport.serializeUser(function(user, done) {
    done(null, user.id);
})

passport.deserializeUser(function (id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    })
})