import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas Cluster
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME || 'projectVault',
    });
    console.log(`[MongoDB Atlas Connected]: Host -> ${conn.connection.host} | DB -> ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Exception]: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
