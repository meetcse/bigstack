const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const Person = mongoose.model("myPerson");
const { secret } = require("../setup/myurl");

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = secret;

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      Person.findById(jwt_payload.id)
        .then((person) => {
          if (person) {
            console.log("CALLED JSONWT STRATEGY");
            return done(null, person);
          }
          return done(null, false);
        })
        .catch((err) => console.log(`Error : ${err}`));
    })
  );
};
