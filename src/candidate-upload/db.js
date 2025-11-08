const mongoose = require('mongoose');

let db;
let bucket; 

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      "mongodb+srv://ashjawale55_db_user:mongoash5@cluster0.bq8vpes.mongodb.net/candidateFormDB?retryWrites=true&w=majority"
    );

    console.log('MongoDB connected');

    db = conn.connection.db;

    bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'videos'
    });

    console.log('GridFSBucket ready');

  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

const getDB = () => db;
const getBucket = () => bucket;

module.exports = { connectDB, getDB, getBucket };
