// models/FavoriteMovie.js
const mongoose = require('mongoose');

const favoriteMovieSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    }
}, {
    timestamps: true
});

// Создаем составной индекс для уникальности пары user-movie
favoriteMovieSchema.index({ user: 1, movie: 1 }, { unique: true });

module.exports = mongoose.model('FavoriteMovie', favoriteMovieSchema);