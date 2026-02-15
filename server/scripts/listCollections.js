const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const listCollections = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const admin = new mongoose.mongo.Admin(mongoose.connection.db);
        const databases = await admin.listDatabases();

        console.log('Databases found in cluster:');

        for (const dbInfo of databases.databases) {
            console.log(`\nDatabase: ${dbInfo.name} (Size: ${dbInfo.sizeOnDisk})`);
            if (dbInfo.name !== 'sample_mflix' && dbInfo.name !== 'test') continue;

            console.log(`\nScanning ${dbInfo.name}...`);
            const targetDb = mongoose.connection.useDb(dbInfo.name);
            const collections = await targetDb.db.listCollections().toArray();

            for (const c of collections) {
                const count = await targetDb.db.collection(c.name).countDocuments();
                console.log(` - Collection: ${c.name}, Count: ${count}`);
            }

        }




        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

listCollections();
