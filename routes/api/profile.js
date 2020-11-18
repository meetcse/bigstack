const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Load Person Model
const Person = require("../../models/Person");

//Load Profile Model
const Profile = require("../../models/Profile");

//@type     GET
//@route    /api/profile
//@desc     route for personal profile
//@access   PRIVATE
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (!profile) {
          return res
            .status(404)
            .json({ error: "Profile Not Found. TRY AGAIN!" });
        }
        res.json(profile);
      })
      .catch((err) => console.log(`ERROR IN PROFILE : ${err}`));
  }
);

//@type     POST
//@route    /api/profile
//@desc     route for UPDATING/SAVING user's personal profile
//@access   PRIVATE
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const profileValues = {};
    profileValues.user = req.user.id;
    if (req.body.username) profileValues.username = req.body.username;
    if (req.body.website) profileValues.website = req.body.website;
    if (req.body.country) profileValues.country = req.body.country;
    if (req.body.portfolio) profileValues.portfolio = req.body.portfolio;
    if (typeof req.body.languages !== undefined) {
      profileValues.languages = req.body.languages.split(",");
    }
    //for entering into "social"
    profileValues.social = {};
    if (req.body.youtube) profileValues.social.youtube = req.body.youtube;
    if (req.body.facebook) profileValues.social.facebook = req.body.facebook;
    if (req.body.instagram) profileValues.social.instagram = req.body.instagram;

    //Do database stuff
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (profile) {
          Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileValues },
            { new: true }
          )
            .then((profile) => {
              res.json(profile);
            })
            .catch((err) => console.log(`Problem in update : ${err}`));
        } else {
          Profile.findOne({ username: profileValues.username })
            .then((profile) => {
              //username already exists
              if (profile) {
                res.status(400), json({ error: "Username Already exists" });
              }
              //save user
              new Profile(profileValues)
                .save()
                .then((profile) => {
                  res.json(profile);
                })
                .catch((err) =>
                  console.log(`Error in saving in Database : ${err}`)
                );
            })
            .catch((err) =>
              console.log(`Error in fetching using username : ${err}`)
            );
        }
      })
      .catch((err) => console.log(`Error in Fetching profile: ${err}`));
  }
);

//@type     GET
//@route    /api/profile/:username
//@desc     route for GETTING user's profile based on USERNAME
//@access   PUBLIC
router.get("/:username", (req, res) => {
  Profile.findOne({ username: req.params.username }) //params is used to fetch the data from URL
    .populate("user", ["name", "email", "profilepic", "username"]) //populate method is used to chain or connect the other models that we want (in profile model, we connected using key 'user' with person model)
    .then((profile) => {
      if (!profile) {
        return res.status(404).json({ error: "User not found using username" });
      }
      res.json(profile);
    })
    .catch((err) => console.log(`ERROR in fetching username : ${err}`));
});

//@type     GET
//@route    /api/profile/id/:id
//@desc     route for GETTING user's profile based on ID
//@access   PUBLIC
router.get("/id/:id", (req, res) => {
  Profile.findById(req.params.id)
    .populate("user", ["name", "email", "profilepic", "username"])
    .then((profile) => {
      if (!profile) {
        return res.status(404).json({ error: "Error in fetching by id" });
      }
      res.json(profile);
    })
    .catch((err) => console.log(`ERROR in fetching user by ID : ${err}`));
});

//@type     GET
//@route    /api/profile/users/getall
//@desc     route for GETTING user profile for everyone
//@access   PUBLIC
router.get("/users/getall", (req, res) => {
  Profile.find()
    .populate("user", ["name", "email", "profilepic", "username"]) //populate method is used to chain or connect the other models that we want (in profile model, we connected using key 'user' with person model)
    .then((profiles) => {
      if (!profiles) {
        return res.status(404).json({ error: "Users not found " });
      }
      res.json(profiles);
    })
    .catch((err) => console.log(`ERROR in fetching profiles : ${err}`));
});

//@type     DELETE
//@route    /api/profile/
//@desc     route for deleting user based on id
//@access   PRIVATE
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id });
    Profile.findOneAndRemove({ user: req.user.id })
      .then(() => {
        Person.findOneAndRemove({ _id: req.user.id })
          .then(() => {
            res.json({ success: "User and Profile is deleted" });
          })
          .catch((err) => console.log(`Error in removing Person : ${err}`));
      })
      .catch((err) => console.log("Error in Removing Profile : " + err));
  }
);

//@type     POST
//@route    /api/profile/workrole
//@desc     route for adding work profile of person
//@access   PRIVATE
router.post(
  "/workrole",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (!profile) {
          return res.status(404).json({ error: "Profile does not exists" });
        }
        const newWork = {
          role: req.body.role,
          company: req.body.company,
          country: req.body.country,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          details: req.body.details,
        };
        profile.workrole.push(newWork);
        profile
          .save()
          .then((profile) => res.json(profile))
          .catch((err) => console.log(`Error in saving work role : ${err}`));
      })
      .catch((err) => console.log(`Error in finding user : ${err}`));
  }
);

//@type     DELETE
//@route    /api/profile/workrole/:w_id
//@desc     route for deleting a specific workrole
//@access   PRIVATE
router.delete(
  "/workrole/:w_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (!profile) {
          return res.status(404).json({ error: "No Profile found" });
        }

        const removeWorkRoleIndex = profile.workrole
          .map((item) => item.id)
          .indexOf(req.params.w_id);
        profile.workrole.splice(removeWorkRoleIndex, 1);
        profile
          .save()
          .then((profile) => {
            res.json(profile);
          })
          .catch((err) => console.log(`Error in saving : ${err}`));
      })
      .catch((err) =>
        console.log(`Error in fetching user to delete workrole : ${err}`)
      );
  }
);

module.exports = router;
