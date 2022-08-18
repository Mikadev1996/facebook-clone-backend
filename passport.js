const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const bcrypt = require('bcryptjs');
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

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