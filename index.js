const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const passport = require("passport");

//bring all routes
const auth = require("./routes/api/auth");
const quesstions = require("./routes/api/questions");
const profile = require("./routes/api/profile");

const app = express();

//middleware for body parser
app.use(bodyparser.urlencoded({ extended: false })); //for encoding url and parsing it into json
app.use(bodyparser.json()); //as we have to send our data into json we will use this

//mongoDB configuration
const db = require("./setup/myurl").mongoURL;

//Attempt to connect to DB
mongoose
  .connect(db, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log("Mongo DB Connected successfully"))
  .catch((err) => console.log(`Failed to connect to Server with error ${err}`));

//PASSPORT MIDDLEWARE
app.use(passport.initialize());

//Config for jwt strategy
require("./strategies/jsonwtStrategies")(passport);

//testing - route
app.get("/", (req, res) => {
  res.send("STACK OVERFLOW");
});

//actual routes
app.use("/api/auth", auth);

app.use("/api/profile", profile);

app.use("/api/questions", quesstions);

const port = process.env.port || 3000;

app.listen(port, () => console.log(`App is running at port ${port}`));
