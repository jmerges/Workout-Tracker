const { Int32 } = require('bson');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exerciseSchema = new Schema ({
    type: String,
    name: String,
    duration: Int32,
    weight: Int32,
    reps: Int32,
    sets: Int32,
    distance: Int32
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = Exercise;
