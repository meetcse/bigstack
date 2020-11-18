const express = require("express");

const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Load Person Model
const Person = require("../../models/Person");

//Load Profile Model
const Profile = require("../../models/Profile");

//Load Question Model
const Question = require("../../models/Question");

//@type     GET
//@route    /api/questions/
//@desc     route for showing all questions
//@access   PUBLIC
router.get("/", (req, res) => {
  Question.find()
    .sort("-date")
    .then((questions) => {
      if (!questions) {
        return res.json("No questions to display");
      }
      res.json(questions);
    })
    .catch((err) => console.log(`Error in fetching all questions : ${err}`));
});

//@type     POST
//@route    /api/questions/
//@desc     route for submitting questions
//@access   PRIVATE
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const newQuestion = new Question({
      user: req.user.id,
      textone: req.body.textone,
      texttwo: req.body.texttwo,
      name: req.body.name,
    });
    newQuestion
      .save()
      .then((question) => {
        res.json(question);
      })
      .catch((err) => console.log(`Error in saving question : ${err}`));
  }
);

//@type     POST
//@route    /api/questions/answers/:id
//@desc     route for submitting asnwers to questions
//@access   PRIVATE
router.post(
  "/answers/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Question.findById(req.params.id)
      .then((question) => {
        const newAnswer = {
          user: req.user.id,
          name: req.body.name,
          text: req.body.text,
        };
        question.answers.push(newAnswer);
        question
          .save()
          .then((question) => res.json(question))
          .catch((err) => console.log(`Error in saving comment : ${err}`));
      })
      .catch((err) => console.log(`Error in fetching question id : ${err}`));
  }
);

//@type     POST
//@route    /api/questions/upvote/:id
//@desc     route for up voting to questions
//@access   PRIVATE
router.post(
  "/upvote/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        Question.findById(req.params.id)
          .then((question) => {
            if (
              question.upvotes.filter(
                (upvote) => upvote.user.toString() === req.user.id.toString()
              ).length > 0
            ) {
              var index = question.upvotes
                .map((item) => item.user.toString())
                .indexOf(req.user.id.toString());

              question.upvotes.splice(index, 1);
              question
                .save()
                .then((question) => {
                  console.log("INDEX " + question.upvotes);
                  return res.json({ done: "Down Voted" });
                })
                .catch((err) =>
                  console.log("ERROR IN SAVING DOWN VOTES : " + err)
                );

              // console.log("INDEX " + index);
              // return res.json({ done: "Down voted" });
            } else {
              question.upvotes.push({ user: req.user.id });
              question
                .save()
                .then((question) => res.send(question))
                .catch((err) => console.log(err));
            }
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(`Error in fetching profile : ${err}`));
  }
);

//@type     DELETE
//@route    /api/questions/delete/:id
//@desc     route for deleting a single question
//@access   PRIVATE
router.delete(
  "/delete/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Question.findOneAndRemove({ _id: req.params.id })
      .then(() => {
        res.json({ success: "Successfully deleted" });
      })
      .catch((err) => console.log(`ERROR in deleting a question : ${err}`));
  }
);

//@type     DELETE
//@route    /api/questions/deleteall/
//@desc     route for deleting all questions of particular user
//@access   PRIVATE
router.delete(
  "/deleteall",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Question.deleteMany({ user: req.user.id })
      .then(() => {
        res.json({
          success: "Successfully deleted all questions for " + req.user.name,
        });
      })
      .catch((err) =>
        console.log(
          `Unable to delete all questions for ${req.user.name}: ${err}`
        )
      );
  }
);

module.exports = router;
