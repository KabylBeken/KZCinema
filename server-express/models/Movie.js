// models/Movie.js
const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        default: null
    },
    year: {
        type: Number
    },
    duration: {
        type: String
    },
    country: {
        type: String
    },
    director: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Movie', movieSchema);