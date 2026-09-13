import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection.db;

const collabs = await db.collection('collaborationrequests').find({}).toArray();
const projects = await db.collection('projects').find({}).toArray();

for (const collab of collabs) {
  const match = projects.find(p => p.title.toLowerCase() === (collab.projectName || '').toLowerCase());
  if (match) {
    await db.collection('collaborationrequests').updateOne(
      { _id: collab._id },
      { $set: { projectId: match._id } }
    );
    console.log('Linked collab', collab._id, 'to project', match._id, match.title);
  }
}

await mongoose.disconnect();
console.log('Finished updating existing collabs');
