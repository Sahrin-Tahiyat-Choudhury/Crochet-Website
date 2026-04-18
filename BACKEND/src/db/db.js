const mongoose = require("mongoose");

async function connectDB() {
    await mongoose.connect("mongodb://yt:bQlVsX9MDlZoY0Ld@ac-8jrpd3t-shard-00-00.chlzwe6.mongodb.net:27017,ac-8jrpd3t-shard-00-01.chlzwe6.mongodb.net:27017,ac-8jrpd3t-shard-00-02.chlzwe6.mongodb.net:27017/?ssl=true&replicaSet=atlas-112c2o-shard-0&authSource=admin&appName=yt-complete-backend/halley")
    
    console.log("Connected to DB")
}

module.exports = connectDB
