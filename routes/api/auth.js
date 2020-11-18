const express = require("express");
const router = express.Router(); //because now we getting routes from diff screen
const bcrypt = require("bcryptjs");
const jsonwt = require("jsonwebtoken");
const passport = require("passport");
const key = require("../../setup/myurl");

//@type     GET
//@route    /api/auth
//@desc     just for testing
//@access   PUBLIC
router.get("/", (req, res) => {
  res.json({ test: "Auth is being Success" });
});

//Import Person Schema to register user
const Person = require("../../models/Person");
const e = require("express");

//@type     POST
//@route    /api/auth/register
//@desc     route for registration for users
//@access   PUBLIC
router.post("/register", (req, res) => {
  Person.findOne({ email: req.body.email })
    .then((person) => {
      if (person) {
        return res.status(400).json({ error: "Email is already registered" });
      } else {
        const newPerson = new Person({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          gender: req.body.gender,
        });
        if (newPerson.gender.toString().toLowerCase() == "male") {
          newPerson.profilepic =
            "https://cdn0.iconfinder.com/data/icons/avatar-78/128/12-512.png";
        } else {
          newPerson.profilepic =
            "https://icons-for-free.com/iconfiles/png/512/female+person+user+woman+young+icon-1320196266256009072.png";
        }
        //Encrypt password using bcryptjs
        bcrypt.genSalt(10, (err, salt) => {
          if (err) throw err;
          bcrypt.hash(newPerson.password, salt, (err, hash) => {
            // Store hash in your password DB.
            if (err) throw err;
            newPerson.password = hash;

            newPerson
              .save()
              .then((person) => res.json(person))
              .catch((err) =>
                console.log(
                  `Error in registration in saving into database ${err}`
                )
              );
          });
        });
      }
    })
    .catch((err) => console.log(`Error in Registration : ${err}`));
});

//@type     POST
//@route    /api/auth/login
//@desc     route for login of users
//@access   PUBLIC
router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  Person.findOne({ email: email })
    .then((person) => {
      if (!person) {
        return res.status(404).json({ error: "Email does not exist" });
      }
      bcrypt
        .compare(password, person.password)
        .then((isSuccess) => {
          if (isSuccess) {
            // res.status(200).json({ message: "Successfully Logged In" });
            //use payload and create token for user
            const payload = {
              id: person.id,
              name: person.name,
              email: person.email,
            };

            jsonwt.sign(
              payload,
              key.secret,
              { expiresIn: 3600 },
              (err, token) => {
                if (err) {
                  throw err;
                } else {
                  res.json({
                    success: true,
                    token: "Bearer " + token,
                  });
                }
              }
            );
          } else {
            res.status(400).json({ error: `Email & Password does not match` });
          }
        })
        .catch((err) => console.log(`ERROR IN LOGIN : ${err}`));
    })
    .catch((err) => console.log(`Error in LOGIN : ${err}`));
});

//@type     GET
//@route    /api/auth/profile
//@desc     route for user's profile
//@access   PRIVATE
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      profilepic: req.user.profilepic,
    });
  }
);

module.exports = router;
