const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const SessionData = require('./models/SessionData');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('MongoDB Connected');
    const allData = await SessionData.find().lean();
    fs.writeFileSync('debug_data.json', JSON.stringify(allData, null, 2));
    console.log('Data written to debug_data.json');
    mongoose.connection.close();
}).catch(err => console.error(err));
