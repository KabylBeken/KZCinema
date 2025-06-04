const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb+srv://bekenkabyl0005:mjvxZfucOuTKpfwR@movie.jnqtm.mongodb.net/?retryWrites=true&w=majority&appName=Movie');
        console.log(`MongoDB подключена: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Ошибка подключения к MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB; 