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
        .then(exercise => db.Workout.findOneAndUpdate({_id: req.params.id}, { $push: { exercises: exercise._id }, $set: { day: Date.now() } }, {new: true}))
        .then(dbExercise => {
            db.Workout.find({_id: req.params.id})
                .populate("exercises")
                .then(currentWorkout => {
                    // const workoutAggr = db.Workout.aggregate([{$match: {_id: req.params.id}},
                    //     {$unwind: "$exercises"},
                    //     {$group: {_id: null, totalDuration: {$sum: "$exercises.duration"}}},
                    //     {$addFields: {
                    //     totalDuration: {$sum: "$excercises.duration"}
                    // }}]);

                    db.Exercise.aggregate([
                        {$match: {}}, {$group: {_id: "$name", total: {$sum: "$duration"}}}
                    ]).then(aggr => {
                        console.log(aggr);
                        var total = 0;
                        for (var i=0; i<aggr.length; i++) {
                            total += aggr[i].total;
                        }
                        console.log(total);
                        db.Workout.findOneAndUpdate({_id: req.params.id}, {$set: { totalDuration: total }}, {new: true})
                            .then(res=>{
                                console.log(res);
                            });
                    });
                        // var totalDuration = result[0].totalDuration;
                        // currentWorkout.totalDuration = totalDuration;
                });
            // console.log(dbExercise);
            res.json(dbExercise);
        });
});

app.post("/api/workouts", (req, res) => {
    db.Workout.create(req.body)
        .then(newWorkout => {
            // console.log(newWorkout);
            res.json(newWorkout);
        });
});

app.get("/api/workouts/range", (req, res) => {
    db.Workout.find({}).sort({day:-1}).limit(7)
        .then(result => {
            res.json(result);
        });
});

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`);
});
