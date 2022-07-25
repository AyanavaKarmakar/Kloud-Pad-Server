const mongoose = require('mongoose');

const mongoURI = "mongodb://localhost:27017/Cloud-Pad"

const connectToMongo = () => {
    mongoose.connect(mongoURI, () => {
        console.log("connected to mongo succesfully!");
    })
}

module.exports = connectToMongo;