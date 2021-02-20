const express = require('express');
const logger = require("morgan");
const mongoose = require('mongoose');
const mongojs = require('mongojs');

const PORT = process.env.PORT || 3000;

const db = require('./models');

const app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));

require("./routes/html-routes.js")(app);

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/workout", { useNewUrlParser: true });

app.get("/api/workouts", (req, res) => {
    db.Workout.find({})
    .populate("exercises")
    .then(dbWorkouts => {
        res.json(dbWorkouts);
    })
    .catch(err => {
        res.json(err);
    });
});

app.put("/api/workouts/:id", (req, res) => {
    db.Exercise.create(req.body)
        .then(exercise => db.Workout.findOneAndUpdate({_id: req.params.id}, { $push: { exercises: exercise._id } }, {new: true}))
        .then(dbExercise => {
            res.json(dbExercise);
        });
});

app.post("/api/workouts", (req, res) => {
    db.Workout.create(req.body)
        .then(newWorkout => {
            console.log(newWorkout);
            res.json(newWorkout);
        });
});

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`);
});
