import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const cleanup = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME || 'projectVault',
    });
    console.log('Connected.');

    const db = mongoose.connection.db;

    // 1. Delete fake seeded recruiter demo user
    const deleteRecruiterRes = await db.collection('users').deleteMany({
      email: 'recruiter.demo@projectvault.dev',
    });
    console.log(`Deleted fake demo recruiter user(s): ${deleteRecruiterRes.deletedCount}`);

    // 2. Fix any user with legacy accountType 'both' -> set to 'student'
    const fixBothRes = await db.collection('users').updateMany(
      { accountType: 'both' },
      { $set: { accountType: 'student' } }
    );
    console.log(`Updated legacy accountType 'both' users: ${fixBothRes.modifiedCount}`);

    // 3. Clear mock/dummy seeded projects (projects where student is undefined/null or matches demo scripts)
    const deleteProjectsRes = await db.collection('projects').deleteMany({
      $or: [
        { student: { $exists: false } },
        { student: null },
        { title: 'NeuralVault: Autonomous Multi-Agent Consensus Engine' },
        { title: 'Distributed Autonomous Agent Framework' },
        { title: 'Faculty Audit Credentials Vault' },
        { title: 'High-Throughput Distributed Cache' },
      ],
    });
    console.log(`Deleted seeded dummy projects: ${deleteProjectsRes.deletedCount}`);

    // 4. Clear fake seeded profile views
    const deleteViewsRes = await db.collection('profileviews').deleteMany({});
    console.log(`Deleted fake profile views: ${deleteViewsRes.deletedCount}`);

    // 5. Clear fake seeded activity logs
    const deleteLogsRes = await db.collection('activitylogs').deleteMany({});
    console.log(`Deleted fake activity logs: ${deleteLogsRes.deletedCount}`);

    // 6. Clear fake seeded collaboration requests
    const deleteCollabsRes = await db.collection('collaborationrequests').deleteMany({});
    console.log(`Deleted fake collaboration requests: ${deleteCollabsRes.deletedCount}`);

    // 7. Ensure clean state for existing real user profiles
    const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
    console.log('\n--- Active Registered Users in Database ---');
    users.forEach((u) => {
      console.log(`- ID: ${u._id} | Name: ${u.name} | Email: ${u.email} | Role: ${u.accountType}`);
    });

    const remainingProjects = await db.collection('projects').countDocuments();
    console.log(`\nRemaining Real Projects: ${remainingProjects}`);

    await mongoose.disconnect();
    console.log('\nDatabase cleanup completed successfully.');
  } catch (err) {
    console.error('Database cleanup failed:', err);
    process.exit(1);
  }
};

cleanup();
